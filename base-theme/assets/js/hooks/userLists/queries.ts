import instance from "../../axios"
import type {
  UserlistsApiUserlistsItemsListRequest as ItemsListRequest,
  LearningResource,
  UserlistsApiUserlistsListRequest as ListRequest,
  PaginatedUserListRelationshipList
} from "@mitodl/open-api-axios/v1"
import { userListsApi } from "../../clients"
import { UseInfiniteQueryOptions, QueryOptions } from "@tanstack/react-query"
import { clearListMemberships } from "../util/queries"

const queryOptions = <T>(options: QueryOptions<T>) => options
const infiniteQueryOptions = <T>(options: UseInfiniteQueryOptions<T>) => options

const userlistKeys = {
  root:              ["userLists"],
  listRoot:          () => [...userlistKeys.root, "list"],
  list:              (params: ListRequest) => [...userlistKeys.listRoot(), params],
  detailRoot:        () => [...userlistKeys.root, "detail"],
  detail:            (id: number) => [...userlistKeys.detailRoot(), id],
  infiniteItemsRoot: (id: number) => [...userlistKeys.detail(id), "items"],
  infiniteItems:     (id: number, listingParams: ItemsListRequest) => [
    ...userlistKeys.infiniteItemsRoot(id),
    listingParams
  ],
  membershipList: () => [...userlistKeys.root, "membershipList"]
}

const userlistQueries = {
  list: (params: ListRequest) =>
    queryOptions({
      queryKey: userlistKeys.list(params),
      queryFn:  () => userListsApi.userlistsList(params).then(res => res.data)
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: userlistKeys.detail(id),
      queryFn:  () =>
        userListsApi.userlistsRetrieve({ id }).then(res => res.data)
    }),
  infiniteItems: (id: number, listingParams: ItemsListRequest) =>
    infiniteQueryOptions({
      queryKey: userlistKeys.infiniteItems(id, listingParams),
      queryFn:  async ({
        pageParam
      }): Promise<PaginatedUserListRelationshipList> => {
        // Use generated API for first request, then use next parameter
        const request = pageParam ?
          instance.request<PaginatedUserListRelationshipList>({
            method: "get",
            url:    String(pageParam)
          }) :
          userListsApi.userlistsItemsList(listingParams)
        const { data } = await request
        return {
          ...data,
          results: data.results.map(
            (relation: {
              id: number
              parent: number
              child: number
              resource: LearningResource
            }) => ({
              ...relation,
              resource: clearListMemberships(relation.resource)
            })
          )
        }
      },
      getNextPageParam: lastPage => {
        return lastPage.next ?? undefined
      },
      initialPageParam: undefined
    }),
  membershipList: () => ({
    queryKey: userlistKeys.membershipList(),
    queryFn:  () => userListsApi.userlistsMembershipList().then(res => res.data)
  })
}

export { userlistQueries, userlistKeys }
