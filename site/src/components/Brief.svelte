<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import {
    documentLines,
    emptyAnswers,
    estimateV3,
    groupOfTask,
    payloadV3,
    questionById,
    stepSequence,
    studioSummary,
    tasksOfGroup,
  } from '../data/brief-v3';
  import { products } from '../data/products';
  import { site } from '../data/site';

  /* Экраны: intro → вопросы → result → contact → sent. */
  let screen = 'intro';
  let stepIndex = 0;
  let answers = emptyAnswers();
  let docOpen = false;

  let contactName = '';
  let contactPhone = '';
  let contactComment = '';
  let hp = '';
  let sending = false;
  let sendError = false;
  let leadId = null;
  let draftId = '';
  let submissionId = '';

  const mountedAt = Date.now();
  let reduced = false;

  /* Последовательность шагов зависит от группы и задачи. */
  $: steps = stepSequence(answers);

  $: stepId = steps[Math.min(stepIndex, steps.length - 1)];
  $: question = stepId === 'otherText' ? null : questionById[stepId];
  /* На шаге уточнения показываем только задачи выбранной группы. */
  $: choices = stepId === 'task' ? tasksOfGroup(answers.group) : (question?.choices ?? []);
  $: stage = question?.stage ?? 1;
  $: stageName = question?.stageName ?? 'Задача';
  $: lines = documentLines(answers);
  $: result = estimateV3(answers);
  $: needSystems = answers.dataflow.includes('crm') || answers.dataflow.includes('onec');
  $: contactReady = contactName.trim().length > 0 && contactPhone.trim().length > 1;

  $: stepDone =
    stepId === 'otherText'
      ? answers.otherText.trim().length > 0
      : question?.multi
        ? answers[stepId].length > 0
        : Boolean(answers[stepId]);

  const flyIn = (node) => fly(node, { y: 26, duration: reduced ? 0 : 500, delay: reduced ? 0 : 180, easing: expoOut });
  const flyOut = (node) => fly(node, { y: -20, duration: reduced ? 0 : 220, easing: expoOut });
  const lineIn = (node) => fly(node, { y: 12, duration: reduced ? 0 : 450, easing: expoOut });

  function start() {
    screen = 'question';
    stepIndex = 0;
  }

  function next() {
    if (stepIndex < steps.length - 1) stepIndex += 1;
    else showResult();
  }

  function back() {
    if (screen === 'result') {
      screen = 'question';
      stepIndex = steps.length - 1;
      return;
    }
    if (stepIndex > 0) stepIndex -= 1;
    else screen = 'intro';
  }

  let advanceTimer;
  function pickSingle(id, value) {
    const groupChanged = id === 'group' && value !== answers.group;
    answers = { ...answers, [id]: value };
    if (id === 'group') {
      // Группа с одной задачей выбирает её сама; иначе задачу уточнит следующий шаг.
      const tasks = tasksOfGroup(value);
      if (tasks.length === 1) answers = { ...answers, task: tasks[0].id };
      else if (groupChanged) answers = { ...answers, task: '' };
    }
    if (id === 'task' || groupChanged) {
      // Смена задачи меняет маршрут — уточнения сбрасываем.
      answers = { ...answers, updateGoal: '', otherText: '' };
    }
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(next, reduced ? 0 : 420);
  }

  function toggleMulti(id, choice) {
    const current = new Set(answers[id]);
    if (choice.exclusive) {
      answers = { ...answers, [id]: current.has(choice.id) ? [] : [choice.id] };
      return;
    }
    const q = questionById[id];
    const exclusives = new Set(q.choices.filter((c) => c.exclusive).map((c) => c.id));
    for (const ex of exclusives) current.delete(ex);
    if (current.has(choice.id)) current.delete(choice.id);
    else current.add(choice.id);
    answers = { ...answers, [id]: [...current] };
  }

  function showResult() {
    screen = 'result';
    docOpen = false;
    saveDraft();
    syncUrl();
  }

  function editAnswers() {
    screen = 'question';
    stepIndex = 0;
  }

  /* Один UUID живёт с конкретным разбором: POST обновляет его, а не плодит строки. */
  function saveDraft() {
    if (!draftId) draftId = crypto.randomUUID();
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draftId, answers: payloadV3(answers) }),
    }).catch(() => {});
  }

  function syncUrl() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams({ ...payloadV3(answers), ...(draftId ? { draft: draftId } : {}), stage: 'result' });
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('version') !== 'v3') return;
    const list = (key) => (params.get(key) ?? '').split(',').filter(Boolean);
    const task = params.get('task') ?? '';
    const productParam = params.get('product') ?? '';
    const draftParam = params.get('draft') ?? '';
    draftId = /^[a-z0-9-]{16,80}$/i.test(draftParam) ? draftParam : '';
    const product = products.find((item) => item.slug === productParam)?.slug ?? '';
    // `?group=` — группа каталога (ссылка с продукта); без неё группа выводится из задачи.
    const paramGroup = questionById.group.choices.some((c) => c.id === params.get('group')) ? params.get('group') : '';
    const group = paramGroup || groupOfTask(task);
    const onlyTask = tasksOfGroup(group).length === 1 ? tasksOfGroup(group)[0].id : '';
    answers = {
      product,
      group,
      task: task || onlyTask,
      updateGoal: params.get('update_goal') ?? '',
      otherText: params.get('other_text') ?? '',
      actions: list('actions'),
      content: list('content'),
      manage: list('manage'),
      dataflow: list('dataflow'),
      systems: params.get('systems') ?? '',
      have: list('have'),
      deadline: params.get('deadline') ?? '',
      budget: params.get('budget') ?? '',
    };
    if (params.get('stage') === 'result' && answers.task) {
      screen = 'result';
    } else if (answers.group) {
      // Переход с карточки продукта: группа (и задача, если известна) предзаполнены —
      // начинаем с первого неотвеченного шага.
      screen = 'question';
      stepIndex = firstIncompleteStep();
    }
  }

  function firstIncompleteStep() {
    const sequence = stepSequence(answers);
    const done = (id) =>
      id === 'otherText'
        ? answers.otherText.trim().length > 0
        : Array.isArray(answers[id])
          ? answers[id].length > 0
          : Boolean(answers[id]);
    const index = sequence.findIndex((id) => !done(id));
    return index === -1 ? sequence.length - 1 : index;
  }

  function telegramText() {
    const number = leadId ? `Бриф №${leadId}.\n` : '';
    return `Привет! Заполнил разбор задачи на сайте.\n${number}\n${studioSummary(answers, result)}\n\nЧерновик: ${draftUrl()}`;
  }

  function draftUrl() {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams({ ...payloadV3(answers), ...(draftId ? { draft: draftId } : {}), stage: 'result' });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  function telegramHref() {
    return `${site.telegramUrl}?text=${encodeURIComponent(telegramText())}`;
  }

  async function submitLead(event) {
    event.preventDefault();
    if (!contactReady || sending) return;
    if (!submissionId) submissionId = crypto.randomUUID();
    sending = true;
    sendError = false;
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: payloadV3(answers),
          contact: { name: contactName.trim(), phone: contactPhone.trim(), comment: contactComment.trim() },
          summary: studioSummary(answers, result),
          draftId: draftId || undefined,
          submissionId,
          hp,
          ts: mountedAt,
        }),
      });
      if (!response.ok) throw new Error('lead failed');
      const data = await response.json();
      leadId = data.id ?? null;
      screen = 'sent';
    } catch {
      sendError = true;
    } finally {
      sending = false;
    }
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    restoreFromUrl();
  });

  const planNotes = {
    core: 'В комфортный бюджет помещается основной состав — связи с системами удобнее добавить вторым этапом.',
    staged: 'Чтобы остаться в названном бюджете, предложим поэтапный запуск: сначала ядро, затем расширения.',
    open: 'Состав работ уточним на коротком созвоне — до договора и без обязательств.',
    full: '',
  };
</script>

<div class="brief" data-testid="brief">
  {#if screen === 'intro'}
    <section class="intro" in:flyIn>
      <p class="mono label">бриф · разбор задачи</p>
      <h1>Расскажите, что должно заработать</h1>
      <p class="intro-lead">
        Ответьте на несколько вопросов — предложим подходящий формат, предварительную стоимость и следующий шаг.
      </p>
      <ul class="intro-meta" aria-label="Как устроен бриф">
        <li>3–5 минут</li>
        <li>Без регистрации</li>
        <li>Ответы можно изменить</li>
        <li>Расчёт предварительный</li>
      </ul>
      <div class="intro-actions">
        <button type="button" class="btn-gold btn-lg" on:click={start}>Начать</button>
        <a class="btn-outline btn-lg" href={site.telegramUrl}>Обсудить проект</a>
      </div>
    </section>
  {:else if screen === 'question'}
    <div class="interview">
      <section class="screen" aria-live="polite">
        {#key stepId}
          <div class="screen-inner" in:flyIn out:flyOut>
            <header class="stage-head">
              <span class="stage-number" aria-hidden="true">{String(stage).padStart(2, '0')}</span>
              <span class="mono stage-name">{stageName}</span>
            </header>

            {#if stepId === 'otherText'}
              <h2>Опишите задачу своими словами</h2>
              <p class="hint">Пары предложений достаточно — детали разберём вместе.</p>
              <textarea
                class="free-text"
                rows="5"
                placeholder="Что должно заработать и для кого"
                bind:value={answers.otherText}
              ></textarea>
            {:else}
              <h2>{question.title}</h2>
              {#if question.hint}<p class="hint">{question.hint}</p>{/if}

              <div class="options" role={question.multi ? 'group' : 'radiogroup'} aria-label={question.title}>
                {#each choices as choice (choice.id)}
                  {#if question.multi}
                    <button
                      type="button"
                      class="option"
                      role="checkbox"
                      aria-checked={answers[stepId].includes(choice.id)}
                      class:selected={answers[stepId].includes(choice.id)}
                      on:click={() => toggleMulti(stepId, choice)}
                    >
                      <span class="mark mark-square" aria-hidden="true"></span>
                      <span class="option-label">{choice.label}</span>
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="option"
                      role="radio"
                      aria-checked={answers[stepId] === choice.id}
                      class:selected={answers[stepId] === choice.id}
                      on:click={() => pickSingle(stepId, choice.id)}
                    >
                      <span class="mark mark-dot" aria-hidden="true"></span>
                      <span class="option-label">{choice.label}</span>
                    </button>
                  {/if}
                {/each}
              </div>

              {#if stepId === 'dataflow' && needSystems}
                <label class="systems" in:lineIn>
                  <span class="field-label">Какие системы уже используются?</span>
                  <input
                    type="text"
                    placeholder="Например: Битрикс24, amoCRM, МойСклад, 1С"
                    bind:value={answers.systems}
                  />
                </label>
              {/if}
            {/if}
          </div>
        {/key}

        <footer class="screen-foot">
          <div class="progress" aria-label={`Этап ${stage} из 6`}>
            <span class="progress-count">{stage} из 6</span>
            <span class="progress-track" aria-hidden="true"><i style={`width:${(stage / 6) * 100}%`}></i></span>
          </div>
          <div class="foot-actions">
            <button type="button" class="ghost" on:click={back}>Назад</button>
            {#if question?.multi || stepId === 'otherText'}
              <button type="button" class="btn-gold" disabled={!stepDone} on:click={next}>Дальше</button>
            {/if}
          </div>
        </footer>
      </section>

      <aside class="doc" aria-label="Разбор задачи — составляется по вашим ответам">
        <header>
          <span class="mono">разбор задачи</span>
        </header>
        <div class="doc-body">
          {#each lines as line (line)}
            <p in:lineIn>{line}</p>
          {/each}
          <span class="caret" aria-hidden="true"></span>
        </div>
        <footer class="doc-foot">Составляем по вашим ответам — станет основой оценки.</footer>
      </aside>

      <div class="doc-mobile" class:open={docOpen}>
        <button type="button" class="doc-toggle" on:click={() => (docOpen = !docOpen)} aria-expanded={docOpen}>
          <span class="mono">разбор задачи</span>
          <span class="doc-last">{docOpen ? 'Свернуть' : (lines[lines.length - 1] ?? 'Появится после первого ответа')}</span>
        </button>
        {#if docOpen}
          <div class="doc-mobile-body">
            {#each lines as line (line)}
              <p>{line}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else if screen === 'result' || screen === 'contact' || screen === 'sent'}
    <section class="sheet" data-testid="brief-result" data-format={result.format} in:flyIn>
      {#if screen === 'sent'}
        <p class="mono sheet-label">отправлено</p>
        <h2>Проект {leadId ? `№${leadId} ` : ''}у нас</h2>
        <p class="sheet-lead">
          Проверим спорные места и вернёмся с 2–4 уточняющими вопросами. После этого пришлём состав работ,
          фиксированную цену и срок.
        </p>
        <div class="sheet-actions">
          <a class="btn-gold" href={telegramHref()}>Открыть чат в Telegram</a>
        </div>
      {:else}
        <p class="mono sheet-label">предварительная оценка</p>
        <h2>{result.title}</h2>
        <p class="sheet-lead">{result.lead}</p>

        <dl class="sheet-rows">
          <div class="row">
            <dt>Срок</dt>
            <dd>{result.deliveryLabel}</dd>
          </div>
          <div class="row">
            <dt>{result.productSlug ? 'Публичная цена' : 'Предварительная оценка выбранного состава работ'}</dt>
            <dd>{result.priceLabel}</dd>
          </div>
          <div class="row">
            <dt>В основе</dt>
            <dd>{result.core.join(', ')}</dd>
          </div>
          {#if result.later.length}
            <div class="row">
              <dt>Можно добавить позже</dt>
              <dd>{result.later.join(', ')}</dd>
            </div>
          {/if}
        </dl>

        <h3>Почему такой формат</h3>
        <p class="sheet-reason">{result.reason}</p>
        {#if planNotes[result.plan]}
          <p class="sheet-reason">{planNotes[result.plan]}</p>
        {/if}

        {#if result.manual.length}
          <div class="manual">
            <p>
              Часть задачи требует короткого разбора: {result.manual.join('; ')}. Мы уточним её до договора и не
              начнём дополнительные работы без согласованной оценки.
            </p>
          </div>
        {/if}

        {#if result.link}
          <p class="sheet-note"><a href={result.link.href} data-testid="brief-result-link">{result.link.label} →</a></p>
        {/if}

        <p class="sheet-note">Расчёт предварительный — точную цену и срок фиксируем в договоре.</p>

        {#if screen === 'contact'}
          <form class="contact" on:submit={submitLead}>
            <label>
              <span class="field-label">Имя</span>
              <input type="text" name="name" autocomplete="name" required maxlength="200" bind:value={contactName} />
            </label>
            <label>
              <span class="field-label">Телефон или Telegram</span>
              <input type="text" name="phone" autocomplete="tel" required maxlength="200" bind:value={contactPhone} />
            </label>
            <label>
              <span class="field-label">Комментарий — по желанию</span>
              <textarea name="comment" rows="3" maxlength="2000" bind:value={contactComment}></textarea>
            </label>
            <input type="text" name="hp" bind:value={hp} class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
            {#if sendError}
              <p class="send-error" role="alert">Не получилось отправить. Попробуйте ещё раз или <a href={telegramHref()}>напишите в Telegram</a>.</p>
            {/if}
            <p class="consent">Отправляя проект, вы соглашаетесь на обработку контактных данных — <a href="/legal/">подробнее</a>.</p>
            <div class="sheet-actions">
              <button type="submit" class="btn-gold btn-submit" disabled={!contactReady || sending}>
                {sending ? 'Отправляем…' : 'Отправить проект'}
              </button>
              <button type="button" class="ghost-dark" on:click={() => (screen = 'result')}>Назад</button>
            </div>
          </form>
        {:else}
          <div class="sheet-actions">
            <button type="button" class="btn-gold" on:click={() => (screen = 'contact')}>Отправить проект в студию</button>
            <a class="ghost-dark" href={telegramHref()}>Обсудить в Telegram</a>
            <button type="button" class="ghost-dark" on:click={editAnswers}>Изменить ответы</button>
          </div>
        {/if}
      {/if}
    </section>
  {/if}
</div>

<style>
  .brief {
    color: var(--color-paper);
    min-height: 560px;
  }

  .mono {
    color: var(--color-gold);
    font-family: var(--font-text);
    font-size: 13px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- Интро ---------- */

  .intro {
    max-width: 720px;
    padding: 24px 0 8px;
  }

  h1 {
    margin: 18px 0 0;
    font-family: var(--font-display);
    font-size: clamp(34px, 5vw, 58px);
    font-weight: 800;
    line-height: 1.08;
  }

  .intro-lead {
    margin: 22px 0 0;
    max-width: 560px;
    color: rgb(244 242 236 / 0.78);
    font-size: 17px;
    line-height: 1.6;
  }

  .intro-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 0;
    margin: 30px 0 0;
    padding: 0;
    list-style: none;
    color: rgb(244 242 236 / 0.6);
    font-size: 14px;
  }

  .intro-meta li + li::before {
    content: '·';
    margin: 0 10px;
    color: var(--color-gold);
  }

  .intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 40px;
  }

  /* Кнопки — общие .btn-gold / .btn-outline из global.css. */

  /* ---------- Интервью ---------- */

  .interview {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    gap: clamp(48px, 7vw, 96px);
    align-items: start;
  }

  .screen {
    display: grid;
    min-height: 540px;
    grid-template-rows: 1fr auto;
  }

  .screen-inner {
    grid-area: 1 / 1;
  }

  .stage-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .stage-number {
    color: rgb(244 242 236 / 0.28);
    font-size: clamp(44px, 5vw, 64px);
    font-weight: 250;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .stage-name {
    letter-spacing: 0.02em;
  }

  h2 {
    margin: 20px 0 0;
    max-width: 560px;
    font-family: var(--font-display);
    font-size: clamp(24px, 2.8vw, 36px);
    font-weight: 700;
    line-height: 1.16;
    /* Длинные названия формата в кавычках («Приложение внутри Telegram» и т.п.) —
       одно «слово» без пробела после «: без переноса это ломает scrollWidth
       на узких экранах (320–390px). */
    overflow-wrap: break-word;
  }

  .hint {
    margin: 12px 0 0;
    color: var(--text-on-ink-muted);
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-lh);
  }

  /* Подпись поля: Golos 600, не Mono. */
  .field-label {
    font-family: var(--font-text);
    font-size: var(--type-body-sm-size);
    font-weight: 600;
    line-height: 1.3;
  }

  .options {
    margin-top: 26px;
    border-top: 1px solid rgb(244 242 236 / 0.16);
  }

  .option {
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    min-height: 48px;
    border: 0;
    border-bottom: 1px solid rgb(244 242 236 / 0.16);
    background: none;
    padding: 13px 4px;
    color: var(--text-on-ink-secondary);
    font: 500 16px / 1.35 var(--font-text);
    text-align: left;
    cursor: pointer;
    transition: color var(--dur-feedback) var(--ease-site);
  }

  .option:hover {
    color: var(--color-paper);
  }

  /* Data-entry фокус на ink: два слоя. Синий (#3552C7) на ink ≈2.8:1, поэтому внутри кольцо
     paper (≈15:1 к ink), снаружи синее — semantic-сигнал. */
  .option:focus-visible {
    outline: 2px solid var(--color-paper);
    outline-offset: 0;
    box-shadow: 0 0 0 4px var(--color-blue);
    color: var(--color-paper);
  }

  .option:focus-visible .mark {
    border-color: var(--color-paper);
  }

  /* Выбор = два сигнала: синий маркер + акцент текста. */
  .option.selected {
    color: var(--color-paper);
    font-weight: 600;
  }

  .mark {
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    border: var(--border-width) solid var(--text-on-ink-muted);
    transition:
      background-color var(--dur-feedback) var(--ease-site),
      border-color var(--dur-feedback) var(--ease-site);
  }

  .mark-dot {
    border-radius: 50%;
  }

  .option.selected .mark {
    border-color: var(--color-blue);
    background: var(--color-blue);
  }

  .option.selected .mark-dot {
    background: var(--color-paper);
    box-shadow: inset 0 0 0 5px var(--color-blue);
  }

  .option.selected .mark-square::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid var(--color-paper);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .free-text,
  .systems input {
    box-sizing: border-box;
    width: 100%;
    min-height: 52px;
    border: var(--border-width) solid var(--border-on-ink-strong);
    border-radius: var(--radius-core);
    background: color-mix(in srgb, var(--color-paper) 4%, transparent);
    color: var(--color-paper);
    padding: 0 16px;
    font: var(--type-body-weight) var(--type-body-size) / var(--type-body-lh) var(--font-text);
  }

  .free-text {
    padding-block: 14px;
    resize: vertical;
  }

  /* Data-entry фокус на ink: paper-кольцо (≈15:1 к ink) + внешнее синее (≈2.8:1 к ink). */
  .free-text:focus-visible,
  .systems input:focus-visible {
    outline: 2px solid var(--color-paper);
    outline-offset: 0;
    border-color: var(--color-paper);
    box-shadow: 0 0 0 4px var(--color-blue);
  }

  .free-text {
    margin-top: 28px;
  }

  .free-text::placeholder,
  .systems input::placeholder {
    color: var(--text-on-ink-faint);
  }

  .systems .field-label {
    color: var(--text-on-ink-secondary);
  }

  .systems {
    display: grid;
    gap: 8px;
    margin-top: 26px;
    max-width: 480px;
  }

  .screen-foot {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 16px;
  }

  .progress {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 180px;
  }

  .progress-count {
    color: rgb(244 242 236 / 0.6);
    font-size: 13.5px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .progress-track {
    display: block;
    flex: 1;
    height: 1.5px;
    min-width: 90px;
    background: rgb(244 242 236 / 0.18);
  }

  .progress-track i {
    display: block;
    height: 100%;
    background: var(--color-gold);
    transition: width 0.5s var(--ease-site);
  }

  .foot-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .ghost {
    border: 0;
    background: none;
    color: rgb(244 242 236 / 0.6);
    font: 600 14.5px / 1 var(--font-text);
    padding: 15px 6px;
    cursor: pointer;
  }

  .ghost:hover {
    color: var(--color-paper);
  }

  /* ---------- Живой документ ---------- */

  .doc {
    position: sticky;
    top: 96px;
    display: flex;
    flex-direction: column;
    background: var(--color-paper);
    color: var(--color-ink);
    min-height: 340px;
    padding: 26px 28px 22px;
  }

  .doc header .mono {
    color: var(--color-ochre);
  }

  .doc-body {
    flex: 1;
    margin-top: 18px;
  }

  .doc-body p {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.55;
  }

  .caret {
    display: inline-block;
    width: 9px;
    height: 18px;
    background: var(--color-ochre);
    vertical-align: text-bottom;
    animation: caretBlink 1.1s steps(1) infinite;
  }

  @keyframes caretBlink {
    50% {
      opacity: 0;
    }
  }

  .doc-foot {
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid rgb(23 21 15 / 0.14);
    color: rgb(23 21 15 / 0.55);
    font-size: 12.5px;
    line-height: 1.5;
  }

  .doc-mobile {
    display: none;
  }

  /* ---------- Лист заключения ---------- */

  .sheet {
    box-sizing: border-box;
    max-width: 780px;
    background: var(--color-paper);
    color: var(--color-ink);
    padding: clamp(28px, 5vw, 56px);
  }

  .sheet-label {
    margin: 0;
    color: var(--color-ochre);
  }

  .sheet h2 {
    margin-top: 14px;
    max-width: none;
    font-size: clamp(26px, 3.4vw, 40px);
  }

  .sheet-lead {
    margin: 18px 0 0;
    max-width: 600px;
    color: rgb(23 21 15 / 0.78);
    font-size: 16.5px;
    line-height: 1.6;
  }

  .sheet-rows {
    margin: 34px 0 0;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(150px, 220px) 1fr;
    gap: 20px;
    border-top: 1px solid rgb(23 21 15 / 0.16);
    padding: 14px 0;
  }

  dt {
    color: rgb(23 21 15 / 0.55);
    font-size: 14px;
  }

  dd {
    margin: 0;
    font-weight: 650;
    font-size: 15.5px;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
  }

  h3 {
    margin: 34px 0 0;
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 700;
  }

  .sheet-reason {
    margin: 12px 0 0;
    max-width: 620px;
    color: rgb(23 21 15 / 0.75);
    font-size: 15.5px;
    line-height: 1.6;
  }

  .manual {
    margin-top: 26px;
    border-left: 3px solid var(--color-ochre);
    padding: 4px 0 4px 18px;
  }

  .manual p {
    margin: 0;
    color: rgb(23 21 15 / 0.78);
    font-size: 14.5px;
    line-height: 1.6;
  }

  .sheet-note {
    margin: 26px 0 0;
    color: rgb(23 21 15 / 0.5);
    font-size: 13px;
  }

  .sheet-note a {
    color: rgb(23 21 15 / 0.75);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .sheet-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    margin-top: 30px;
  }

  /* Лист — бумажная поверхность внутри ink-страницы: hover primary инвертируется в ink. */
  .sheet .btn-gold:hover:not(:disabled) {
    background: var(--color-ink);
    color: var(--color-paper);
  }

  /* Подпись кнопки меняется («Отправить проект» → «Отправляем…») — ширина остаётся. */
  .btn-submit {
    min-width: 220px;
  }

  .ghost-dark {
    border: 0;
    background: none;
    color: rgb(23 21 15 / 0.7);
    font: 600 14.5px / 1 var(--font-text);
    padding: 16px 8px;
    text-decoration: underline;
    text-underline-offset: 4px;
    cursor: pointer;
  }

  .ghost-dark:hover {
    color: var(--color-ink);
  }

  /* ---------- Контакт ---------- */

  .contact {
    display: grid;
    gap: 18px;
    margin-top: 34px;
    max-width: 480px;
  }

  .contact label {
    display: grid;
    gap: 8px;
  }

  .contact .field-label {
    color: var(--text-secondary);
  }

  .contact input,
  .contact textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 52px;
    border: var(--border-width) solid var(--border-strong);
    border-radius: var(--radius-core);
    background: var(--color-surface);
    color: var(--color-ink);
    padding: 0 16px;
    font: var(--type-body-weight) var(--type-body-size) / var(--type-body-lh) var(--font-text);
  }

  .contact textarea {
    padding-block: 14px;
    resize: vertical;
  }

  .contact input:focus-visible,
  .contact textarea:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: 4px;
  }

  .hp {
    position: absolute;
    left: -9999px;
  }

  .send-error {
    margin: 0;
    color: var(--color-ochre-dk);
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-lh);
  }

  .send-error a {
    color: inherit;
    text-decoration: underline;
  }

  .consent {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-lh);
  }

  .consent a {
    color: var(--color-blue);
    text-decoration: underline;
  }

  /* ---------- Адаптив ---------- */

  @media (max-width: 960px) {
    .interview {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .doc {
      display: none;
    }

    .screen {
      min-height: 480px;
    }

    .doc-mobile {
      display: block;
      margin-top: 26px;
      background: var(--color-paper);
      color: var(--color-ink);
    }

    .doc-toggle {
      display: grid;
      gap: 6px;
      width: 100%;
      border: 0;
      background: none;
      padding: 16px 18px;
      text-align: left;
      cursor: pointer;
    }

    .doc-toggle .mono {
      color: var(--color-ochre);
      font-size: 11px;
    }

    .doc-last {
      overflow: hidden;
      color: rgb(23 21 15 / 0.8);
      font-size: 13.5px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .doc-mobile-body {
      padding: 0 18px 16px;
    }

    .doc-mobile-body p {
      margin: 0 0 10px;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  @media (max-width: 640px) {
    .screen {
      min-height: 440px;
    }

    .option {
      font-size: 15px;
      padding: 14px 2px;
    }

    .screen-foot {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .foot-actions {
      justify-content: space-between;
    }

    .foot-actions .btn-gold {
      flex: 1;
    }

    .row {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .sheet-actions {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      animation: none;
    }
  }
</style>
