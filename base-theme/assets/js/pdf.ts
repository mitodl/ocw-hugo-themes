const platformExpression = /Mac|iPhone|iPod|iPad/i
const rejectedExpression = /Chrome|Android|CriOS|FxiOS|EdgiOS/i
const expectedExpression = /Safari/i

const isAppleSafari = (agent: string) => {
  if (rejectedExpression.test(agent)) {
    return false
  }
  return platformExpression.test(agent) && expectedExpression.test(agent)
}

export const hidePdfViewersSafari = () => {
  // hide the embedded PDF on Apple Webkit browsers because it doesn't work right
  if (isAppleSafari(navigator.userAgent)) {
    $(".pdf-wrapper").css("display", "none")
  }
}
