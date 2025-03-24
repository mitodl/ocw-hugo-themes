# ocw-hugo-themes

This is a collection of [Hugo](https://gohugo.io/) themes. They can be used to generate pages related to the OCW website as well as OCW course sites.

## Structure

```
base-theme/
├── assets/
│   ├── css/
│   ├── js/
│   ├── fonts/
│   ├── webpack/ (webpack configuration for building css / js bundles)
│   └── index.ts
├── data/
│   └── webpack.json (describes location of rendered webpack assets)
├── layouts/
│   ├── _default/ (standard Hugo base templates)
│   ├── partials/
│   ├── shortcodes/
│   ├── 404.html
│   └── robots.txt
└── static/
    └── images (images inherited by every theme)
course/
├── assets/
│   ├── css/
│   ├── js/
│   └── course.ts
├── data/
│   ├── departments.json (map of department numbers)
│   └── search_query_keys.json (map of search query strings)
└── layouts/
    ├── _default/
    ├── pages/
    ├── partials/
    ├── resources/
    ├── shortcodes/
    └── home.html
fields/
├── assets/
│   ├── css/
│   ├── js/
│   └── fields.js
└── layouts/
    ├── _default/
    ├── partials/
    └── home.html
www/
├── archetypes/ (various Hugo markdown templates for manually creating content with "hugo new")
├── assets/
│   ├── css/
│   ├── js/ (contains React based search app)
│   └── www.tsx
├── content/
│   └── search/
│       └── _index.md (placeholder to tell Hugo to render the search page)
└── layouts/
    ├── _default/
    ├── instructor/
    ├── pages/
    ├── partials/
    ├── search/
    ├── testimonials/
    └── home.html
package_scripts/ (various scripts for packaging and deployment)
```

## Themes

### base-theme

The base theme should be inherited first whenever using any of the other
themes. It includes the webpack configuration for building the CSS / JS used
by all the themes as well as the base layouts that include the built assets.
Anything that is to be used by all other themes should be placed here.

### course

![18.06 Linear Algebra Spring 2010](https://user-images.githubusercontent.com/12089658/137996002-ade25b96-9c75-4a43-a3c2-715ed68cc976.png)

The course theme is used to render OCW course sites. Content is generated by
[`ocw-studio`](https://github.com/mitodl/ocw-studio) and the structure is
defined in
[`ocw-hugo-projects`](https://github.com/mitodl/ocw-hugo-projects/blob/main/ocw-course/ocw-studio.yaml).
The main components are "pages" and "resources." Course sites can be edited in
an instance of `ocw-studio` and published to a backend like Github as Hugo
markdown content that can be built using the course theme.

### www

![OCW Home Page](https://user-images.githubusercontent.com/12089658/137997162-ab717049-a516-479e-b567-a82a7135e65e.png)

The www theme is primarily responsible for rendering the OCW home page,
although there are a few other types of content it is set up to handle
including instructors that are rendered in a static JSON API, testimonials and
the promotions seen in the carousel. This content can be edited in an instance
of [`ocw-studio`](https://github.com/mitodl/ocw-studio) and it uses the
`ocw-www` starter configuration in
[`ocw-hugo-projects`](https://github.com/mitodl/ocw-hugo-projects/blob/main/ocw-www/ocw-studio.yaml).

### fields

![Philosphy Fields Page](https://user-images.githubusercontent.com/12089658/166737333-442e2334-6f89-43c9-963c-91e7e0a010aa.png)

The fields theme is used to render collections of course lists,
much like the collections linked from the OCW home page. In this theme,
the field that you specify in your content is used as the home page. This
content can be edited in an instance of [`ocw-studio`](https://github.com/mitodl/ocw-studio)
and it uses the `mit-fields` starter configuration in
[`ocw-hugo-projects`](https://github.com/mitodl/ocw-hugo-projects/blob/main/mit-fields/ocw-studio.yaml).

## Local development

### Dependencies

- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [NodeJS](https://nodejs.org/en/download/); version managed by nvm
- [Yarn](https://yarnpkg.com/getting-started/install)

If you're running the site for the first time, or if dependencies have changed,
install dependencies with:

`yarn install`

You will also need git access to clone repos from
https://github.mit.edu/ocw-content-rc, so make sure your command line `git`
interface is configured to do so.

### Running Sites (courses and ocw-www)

After installing dependences and ensuring git access to content repositories, you need only run `yarn start www` or `yarn start course`. The site should then be available at https://localhost:3000.

The `yarn start course` and `yarn start www` commands will clone additional content if needed: Hugo configuration files from [ocw-hugo-projects](https://github.com/mitodl/ocw-hugo-projects) and site content from [ocw-content-rc](https://github.mit.edu/ocw-content-rc)). The default (and recommended!) behavior is that these resources are stored in sibling directories of `ocw-hugo-themes`:

```
your/favorite/dir/
├─ ocw-hugo-themes/         hugo themes
├─ ocw-hugo-projects/       hugo configuration files
├─ ocw-content-rc/
   ├─ ocw-www/              ocw homepage repo
   ├─ 8.01sc-fall-2016/     course site repo
   ├─ 9.40-spring-2018/     course site repo
   ├─ ...and so on
```

For `yarn start www`, see note about [CORS](#cors).

The `start` CLI commands provide some configuration options and, in general, the default values of these options are set to environment variables. For example:

- to change where site content should be stored, alter `COURSE_CONTENT_PATH` and `WWW_CONTENT_PATH` environment variables. (Can be overriden with `--content-dir` cli option.)
- to change the github org from which site content is fetched alter `GIT_CONTENT_SOURCE` environment variable (can be overriden with `--git-content-source`). By default, content is pulled from RC.

Run `yarn start course --help` , `yarn start www --help`, and see [Environment Variables](#environment-variables) for more details.

**Customizing site content:** To customize site content, either edit the site markdown locally, or edit the site at https://ocw-studio-rc.odl.mit.edu/sites/. After editing content in Studio, run `yarn start course <course-short-id>` (or `yarn start www` if you're working on ocw-www). If you already had the site locally, you will need to `cd` to the content directory and manually fetch the updated content with `git pull`.

**MIT Fields:** In addition to ocw-www and the course sites, an experimental project "MIT Fields" is also available. Run `yarn start fields` to run an example fields site.

### Obtaining and Creating Content

Content for the themes in this repo can be generated using an instance of [`ocw-studio`](https://github.com/mitodl/ocw-studio), a CMS used to author OCW sites. The RC instance is located at https://ocw-studio-rc.odl.mit.edu. Its content is published to MIT's Github Enterprise instance under the [`ocw-content-rc`](https://github.mit.edu/ocw-content-rc) organization. For the `www` theme, content can be found in the [`ocw-www`](https://github.mit.edu/ocw-content-rc/ocw-www) repo. For the `course` theme, use any repo in the [`ocw-content-rc`](https://github.mit.edu/ocw-content-rc) organization created using the `ocw-course` starter or create and publish your own.

Much the same for `fields`, you can either create your own site using the
`mit-fields` starter or find an existing one and use that.

### Environment variables

During local development, environment variables are read from `.env`. However, this project has no required environment variables _for development_.

To seed a `.env` file with your development values (e.g., for running production-esque commands during development), run `yarn with-env --dev --print-env '' > .env`.

To further explain the various environment variables and what they do:

| Variable                  | Relevant Themes               | Example                                             | Description                                                                                                                                                                                  |
| ------------------------- | ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GTM_ACCOUNT_ID`          | `base-theme`, `www`, `course` | N/A                                                 | A string representing a Google account ID to initialize Google Tag Manager with                                                                                                              |
| `SEARCH_API_URL`          | `www`                         | `http://discussions-rc.odl.mit.edu/api/v0/search/`  | A URL to an `open-discussions` search API to fetch results from                                                                                                                              |
| `OCW_STUDIO_BASE_URL`     | `www`                         | `http://ocw-studio-rc.odl.mit.edu/`                 | A URL of an instance of [`ocw-studio`](https://github.com/mitodl/ocw-studio) to fetch home page content from                                                                                 |
| `STATIC_API_BASE_URL`     | `course`                      | `http://ocw.mit.edu/`                               | A URL of a deployed Hugo site with a static JSON API to query against                                                                                                                        |
| `RESOURCE_BASE_URL`       | `base-theme`                  | `https://live-qa.ocw.mit.edu/`                      | A base URL to prefix the rendered path to resources with                                                                                                                                     |
| `SITEMAP_DOMAIN`          | `base-theme`                  | `ocw.mit.edu`                                       | The domain used when writing fully qualified URLs into the sitemap                                                                                                                           |
| `WWW_HUGO_CONFIG_PATH`    | `www`                         | `/path/to/ocw-hugo-projects/ocw-www/config.yaml`    | A path to the `ocw-www` Hugo configuration file                                                                                                                                              |
| `COURSE_HUGO_CONFIG_PATH` | `course`                      | `/path/to/ocw-hugo-projects/ocw-course/config.yaml` | A path to the `ocw-course` Hugo configuration file                                                                                                                                           |
| `WWW_CONTENT_PATH`        | `www`                         | `/path/to/ocw-content-rc/ocw-www`                   | A path to a Hugo site that will be rendered when running `yarn start www`                                                                                                                    |
| `COURSE_CONTENT_PATH`     | `course`                      | `/path/to/ocw-content-rc/`                          | A path to a base folder containing `ocw-course` type Hugo sites                                                                                                                              |
| `OCW_TEST_COURSE`         | `course`                      | `18.06-spring-2010`                                 | The name of a folder in `COURSE_CONTENT_PATH` containing a Hugo site that will be rendered when running `yarn start course`                                                                  |
| `OCW_COURSE_STARTER_SLUG` | `www`                         | `ocw-course`                                        | When generating "New Courses" cards on the home page, the `ocw-studio` API is queried using `OCW_STUDIO_BASE_URL`. This value determines the `type` used in the query string against the API |
| `FIELDS_HUGO_CONFIG_PATH` | `fields`                      | `/path/to/ocw-hugo-projects/mit-fields/config.yaml` | A path to the `mit-fields` Hugo configuration file                                                                                                                                           |
| `FIELDS_CONTENT_PATH`     | `fields`                      | `/path/to/ocw-content-rc/philosophy`                | A path to a Hugo site that will be rendered when running `yarn start fields`                                                                                                                 |
| `WEBPACK_ANALYZE`         | N/A                           | `true`                                              | Used in webpack build. If set to `true`, a dependency analysis of the bundle will be included in the build output.                                                                           |
| `WEBPACK_HOST`            | N/A                           | `localhost`                                         | Host used by Hugo when querying the Webpack Dev Server. Can be set to your local IP to enable testing OCW on other devices (e.g., phones) within your network.                               |
| `WEBPACK_PORT`            | N/A                           | `3001`                                              | Port used by Webpack Dev Server                                                                                                                                                              |
| `NOINDEX`                 | `base-theme`                  | `true`                                              | Whether a noindex tag should be added to prevent indexing by web crawlers                                                                                                                    |
| `POSTHOG_API_HOST` | `www`, `course` | `https://app.posthog.com` | PostHog API URL
| `POSTHOG_ENABLED` | `www`, `course` | `true` | Whether PostHog analytics are enabled
| `POSTHOG_ENV` | `www`, `course` | `production` | Environment for PostHog
| `POSTHOG_PROJECT_API_KEY` | `www`, `course` | `api-key` | API key for PostHog |
| `MIT_LEARN_BASE_URL` | N/A | `http://learn.odl.local:8062` | The base URL for the frontend of an instance of [`mit-learn`](https://github.com/mitodl/mit-learn) |
| `MIT_LEARN_API_BASE_URL` | N/A | `http://learn.odl.local:8065` | The base URL for the API gateway (APISIX) of an instance of [`mit-learn`](https://github.com/mitodl/mit-learn) |


### Writing Tests

Most tests in OCW Hugo Themes should be written as e2e tests with Playwright. See [End to End Testing](./tests-e2e/README.md) for more.

### Miscellaneous commands

- `WEBPACK_ANALYZE=true yarn run build:webpack`: This builds the project for production and should open an analysis of the bundle in your web browser.

### External API's

The `www` theme accesses external API's made available by
[`ocw-studio`](https://github.com/mitodl/ocw-studio) and
[`open-discussions`](https://github.com/mitodl/open-discussions) for some
functionality. Search results are provided by `open-discusisons` and
`ocw-studio` provides some content for the home page, such as newly added
courses and news items. If you need to work with this functionality you can
either run a local instance of either of these projects, or alternatively point
at the RC instances and temporarily disable CORS in your browser.

#### MIT Learn integration

One of the external API's that can be integrated into OCW sites is based on [MIT Learn](https://github.com/mitodl/mit-learn).
There are two environment variables you can set related to this functionality;
`MIT_LEARN_BASE_URL` and `MIT_LEARN_API_BASE_URL`. The former is used to construct 
URLs to the login / logout pages, and the latter is used to construct calls to the API.
In the following examples, we will assume you are running `mit-learn` locally with:

- `MIT_LEARN_BASE_URL=http://open.odl.local:8062`
- `MIT_LEARN_API_BASE_URL=http://api.open.odl.local:8065`

We also assume that you have configured `mit-learn` to run on this domain, and that you
have set up a `hosts` DNS record to point it at the local IP address of your development
machine. It is recommended to set a static IP address, but not necessary. Assuming your
IP is 192.168.1.123, you would add the following to your `hosts` file:

```
192.168.1.123 open.odl.local
192.168.1.123 api.open.odl.local
192.168.1.123 kc.ol.local
192.168.1.123 ocw.odl.local
```

On the `mit-learn` side, in your `.env` file you will want to set the following values as a
bare minimum:

```
COMPOSE_PROFILES=backend,frontend,apisix,keycloak
CSRF_COOKIE_DOMAIN=.odl.local
ALLOWED_REDIRECT_HOSTS=["localhost:3000", "ocw.odl.local:3000"]
CORS_ALLOWED_ORIGINS=["http://localhost:3000", "http://ocw.odl.local:3000"]
CSRF_TRUSTED_ORIGINS=["http://localhost:3000", "http://ocw.odl.local:3000"]
```

After setting these values and spinning up both `mit-learn` and `ocw-hugo-themes` locally,
you should be able to hit your OCW dev page at http://ocw.odl.local:3000/ and see a "Log In"
button in the upper right.

### CORS

The search page at `/search/` uses the `open-discussions` search API to source
results. Running this locally and populating it with results can be tedious,
so it's often easier to just point your local website at an already running
version of the search API. In order for this to work properly, you will need
to disable CORS. This is a generally unsafe thing to do and you should make
sure that in whatever browser you open with CORS disabled, you are only testing
your local `ocw-www` site and not visiting other sites. Here is a link that
shows how to do this in various browsers:
https://medium.com/swlh/avoiding-cors-errors-on-localhost-in-2020-5a656ed8cefa

### Managing icon fonts

Please refer to [these docs](./base-theme/assets/fonts/material-design-icons/README.md).
