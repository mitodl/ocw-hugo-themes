import "./css/www.scss"
import "./css/search.scss"

import Popper from "popper.js"
import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserHistory } from "history"

import SearchPage from "./js/components/SearchPage"
import CourseList from "./js/components/CourseList"

import { setupEmailSignupForm } from "./js/mailchimp"
import { initNotifications } from "./js/notification"
import { initSubNav } from "./js/subnav"
import ResourceCollection from "./js/components/ResourceCollection"
import UserMenu from "./js/components/UserMenu"

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

type MaybeHasStatus = {
  response?: {
    status?: number
  }
}

const RETRY_STATUS_CODES = [408, 429, 502, 503, 504]
const MAX_RETRIES = 3
const THROW_ERROR_CODES: (number | undefined)[] = [404, 403, 401]

const makeQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        throwOnError: (error) => {
          const status = (error as MaybeHasStatus)?.response?.status
          return THROW_ERROR_CODES.includes(status)
        },
        retry: (failureCount, error) => {
          const status = (error as MaybeHasStatus)?.response?.status
          /**
           * React Query's default behavior is to retry all failed queries 3
           * times. Many things (e.g., 403, 404) are not worth retrying. Let's
           * just retry some explicit whitelist of status codes.
           */
          if (status !== undefined && RETRY_STATUS_CODES.includes(status)) {
            return failureCount < MAX_RETRIES
          }
          return false
        },
      },
    },
  })
}

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
