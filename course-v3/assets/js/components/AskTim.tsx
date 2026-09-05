import React, { Suspense, useEffect, useRef, useState } from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { createPortal } from "react-dom"
import { createRoot } from "react-dom/client"
import { Button, ThemeProvider } from "@mitodl/smoot-design"
import { RiSparkling2Line } from "@remixicon/react"
import type { PostHog } from "posthog-js"

const AskTimDrawer = React.lazy(() => import("./AskTimDrawer"))

export const ASK_TIM_FEATURE_FLAG = "ocw-course-v3-ask-tim"

// Matches Bootstrap's media-breakpoint-down(sm), used by the course-v3 layout.
const COURSE_MOBILE_MEDIA_QUERY = "(max-width: 767.98px)"

export type AskTimPostHog = Pick<PostHog, "capture" | "onFeatureFlags">

interface AskTimProps {
  courseTitle: string
  mobileContainer?: Element | null
  posthog?: AskTimPostHog
  readableId: string
  syllabusEndpoint: string
}

export const AskTim: React.FC<AskTimProps> = ({
  courseTitle,
  mobileContainer,
  posthog,
  readableId,
  syllabusEndpoint
}) => {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const restoreFocus = useRef(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const isMobile = useMediaQuery(COURSE_MOBILE_MEDIA_QUERY)

  useEffect(() => {
    setEnabled(false)
    if (!syllabusEndpoint || !posthog?.onFeatureFlags) return

    return posthog.onFeatureFlags((flags, _variants, context) => {
      const nextEnabled =
        !context?.errorsLoading && flags.includes(ASK_TIM_FEATURE_FLAG)
      setEnabled(nextEnabled)
      if (!nextEnabled) setOpen(false)
    })
  }, [posthog, syllabusEndpoint])

  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false
      triggerRef.current?.focus()
    }
  }, [open])

  if (!enabled) return null

  const handleOpen = () => {
    posthog?.capture("asktim_clicked", {
      type:         "syllabus_bot",
      readableId,
      resourceType: "course",
      platformCode: "ocw"
    })
    setHasOpened(true)
    setOpen(true)
  }

  const handleClose = () => {
    restoreFocus.current = true
    setOpen(false)
  }

  const trigger = (
    <Button
      aria-label="AskTIM about this course"
      className="ask-tim-trigger w-100"
      edge="rounded"
      onClick={handleOpen}
      ref={triggerRef}
      size="large"
      variant="bordered"
    >
      <span className="ask-tim-content">
        <RiSparkling2Line aria-hidden size={20} />
        <span className="ask-tim-label">
          Ask<strong>TIM</strong> about this course
        </span>
      </span>
    </Button>
  )

  return (
    <>
      {isMobile && mobileContainer ?
        createPortal(trigger, mobileContainer) :
        trigger}
      {hasOpened ? (
        <Suspense fallback={null}>
          <AskTimDrawer
            courseTitle={courseTitle}
            onClose={handleClose}
            open={open}
            readableId={readableId}
            syllabusEndpoint={syllabusEndpoint}
          />
        </Suspense>
      ) : null}
    </>
  )
}

export const mountAskTim = (
  container: Element | null,
  posthog?: AskTimPostHog,
  syllabusEndpoint = process.env.LEARN_AI_SYLLABUS_ENDPOINT
): void => {
  if (!(container instanceof HTMLElement) || !posthog || !syllabusEndpoint) {
    return
  }

  const { courseTitle, readableId } = container.dataset
  if (!courseTitle || !readableId) return

  const mobileContainer = document.querySelector("#ask-tim-mobile-container")

  createRoot(container).render(
    <ThemeProvider>
      <AskTim
        courseTitle={courseTitle}
        mobileContainer={mobileContainer}
        posthog={posthog}
        readableId={readableId}
        syllabusEndpoint={syllabusEndpoint}
      />
    </ThemeProvider>
  )
}

export default AskTim
