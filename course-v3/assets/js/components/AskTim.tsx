import React, { Suspense, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { Button, ThemeProvider } from "@mitodl/smoot-design"
import { RiSparkling2Line } from "@remixicon/react"
import type { PostHog } from "posthog-js"

const AskTimDrawer = React.lazy(() => import("./AskTimDrawer"))

export const ASK_TIM_FEATURE_FLAG = "ocw-course-v3-ask-tim"

export type AskTimPostHog = Pick<PostHog, "capture" | "onFeatureFlags">

interface AskTimProps {
  courseTitle: string
  posthog?: AskTimPostHog
  readableId: string
  syllabusEndpoint: string
}

export const AskTim: React.FC<AskTimProps> = ({
  courseTitle,
  posthog,
  readableId,
  syllabusEndpoint
}) => {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

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

  return (
    <>
      <Button
        aria-label="Ask TIM about this course"
        className="mr-2"
        edge="rounded"
        onClick={handleOpen}
        size="small"
        startIcon={<RiSparkling2Line aria-hidden />}
        variant="bordered"
      >
        Ask<strong>TIM</strong>
      </Button>
      {hasOpened ? (
        <Suspense fallback={null}>
          <AskTimDrawer
            courseTitle={courseTitle}
            onClose={() => setOpen(false)}
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

  createRoot(container).render(
    <ThemeProvider>
      <AskTim
        courseTitle={courseTitle}
        posthog={posthog}
        readableId={readableId}
        syllabusEndpoint={syllabusEndpoint}
      />
    </ThemeProvider>
  )
}

export default AskTim
