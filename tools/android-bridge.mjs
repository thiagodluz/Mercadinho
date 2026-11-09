import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { createNativeStorage } from './native-storage.mjs';

if (Capacitor.getPlatform() === 'android') {
  function reportStorageError(error) {
    console.error('Falha ao salvar o progresso:', error);
    let notice = document.getElementById('storage-error');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'storage-error';
      notice.setAttribute('role', 'alert');
      notice.style.cssText = 'position:fixed;z-index:100;bottom:0;left:0;right:0;margin:0;padding:12px;background:#743510;color:white;text-align:center';
      document.body.append(notice);
    }
    notice.textContent = 'Não foi possível salvar o progresso. Verifique o espaço disponível no aparelho.';
  }
  globalThis.mercadinhoStorageReady = createNativeStorage(Preferences, localStorage, reportStorageError)
    .then(storage => { globalThis.mercadinhoStorage = storage; });
}

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
