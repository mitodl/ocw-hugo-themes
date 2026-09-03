import React, { useMemo, useState } from "react"
import Box from "@mui/material/Box"
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
  mobile: boolean
  onClose: () => void
  open: boolean
  readableId: string
  syllabusEndpoint: string
}

const AskTimDrawer: React.FC<AskTimDrawerProps> = ({
  courseTitle,
  mobile,
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

  const closeButton = (
    <ActionButton
      aria-label="Close Ask TIM"
      autoFocus
      edge="rounded"
      onClick={onClose}
      size="medium"
      variant="tertiary"
    >
      <RiCloseLine aria-hidden />
    </ActionButton>
  )

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          "aria-label": "Ask TIM",
          sx:           {
            boxSizing: "border-box",
            display:   "flex",
            maxWidth:  900,
            overflowX: "hidden",
            width:     "100%"
          }
        }
      }}
    >
      <Box
        component="header"
        sx={theme =>
          mobile ?
            {
              position: "absolute",
              right:    theme.spacing(2),
              top:      theme.spacing(2),
              zIndex:   2
            } :
            {
              alignItems:     "flex-start",
              display:        "flex",
              flexShrink:     0,
              gap:            2,
              justifyContent: "space-between",
              pb:             2,
              pt:             3,
              px:             4,
              position:       "relative",
              zIndex:         2
            }
        }
      >
        {!mobile ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              sx={{ color: "secondary.active" }}
              variant="body2"
            >
              Course
            </Typography>
            <Typography
              aria-level={2}
              component="div"
              noWrap
              role="heading"
              variant="h4"
            >
              {courseTitle}
            </Typography>
          </Box>
        ) : null}
        {/* Preserve the close button across breakpoint changes so autoFocus does not run again. */}
        <Box key="close" sx={{ flexShrink: 0 }}>
          {closeButton}
        </Box>
      </Box>
      <Box
        data-testid="ask-tim-scroll-container"
        ref={setScrollElement}
        sx={{
          flex:      1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          position:  "relative"
        }}
      >
        <AiChat
          chatId={readableId}
          conversationStarters={COURSE_CONVERSATION_STARTERS}
          entryScreenTitle="What do you want to know about this course?"
          requestOpts={requestOpts}
          scrollElement={scrollElement}
        />
      </Box>
    </Drawer>
  )
}

export default AskTimDrawer
