function courseNav() {
  document
    .querySelectorAll(".course-nav, .transcript-header")
    .forEach(navEl => {
      // set .active on the currently active link
      navEl.querySelectorAll(".nav-link").forEach(navLinkEl => {
        const navLink = navLinkEl.getAttribute("href") ?
          navLinkEl.getAttribute("href") :
          ""
        if (
          // @ts-ignore
          navLink.replace(/\/$/, "") ===
          window.location.pathname.replace(/\/$/, "")
        ) {
          navLinkEl.classList.add("active")
        }
      })

      const activeEl = navEl.querySelector("a.nav-link.active")

      // iterate through nav items, find any that are parents of the active link, expanded if needed
      navEl.querySelectorAll(".course-nav-list-item").forEach(navItemEl => {
        const collapseEl = navItemEl.querySelector(".collapse")
        if (collapseEl && collapseEl.contains(activeEl)) {
          collapseEl.classList.add("show")
          // @ts-ignore
          navItemEl
            .querySelector(
              ".course-nav-section-toggle, video-tab-section-toggle"
            )
            .setAttribute("aria-expanded", "true")
        }
      })
    })
}
courseNav()
