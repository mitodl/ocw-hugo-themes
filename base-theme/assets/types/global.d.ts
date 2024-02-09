declare module "@sentry/browser" {
  // The sentry type definitions for additionalData appear to be incorrect.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function captureException(exception: any, additionalData?: any): string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function captureMessage(message: string, additionalData?: any): string
}

declare global {
  declare let RELEASE_VERSION: string
  namespace NodeJS {
    interface ProcessEnv {
      COURSE_SEARCH_API_URL: string
      CONTENT_FILE_SEARCH_API_URL: string
    }
  }
}

export {}
