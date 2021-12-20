const initSubNav = () => {
  $(".navbar .nav-link").on("click", e => {
    const clickedLink = $(e.target)
    $(".navbar")
      .find(".active")
      .removeClass("active")
    clickedLink.addClass("active")
    $(".navbar-current-active").text(clickedLink.text())
    window.location = clickedLink.attr("href")
    // console.log($(".navbar-collapse")[0].collapse)
    // $(".navbar-collapse").collapse("hide")
  })
}

export { initSubNav }
