import { UsersApi } from "@mitodl/open-api-axios/v0"
import {
  Configuration,
  LearningResourcesApi,
  UserlistsApi
} from "@mitodl/open-api-axios/v1"
import { QueryClient } from "@tanstack/react-query"

type MaybeHasStatus = {
  response?: {
    status?: number
  }
}

const RETRY_STATUS_CODES = [408, 429, 502, 503, 504]
const MAX_RETRIES = 3
const THROW_ERROR_CODES: (number | undefined)[] = [404, 403, 401]

const makeQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime:            Infinity,
        onError:              error => {
          const status = (error as MaybeHasStatus)?.response?.status
          if (THROW_ERROR_CODES.includes(status)) {
            throw error
          }
        },
        retry: (failureCount, error) => {
          const status = (error as MaybeHasStatus)?.response?.status
          /**
           * React Query's default behavior is to retry all failed queries 3
           * times. Many things (e.g., 403, 404) are not worth retrying. Let's
           * just retry some explicit whitelist of status codes.
           */
          if (status !== undefined && RETRY_STATUS_CODES.includes(status)) {
            return failureCount < MAX_RETRIES
          }
          return false
        }
      }
    }
  })
}

const config = {
  basePath:    process.env.MIT_LEARN_API_BASEURL,
  baseOptions: { withCredentials: true }
}
const configuration = new Configuration({
  basePath:    config.basePath,
  baseOptions: config.baseOptions
})

const usersApi = new UsersApi(configuration)

const learningResourcesApi = new LearningResourcesApi(configuration)

const userListsApi = new UserlistsApi(configuration)

export { makeQueryClient, usersApi, learningResourcesApi, userListsApi }
