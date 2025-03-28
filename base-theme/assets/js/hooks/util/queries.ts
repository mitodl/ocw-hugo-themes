import { LearningResource } from "@mitodl/open-api-axios/v1"

const clearListMemberships = (
  resource: LearningResource
): LearningResource => ({
  ...resource,
  user_list_parents:     [],
  learning_path_parents: []
})

export { clearListMemberships }
