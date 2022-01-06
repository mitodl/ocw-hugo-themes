/*
  If there are notifications that have not been dismissed, display them
*/
const initNotifications = () => {
  $(".notification-close").on("click", onNotificationClose)
  const notifications = document.getElementsByClassName("notification")
  for (const notification of Array.from(notifications)) {
    if (localStorage.getItem(`${notification.id}_dismissed`) !== "true") {
      notification.classList.remove("d-none")
    }
  }
}

/*
  Set the notification as dismissed
*/
const onNotificationClose = () => {
  const notifications = document.getElementsByClassName("notification")
  for (const notification of Array.from(notifications)) {
    notification.classList.add("d-none")
    localStorage.setItem(`${notification.id}_dismissed`, "true")
  }
}

export { initNotifications, onNotificationClose }
