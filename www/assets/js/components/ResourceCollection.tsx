import { useResourceCollectionData } from "../hooks/hugo_data"
import { LearningResourceDisplay } from "./SearchResult"

export default function ResourceCollection() {
  const data = useResourceCollectionData()

  return (
    <div className="col-12 col-lg-8 pb-2">
      {data.map((learningResource, index) => (
        <LearningResourceDisplay
          key={index}
          id={String(learningResource.id)}
          object={learningResource}
          index={index}
        />
      ))}
    </div>
  )
}
