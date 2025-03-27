import ContentLoader from "react-content-loader"
import { times } from "ramda"

import Card from "./Card"

export const contentLoaderSpeed = 2

export const AnimatedEmptyCard = () => (
  <div className="post-content-loader" data-testid="animated-card">
    <Card className="compact-post-summary">
      <ContentLoader
        speed={contentLoaderSpeed}
        style={{ width: "100%", height: "137px" }}
        width={1000}
        height={137}
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" rx="5" ry="5" width="60%" height="20" />
        <rect x="0" y="40" rx="5" ry="5" width="60%" height="16" />
        <rect x="0" y="58" rx="5" ry="5" width="60%" height="16" />
        <rect x="0" y="113" rx="5" ry="5" width="170" height="24" />
        <rect x="66%" y="0" rx="5" ry="5" width="34%" height={128} />
      </ContentLoader>
    </Card>
  </div>
)

export default function Loading() {
  return (
    <div className="card-list-loader">
      {times(
        i => (
          <AnimatedEmptyCard key={i} />
        ),
        10
      )}
    </div>
  )
}

interface Props {
  className?: string
}

export function Spinner(props: Props) {
  const { className } = props

  return (
    <div className={`loading ${className || ""}`} data-testid="spinner">
      <div className="spinner">
        <div className="bounce1" data-testid="bounce"></div>
        <div className="bounce2" data-testid="bounce"></div>
        <div className="bounce3" data-testid="bounce"></div>
      </div>
    </div>
  )
}
