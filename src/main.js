import Vue from 'vue'
import * as Sentry from '@sentry/vue'
// import { BrowserTracing } from '@sentry/tracing'
import App from './App.vue'

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'production') {
  console.log('sentry init')
  Sentry.init({
    Vue,
    dsn: 'https://19b08fd5fcf54e76a810af90855623c6@o312514.ingest.sentry.io/4504241327177728',
    integrations: [
      // new BrowserTracing({
      //   routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      //   tracePropagationTargets: ['localhost', 'my-site-url.com', /^\//]
      // })
    ],
    tracesSampleRate: 1.0,
    normalizeDepth: 10, // 对象格式化层级深度
    release: '0.0.1',
    environment: 'production'
  })
}


new Vue({
  render: h => h(App),
}).$mount('#app')
