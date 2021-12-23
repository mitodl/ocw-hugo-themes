const initSubNav = () => {
  $(".navbar .nav-link").on("click", e => {
    const clickedLink = $(e.target)
    $(".navbar")
      .find(".active")
      .removeClass("active")
    clickedLink.addClass("active")
    $(".navbar-current-active").text(clickedLink.text())
    const target = $(clickedLink.attr("href")).get(0)
    const yOffset = -300
    const y = target.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({
      top:      y,
      behavior: "smooth"
    })
  })
}

export { initSubNav }
