# Static API Mocks

## Static API
Our Hugo builds output json data files, and other builds consume these data
files. For example:
 - **Building ocw-www:**
   - **produces** instructor data, e.g., https://ocw.mit.edu/instructors/a32373bc-8c78-e37a-f79e-1f15686d1a9b/index.json
   - **consumes** course summary data (e.g., for the "Featured Courses" carousel)
- **Building course sites:**
  - **produces:** course summary data, e.g., https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/data.json
  - **consumes:** instructor data (e.g., for the "Course Info" on course homepage)

These data comprise our "static API". When Hugo consumes this data during the build, it does so via requests through `STATIC_API_BASE_URL`.

## Circular dependencies when building a snapshot
Because course builds depend on www data, and www builds depend on course data, it is possible (and likely) for builds to contain circular dependencies. For example, if
 - Course A uses instructor X, and
 - ocw-www markdown describes instructor X
 - ocw-www features Course A as a featured course
 - neither Course A nor ocw-www have ever been published
then publishing will be deadlocked: the www build will fail for lack of course X, and the course X build will fail for lack of instructor data.

Thus, it is likely that a **snapshot**[^1] of the OCW Markdown at a single point in time cannot be built in isolation by Hugo.

[^1]: OCW Studio forces you to build the sites incrementally: Course A cannot be published until a WWW version has been published which includes the relevant instructors, and a course cannot be featured on WWW until it has been published.

## Building a snapshot for e2e testing: `test-sites/__fixtures`

For e2e testing we *do* want to build a snapshot of OCW markdown in isolation. But there's really only a circular dependency if the `STATIC_API_BASE_URL` is the Hugo output. So for e2e testing, we pre-construct the relevant JSON files (stored in `test-sites/__fixtures__`) and serve them for use during the Hugo builds.

All JSON files in `test-sites/__fixtures__` are served during the e2e hugo builds. The API urls mirror the directory structure, except `/not/a/course/page` is redirected to the file `ocw-ci-www-test/not/a/course/path` . (I.e., www json is within its own folder, not at fixtures' root).