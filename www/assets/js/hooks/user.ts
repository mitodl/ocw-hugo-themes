import { useQuery } from "@tanstack/react-query"
import { User as UserApi, UsersApi } from "@mitodl/open-api-axios/v0"

interface User extends Partial<UserApi> {
  is_authenticated: boolean
}

const useUserMe = () =>
  useQuery({
    queryKey: ["userMe"],
    queryFn: async (): Promise<User> => {
      try {
        const usersApi = new UsersApi(undefined, "https://api.learn.dev.c4103.com/".replace(/\/+$/, ""), )
        usersApi.axios.defaults.withCredentials = true
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