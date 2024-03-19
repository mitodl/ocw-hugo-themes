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
import { initExternalLinkModal } from "./js/external_link_modal"
import { initUserlistModal } from "./js/userlist_modal"
import { initLoginButton } from "@mitodl/mit-open-login-button"
import * as openAPI from "@mitodl/open-api-axios"

export interface OCWWindow extends Window {
  initNanogallery2: () => void
  courseOpenID: number
  coursesAPI: () => any
  userlistAPI: () => any
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
  initExternalLinkModal()
  initUserlistModal()
  initLoginButton(
    "login-button-mobile",
    "http://localhost:8063/",
    window.location,
    "Login",
    "btn blue-btn text-white btn-link link-button py-2 px-3 my-0",
    "text-white"
  )
  initLoginButton(
    "login-button-desktop",
    "http://localhost:8063/",
    window.location,
    "Login",
    "btn blue-btn text-white btn-link link-button py-2 px-3 my-0",
    "text-white px-3"
  )
  const coursesAPI = new openAPI.v1.CoursesApi()
  const userlistAPI = new openAPI.v1.UserlistsApi()
  coursesAPI.axios.defaults.withCredentials = true
  userlistAPI.axios.defaults.withCredentials = true
  coursesAPI.basePath = "http://localhost:8063/"
  userlistAPI.basePath = "http://localhost:8063/"
  window.coursesAPI = coursesAPI
  window.userlistAPI = userlistAPI
  //TODO: Get this ID from the API using readable_id
  window.courseOpenID = 1470
})

let nanogallery2Loaded = false

window.initNanogallery2 = () => {
  if (nanogallery2Loaded) return
  import("./nanogallery2-imports")
  nanogallery2Loaded = true
}
