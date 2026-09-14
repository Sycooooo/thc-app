import type { CapacitorConfig } from '@capacitor/cli'

// Coque native iOS : la WebView charge directement le site déployé sur Vercel.
// Le dossier capacitor-web n'est qu'un secours (page de redirection).
const config: CapacitorConfig = {
  appId: 'com.sycooooo.thcapp',
  appName: 'THC App',
  webDir: 'capacitor-web',
  server: {
    url: 'https://thc-app-six.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#0a0a14',
    scheme: 'THC App',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#0a0a14',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a14',
    },
  },
}

export default config
