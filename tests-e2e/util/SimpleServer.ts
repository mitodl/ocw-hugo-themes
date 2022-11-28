import * as http from "http"

type RedirectionRule =
  | {
      type: "rewrite"
      match: RegExp
      /**
       * Transform the url WITHOUT the origin.
       */
      transform: (url: string) => string
    }
  | {
      type: "redirect"
      match: RegExp
      /**
       * Transform the url; must include origin.
       */
      transform: (url: string) => string
    }

type Config = {
  rules: RedirectionRule[]
  verbose: boolean
}

const defaultConfig = {
  rules:   [],
  verbose: false
}

/**
 * A simple HTTP server that can be configured to redirect/rewrite requests to
 * other URLs.
 *
 * For example,
 *  - redirect /static requests to Webpack dev server
 *  - rewrite /not/a/course/page to /ocw-ci-test-www/not/a/course/page
 *
 * Rewrites do not create a new request; they modify `request.url` being handled.
 *
 * Elsewhere in our e2e tests, we use [serve-handler](https://github.com/vercel/serve-handler)
 * which supports "rewrites" and redirections. However, the rewrites must be
 * listed very verbosely. It is a real pain to rewrite ALL /static/ requests to
 * Webpack, or ALL /not/a/course/page requests to /ocw-ci-test-www/not/a/course/page.
 * Hence this thing.
 */
class SimpleServer {
  private handleNotRedirected: http.RequestListener
  private server: http.Server

  private config: Config

  constructor(handler: http.RequestListener, config: Partial<Config> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.handleNotRedirected = handler
    this.server = http.createServer(this.handler)
  }

  private handler: http.RequestListener = (request, response) => {
    const { rules = [] } = this.config
    const rule = rules.find(rule => rule.match.test(request.url ?? ""))
    if (rule) {
      const transformed = rule.transform(request.url ?? "")

      if (
        rule.type === "redirect" &&
        rules
          .filter(r => r.type === "redirect")
          .some(rule => rule.match.test(transformed))
      ) {
        // We don't need this, so let's prevent potential confusion
        throw new Error(`${request.url} would be redirected multiple times.`)
      }

      if (this.config.verbose) {
        const verbing = rule.type === "redirect" ? "Redirecting" : "Rewriting"
        console.log(`${verbing} ${request.method} ${request.url} to:`)
        console.log(`  ${transformed}`)
      }

      if (rule.type === "rewrite") {
        request.url = transformed
      } else {
        response.writeHead(302, { Location: transformed })
        response.end()
        return
      }
    }
    this.handleNotRedirected(request, response)
  }

  listen(port: number) {
    this.server.listen(port)
  }

  close() {
    this.server.close()
  }
}

export default SimpleServer
export type { RedirectionRule }
