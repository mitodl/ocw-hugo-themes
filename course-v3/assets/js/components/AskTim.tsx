import React, { Suspense, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { Button, ThemeProvider } from "@mitodl/smoot-design"
import { RiSparkling2Line } from "@remixicon/react"
import type { PostHog } from "posthog-js"

const AskTimDrawer = React.lazy(() => import("./AskTimDrawer"))

export const ASK_TIM_FEATURE_FLAG = "ocw-course-v3-ask-tim"

export type AskTimPostHog = Pick<PostHog, "capture" | "onFeatureFlags">

interface AskTimProps {
  apiBaseUrl: string
  courseTitle: string
  posthog?: AskTimPostHog
  readableId: string
}

export const AskTim: React.FC<AskTimProps> = ({
  apiBaseUrl,
  courseTitle,
  posthog,
  readableId
}) => {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    setEnabled(false)
    if (!apiBaseUrl || !posthog?.onFeatureFlags) return

    return posthog.onFeatureFlags((flags, _variants, context) => {
      const nextEnabled =
        !context?.errorsLoading && flags.includes(ASK_TIM_FEATURE_FLAG)
      setEnabled(nextEnabled)
      if (!nextEnabled) setOpen(false)
    })
  }, [apiBaseUrl, posthog])

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
        className="ask-tim-button mr-2"
        edge="rounded"
        onClick={handleOpen}
        size="small"
        startIcon={<RiSparkling2Line aria-hidden />}
        variant="bordered"
      >
        Ask TIM
      </Button>
      {hasOpened ? (
        <Suspense fallback={null}>
          <AskTimDrawer
            apiBaseUrl={apiBaseUrl}
            courseTitle={courseTitle}
            onClose={() => setOpen(false)}
            open={open}
            readableId={readableId}
          />
        </Suspense>
      ) : null}
    </>
  )
}

export const mountAskTim = (
  container: Element | null,
  posthog?: AskTimPostHog,
  apiBaseUrl = process.env.MIT_LEARN_API_BASE_URL
): void => {
  if (!(container instanceof HTMLElement) || !posthog || !apiBaseUrl) return

  const { courseTitle, readableId } = container.dataset
  if (!courseTitle || !readableId) return

  createRoot(container).render(
    <ThemeProvider>
      <AskTim
        apiBaseUrl={apiBaseUrl}
        courseTitle={courseTitle}
        posthog={posthog}
        readableId={readableId}
      />
    </ThemeProvider>
  )
}

export default AskTim
