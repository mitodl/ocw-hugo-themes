import { useQuery } from "@tanstack/react-query"
import { User } from "@mitodl/open-api-axios/v0"
import { usersApi } from "../../clients"

const useUserMe = () =>
  useQuery({
    queryKey: ["userMe"],
    queryFn:  async (): Promise<User> => {
      const response = await usersApi.usersMeRetrieve()
      return response.data as User
    }
  })

const useUserIsAuthenticated = () => {
  const { data: user } = useUserMe()
  return !!user?.is_authenticated
}

export { useUserMe, useUserIsAuthenticated }
