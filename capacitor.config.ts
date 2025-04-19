import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safewake.app',
  appName: 'SafeWake',
  webDir: 'client/dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3bab3d",
      sound: "alarm_sound.wav"
    },
    CapacitorHttp: {
      enabled: true,
    },
  }
};

export default config;
