export const initDivToggle = () => {
  const revealElements = document.querySelectorAll("[class*=reveal]")
  for (const reveal of revealElements) {
    for (const elementClass of reveal.classList) {
      if (elementClass.match(/^reveal/)) {
        reveal.addEventListener("click", () => {
          const revealId = elementClass.replace("reveal", "")

          const hideables = document.getElementsByClassName(`toggle${revealId}`)
          for (const hidable of hideables) {
            hidable.classList.toggle("toggle-visible")
          }
        })
      }
    }
  }
}
