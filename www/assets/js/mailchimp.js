import { parseQueryParams } from "./lib/util"

const setupEmailSignupForm = () => {
  const $form = $(".newsletter-form")
  $form.find(".signup-link").click(event => {
    event.preventDefault()
    window.location.assign(`/newsletter?EMAIL=${$("#mce-EMAIL").val() || ""}`)
  })

  const queryParams = parseQueryParams()
  $("#mce-EMAIL").val(queryParams.get("EMAIL") || "")
  $("#mce-EMAIL").trigger("focus")
}
export { setupEmailSignupForm }
