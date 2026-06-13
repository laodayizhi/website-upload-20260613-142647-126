function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    panel.hidden = isOpen;
  });
}

function setupHeroSlider() {
  const slider = document.querySelector('.hero-slider');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(slider.querySelectorAll('.hero-dot'));
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupLocalFilter() {
  const input = document.querySelector('.local-filter');
  const grid = document.querySelector('.filterable-grid');
  const empty = document.querySelector('.empty-state');

  if (!input || !grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year
      ].join(' ').toLowerCase();
      const visible = !query || haystack.includes(query);
      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  });
}

setupMobileMenu();
setupHeroSlider();
setupLocalFilter();
