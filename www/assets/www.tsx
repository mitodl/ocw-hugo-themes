import "./css/www.scss"
import "./css/search.scss"

import Popper from "popper.js"
import ReactDOM from "react-dom"
import React from "react"
import { createBrowserHistory } from "history"

import SearchPage from "./js/components/SearchPage"
import CourseList from "./js/components/CourseList"

import { setupEmailSignupForm } from "./js/mailchimp"
import { initNotifications } from "./js/notification"
import { initSubNav } from "./js/subnav"
import ResourceCollection from "./js/components/ResourceCollection"
import posthog from "posthog-js"
import { initPostHog } from "../../base-theme/assets/js/posthog"
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
  const searchPageEl = document.querySelector("#search-page")
  if (searchPageEl) {
    ReactDOM.render(<SearchPage history={history} />, searchPageEl)
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
        ReactDOM.render(<CourseList uid={collectionUid} />, el)
      }
    }
  })

  const resourceCollectionEl = document.querySelector(
    "#resource-collection-container"
  )
  if (resourceCollectionEl) {
    ReactDOM.render(<ResourceCollection />, resourceCollectionEl)
  }

  initNotifications()
  setupEmailSignupForm()
  initSubNav()
})
