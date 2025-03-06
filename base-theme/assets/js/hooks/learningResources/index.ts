import { useQuery } from "@tanstack/react-query"
import type { LearningResourcesApiLearningResourcesListRequest as LRListRequest } from "@mitodl/open-api-axios/v1"
import { learningResourceQueries } from "./queries"

const useLearningResourceByReadableId = (
  params: LRListRequest = {},
  opts?: { enabled?: boolean },
) => {
  const readableId = params.readable_id ? params.readable_id[0] : ""
  return useQuery({
    ...learningResourceQueries.detailByReadableId(readableId),
    ...opts,
  })
}

export { useLearningResourceByReadableId }