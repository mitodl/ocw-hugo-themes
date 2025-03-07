import "./css/www.scss"
import "./css/search.scss"

import Popper from "popper.js"
import { createRoot } from "react-dom/client"

import { createBrowserHistory } from "history"

import SearchPage from "./js/components/SearchPage"
import CourseList from "./js/components/CourseList"

import { setupEmailSignupForm } from "./js/mailchimp"
import { initNotifications } from "./js/notification"
import { initSubNav } from "./js/subnav"
import ResourceCollection from "./js/components/ResourceCollection"
import posthog from "posthog-js"
import {
  initPostHog,
  isFeatureEnabled
} from "../../base-theme/assets/js/posthog"
import { makeQueryClient } from "../../base-theme/assets/js/clients"
import { QueryClientProvider } from "@tanstack/react-query"
import UserMenu from "../../base-theme/assets/js/components/UserMenu"
export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
  posthog: typeof posthog
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper

const history = createBrowserHistory()

$(function() {
  window.posthog = initPostHog()

  const userMenuContainers = document.querySelectorAll(".user-menu-container")
  if (userMenuContainers && isFeatureEnabled("ocw-learn-integration")) {
    for (const userMenuContainer of Array.from(userMenuContainers)) {
      const queryClient = makeQueryClient()
      ReactDOM.render(
        <QueryClientProvider client={queryClient}>
          <UserMenu />
        </QueryClientProvider>,
        userMenuContainer
      )
    }
  }

  const searchPageEl = document.querySelector("#search-page")
  if (searchPageEl) {
    const root = createRoot(searchPageEl)
    root.render(<SearchPage history={history} />)
  }

  const courseCollectionEls = document.querySelectorAll(
    ".course-collection-container"
  )
  // iterate across all collection els, render a CourseList
  // component for each one. This lets us support layouts with multiple
  // instances of the component per-page.
  courseCollectionEls.forEach(el => {
    if (el) {
      const collectionUid = el.getAttribute("data-collectionid")
      if (collectionUid) {
        const root = createRoot(el)
        root.render(<CourseList uid={collectionUid} />)
      }
    }
  })

  const resourceCollectionEl = document.querySelector(
    "#resource-collection-container"
  )
  if (resourceCollectionEl) {
    const root = createRoot(resourceCollectionEl)
    root.render(<ResourceCollection />)
  }

  initNotifications()
  setupEmailSignupForm()
  initSubNav()
})
