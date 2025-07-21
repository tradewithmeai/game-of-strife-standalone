
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.gameofstrife.local',
  appName: 'Game of Strife',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    },
    StatusBar: {
      backgroundColor: '#1a1a2e',
      style: 'dark'
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
