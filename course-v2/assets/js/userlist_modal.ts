import * as openAPI from "@mitodl/open-api-axios"

export const USERLIST_MODAL_ID = "userlist-modal"
export const USERLIST_CONTAINER_ID = "userlist-modal-list-container"

export interface Userlist extends Object {
    author: number
    description: string
    id: number
    image: string
    item_count: number
    privacy_level: string
    title: string
    topics: Array<string>
  }

export function initUserlistModal() {
  $("#course-bookmark-btn").on("click", async event => {
    event.preventDefault()

    const modal = $(`#${USERLIST_MODAL_ID}`)

    const userlistAPI = new openAPI.v1.UserlistsApi()
    userlistAPI.axios.defaults.withCredentials = true
    userlistAPI.basePath = "http://localhost:8063/"
    const userLists = await userlistAPI.userlistsList()

    const userlistContainer = $(`#${USERLIST_CONTAINER_ID}`)
    const userlistList = document.createElement("ul")
    userlistList.className = "list-group"
    userlistContainer.append(userlistList)
    userLists.data.results.forEach((userList: Userlist) => {
        const listItem = document.createElement("li")
        listItem.className = "list-group-item"
        userlistList.append(listItem)
        const listItemContainer = document.createElement("div")
        listItemContainer.append(listItem)
        listItemContainer.classList.add("row")
        const listNameContainer = document.createElement("div")
        listNameContainer.classList.add("col-11")
        const listName = document.createElement("span")
        listName.innerText = userList.title
        const listButtonContainer = document.createElement("div")
        listButtonContainer.classList.add("col-1")
        const listButton = document.createElement("button")
        listButton.className = "red-btn p-2"
        const listButtonIcon = document.createElement("i")
        listButtonIcon.className = "material-icons display-4 text-white align-bottom"
        listButtonIcon.innerText = "bookmark_add"
        userlistContainer.append(listItemContainer)
        listNameContainer.append(listName)
        listItemContainer.append(listNameContainer)
        listButton.append(listButtonIcon)
        listButtonContainer.append(listButton)
        listItemContainer.append(listButtonContainer)
        console.log(userList)
    })

    console.log(userLists.data)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    modal.modal("show")
  })
}
