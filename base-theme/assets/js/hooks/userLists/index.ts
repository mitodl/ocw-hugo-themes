import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { userListsApi } from "../../clients"
import type {
  UserlistsApiUserlistsListRequest as ListRequest,
  UserlistsApiUserlistsCreateRequest as CreateRequest,
  UserlistsApiUserlistsDestroyRequest as DestroyRequest,
  UserlistsApiUserlistsItemsListRequest as ItemsListRequest,
  UserList
} from "@mitodl/open-api-axios/v1"
import { userlistKeys, userlistQueries } from "./queries"
import { useUserIsAuthenticated } from "../user"

const useUserListList = (
  params: ListRequest = {},
  opts?: { enabled?: boolean }
) => {
  const queryOptions = userlistQueries.list(params)
  return useQuery({
    ...queryOptions,
    queryKey: queryOptions.queryKey ?? [`userlist-list`, params],
    ...opts
  })
}

const useUserListsDetail = (id: number) => {
  const queryOptions = userlistQueries.detail(id)
  return useQuery({
    ...queryOptions,
    queryKey: queryOptions.queryKey ?? [`userlist-detail`, id]
  })
}

const useUserListCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CreateRequest["UserListRequest"]) =>
      userListsApi.userlistsCreate({
        UserListRequest: params
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userlistKeys.listRoot() })
    }
  })
}
const useUserListUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Pick<UserList, "id"> & Partial<UserList>) =>
      userListsApi.userlistsPartialUpdate({
        id:                     params.id,
        PatchedUserListRequest: params
      }),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: userlistKeys.listRoot() })
      queryClient.invalidateQueries({ queryKey: userlistKeys.detail(vars.id) })
    }
  })
}

const useUserListDestroy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: DestroyRequest) =>
      userListsApi.userlistsDestroy(params),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userlistKeys.listRoot() })
      queryClient.invalidateQueries({ queryKey: userlistKeys.membershipList() })
    }
  })
}

const useInfiniteUserListItems = (
  params: ItemsListRequest,
  opts?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    ...userlistQueries.infiniteItems(params.userlist_id, params),
    ...opts
  })
}

interface ListItemMoveRequest {
  parent: number
  id: number
  position?: number
}
const useUserListListItemMove = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ parent, id, position }: ListItemMoveRequest) => {
      await userListsApi.userlistsItemsPartialUpdate({
        userlist_id:                        parent,
        id,
        PatchedUserListRelationshipRequest: { position }
      })
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: userlistKeys.infiniteItemsRoot(vars.parent)
      })
    }
  })
}

const useIsUserListMember = (resourceId?: number) => {
  return useQuery({
    ...userlistQueries.membershipList(),
    select: data => {
      return !!data.find(relationship => relationship.child === resourceId)
    },
    enabled: useUserIsAuthenticated() && !!resourceId
  })
}

const useUserListMemberList = (resourceId?: number) => {
  return useQuery({
    ...userlistQueries.membershipList(),
    select: data => {
      return data
        .filter(relationship => relationship.child === resourceId)
        .map(relationship => relationship.parent.toString())
    },
    enabled: useUserIsAuthenticated() && !!resourceId
  })
}

export {
  useUserListList,
  useUserListsDetail,
  useUserListCreate,
  useUserListUpdate,
  useUserListDestroy,
  useInfiniteUserListItems,
  useUserListListItemMove,
  useIsUserListMember,
  useUserListMemberList
}
