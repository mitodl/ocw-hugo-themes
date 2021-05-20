Release Notes
=============

Version 1.15.0
--------------

- other versions (#44)
- Update some headers to remove accessibility warning (#48)
- Add labels for a couple input fields (#51)
- Accessibility improvements for search (#49)
- switch from node-sass to sass
- fix title tag generation (#50)

Version 1.14.0 (Released May 17, 2021)
--------------

- force mobile course info table to not have forced mobile style applied to it (#45)
- Add alt text (#36)

Version 1.13.0 (Released May 14, 2021)
--------------

- table not .table (#39)
- Accessibility changes for carousel (#27)
- add in a block for extra header content, then define extra header content for the course theme (#33)
- remove default salutation from search
- move over code from https://github.com/mitodl/ocw-course-hugo-theme/pull/87 (#24)
- Add to history stack on changes to search UI, and support back button (#12)
- edit PR template to remove autotag

Version 1.12.0 (Released May 11, 2021)
--------------

- move pdfjs static build to the www theme so it's built with the main site, and only copy the files into a course build if it's running locally for development (#21)
- Disable collapse for instructors list (#13)
- check if site.BaseURL is set before trying to use it (#18)
- ocw-to-hugo 1.19.0 (#9)
- Parse URL to fix section handling (#11)
- separate things a little bit
- default VERBOSE in the beginning of the file to zero and check it before logging which variables are not set
- add a note in the readme about build_all_courses path arguments needing to be absolute ptahs
- handle VERBOSE not being defined at all, and default to it being off
- add env variables used in build_all_courses to the example env and update the readme
- add a script for building an entire output folder from ocw-to-hugo
- ocw-www not ocw-website
- modify prep_external_site to automatically add a go.mod file with replacement lines to the target site when running locally
- output all build artifacts to external site path's dist folder

Version 1.11.0 (Released April 06, 2021)
--------------

- apply transparent backround and absolute positioning to home page header only, make consistent for all other pages (#88)

Version 1.10.3 (Released April 05, 2021)
--------------

- Revert "Revert "Add resource_type facet for resource search and remove content_type filter (#70)"" (#85)

Version 1.10.2 (Released April 01, 2021)
--------------

- Revert "Add resource_type facet for resource search and remove content_type filter (#70)"

Version 1.10.1 (Released March 31, 2021)
--------------

- fix header background width (#81)

Version 1.10.0 (Released March 31, 2021)
--------------

- add notification archetype and templates (#73)
- give the search page its own header style (#77)
- Add file_thumbnail (#78)
- Add Appzi script (#75)
- Add resource_type facet for resource search and remove content_type filter (#70)
- add default content so page is visible as soon as you create it
- add generic page layout
- Updates to search page design (#67)
- Mail signup will redirect to legacy signup form (#65)

Version 1.9.0 (Released March 29, 2021)
-------------

- New facet for course feature tags (#60)
- Remove testimonial hover (#61)

Version 1.8.0 (Released March 10, 2021)
-------------

- remove the coming soon class from contact us
- Add legacy contact link for now

Version 1.7.2 (Released February 19, 2021)
-------------

- Added robots.txt and disallowed crawling on all pages

Version 1.7.1 (Released February 10, 2021)
-------------

- Fixed course site variable reference (url_path)

Version 1.7.0 (Released February 09, 2021)
-------------

- Added testimonials list and detail pages
- Google Tag Manager JS and .env variable (#43)
- Don't show suggestion if it is effectively the same as search text (#36)

Version 1.6.3 (Released January 22, 2021)
-------------

- round out mobile display
- prod deploy
- remove 'alias' field from the CI deploy
- fix styling issue with promo carousel

Version 1.6.2 (Released January 21, 2021)
-------------

- fix npm start
- Implemented OCW news carousel in mobile/tablet widths
- Move beneath give now section
- Add OCW News to front page
- update README, always source `.env`

Version 1.6.1 (Released January 19, 2021)
-------------

- add promo carousel to the homepage
- prepend /course/ onto thumbnail links (#29)
- fix deploy

Version 1.6.0 (Released January 19, 2021)
-------------

- some mobile fixes
- Added setup details to README

