/**
 * Переключатель сценария покупки для кейса «Ольгинка».
 *
 * На живом сайте это React-контекст, который меняет весь копирайт разом. В кейсе
 * та же механика нужна дважды — в hero (сцена 1) и в главе «Один объект — два
 * сценария» (сцена 3), — поэтому она атрибутивная и не знает про конкретные сцены.
 *
 *   [data-mode-scope]           — область синхронизации
 *   [data-mode-btn="id"]        — кнопка внутри области
 *   [data-mode-panel="id"]      — панель, которую она показывает
 *   [data-mode-emphasis]        — панели видны всегда, кнопка только акцентирует
 *   [data-mode-mark="id"]       — элемент, который только подсвечивается классом
 *                                 (ячейка матрицы, кадр под заметкой): прятать
 *                                 его от скринридера нельзя, он часть таблицы
 *   [data-mode-name] / [data-mode-sub]
 *                               — подписи, которые повторяют имя выбранного
 *                                 варианта: текст берётся с кнопки
 *
 * Клавиатура работает по контракту ARIA tablist только там, где кнопки реально
 * объявлены табами: в hero пилюля переключает копирайт вокруг себя, а не панели
 * с ролями, и перехватывать там стрелки не нужно.
 */

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

function activate(scope: HTMLElement, id: string) {
  const buttons = Array.from(scope.querySelectorAll<HTMLElement>('[data-mode-btn]'));
  const panels = Array.from(scope.querySelectorAll<HTMLElement>('[data-mode-panel]'));
  const emphasis = scope.hasAttribute('data-mode-emphasis');

  for (const button of buttons) {
    const isActive = button.dataset.modeBtn === id;
    button.classList.toggle('is-active', isActive);
    if (button.getAttribute('role') === 'tab') {
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    } else if (button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', String(isActive));
    }
  }

  for (const panel of panels) {
    const isActive = panel.dataset.modePanel === id;
    panel.classList.toggle('is-active', isActive);
    // В режиме акцента обе панели остаются на экране — прятать неактивную от
    // скринридера и от табуляции нельзя, она такой же полноценный экспонат.
    if (emphasis) continue;
    // Иначе панели лежат стопкой и кроссфейдятся, оставаясь в потоке, —
    // скрываем неактивную вручную.
    panel.toggleAttribute('inert', !isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  }

  for (const mark of scope.querySelectorAll<HTMLElement>('[data-mode-mark]')) {
    mark.classList.toggle('is-active', mark.dataset.modeMark === id);
  }

  // Имя выбранного варианта повторяется в итоге и на телефоне: держим его
  // одной строкой правды — подписью на самой кнопке.
  const active = buttons.find((button) => button.dataset.modeBtn === id);
  if (active?.dataset.modeLabel) {
    for (const node of scope.querySelectorAll<HTMLElement>('[data-mode-name]')) {
      node.textContent = active.dataset.modeLabel;
    }
  }
  if (active?.dataset.modeSublabel) {
    for (const node of scope.querySelectorAll<HTMLElement>('[data-mode-sub]')) {
      node.textContent = active.dataset.modeSublabel;
    }
  }

  scope.dataset.modeActive = id;
}

export function initCaseMode() {
  const scopes = Array.from(document.querySelectorAll<HTMLElement>('[data-mode-scope]'));

  for (const scope of scopes) {
    const buttons = Array.from(scope.querySelectorAll<HTMLElement>('[data-mode-btn]'));
    if (!buttons.length) continue;

    // Стартовое состояние ставим из разметки, чтобы без JS страница осталась
    // рабочей: активный сценарий уже отрисован сервером.
    activate(scope, scope.dataset.modeActive ?? buttons[0].dataset.modeBtn ?? '');

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(scope, button.dataset.modeBtn ?? ''));

      if (button.getAttribute('role') !== 'tab') return;

      button.addEventListener('keydown', (event) => {
        if (!ARROW_KEYS.includes(event.key)) return;
        event.preventDefault();
        const tabs = buttons.filter((item) => item.getAttribute('role') === 'tab');
        const current = tabs.indexOf(button);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.focus();
        activate(scope, tabs[next]?.dataset.modeBtn ?? '');
      });
    });
  }
}
