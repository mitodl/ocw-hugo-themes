// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const toggleExpand = (button, container) => {
  const expanded = button.classList.contains("expanded")
  const readmoreText = button.querySelector(".read-more-text")
  const arrow = button.querySelector(".expander-arrow")
  if (expanded) {
    button.classList.remove("expanded")
    button.setAttribute("aria-expanded", "false")
    container.classList.add("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_right"
    }
  } else {
    button.classList.add("expanded")
    button.setAttribute("aria-expanded", "true")
    container.classList.remove("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_down"
    }
  }

  if (readmoreText) {
    readmoreText.textContent = expanded ? "Read More" : "Show Less"
  }
}

const initCourseInfoExpander = document => {
  for (const expanderButton of document.querySelectorAll(".expand-link")) {
    const container = expanderButton.closest(".expand-container")
    expanderButton.addEventListener("click", event => {
      event.preventDefault()
      toggleExpand(expanderButton, container)
    })
    expanderButton.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        event.preventDefault()
        toggleExpand(expanderButton, container)
      }
    })
  }
}

const initCourseDescriptionExpander = document => {
  const courseDescription = document.getElementById("course-description")
  if (courseDescription) {
    const collapsedDescription = courseDescription.querySelector(
      "#collapsed-description"
    )
    const expandedDescription = courseDescription?.querySelector(
      "#expanded-description"
    )
    if (collapsedDescription && expandedDescription) {
      const expandLink = collapsedDescription.querySelector(
        "#expand-description"
      )
      const collapseLink = expandedDescription.querySelector(
        "#collapse-description"
      )
      expandLink.addEventListener("click", () => {
        collapsedDescription.classList.add("d-none")
        expandedDescription.classList.remove("d-none")
      })
      collapseLink.addEventListener("click", () => {
        collapsedDescription.classList.remove("d-none")
        expandedDescription.classList.add("d-none")
      })
    }
  }
}

export { initCourseInfoExpander, initCourseDescriptionExpander }
