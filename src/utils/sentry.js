import * as Sentry from '@sentry/vue'

const noop = () => {}

export const captureException = process.env.VUE_APP_USE_SENTRY === '1' ? Sentry.captureException : noop
export const captureMessage = process.env.VUE_APP_USE_SENTRY === '1' ? Sentry.captureMessage : noop

export default {
  Sentry,
  captureException,
  captureMessage
}
