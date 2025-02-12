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
import { QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import { makeQueryClient } from "../../base-theme/assets/js/clients"
import UserMenu from "../../base-theme/assets/js/components/UserMenu"

export interface OCWWindow extends Window {
  initNanogallery2: () => void
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
  const userMenuContainer = document.querySelector("#user-menu-container")
  if (userMenuContainer) {
    const queryClient = makeQueryClient()
    const root = ReactDOM.createRoot(userMenuContainer)
    root.render(<QueryClientProvider client={queryClient}><UserMenu /></QueryClientProvider>)
  }
})

let nanogallery2Loaded = false

window.initNanogallery2 = () => {
  if (nanogallery2Loaded) return
  import("./nanogallery2-imports.js")
  nanogallery2Loaded = true
}
