/* eslint-disable no-console */
import * as Sentry from "@sentry/browser"

export const initSentry = () => {
  Sentry.init({
    dsn:
      "https://eee58f41dda54d2b814296e12dced4b7@o48788.ingest.sentry.io/5304953"
  })
}
