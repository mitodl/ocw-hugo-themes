import "video.js/dist/video-js.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "../../course-v2/assets/css/course-v2.scss"
import { initDivToggle } from "../../course-v2/assets/js/div_toggle"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "../../course-v2/assets/js/course_expander"
import { initCourseDrawersClosingViaSwiping } from "../../course-v2/assets/js/mobile_course_drawers"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "../../course-v2/assets/js/quiz_multiple_choice"
import "nanogallery2/src/jquery.nanogallery2.core.js"
import "nanogallery2/src/css/nanogallery2.css"
import "videojs-youtube"
import videojs from "video.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  videojs: typeof videojs
}

declare let window: OCWWindow

$(function() {
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
  window.videojs = videojs
})

let nanogallery2Loaded = false;

(window as any).initNanogallery2 = () => {

  console.log("Initializing nanogallery2")
  if (nanogallery2Loaded) return
  nanogallery2Loaded = true

  
    // Initialize all image galleries using JavaScript API instead of HTML markup
    const galleries = document.querySelectorAll('.image-gallery')
    
    galleries.forEach(gallery => {
      const baseUrl = gallery.getAttribute('data-base-url') || ''
      const galleryId = gallery.id
      
      // Extract image data from existing HTML markup
      const links = gallery.querySelectorAll('a[href][data-ngdsc]')
      const items = Array.from(links).map(link => {
        const src = link.getAttribute('href')
        // const description = link.getAttribute('data-ngdsc')?.substring(link.textContent.length)
        const title = link.innerHTML
        
        return {
          src: src,
          title: title,
          // description: description
        }
      })
      
      // Clear the existing HTML content
      gallery.innerHTML = ''
      
      // Initialize nanogallery2 with JavaScript API
      if (items.length > 0 && (window as any).$) {
        ((window as any).$(gallery) as any).nanogallery2({
          itemsBaseURL: baseUrl,
          items: items,
          allowHTMLinData: true,
          thumbnailLabel: {
            display: true,
            // displayDescription: true,
            position: 'overImage',
            titleMultiLine: true,
            descriptionMultiLine: false,
          }
        })
      }
    })
  }
  

