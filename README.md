# ocw-hugo-theme

This is a [Hugo](https://gohugo.io/) theme implemented as a [module](https://gohugo.io/hugo-modules/).  It can be used to generate pages related to the OCW website as well as OCW course sites.
## Local development

### Dependencies

- [NodeJS](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
- [Go](https://golang.org/doc/install)
- [Hugo](https://gohugo.io/getting-started/installing/)

If you're running the site for the first time, or if dependencies have changed, install dependencies with:

`yarn install`

### Pre-load Webpack assets

Additionally, you may want to run:

`npm run build:webpack`

Hugo is so fast that the first time you run the site, the Hugo build will happen much more quickly than the webpack build so it's best to run the build once so that assets are ready for when you start the site.  If you don't see any styling the first time you visit the page, force refresh it.  If that doesn't work, try restarting the site.

### External API's

This site requires running instances of [`ocw-studio`](https://github.com/mitodl/ocw-studio) and [`open-discussions`](https://github.com/mitodl/open-discussions) for some functionality.  Search results are provided by `open-discusisons` and `ocw-studio` provides some content for the home page, such as newly added courses and news items.  If you need to work with this functionality you can either run a local instance of either of these projects, or alternatively point at the RC instances and use a browser extension to temporarily disable CORS.

### CORS

The search page at `/search` uses the `open-discussions` search API to source results.  Running this locally and populating it with results can be tedious, so it's often easier to just point your local website at an already running version of the search API.  In order for this to work properly, you will need to use a browser extension for disabling CORS, like Moesif Origin & CORS Changer:

- [Chrome](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc?hl=en-US#:~:text=Moesif%20Origin%20%26%20CORS%20Changer&text=This%20plugin%20allows%20you%20to%20send%20cross%2Ddomain%20requests.&text=This%20plugin%20allows%20you%20to%20send%20cross%2Ddomain%20requests%20directly,Allow%2DOrigin%20set%20to%20*.)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/moesif-origin-cors-changer1/)
### Environment variables

For development you'll need to set a few environment variables. The
`.env.example` file will get you started.  Here are the variables and what they do:

| Variable | Example | Description |
| --- | --- | --- |
| `SEARCH_API_URL` | `http://localhost:8063/api/v0/search/` | A URL to an `open-discussions` search API to fetch results from|
| `OCW_STUDIO_BASE_URL` | `http://localhost:8043/` | A URL of an instance of [`ocw-studio`](https://github.com/mitodl/ocw-studio) to fetch home page content from |
| `EXTERNAL_SITE_PATH` | `~/Code/ocw-www/site/` | A path to a Hugo site with content (Pages, Notifications, Promos, Testimonials) to use for local development |
| `OCW_TO_HUGO_PATH` | `~/Code/ocw-to-hugo/` | A path to a local override of [`ocw-to-hugo`](https://github.com/mitodl/ocw-to-hugo), a library used to generate Hugo markdown content from parsed OCW JSON exports from the legacy site |
| `AWS_BUCKET_NAME` | `open-learning-course-data-production` | The S3 bucket `ocw-to-hugo` should source course data from |
| `OCW_TEST_COURSE` | `18-06-linear-algebra-spring-2010` | An OCW course ID to use when spinning up a course site for local development with `npm run start:course` |

### Run the website

If you have content in a separate folder that you'd like to use with local development, set the `EXTERNAL_SITE_PATH` variable.  Then, run:

`npm start`

Keep in mind that this will deposit a `config.toml` and a `go.mod` file in your site's folder, tieing this theme to it as a module.  If these files exist in your site already, they will be overwritten.

### Testimonials

Testimonials are stored as Markdown files managed by Hugo. To create a new one
you can use `hugo new` like this:

`hugo new testimonials/firstname-lastname.md`

The filename of `firstname-lastname.md` will allow hugo to automatically pull the testimonial student's name out. Once you run the command there will be a new file in `site/content/testimonials/` with some placeholder content. Edit that file to add the content for that student.

### Homepage Promo Carousel

These are checked into the repo, stored as Markdown files managed by Hugo. To create a new one you can use `hugo new` like this:

`hugo -s site new promos/filename.md`

You'll then also need to check an image file into `static/images/promo-carousel/` and add it to the front matter in the file you just created alongside the URL for the promo. You'll also need to set a title, subtitle, and link text.

### Course sites

Local development on the `course` templates can be done by spinning up a course site using `npm run start:course`.  Course data is fetched using `ocw-to-hugo`.  If a local path to `ocw-to-hugo` isn't specified, the NPM version specified in `package.json` is used.  Either way, an S3 bucket to source OCW parsed JSON from needs to be specified with the environment varible `AWS_BUCKET_NAME`.  For authentication, you can configure CLI access using the AWS credential file as described [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) or set your key / secret in the standard `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY` env variables.  Upon running `npm run start:course`, the course with the ID specified in `OCW_TEST_COURSE` will be downloaded from S3 and converted to Hugo content in `private/ocw-to-hugo-output`.
