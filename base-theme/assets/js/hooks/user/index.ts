import { useQuery } from "@tanstack/react-query"
import { User as UserApi} from "@mitodl/open-api-axios/v0"
import { usersApi } from "../../clients"

interface User extends Partial<UserApi> {
  isAuthenticated: boolean
}

const useUserMe = () =>
  useQuery({
    queryKey: ["userMe"],
    queryFn:  async (): Promise<User> => {
      try {
        const response = await usersApi.usersMeRetrieve()
        return {
          isAuthenticated: true,
          ...response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response?.status === 403) {
          return {
            isAuthenticated: false
          }
        }
        throw error
      }
    }
  })

const useUserIsAuthenticated = () => {
  const { data: user } = useUserMe()
  return !!user?.isAuthenticated
}

export { useUserMe, useUserIsAuthenticated }
