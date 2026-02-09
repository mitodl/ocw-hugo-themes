import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "./css/course-v3.scss"
import { initDivToggle } from "./js/div_toggle"
import { initMITLearnHeader } from "./js/mit_learn_header"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "./js/course_expander"
import { initImageGalleriesFromMarkup } from "./js/init_image_galleries_from_markup"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "./js/quiz_multiple_choice"
import { initMobileCourseMenuV3 } from "./js/mobile_course_menu_v3"
import { initTableRowspanBorders } from "./js/table_rowspan_borders"
import posthog from "posthog-js"
import {
  initPostHog,
  isFeatureEnabled
} from "../../base-theme/assets/js/posthog"
import { QueryClientProvider } from "@tanstack/react-query"
import { makeQueryClient } from "../../base-theme/assets/js/clients"
import UserMenu from "./js/components/UserMenu"
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
  initMITLearnHeader()
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initMobileCourseMenuV3()
  initTableRowspanBorders()
  const queryClient = makeQueryClient()
  const userMenuContainers = document.querySelectorAll(
    ".user-menu-container, .mit-learn-user-menu-container"
  )

  const envFlagEnabled = process.env.FEATURE_ENABLE_LEARN_INTEGRATION === "true"
  const postHogFlagEnabled = isFeatureEnabled("ocw-learn-integration")
  const learnIntegrationEnabled = envFlagEnabled || postHogFlagEnabled
  console.log("MIT Learn integration:", {
    envFlagEnabled,
    postHogFlagEnabled,
    learnIntegrationEnabled,
    envValue: process.env.FEATURE_ENABLE_LEARN_INTEGRATION
  })
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
  if (nanogallery2Loaded) return
  import("./nanogallery2-imports.js").then(initImageGalleriesFromMarkup)
  nanogallery2Loaded = true
}
