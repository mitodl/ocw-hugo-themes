import * as Sentry from "@sentry/browser"

export const initSentry = (): typeof Sentry => {
  const sentryDSN = process.env.SENTRY_DSN
  Sentry.init({
    release:    RELEASE_VERSION,
    dsn:        sentryDSN,
    beforeSend: event => (sentryDSN ? event : null)
  })
  return Sentry
}
