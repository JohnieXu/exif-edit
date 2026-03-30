import * as Sentry from '@sentry/vue'

const noop = () => {}

const enabled = import.meta.env.VITE_USE_SENTRY === '1'

export const captureException: (e: unknown) => void = enabled ? Sentry.captureException : noop
export const captureMessage: (message: string) => void = enabled ? Sentry.captureMessage : noop

export default {
  Sentry,
  captureException,
  captureMessage,
}
