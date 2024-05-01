declare module 'mit-open-components' {
    declare const initMitOpenDom: (container: HTMLElement) => void
    declare const openAddToUserListDialog: (readableId: string) => void
    export { initMitOpenDom, openAddToUserListDialog }
}
