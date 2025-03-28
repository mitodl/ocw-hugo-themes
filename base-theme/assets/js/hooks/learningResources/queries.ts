import { QueryOptions } from "@tanstack/react-query"
import { learningResourcesApi } from "../../clients"
import { clearListMemberships } from "../util/queries"

const queryOptions = <T>(options: QueryOptions<T>) => options

const learningResourceKeys = {
  root:        ["learning_resources"],
  // detail
  detailsRoot: () => [...learningResourceKeys.root, "detail"],
  detail:      (readableId: string) => [
    ...learningResourceKeys.detailsRoot(),
    readableId
  ]
}

const learningResourceQueries = {
  detailByReadableId: (readableId: string) =>
    queryOptions({
      queryKey: learningResourceKeys.detail(readableId),
      queryFn:  () =>
        learningResourcesApi
          .learningResourcesList({ readable_id: [readableId] })
          .then(res => clearListMemberships(res.data.results[0]))
    })
}

export { learningResourceQueries }
