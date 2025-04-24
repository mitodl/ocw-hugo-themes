import React from "react"
import { useUserListMemberList } from "../hooks/userLists"
import { useLearningResourceByReadableId } from "../hooks/learningResources"
import { ActionButton } from "@mitodl/smoot-design"
import { RiBookmarkFill, RiBookmarkLine } from "@remixicon/react"

interface BookmarkButtonProps {
  resourceReadableId: string
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  resourceReadableId
}) => {
  const { data: resource, isLoading: isResourceLoading } =
    useLearningResourceByReadableId({ readable_id: [resourceReadableId] })
  const { data: userListMemberships, isLoading: isUserListMembershipsLoading } =
    useUserListMemberList(resource?.id)
  const inUserList = userListMemberships?.length || 0 > 0
  return (
    <ActionButton
      className="bookmark-button"
      edge="circular"
      size="small"
      variant={inUserList ? "primary" : "secondary"}
      color={inUserList ? undefined : "secondary"}
      data-toggle="modal"
      data-target="#add-to-user-list-modal"
      data-resourcereadableid={resourceReadableId}>
        {inUserList ? (
          <RiBookmarkFill aria-hidden />
        ) : (
          <RiBookmarkLine aria-hidden />
        )}
    </ActionButton>
  )
}

export default BookmarkButton
