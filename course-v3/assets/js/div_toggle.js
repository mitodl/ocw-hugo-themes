export const initDivToggle = () => {
  const revealElements = document.querySelectorAll("[class*=reveal]")
  for (const reveal of Array.from(revealElements)) {
    for (const elementClass of Array.from(reveal.classList)) {
      if (elementClass.match(/^reveal/)) {
        reveal.addEventListener("click", () => {
          const revealId = elementClass.replace("reveal", "")

          const hideables = document.getElementsByClassName(`toggle${revealId}`)
          for (const hidable of Array.from(hideables)) {
            hidable.classList.toggle("toggle-visible")
          }
        })
      }
    }
  }
}
