export const initDivToggle = () => {
  var revealElements = document.querySelectorAll("[class*=reveal]")
  for (var reveal of revealElements) {
    (function () {
      for(var elementClass of reveal.classList){
        if(elementClass.match(/^reveal/)){
          reveal.addEventListener("click", () => {
            var revealNumber = elementClass.match(/\d+$/)[0]
            
            var hideables = document.getElementsByClassName("toggle" + revealNumber)
            for(var hidable of hideables){
              hidable.classList.toggle("toggle-visible")
            }
          })
        }
      }
    }())
  }
}
