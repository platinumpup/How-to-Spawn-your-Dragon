/* OOF Signature Splash — eye-only restart. */
(() => {
  let restarting = false;

  function restartSplashAnimation() {
    if (restarting) return;
    restarting = true;

    const splash = document.getElementById('splash');
    const title = document.getElementById('splashTitle');
    const eye = document.getElementById('splashEyeRestart');

    if (!splash || !title) {
      restarting = false;
      return;
    }

    if (eye) eye.disabled = true;
    splash.classList.add('splashRestarting');
    title.classList.add('splashRestarting');

    window.setTimeout(() => {
      const freshTitle = title.cloneNode(true);
      freshTitle.classList.remove('splashRestarting');
      title.replaceWith(freshTitle);
      splash.classList.remove('splashRestarting');

      const freshEye = freshTitle.querySelector('#splashEyeRestart');
      if (freshEye) {
        freshEye.disabled = false;
        // Keep the eye from showing a mobile/desktop focus halo after replay.
      }
      restarting = false;
    }, 1950);
  }

  document.addEventListener('click', event => {
    const eye = event.target.closest && event.target.closest('#splashEyeRestart');
    if (!eye) return;
    event.preventDefault();
    event.stopPropagation();
    restartSplashAnimation();
  });

  window.addEventListener('keydown', event => {
    const eye = event.target.closest && event.target.closest('#splashEyeRestart');
    if (eye && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      restartSplashAnimation();
    }
  });

})();
