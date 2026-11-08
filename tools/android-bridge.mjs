import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('MercadinhoHaptics')) {
  const haptics = registerPlugin('MercadinhoHaptics');
  globalThis.mercadinhoHaptics = kind => haptics.pulse({ kind });
}

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('App')) {
  globalThis.mercadinhoExit = () => App.exitApp();
}

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('MercadinhoGestures')) {
  const root = document.documentElement;
  const gestures = registerPlugin('MercadinhoGestures');
  root.classList.add('android-game');

  async function updateGestureInsets() {
    const { left, right, immersive } = await gestures.readInsets();
    root.classList.toggle('android-immersive', immersive === true);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      root.style.setProperty('--android-gesture-left', `${left}px`);
      root.style.setProperty('--android-gesture-right', `${right}px`);
    }
  }

  const refreshInsets = () => updateGestureInsets().catch(console.error);
  refreshInsets();
  window.addEventListener('resize', refreshInsets);
  window.addEventListener('load', refreshInsets, { once: true });
  setTimeout(refreshInsets, 600);
  App.addListener('resume', refreshInsets).catch(console.error);

  document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.board-stage');
    let scheduled = false;
    const updateBounds = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const { top, bottom } = board.getBoundingClientRect();
        gestures.setBoardBounds({ top, bottom }).catch(console.error);
      });
    };
    const observer = new ResizeObserver(updateBounds);
    observer.observe(board);
    observer.observe(document.querySelector('.shop-stage header'));
    window.addEventListener('scroll', updateBounds, { passive: true });
    window.addEventListener('resize', updateBounds);
    updateBounds();
  });
}
