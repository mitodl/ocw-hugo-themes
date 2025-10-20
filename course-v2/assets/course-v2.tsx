import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "./css/course-v2.scss"
import { initDivToggle } from "./js/div_toggle"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "./js/course_expander"
import { initCourseDrawersClosingViaSwiping } from "./js/mobile_course_drawers"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "./js/quiz_multiple_choice"
import posthog from "posthog-js"
import {
  initPostHog,
  isFeatureEnabled
} from "../../base-theme/assets/js/posthog"
import { QueryClientProvider } from "@tanstack/react-query"
import { makeQueryClient } from "../../base-theme/assets/js/clients"
import UserMenu from "../../base-theme/assets/js/components/UserMenu"
import { createRoot } from "react-dom/client"
import AddToUserListModal from "../../base-theme/assets/js/components/UserListModal"
import CreateUserListModal from "../../base-theme/assets/js/components/CreateUserListModal"
import { ThemeProvider } from "@mitodl/smoot-design"
import BookmarkButton from "../../base-theme/assets/js/components/BookmarkButton"

export interface OCWWindow extends Window {
  initNanogallery2: () => void
  setReadableResourceId: (value: string) => void
  posthog: typeof posthog
}

declare let window: OCWWindow

$(function() {
  window.posthog = initPostHog()
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
  const queryClient = makeQueryClient()
  const userMenuContainers = document.querySelectorAll(".user-menu-container")
  const learnIntegrationEnabled = isFeatureEnabled("ocw-learn-integration")
  if (userMenuContainers && learnIntegrationEnabled) {
    for (const userMenuContainer of Array.from(userMenuContainers)) {
      const root = createRoot(userMenuContainer)
      root.render(
        <QueryClientProvider client={queryClient}>
          <UserMenu />
        </QueryClientProvider>
      )
    }
  }
  const bookmarkButtonContainers = document.querySelectorAll(
    ".bookmark-button-container"
  )
  if (bookmarkButtonContainers.length > 0 && learnIntegrationEnabled) {
    for (const bookmarkButton of Array.from(bookmarkButtonContainers)) {
      const resourceReadableId =
        (bookmarkButton as HTMLButtonElement).dataset.resourcereadableid || ""
      const root = createRoot(bookmarkButton)
      root.render(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BookmarkButton resourceReadableId={resourceReadableId} />
          </ThemeProvider>
        </QueryClientProvider>
      )
    }
    const userListModalContainer = document.querySelector(
      "#user-list-modal-container"
    )
    if (userListModalContainer && learnIntegrationEnabled) {
      const root = createRoot(userListModalContainer)
      root.render(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AddToUserListModal />
          </ThemeProvider>
        </QueryClientProvider>
      )
    }
    const createUserListModalContainer = document.querySelector(
      "#create-user-list-modal-container"
    )
    if (createUserListModalContainer && learnIntegrationEnabled) {
      const root = createRoot(createUserListModalContainer)
      root.render(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CreateUserListModal />
          </ThemeProvider>
        </QueryClientProvider>
      )
    }
  }
})

let nanogallery2Loaded = false

window.initNanogallery2 = () => {

  console.log("Initializing nanogallery2")
  if (nanogallery2Loaded) return
  
  import("./nanogallery2-imports.js").then(() => {
    // Initialize all image galleries using JavaScript API instead of HTML markup
    const galleries = document.querySelectorAll('.image-gallery')
    
    galleries.forEach(gallery => {
      const baseUrl = gallery.getAttribute('data-base-url') || ''
      const galleryId = gallery.id
      
      // Extract image data from existing HTML markup
      const links = gallery.querySelectorAll('a[href][data-ngdsc]')
      const items = Array.from(links).map(link => {
        const src = link.getAttribute('href')
        const description = link.getAttribute('data-ngdsc')?.substring(link.textContent.length)
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
  })
  
  nanogallery2Loaded = true
}
