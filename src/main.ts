import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: 'https://19b08fd5fcf54e76a810af90855623c6@o312514.ingest.sentry.io/4504241327177728',
    tracesSampleRate: 1.0,
    normalizeDepth: 10,
    release: '0.0.1',
    environment: 'production',
  })
}

app.mount('#app')
