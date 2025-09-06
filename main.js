// Rotating hero text
(function rotateHero() {
  const el = document.querySelector('.rotating-text');
  if (!el) return;
  let phrases = [];
  try {
    phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
  } catch {}
  if (!Array.isArray(phrases) || phrases.length === 0) return;
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % phrases.length;
    el.textContent = phrases[idx];
  }, 2500);
})();

// IntersectionObserver for reveal
(function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

// Counter animation for stats
(function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const format = (value, suffix) => `${Math.floor(value)}${suffix || ''}`;

  const run = (el) => {
    const target = Number(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased, suffix);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = format(target, suffix);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        run(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach((el) => io.observe(el));
})();
