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
    const { left, right } = await gestures.readInsets();
    if (Number.isFinite(left) && Number.isFinite(right)) {
      root.style.setProperty('--android-gesture-left', `${left}px`);
      root.style.setProperty('--android-gesture-right', `${right}px`);
    }
  }

  const refreshInsets = () => updateGestureInsets().catch(console.error);
  refreshInsets();
  window.addEventListener('resize', refreshInsets);
  App.addListener('resume', refreshInsets).catch(console.error);
}
