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
import useLocalStorage from "../../base-theme/assets/js/hooks/util"
import UserListModal from "../../base-theme/assets/js/components/UserListModal"

export interface OCWWindow extends Window {
  initNanogallery2: () => void
  setReadableResourceId: (value: string) => void
  posthog: typeof posthog
}

declare let window: OCWWindow

function ModalWrapper() {
  const [resourceReadableId, setResourceReadableId] = useLocalStorage(
    "resourceReadableId",
    ""
  )
  const userListModalContainer = document.querySelector(
    "#user-list-modal-container"
  )
  if (userListModalContainer) {
    window.setReadableResourceId = setResourceReadableId
    return <UserListModal resourceReadableId={resourceReadableId} />
  }
}

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
  if (userMenuContainers && isFeatureEnabled("ocw-learn-integration")) {
    for (const userMenuContainer of Array.from(userMenuContainers)) {
      const root = createRoot(userMenuContainer)
      root.render(
        <QueryClientProvider client={queryClient}>
          <UserMenu />
        </QueryClientProvider>
      )
    }
  }
  const userListModalContainer = document.querySelector(
    "#user-list-modal-container"
  )
  if (userListModalContainer) {
    const root = createRoot(userListModalContainer)
    root.render(
      <QueryClientProvider client={queryClient}>
        <ModalWrapper />
      </QueryClientProvider>
    )
  }
})

let nanogallery2Loaded = false

window.initNanogallery2 = () => {
  if (nanogallery2Loaded) return
  import("./nanogallery2-imports.js")
  nanogallery2Loaded = true
}
