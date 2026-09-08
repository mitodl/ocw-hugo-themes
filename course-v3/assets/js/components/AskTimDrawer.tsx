import React, { useMemo, useState } from "react"
import Drawer from "@mui/material/Drawer"
import Typography from "@mui/material/Typography"
import { ActionButton } from "@mitodl/smoot-design"
import { AiChat } from "@mitodl/smoot-design/ai"
import type { AiChatProps } from "@mitodl/smoot-design/ai"
import { RiCloseLine } from "@remixicon/react"

export const COURSE_CONVERSATION_STARTERS = [
  { content: "What is this course about?" },
  { content: "What are the prerequisites for this course?" },
  { content: "How will this course be graded?" }
]

interface AskTimDrawerProps {
  courseTitle: string
  onClose: () => void
  open: boolean
  readableId: string
  syllabusEndpoint: string
}

const AskTimDrawer: React.FC<AskTimDrawerProps> = ({
  courseTitle,
  onClose,
  open,
  readableId,
  syllabusEndpoint
}) => {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  )
  const requestOpts = useMemo<AiChatProps["requestOpts"]>(
    () => ({
      apiUrl:         syllabusEndpoint,
      csrfCookieName: process.env.CSRF_COOKIE_NAME || "csrftoken",
      csrfHeaderName: "X-CSRFToken",
      fetchOpts:      { credentials: "include" },
      transformBody:  messages => {
        let latestUserMessage = ""
        for (let index = messages.length - 1; index >= 0; index -= 1) {
          if (messages[index].role === "user") {
            latestUserMessage = messages[index].content
            break
          }
        }
        return {
          collection_name: "content_files",
          message:         latestUserMessage,
          course_id:       readableId
        }
      }
    }),
    [readableId, syllabusEndpoint]
  )

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          "aria-label": "AskTIM",
          className:    "ask-tim-drawer"
        }
      }}
    >
      <header className="ask-tim-drawer-header">
        <div className="ask-tim-course-context">
          <Typography
            className="ask-tim-course-label"
            component="div"
            variant="body2"
          >
            Course
          </Typography>
          {/* Preserve Smoot typography despite the theme's global h2 overrides. */}
          <Typography
            aria-level={2}
            component="div"
            noWrap
            role="heading"
            title={courseTitle}
            variant="h4"
          >
            {courseTitle}
          </Typography>
        </div>
        <ActionButton
          aria-label="Close AskTIM"
          autoFocus
          className="flex-shrink-0"
          edge="rounded"
          onClick={onClose}
          size="medium"
          variant="tertiary"
        >
          <RiCloseLine aria-hidden />
        </ActionButton>
      </header>
      <div
        className="ask-tim-scroll-container"
        data-testid="ask-tim-scroll-container"
        ref={setScrollElement}
      >
        <AiChat
          chatId={readableId}
          conversationStarters={COURSE_CONVERSATION_STARTERS}
          entryScreenTitle="What do you want to know about this course?"
          requestOpts={requestOpts}
          scrollElement={scrollElement}
        />
      </div>
    </Drawer>
  )
}

export default AskTimDrawer
