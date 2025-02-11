import { useQuery } from "@tanstack/react-query"
import { Configuration, User as UserApi, UsersApi } from "@mitodl/open-api-axios/v0"

interface User extends Partial<UserApi> {
  is_authenticated: boolean
}

const useUserMe = () =>
  useQuery({
    queryKey: ["userMe"],
    queryFn: async (): Promise<User> => {
      try {
        const config = { basePath: "https://api.learn.dev.c4103.com/".replace(/\/+$/, ""), baseOptions: { withCredentials: true } }
        const configuration = new Configuration({
          basePath: config.basePath,
          baseOptions: config.baseOptions,
        })
        const usersApi = new UsersApi(configuration)
        const response = await usersApi.usersMeRetrieve()
        return {
          is_authenticated: true,
          ...response.data,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response?.status === 403) {
          return {
            is_authenticated: false,
          }
        }
        throw error
      }
    },
  })

export { useUserMe }