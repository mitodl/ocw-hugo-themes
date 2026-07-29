---
content_type: page
description: Test page for site-absolute /courses/... links authored against v2.
draft: false
title: Legacy Course Links
uid: c4f1a7e2-8b93-4d16-a5c7-9e2f0b3d6a48
---

Every link below is authored the way v2 content is: as a site-absolute
`/courses/...` path, or as a fully qualified `ocw.mit.edu` URL. course-v3 serves
sites under a path prefix, so it rewrites these; other themes leave them alone.

Same course: [Self link](/courses/ocw-ci-test-course/pages/first-test-page-title)

Same course with a fragment: [Self link with anchor](/courses/ocw-ci-test-course/pages/first-test-page-title#a-section)

Same course, but the target does not exist: [Self link to missing page](/courses/ocw-ci-test-course/pages/deliberately-missing-page#a-section)

Another course: [Cross course link](/courses/some-other-course-fall-2020/pages/syllabus)

Another course, no sub-path: [Cross course bare link](/courses/some-other-course-fall-2020)

Another course, already prefixed: [Already prefixed link](/courses/o/some-other-course-fall-2020/pages/syllabus)

This site, already at its own base path: [Own base path link](/courses/o/ocw-ci-test-course/pages/second-test-page)

Not a course path: [OCW terms link](https://ocw.mit.edu/terms)

The course listing, not a course: [OCW courses listing link](https://ocw.mit.edu/courses/)

Not an OCW host: [Third party courses link](https://example.com/courses/not-ours/pages/syllabus)

An external resource whose URL points at a course: {{% resource_link "6f2b1c40-7d3e-4a58-9b21-4c0e8d5a7f36" "OCW course link" %}}
