const setupEmailSignupForm = () => {
  const $form = $(".newsletter-form")
  $form.find(".signup-link").click(event => {
    event.preventDefault()
    $form.submit()
  })
}

export { setupEmailSignupForm }
