import "../../node_modules/tippy.js/dist/tippy.css"
import "../../node_modules/nanogallery2/src/css/nanogallery2.css"

import "./css/www.scss"
import "./css/search.scss"

import Popper from "popper.js"
import ReactDOM from "react-dom"
import React from "react"

import SearchPage from "./js/components/SearchPage"
import CourseCollection from "./js/components/CourseCollection"

import { setupEmailSignupForm } from "./js/mailchimp"
import { initNotifications } from "./js/notification"
import { initSubNav } from "./js/subnav"
import ResourceCollection from "./js/components/ResourceCollection"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper

$(document).ready(() => {
  const searchPageEl = document.querySelector("#search-page")
  if (searchPageEl) {
    ReactDOM.render(<SearchPage />, searchPageEl)
  }

  const courseCollectionEl = document.querySelector(
    "#course-collection-container"
  )
  if (courseCollectionEl) {
    ReactDOM.render(<CourseCollection />, courseCollectionEl)
  }

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
