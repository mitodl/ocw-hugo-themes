// @ts-expect-error TODO
function expandNav(navItemEl, collapseEl) {
  collapseEl.classList.add("show")
  navItemEl
    .querySelector(".course-nav-section-toggle, video-tab-toggle-section")
    .setAttribute("aria-expanded", "true")
}

function courseNav() {
  document
    .querySelectorAll(".course-nav, .transcript-header")
    .forEach(navEl => {
      // set .active on the currently active link
      navEl.querySelectorAll(".nav-link").forEach(navLinkEl => {
        const navLink = navLinkEl.getAttribute("href") ?
          navLinkEl.getAttribute("href") :
          ""
        // @ts-expect-error TODO
        const navLinkPath = `/${navLink.replace(/\.\.\//g, "").replace(/\/(index\.html)?$/, "")}`
        const windowLocationPath = window.location.pathname.replace(/\/(index\.html)?$/, "")

        if (navLinkPath === windowLocationPath) {
          navLinkEl.classList.add("active")
          // @ts-expect-error TODO
          const uuid = navLinkEl.dataset.uuid
          const navItemEl = navLinkEl.closest(".course-nav-list-item")
          const collapseEl = navItemEl?.querySelector(".collapse")
          const sectionToggles = Array.prototype.filter.call(
            document.querySelectorAll(".course-nav-section-toggle"),
            node => {
              return node.dataset.uuid === uuid
            }
          )
          // if this is a parent item, expand its children
          if (navItemEl && collapseEl && sectionToggles.length > 0) {
            expandNav(navItemEl, collapseEl)
          }
        }
      })

      const activeEl = navEl.querySelector("a.nav-link.active")

      // iterate through nav items, find any that are parents of the active link, expanded if needed
      navEl.querySelectorAll(".course-nav-list-item").forEach(navItemEl => {
        const collapseEl = navItemEl.querySelector(".collapse")
        if (collapseEl && collapseEl.contains(activeEl)) {
          expandNav(navItemEl, collapseEl)
        }
      })
    })
}
courseNav()
