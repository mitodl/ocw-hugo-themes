// @ts-nocheck
export const clearSolution = () => {
  const radioElements = document.getElementsByClassName("multiple-choice-radio")
  for (const radio of radioElements) {
    radio.addEventListener("click", () => {
      Array.from(
        radio.closest("fieldset").getElementsByClassName("correctness-icon")
      ).forEach(solution => {
        solution.classList.remove("toggle-visible")
      })
    })
  }
}

export const checkAnswer = () => {
  Array.from(
    document.getElementsByClassName("multiple-choice-check-button")
  ).forEach(button => {
    button.addEventListener("click", () => {
      Array.from(
        button
          .closest(".multiple-choice-question")
          .getElementsByClassName("multiple-choice-radio")
      ).forEach(input => {
        if (input.checked) {
          input
            .closest("div")
            .getElementsByClassName("correctness-icon")[0]
            .classList.add("toggle-visible")
        }
      })
    })
  })
}

export const showSolution = () => {
  Array.from(
    document.getElementsByClassName("multiple-choice-show-button")
  ).forEach(button => {
    button.addEventListener("click", () => {
      const solutionShown = button
        .closest(".multiple-choice-question")
        .getElementsByClassName("multiple-choice-solution")[0]
        .classList.toggle("toggle-visible")

      if (solutionShown) {
        button
          .closest(".multiple-choice-question")
          .getElementsByClassName("correctness-icon-correct")[0]
          .classList.add("toggle-visible")
      } else {
        button
          .closest(".multiple-choice-question")
          .getElementsByClassName("correctness-icon-correct")[0]
          .classList.remove("toggle-visible")
      }
    })
  })
}
