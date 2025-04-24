import React from "react"

interface BookmarkButtonProps {
  resourceReadableId: string
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  resourceReadableId
}) => {
  return (
    <button
      className="red-btn p-2"
      data-toggle="modal"
      data-target="#add-to-user-list-modal"
      data-resourcereadableid={resourceReadableId}
      title="Add to User List"
    >
      <i
        aria-hidden="true"
        className="material-icons display-4 text-white align-bottom"
      >
        bookmarks
      </i>
    </button>
  )
}

export default BookmarkButton
