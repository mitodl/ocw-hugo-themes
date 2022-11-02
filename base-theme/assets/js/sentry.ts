import * as Sentry from "@sentry/browser"

export const initSentry = (): typeof Sentry => {
  Sentry.init({
    release: RELEASE_VERSION,
    dsn:     process.env.SENTRY_DSN
  })
  return Sentry
}
