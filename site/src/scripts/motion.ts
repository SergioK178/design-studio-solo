// Система движения сайта: reveal при скролле, стаггер групп, магнитные CTA,
// курсор-ярлык и морфинг фона между секциями. Все скрытые состояния в CSS
// включаются только при html.js и prefers-reduced-motion: no-preference.

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// --- Reveal при скролле -----------------------------------------------------

const singles = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-group]'));

for (const group of groups) {
  Array.from(group.children).forEach((child, index) => {
    (child as HTMLElement).style.setProperty('--ri', String(index));
  });
}

const finish = (el: HTMLElement) => {
  // Возвращаем элементам их родные transition после завершения reveal-а.
  window.setTimeout(() => el.classList.add('reveal-done'), 1600);
};

if (motionOK && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        finish(el);
        io.unobserve(el);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  [...singles, ...groups].forEach((el) => io.observe(el));
} else {
  [...singles, ...groups].forEach((el) => el.classList.add('is-in', 'reveal-done'));
}

// --- Магнитные CTA ----------------------------------------------------------

if (motionOK && finePointer) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.22;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.32;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }
}

// --- Курсор-ярлык над кейсами -----------------------------------------------

const cursorTargets = document.querySelectorAll<HTMLElement>('[data-cursor]');

if (motionOK && finePointer && cursorTargets.length > 0) {
  const label = document.createElement('div');
  label.className = 'cursor-label';
  label.setAttribute('aria-hidden', 'true');
  const text = document.createElement('b');
  label.append(text);
  document.body.append(label);

  let x = -200;
  let y = -200;
  let targetX = x;
  let targetY = y;

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  const loop = () => {
    x += (targetX - x) * 0.16;
    y += (targetY - y) * 0.16;
    label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  for (const target of cursorTargets) {
    target.addEventListener('mouseenter', () => {
      text.textContent = target.dataset.cursor ?? '';
      label.classList.add('on');
    });
    target.addEventListener('mouseleave', () => label.classList.remove('on'));
  }
}

// --- Отсчёт чисел (data-countup) ----------------------------------------------
// Анимирует первое число в текстовом содержимом от 0 до финального значения.

const counters = document.querySelectorAll<HTMLElement>('[data-countup]');

if (counters.length > 0 && 'IntersectionObserver' in window) {
  const runCount = (el: HTMLElement) => {
    const source = el.textContent ?? '';
    const match = source.match(/\d+/);
    if (!match || match.index === undefined) return;
    const final = parseInt(match[0], 10);
    const prefix = source.slice(0, match.index);
    const suffix = source.slice(match.index + match[0].length);
    const started = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const p = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * p);
      el.textContent = `${prefix}${Math.round(final * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = source;
    };
    requestAnimationFrame(tick);
  };

  if (motionOK) {
    const countIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          runCount(entry.target as HTMLElement);
          countIO.unobserve(entry.target);
        }
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => countIO.observe(el));
  }
}

// --- Параллакс внутри рамок (data-parallax) ------------------------------------
// Первый дочерний элемент двигается медленнее скролла; масштаб в CSS
// компенсирует сдвиг, чтобы не открывались края.

const parallaxFrames = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));

if (motionOK && parallaxFrames.length > 0) {
  const strength = 38;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const frame of parallaxFrames) {
      const inner = frame.firstElementChild as HTMLElement | null;
      if (!inner) continue;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) continue;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      inner.style.transform = `translateY(${(progress * -strength).toFixed(1)}px) scale(1.08)`;
    }
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

// --- Морфинг фона между секциями ---------------------------------------------

const themed = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]'));

// Морфинг — тоже анимация: при reduced-motion секции остаются с нативными
// фонами (это же чинит full-page скриншоты в capture-screens).
if (motionOK && themed.length > 0) {
  // Активна секция на «линии чтения» — 33% высоты вьюпорта. Детерминированно:
  // побеждает последняя секция, чей верх выше линии (важно для коротких
  // хедеров, которые центральная полоса пропускала бы при загрузке).
  const pickBg = () => {
    const line = window.innerHeight * 0.33;
    let active = themed[0];
    for (const el of themed) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) active = el;
    }
    return active.dataset.bg;
  };

  const applyBg = () => {
    const bg = pickBg();
    if (bg) document.body.style.setProperty('--page-bg', `var(--color-${bg})`);
  };

  // Стартовый цвет ставим до включения theme-scroll (transition живёт на
  // body.theme-scroll), чтобы фон не «переезжал» при первой отрисовке.
  applyBg();
  requestAnimationFrame(() => document.body.classList.add('theme-scroll'));

  let bgTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (bgTicking) return;
      bgTicking = true;
      requestAnimationFrame(() => {
        bgTicking = false;
        applyBg();
      });
    },
    { passive: true },
  );
}
