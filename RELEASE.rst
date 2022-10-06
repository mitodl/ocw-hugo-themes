Release Notes
=============

Version 1.73.3 (Released October 06, 2022)
--------------

- fix: leading new lines removed from link (#878)

Version 1.73.2 (Released October 05, 2022)
--------------

- Fix table code erroring on non-table pages (#887)

Version 1.73.1 (Released October 04, 2022)
--------------

- update course-search-utils (#842)

Version 1.73.0 (Released October 03, 2022)
--------------

- revert image context change (#883)

Version 1.72.1 (Released September 29, 2022)
--------------

- fix give now link (#871)
- Fix table renders for course-v1 when table width is greater then main-content width (#844)
- bootstrap col restored (#866)

Version 1.72.0 (Released September 27, 2022)
--------------

- add webpack bundle analyzer (#855)
- rework video_embed to properly generate links to video pages offline (#859)
- metadata tags added for sharing on Facebook (#823)
- fix: new line removed (#858)
- expand parent nav item when selected (#857)

Version 1.71.0 (Released September 22, 2022)
--------------

- online / offline detection in offline course sites (#850)
- collapse facets and move department to top (#851)

Version 1.70.0 (Released September 20, 2022)
--------------

- don't use partialCached on course_banner.html to ensure relative links in the offline theme are correct on every page (#841)
- create a new partial for rendering links that renders a span instead if a link or name isn't specified, then use that partial everywhere search links are rendered, then override get_search_url.html to return nothing (#839)
- fixed responsive in tables (#837)

Version 1.69.0 (Released September 08, 2022)
--------------

- offline course site theme (#832)
- sidebar and image section height and width styling (#814)
- adding check to other actions aswell (#834)
- Addeded command to continue on failure (#833)
- fixed nav items (#826)
- updated headers (#794)
- added topics partial to course-v2-home to render topics in a hierarchy  (#818)

Version 1.68.0 (Released August 23, 2022)
--------------

- Netlify deployment: www, course, course-v2 comment (#824)
- added safeguard for course description (#816)
- updated about page MIT staff (#819)
- build and deploy course v2 on netlify (#809)

Version 1.67.1 (Released August 10, 2022)
--------------

- fix hot reload in dev (#807)
- feat: compact design (#784)

Version 1.67.0 (Released August 04, 2022)
--------------

- upgraded webpack (#787)

Version 1.66.0 (Released July 25, 2022)
--------------

- fix mathjax url on course home pages (#797)

Version 1.65.1 (Released July 14, 2022)
--------------

- added code to maintain order of list (#783)
- fixed issue with lighthouse (#785)

Version 1.65.0 (Released July 13, 2022)
--------------

- use course-search-utils query generation (#781)
- replace pdf.js with pdfobject (#780)

Version 1.64.1 (Released July 11, 2022)
--------------

- course resources revisions (#777)

Version 1.64.0 (Released July 07, 2022)
--------------

- fix: import order of videojs-youtube sorted (#776)
- added deploy configurations for testing (#768)

Version 1.63.0 (Released July 05, 2022)
--------------

- prefix the canonical url with the sitemap domain (#773)
- Added theme for resource list (#775)
- search API error handling improved (#761)
- feat: lists of course resources grouped by learning resource types (#753)
- specify the canonical url with a value of .Permalink (#767)
- Added download button to control bar (#732)

Version 1.62.0 (Released June 23, 2022)
--------------

- update default URLs to match new scheme (#741)
- fix: overlapping timecode (#759)
- course card line clamp (#754)
- getJSON replaced with resources.GetRemote (#734)

Version 1.61.1 (Released June 22, 2022)
--------------

- If this is the home page, try getting the course level metadata description (#756)
- added styles to fix title overlap (#743)
- fix: videojs-youtube lib included in inside document.ready function (#728)
- fix: catching exception while fetching PDF (#733)
- make level array (#744)

Version 1.61.0 (Released June 15, 2022)
--------------

- fix resource filter (#747)
- Removes alt text (#727)

Version 1.60.1 (Released June 13, 2022)
--------------

- hide layout buttons (#742)
- updated 404 page (#716)
- fixed formatting (#722)
- use new search metadata fields (#726)
- Fix video transcripts RESOURCE_BASE_URL (#735)
- video player design update (#678)
- compact search view (#730)

Version 1.60.0 (Released June 09, 2022)
--------------

- Added setting button to control bar (#709)
- fix: course list order maintained (#721)
- resources layout moved to base theme from courses (#713)

Version 1.59.0 (Released June 02, 2022)
--------------

- also trim the baseurl before comparison (#719)
- trim slash prefix from path before comparison (#712)
- strip the base url when comparing path with disallowed urls (#710)
- source resource descriptions from markdown body (#707)
- removed header and added required css to style tag (#690)
- create lists of disallowed URLs for the base and www sitemaps (#698)

Version 1.58.0 (Released May 25, 2022)
--------------

- update theme to use url_path (#700)
- remove the old coursemedia hack (#688)

Version 1.57.0 (Released May 16, 2022)
--------------

- update node version (#685)

Version 1.56.0 (Released May 16, 2022)
--------------

- move resource shortcode (and the shortcodes it calls) to the base theme (#692)

Version 1.55.1 (Released May 16, 2022)
--------------

- make sure base_url is not blank before writing a sitemap into the index (#687)
- feat: error handling for localstorage (#664)

Version 1.55.0 (Released May 12, 2022)
--------------

- replace uses of Page.URL with Page.RelPermalink (#681)
- fix sitemaps (#679)
- removes give now text from www homepage (#675)
- add single template for subfields (#677)
- write fully qualified urls into course sitemap (#674)
- add fields theme (#670)

Version 1.54.0 (Released May 04, 2022)
--------------

- sanitize facets (#668)
- update course search utils (#667)

Version 1.53.1 (Released May 03, 2022)
--------------

- feat: error handling in search API (#662)

Version 1.53.0 (Released April 27, 2022)
--------------

- fix: change in jquery ready handler (#655)
- increase resource title priority (#656)

Version 1.52.4 (Released April 25, 2022)
--------------

- fix: jsonifying instructor fields in layout (#652)
- updated directory for testimonials to stories (#653)

Version 1.52.3 (Released April 20, 2022)
--------------

- Fixed pages theme (#621)

Version 1.52.2 (Released April 19, 2022)
--------------

- referring url added in contact form (#641)
- updated sponsor image (#627)
- updated theme name (#629)
- fix: h4 fontsize overridden and made smaller than h3 (#635)

Version 1.52.1 (Released April 14, 2022)
--------------

- Fixed newsletter and contact (#628)
- Added standalone 404 page (#612)

Version 1.52.0 (Released April 12, 2022)
--------------

- new course carusel fix (#638)
- use static api for new courses (#630)
- fix: typo in Elizabeth DeRienzo's name (#622)

Version 1.51.2 (Released April 07, 2022)
--------------

- educator page updates (#616)

Version 1.51.1 (Released April 06, 2022)
--------------

- fix: browse course material button styling (#611)
- Updated about page text and images (#567)
- anchor tag in toggle/collapse replaced with div (#609)
- Giving Section text updated (#607)
- sponsor logos updated (#595)
- added check to fix issue (#610)
- get started link conditionally updated (#600)

Version 1.51.0 (Released April 06, 2022)
--------------

- Fix mobile style for featured carousel (#602)
- Show featured course list in each collection if it exists (#587)
- added footer to missing pages and updated styles (#585)

Version 1.50.0 (Released April 04, 2022)
--------------

- fix: testimonials images should squish (#596)
- removed custom override for appzi (#594)

Version 1.49.1 (Released March 31, 2022)
--------------

- fix: open learning button redirection (#588)

Version 1.49.0 (Released March 30, 2022)
--------------

- fix for videos with start time but not end time (#581)
- feat: featured courses (#566)

Version 1.48.2 (Released March 30, 2022)
--------------

- Styling for course collections (#575)
- Added a bit more space to handle double/triple line titles (#578)

Version 1.48.1 (Released March 30, 2022)
--------------

- fixed extar tab in course collection (#576)
- fix: video tab section toggle  (#562)
- Revert "ab/styling-for-course-collections-and-lists"
- ab/styling-for-course-collections-and-lists
- Fix testimonial carousel (#570)
- fixed styling issues for appzi feedback button (#565)
- Updated course collection dashboard to link to course lists (#555)

Version 1.48.0 (Released March 29, 2022)
--------------

- Add cover image to collection page (#553)
- add start and end to videos (#560)
- fix: embeded video downlaod (#556)
- upgrade course-search-utils, fix a bunch of nested imports

Version 1.47.2 (Released March 25, 2022)
--------------

- search styling v3 (#550)

Version 1.47.1 (Released March 24, 2022)
--------------

- remove ts-nocheck on two files

Version 1.47.0 (Released March 24, 2022)
--------------

- more search css changes (#545)
- feat: support links in resource (image) short codes (#538)
- add support for rendering course collections
- Updated the about page text (#522)
- search css changes (#531)
- fix: give now button css (#535)
- revert: PR 388 | instructor insights images scaling (#528)

Version 1.46.2 (Released March 21, 2022)
--------------

- fix: cleaning font-sizes, replacing px with rem (#474)
- update display of course collection to match latest designs
- add topic to resource search (#516)
- Added CoPresent icon from google material design (#512)

Version 1.46.1 (Released March 17, 2022)
--------------

- Added shortcode for underline (#514)

Version 1.46.0 (Released March 14, 2022)
--------------

- display &nbsp in quotes correctly (#513)
- remove description from video-gallery partial (#509)
- Better search results for course numbers (#508)
- update code block style

Version 1.45.0 (Released March 09, 2022)
--------------

- feat: Home SEO (#493)
- fix: style added for code elements (#471)
- fixed typo (#503)

Version 1.44.0 (Released March 07, 2022)
--------------

- Added course collection filter based on Title (#487)

Version 1.43.1 (Released March 03, 2022)
--------------

- CSS fix for errant empty paragraphs in table cells
- removed paddings (#492)
- fixed home page style leaking into footer (#488)

Version 1.43.0 (Released March 02, 2022)
--------------

- return relative url for course images (#478)
- add video thumbnail (#475)
- change resource_link to be a markdown based shortcode (#485)
- fixed spacing issue with h3 (#482)
- added optional and related resources tab (#457)
- fix: about page button links updated (#451)
- fix: removing extra whitespace in sub and sup shortcodes (#481)

Version 1.42.3 (Released February 28, 2022)
--------------

- added footer to pages template (#467)
- completed base footer design (#456)
- fixed page title caching (#468)
- fixed css
- moved resource link to base theme (#473)

Version 1.42.2 (Released February 25, 2022)
--------------

- fix: style of h3 in td, name of an id changed (#452)
- fixed video urls not linking to archive.org (#445)
- fix: moving logo from course static to base static (#442)

Version 1.42.1 (Released February 18, 2022)
--------------

- fixed resource toggling issue (#438)
- added optional anchor id to resource link (#444)
- Minor readme updates (#358)
- removed focus casuing the page to scoll down (#439)
- scoped css to prevent side-effects (#440)

Version 1.42.0 (Released February 14, 2022)
--------------

- pass what's passed into `resource_file.html` through `resource_url.html` to either make it root relative or prefix with `RESOURCE_BASE_URL` (#434)
- added course info button to tab order (#425)
- fixed bug with boldsymbol not rendering (#431)
- add resource collection rendering support
- added search icon to base theme (#410)
- fix: some margin botton added below course description (#427)

Version 1.41.0 (Released February 11, 2022)
--------------

- add simple subscript, superscript shortcodes (#422)
- Add course collection partial (#411)
- fix: increased value for expand widget for course image description (#407)
- fixed  typo which is causing link to be broken (#423)
- accessibility: home page (#416)
- accessibility: about page (#417)

Version 1.40.0 (Released February 08, 2022)
--------------

- updated footer
- added section to course theme
- add a data template for creating a course content map
- fix: alt text removed for lecture videos (#408)
- fix: accessibility fixes (#389)
- add UI for rendering course collections
- added basic newsletter page
- fix: instructor insights images scaled up (#388)
- fix small oversight on typescript change
- fix some more type issues, upgrade course-search-utils
- fix handling of role="search"
- fix usage of aria-live on the search page
- slugify text before using it as an ID

Version 1.39.1 (Released February 07, 2022)
--------------

- populate resource title
- fix: sanity check for Learning Resource Types (#377)
- removed coming soon class
- fix: carousel height and thumb swipe fixed (#368)
- feat: expand/collapse in document title (#364)
- updated help and faq link
- updated header link
- fix: adding data attributes to carousel (#365)
- added aspect ratio to class
- fix: horizontal scroll bar on topics in drawer (#337)
- fix: resource type hidden when count 0 (#362)
- feat: contact page (#353)
- remove trailing slash from match

Version 1.39.0 (Released January 21, 2022)
--------------

- output githash to base-theme/dist/static (#355)
- add optional colspan and rowspan attributes to tdopen / thopen shortcodes (#348)
- feat: expand/collapse enhancement (#330)
- fix: updating css for about and educator page (#332)
- switch to building the JS files with Typescript
- add course image to the coursedata.json template
- fix: placing mp_logo in static images of course theme
- fix: removing font-size for h2 tag

Version 1.38.3 (Released January 11, 2022)
--------------

- json data pages
- fixed issue regarding box overflow

Version 1.38.2 (Released January 07, 2022)
--------------

- replaced span with h1 tag and fixed contrast issue

Version 1.38.1 (Released January 05, 2022)
--------------

- fix: subnav scroll going a bit down
- adding href for about page
- adding search link for course theme
- feat: menu for mobile devices
- fix: showing navbrand while scrolling
- fixing linting issues
- changes in design
- feat: highlight subnav items as user scrolls
- changes to cater about page and few other css changes
- importing about css file
- fixing linting issues
- font adjusted, last section changed, all images added
- fix: adding missing space
- fix: removing semicolons for linting check
- navbar working, css reduced, global fonts used, mobile optimized
- navabr adjusted
- navbar colors and links
- feat: main page done except few little things
- feat: educator page in progress

Version 1.38.0 (Released January 04, 2022)
--------------

- fix instructors error take 2
- fix instructors
- About Us Page (#303)
- add course_data.json

Version 1.37.0 (Released December 20, 2021)
--------------

- multiple choice
- Fix MathJax Javascript URL (#299)

Version 1.36.0 (Released December 15, 2021)
--------------

- ensure unique video id
- fix lighthouse checks (#295)

Version 1.35.0 (Released December 02, 2021)
--------------

- set up some defaults for the course image metadata (#292)
- Revert "Revert "Use alt-text for course image (#270)"" (#284)

Version 1.34.0 (Released November 23, 2021)
--------------

- Revert "Use alt-text for course image (#270)" (#282)
- hide/show toggle
- add the resource_file shortcode to the course theme (#273)
- Fix calculation for course home page cards (#272)
- Use alt-text for course image (#270)

Version 1.33.0 (Released November 22, 2021)
--------------

- update home course cards instructors, topics and level (#269)
- Revert "hide/show toggle"
- hide/show toggle
- add in a hack for /coursemedia (#264)
- if $courseData.level is an array, iterate the levels (#262)
- move department and query key data to the base theme and set up home_course_cards to generate search url for level (#257)

Version 1.32.1 (Released November 10, 2021)
--------------

- render the video gallery description if set (#253)
- Adjust level, term to new ocw-to-hugo format (#249)

Version 1.32.0 (Released November 09, 2021)
--------------

- Video Downloads

Version 1.31.1 (Released November 01, 2021)
--------------

- move instructor json to instructors (#247)
- add back td-colspan shortcode (#246)
- add table shortcodes
- video galleries redesign (#240)
- mitodl not mitocw (#239)

Version 1.31.0 (Released October 28, 2021)
--------------

- overhaul local dev / package scripts / documentation (#231)

Version 1.30.4 (Released October 22, 2021)
--------------

- link from embed video to video page

Version 1.30.3 (Released October 21, 2021)
--------------

- replace "sections" with "pages" (#234)

Version 1.30.2 (Released October 20, 2021)
--------------

- show transcripts under video

Version 1.30.1 (Released October 13, 2021)
--------------

- Implement simple resource embed (#226)
- use `file` over `file_location` (#225)

Version 1.30.0 (Released October 12, 2021)
--------------

- Revert "Revert "download transcript theme""
- fix course image (#222)
- Revert "download transcript theme"
- download transcript theme
- Revert "since course images are a 1:1 relationship, don't access them as if they were an array"
- since course images are a 1:1 relationship, don't access them as if they were an array

Version 1.29.1 (Released October 05, 2021)
--------------

- course images from resources (#212)

Version 1.29.0 (Released October 04, 2021)
--------------

- Add image view and add metadata to document and download resource views (#204)

Version 1.28.0 (Released September 29, 2021)
--------------

- Update ocw-to-hugo to fix typo bug (#205)
- adjust topics_summary to be compatible with newest ocw-to-hugo changes related to topics (#207)

Version 1.27.0 (Released September 23, 2021)
--------------

- default subtopics to an empty slice (#202)
- fix inpanel (#200)
- Handle empty topics (#197)
- use with on instructors before using it (#196)
- Update template to use newer format for topics (#193)
- Resource page template (#172)
- more ocw-studio updates (#192)
- Add shortcode for resource links (#185)
- instructors from static api (#186)
- Add joining slash if none exists to course feature urls (#183)

Version 1.26.0 (Released September 17, 2021)
--------------

- update .env file sourcing

Version 1.25.0 (Released September 09, 2021)
--------------

- use name and not course_id from the metadata (#176)
- ocw-course not course (#171)

Version 1.24.3 (Released September 07, 2021)
--------------

- Disable autoplay (#164)
- add json templates to render instructor static JSON API responses (#167)
- use level text and search url (#165)
- ocw studio structure adjustments (#162)

Version 1.24.2 (Released August 26, 2021)
--------------

- remove references to course_id in front matter and the data template (#157)

Version 1.24.1 (Released August 12, 2021)
--------------

- update lockfile (#156)

Version 1.24.0 (Released August 11, 2021)
--------------

- update ocw-to-hugo to 1.27.0 (#153)
- update ocw-to-hugo to 1.26.1 and adjust rendering of course description to source from the course data template (#151)

Version 1.23.0 (Released August 02, 2021)
--------------

- use primary_course_number on home_course_cards partial (#148)

Version 1.22.0 (Released July 27, 2021)
--------------

- separate primary course number and extra course numbers (#141)
- Don't initialize the video player setup (#143)

Version 1.21.0 (Released July 23, 2021)
--------------

- update ocw-to-hugo to 1.25.0 (#137)

Version 1.20.0 (Released July 19, 2021)
--------------

- Add captions location as an argument to youtube shortcode (#135)
- department course number sort
- Revert "fix search fields"
- fix search fields
- Video.js player for custom video controls (#131)

Version 1.19.3 (Released June 30, 2021)
--------------

- adapt to use ocw-studio generated ocw-www content (#126)

Version 1.19.2 (Released June 29, 2021)
--------------

- move sponsor logos to the correct location (#128)

Version 1.19.1 (Released June 28, 2021)
--------------

- Fix course info expander (#113)
- use uid instead of id (#122)
- Revert "Revert "Show archived versions on course home page (#94)" (#115)" (#118)

Version 1.19.0 (Released June 21, 2021)
--------------

- Add sorting by date (#117)

Version 1.18.2 (Released June 17, 2021)
--------------

- Fix infinite scroll issue on course search

Version 1.18.1 (Released June 17, 2021)
--------------

- Revert "Show archived versions on course home page (#94)" (#115)
- Implement sort (#107)
- Show archived versions on course home page (#94)

Version 1.18.0 (Released June 15, 2021)
--------------

- Revert "Video.js player for customized video controls (#35)" (#109)
- move corporate sponsor logos to the theme (#108)
- reorganize webpack output (#98)
- add search placeholder (#96)
- Video.js player for customized video controls (#35)
- open learning library (#80)

Version 1.17.2 (Released June 03, 2021)
--------------

- Course home page tweaks (#82)

Version 1.17.1 (Released June 02, 2021)
--------------

- Remove unused dialog (#73)
- Add search role and mark search area with aria-live, adjust label colors (#74)

Version 1.17.0 (Released June 01, 2021)
--------------

- Fix netlify deploy (#77)

Version 1.16.2 (Released May 28, 2021)
--------------

- other versions to data template (#75)
- Change label color for course info and metadata labels (#53)

Version 1.16.1 (Released May 26, 2021)
--------------

- fix instructor insights styles (#64)
- Update give button and adjust link size in promo carousel (#59)

Version 1.16.0 (Released May 25, 2021)
--------------

- Switch to div for subscribe title (#68)

Version 1.15.2 (Released May 24, 2021)
--------------

- Tweaks to search accessibility page (#56)
- Add padding to search textbox (#61)
- Adjust color of notification banner and link text (#60)

Version 1.15.1 (Released May 21, 2021)
--------------

- check length before rendering (#58)
- allow launching of an externally converted course (#47)

Version 1.15.0 (Released May 20, 2021)
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

