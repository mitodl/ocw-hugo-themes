import { initMitOpenDom, openAddToUserListDialog } from "mit-open-components"

export function initUserlistModal(readableId: string) {
  $("#course-bookmark-btn").on("click", async event => {
    event.preventDefault()
    await initMitOpenDom($("#mit-open-dom")[0])
    await openAddToUserListDialog(readableId)
  })
}
