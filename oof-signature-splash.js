/* OOF Signature Splash — eye enters the app. */
(() => {
  let entering = false;

  function enterApp() {
    if (entering) return;
    entering = true;

    const splash = document.getElementById('splash');
    const title = document.getElementById('splashTitle');
    const eye = document.getElementById('splashEyeRestart');

    if (!splash || !title) {
      entering = false;
      return;
    }

    if (eye) {
      eye.disabled = true;
      eye.blur();
    }

    splash.classList.add('splashEntering');
    title.classList.add('splashEntering');

    window.setTimeout(() => {
      splash.classList.add('done');
      const main = document.querySelector('.app-shell');
      if (main) main.setAttribute('tabindex', '-1');
      if (main && typeof main.focus === 'function') main.focus({ preventScroll: true });
      window.setTimeout(() => splash.remove(), 560);
    }, 1880);
  }

  document.addEventListener('click', event => {
    const eye = event.target.closest && event.target.closest('#splashEyeRestart');
    if (!eye) return;
    event.preventDefault();
    event.stopPropagation();
    enterApp();
  });

  window.addEventListener('keydown', event => {
    const eye = event.target.closest && event.target.closest('#splashEyeRestart');
    if (eye && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      enterApp();
    }
  });
})();
