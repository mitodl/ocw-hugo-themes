# End-to-end Testing

This repository uses [Playwright](https://playwright.dev/) for end-to-end testing. Roughly, the Playwright tests build static assets with Webpack and Hugo then use headless browsers to manipulate the generated pages. We make assertions about the pages using Playwright's typescript library [`@playwright/test`](https://playwright.dev/docs/intro).

In OCW Hugo Themes, **most tests should be e2e**. See [Why playwright?](#why-playwright) for more. 

## FAQ

### How to Run Playwright

To run the tests:
1. `yarn start:webpack` in one shell, and
2. `yarn test:e2e` in another. *Or `yarn test:e2e --debug` to step through tests.

Running `yarn test:e2e` by itself will also work. However, if you start a webpack server in a separate process first, Playwright will use that server instead rather than starting a new one, resulting in much less overhead if you need to re-run tests.

_**Note:** We've had trouble running Playwright on M1 macs using Node 18, though Node 16 works fine._

### Is there a `--watch` mode for re-running tests?

No. For VS Code users, a similar experience can be achieved with [Playwright for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright). Individual tests can be run from your editor with the click of a button.

### How do I generate test content?
The easiest way is probably through Studio. See [https://ocw-studio-rc.odl.mit.edu/sites/ocw-ci-test-course](https://ocw-studio-rc.odl.mit.edu/sites/ocw-ci-test-course/type/metadata/), for example. 

### Why Playwright?
Historically, we've used Jest and JSDom to test *some* aspects of OCW Hugo Themes. However, building any significant confidence in OCW Hugo Themes via Jest+JSDom has proven difficult for two reasons: (1) a large portion of the repo's logic is in Hugo templates, and (2) the output of Hugo is static HTML files, not JS modules. Neither of these issues is a challenge when testing Hugo's output via Playwright, and we get other benefits, too. (For example: ability to test features like infinite scroll that rely on layout, or the possibility to do visual testing.)