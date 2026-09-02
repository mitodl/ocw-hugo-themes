import React, { useId, useMemo } from "react"
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
  const titleId = useId()
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
          "aria-labelledby": titleId,
          sx:                {
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
        sx={{
          alignItems:     "center",
          borderBottom:   1,
          borderColor:    "divider",
          display:        "flex",
          flexShrink:     0,
          gap:            2,
          justifyContent: "space-between",
          p:              2
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography id={titleId} variant="h4">
            Ask TIM
          </Typography>
          <Typography noWrap variant="body2">
            {courseTitle}
          </Typography>
        </Box>
        <ActionButton
          aria-label="Close Ask TIM"
          autoFocus
          edge="circular"
          onClick={onClose}
          size="small"
          variant="text"
        >
          <RiCloseLine aria-hidden />
        </ActionButton>
      </Box>
      <Box
        sx={{
          flex:                                 1,
          minHeight:                            0,
          overflow:                             "hidden",
          position:                             "relative",
          "& .MitAiChat--entryScreenContainer": { overflowY: "auto" }
        }}
      >
        <AiChat
          chatId={readableId}
          conversationStarters={COURSE_CONVERSATION_STARTERS}
          entryScreenTitle="What do you want to know about this course?"
          requestOpts={requestOpts}
        />
      </Box>
    </Drawer>
  )
}

export default AskTimDrawer
