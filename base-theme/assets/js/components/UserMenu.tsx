import React from "react"

import { UserMenu as SmootUserMenu } from "@mitodl/smoot-design"

import { useUserMe } from "../hooks/user"

type UserMenuProps = {
  /** Which login affordance to show when logged out. */
  variant?: "desktop" | "mobile"
}

/**
 * OCW's binding of smoot-design's shared UserMenu: it supplies the auth state
 * and the OCW/MIT Learn links; smoot owns the appearance.
 */
export default function UserMenu({ variant }: UserMenuProps) {
  const { data: user, isLoading } = useUserMe()
  const learnBaseUrl = process.env.MIT_LEARN_BASE_URL
  const apiBaseUrl = process.env.MIT_LEARN_API_BASE_URL
  const encodedLocation = encodeURI(window.location.href)
  const dashboardUrl = new URL("/dashboard", learnBaseUrl).toString()
  const myListsUrl = new URL("/dashboard/my-lists", learnBaseUrl).toString()
  const logoutUrl = new URL(
    `/logout?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()
  const loginUrl = new URL(
    `/login?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()

  if (isLoading) return null

  return (
    <SmootUserMenu
      user={user?.is_authenticated ? { name: user.profile?.name } : undefined}
      /**
       * MIT Learn builds this list from the user's permissions, so editors
       * additionally see Learning Paths, Article, and News. OCW has no way to
       * ask for those, so it shows the subset every authenticated user gets.
       * Serving the items from an API would let the two headers converge.
       */
      items={[
        { key: "dashboard", label: "Dashboard", href: dashboardUrl },
        { key: "my-lists", label: "My Lists", href: myListsUrl },
        { key: "logout", label: "Log Out", href: logoutUrl }
      ]}
      loginUrl={loginUrl}
      variant={variant}
    />
  )
}
