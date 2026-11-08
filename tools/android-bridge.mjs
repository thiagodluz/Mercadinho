import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('MercadinhoHaptics')) {
  const haptics = registerPlugin('MercadinhoHaptics');
  globalThis.mercadinhoHaptics = kind => haptics.pulse({ kind });
}

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('App')) {
  App.addListener('backButton', () => {
    document.dispatchEvent(new Event('mercadinho-android-back'));
  }).catch(console.error);
  globalThis.mercadinhoExit = () => App.exitApp();
}
