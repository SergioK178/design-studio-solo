/**
 * Конфигуратор исполнения в кейсе «ИМЭКС» (глава 04, акт B).
 *
 * Это единственный интерактив кейса, который не украшает страницу, а показывает
 * саму работу: параметры действительно переключаются, итог и текст на этикетке
 * пересобираются, а недоступные значения остаются видимыми, но выключенными —
 * ровно так, как это устроено на живом сайте.
 *
 *   [data-config]                 — область конфигуратора
 *   [data-config-opt="key"]       — чип параметра, значение в data-config-value
 *   [data-config-out="key"]       — место, где значение выводится
 *   [data-config-step="key"]      — блок шага целиком
 *
 * Движение — только кроссфейд значения: подмена происходит в тот момент, когда
 * текста не видно, поэтому глазу не за что зацепиться.
 */

/** Форматы без иглы: у них шаг «Тип иглы» существует, но выбирать нечего. */
const NEEDLELESS = ['Лигатура', 'Петля / без иглы'];
const FADE_MS = 130;

function render(scope: HTMLElement, key: string, value: string) {
  const outputs = Array.from(scope.querySelectorAll<HTMLElement>(`[data-config-out="${key}"]`));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    for (const node of outputs) node.textContent = value;
    return;
  }

  for (const node of outputs) node.classList.add('is-out');
  window.setTimeout(() => {
    for (const node of outputs) {
      node.textContent = value;
      node.classList.remove('is-out');
    }
  }, FADE_MS);
}

function select(scope: HTMLElement, key: string, value: string) {
  for (const chip of scope.querySelectorAll<HTMLElement>(`[data-config-opt="${key}"]`)) {
    const isActive = chip.dataset.configValue === value;
    chip.classList.toggle('p-chip--on', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  }

  render(scope, key, value);
  scope.dataset[`config${key[0].toUpperCase()}${key.slice(1)}`] = value;

  // Формат правит доступность игл: у лигатуры и петли иглы нет, но шаг со
  // сцены не убирается — покупатель должен видеть, чего у этого формата не бывает.
  if (key !== 'format') return;

  const needleless = NEEDLELESS.includes(value);
  const step = scope.querySelector<HTMLElement>('[data-config-step="needle"]');
  step?.classList.toggle('is-off', needleless);
  // Предмет на сцене обязан согласовываться с параметрами: без иглы её нет.
  scope.classList.toggle('is-needleless', needleless);

  const needleChips = Array.from(
    scope.querySelectorAll<HTMLButtonElement>('[data-config-opt="needle"]'),
  );
  for (const chip of needleChips) {
    chip.disabled = needleless;
    if (needleless) chip.classList.remove('p-chip--on');
  }

  if (needleless) {
    render(scope, 'needle', '—');
    return;
  }

  const current = needleChips.find((chip) => chip.dataset.configValue === scope.dataset.configNeedle);
  const restored = current ?? needleChips[0];
  if (restored?.dataset.configValue) select(scope, 'needle', restored.dataset.configValue);
}

export function initCaseConfig() {
  for (const scope of document.querySelectorAll<HTMLElement>('[data-config]')) {
    for (const chip of scope.querySelectorAll<HTMLElement>('[data-config-opt]')) {
      chip.addEventListener('click', () => {
        const key = chip.dataset.configOpt;
        const value = chip.dataset.configValue;
        if (!key || !value) return;
        select(scope, key, value);
      });
    }

    // Стартовое состояние уже отрисовано сервером — здесь только запоминаем
    // выбранную иглу, чтобы её можно было вернуть после формата без иглы.
    const active = scope.querySelector<HTMLElement>('[data-config-opt="needle"].p-chip--on');
    if (active?.dataset.configValue) scope.dataset.configNeedle = active.dataset.configValue;
  }
}
