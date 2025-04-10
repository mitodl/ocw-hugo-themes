import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  LearningResourcesApiLearningResourcesUserlistsPartialUpdateRequest,
  LearningResourcesApiLearningResourcesListRequest as LRListRequest
} from "@mitodl/open-api-axios/v1"
import { learningResourceQueries } from "./queries"
import { learningResourcesApi } from "../../clients"
import { userlistKeys } from "../userLists/queries"

const useLearningResourceByReadableId = (
  params: LRListRequest = {},
  opts?: { enabled?: boolean }
) => {
  const readableId = params.readable_id ? params.readable_id[0] : ""
  const queryDetails = learningResourceQueries.detailByReadableId(readableId)
  return useQuery({
    queryKey: queryDetails.queryKey || [],
    ...queryDetails,
    ...opts
  })
}

const useLearningResourceSetUserListRelationships = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      params: LearningResourcesApiLearningResourcesUserlistsPartialUpdateRequest
    ) => {
      return learningResourcesApi.learningResourcesUserlistsPartialUpdate(
        params
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userlistKeys.membershipList() })
    }
  })
}

export {
  useLearningResourceByReadableId,
  useLearningResourceSetUserListRelationships
}
