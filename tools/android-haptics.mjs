import { Capacitor, registerPlugin } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('MercadinhoHaptics')) {
  const haptics = registerPlugin('MercadinhoHaptics');
  globalThis.mercadinhoHaptics = kind => haptics.pulse({ kind });
}
