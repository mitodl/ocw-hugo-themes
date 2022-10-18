import * as Sentry from "@sentry/browser"

export const initSentry = (): typeof Sentry => {
  Sentry.init({
    release: RELEASE_VERSION,
    dsn:     SENTRY_DSN
  })
  return Sentry
}
