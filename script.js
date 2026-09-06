// Astrosynthetic — scroll-driven robot turn (frame sequence) + section activation

(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Robot frame sequence: preload all 8 frames, then swap the <img> src
  //     based on scroll progress so the turn + eye-color change plays back. ---
  const FRAME_COUNT = 8;
  const framePaths = Array.from(
    { length: FRAME_COUNT },
    (_, i) => `assets/robot/frame-${String(i + 1).padStart(2, '0')}.png`
  );
  const robotImg = document.getElementById('robot-frame');
  let framesReady = false;
  let currentFrameIndex = 0;

  if (robotImg) {
    let loadedCount = 0;
    framePaths.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount += 1;
        if (loadedCount === FRAME_COUNT) framesReady = true;
      };
      img.src = src;
    });
  }

  function setRobotFrame(progress) {
    if (!robotImg) return;
    const index = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    if (index !== currentFrameIndex) {
      currentFrameIndex = index;
      robotImg.src = framePaths[index];
    }
  }

  // --- Scroll progress drives CSS var --progress (0 → 1 across the page)
  //     and picks which robot frame is showing. ---
  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY || root.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    root.style.setProperty('--progress', progress.toFixed(4));
    setRobotFrame(progress);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }

  updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // If reduced motion is requested, freeze on a calm mid-sequence frame
  // instead of continuously swapping images while scrolling.
  if (reduceMotion) {
    root.style.setProperty('--progress', '0.5');
    setRobotFrame(0.5);
    window.removeEventListener('scroll', onScroll);
  }

  // --- Activate rail items and timeline stages as they enter view ---
  const observedItems = document.querySelectorAll('.rail-item, .timeline li');

  if ('IntersectionObserver' in window && observedItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
          }
        });
      },
      { threshold: 0.5 }
    );
    observedItems.forEach((el) => observer.observe(el));
  } else {
    observedItems.forEach((el) => el.classList.add('is-active'));
  }

  // --- Waitlist form (static site — no backend attached yet) ---
  const form = document.getElementById('waitlist-form');
  const note = document.getElementById('form-note');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      if (!email) return;

      // NOTE: this is a static site with no backend. Wire this up to a form
      // service (Formspree, Getform, Basin) or your own API before launch —
      // see README.md for instructions.
      note.textContent = `You're on the list — we'll email ${email} when it's your turn.`;
      form.reset();
    });
  }

  // --- Footer year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
