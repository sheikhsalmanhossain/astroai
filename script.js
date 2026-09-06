// Astrosynthetic — scroll-driven robot turn (video scrub) + section activation

(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Robot video: paused, never auto-plays. script.js sets its currentTime
  //     directly based on scroll position, so scrolling scrubs through the
  //     clip frame-accurately (the video was encoded with every frame as a
  //     keyframe specifically so this seeking stays smooth). ---
  const robotVideo = document.getElementById('robot-video');
  let videoDuration = 0;

  if (robotVideo) {
    robotVideo.addEventListener('loadedmetadata', () => {
      videoDuration = robotVideo.duration || 0;
    });
    // In case metadata is already cached/available by the time this runs.
    if (robotVideo.readyState >= 1 && robotVideo.duration) {
      videoDuration = robotVideo.duration;
    }
  }

  function setVideoProgress(progress) {
    if (!robotVideo || !videoDuration) return;
    // Clamp slightly inside the end so we never try to seek past the last frame.
    const target = Math.min(progress * videoDuration, videoDuration - 0.05);
    if (Math.abs(robotVideo.currentTime - target) > 0.02) {
      robotVideo.currentTime = target;
    }
  }

  // --- Scroll progress drives CSS var --progress (0 → 1 across the page)
  //     and scrubs the robot video. ---
  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY || root.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    root.style.setProperty('--progress', progress.toFixed(4));
    setVideoProgress(progress);
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

  // If reduced motion is requested, freeze on a calm mid-clip frame instead
  // of continuously seeking the video while scrolling.
  if (reduceMotion) {
    root.style.setProperty('--progress', '0.5');
    if (robotVideo) {
      robotVideo.addEventListener('loadedmetadata', () => setVideoProgress(0.5), { once: true });
    }
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
