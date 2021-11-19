export const initDivToggle = () => {
  const revealElements = document.querySelectorAll("[class*=reveal]")
  for (const reveal of revealElements) {
    for (const elementClass of reveal.classList) {
      if (elementClass.match(/^reveal/)) {
        reveal.addEventListener("click", () => {
          const revealNumber = elementClass.match(/\d+$/)[0]

          const hideables = document.getElementsByClassName(
            `toggle${revealNumber}`
          )
          for (const hidable of hideables) {
            hidable.classList.toggle("toggle-visible")
          }
        })
      }
    }
  }
}
