/**
 * One offline build ships twice: synced into the mirror drive at the course's
 * site_url_path (e.g. courses/<slug>/), below the mirror's own home page, and
 * as the course download zip, where nothing sits above the course. The build
 * points the OCW logo at the mirror home, relative to the page. Only the
 * page's location can tell the two apart, so outside a mirror this points the
 * logo at the live site instead of a file that does not exist.
 */

/**
 * Whether `pageUrl` sits at `siteUrlPath` below the mirror home that the logo
 * link resolves to, as it does in a mirror.
 */
export const isInMirror = (
  pageUrl: string,
  mirrorHomeUrl: string,
  siteUrlPath: string
): boolean => {
  const segments = siteUrlPath.split("/").filter(Boolean)
  if (segments.length === 0) return false

  const courseRoot = new URL(`${segments.join("/")}/`, mirrorHomeUrl)
  return pageUrl.startsWith(courseRoot.href)
}

const getMetaContent = (name: string) =>
  document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content

export const initMirrorHomeLinks = () => {
  const siteUrlPath = getMetaContent("ocw-site-url-path")
  const liveSiteUrl = getMetaContent("ocw-live-site-url")
  if (!siteUrlPath || !liveSiteUrl) return

  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    "a.ocw-logo-link"
  )) {
    if (!isInMirror(window.location.href, link.href, siteUrlPath)) {
      link.href = liveSiteUrl
    }
  }
}
