import "./css/www.scss"
import "./css/search.scss"

import Popper from "popper.js"
import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { createBrowserHistory } from "history"

import SearchPage from "./js/components/SearchPage"
import CourseList from "./js/components/CourseList"

import { setupEmailSignupForm } from "./js/mailchimp"
import { initNotifications } from "./js/notification"
import { initSubNav } from "./js/subnav"
import ResourceCollection from "./js/components/ResourceCollection"
import UserMenu from "../../base-theme/assets/js/components/UserMenu"
import { makeQueryClient } from "../../base-theme/assets/js/clients"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper

const history = createBrowserHistory()

$(function() {
  const userMenuContainer = document.querySelector("#user-menu-container")
  if (userMenuContainer) {
    const queryClient = makeQueryClient()
    const root = ReactDOM.createRoot(userMenuContainer)
    root.render(<QueryClientProvider client={queryClient}><UserMenu /></QueryClientProvider>)
  }

  const searchPageEl = document.querySelector("#search-page")
  if (searchPageEl) {
    const root = ReactDOM.createRoot(searchPageEl)
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
        const root = ReactDOM.createRoot(el)
        root.render(<CourseList uid={collectionUid} />)
      }
    }
  })

  const resourceCollectionEl = document.querySelector(
    "#resource-collection-container"
  )
  if (resourceCollectionEl) {
    const root = ReactDOM.createRoot(resourceCollectionEl)
    root.render(<ResourceCollection />)
  }

  initNotifications()
  setupEmailSignupForm()
  initSubNav()
})
