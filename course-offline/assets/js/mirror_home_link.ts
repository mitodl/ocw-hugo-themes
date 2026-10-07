/**
 * One offline build ships twice: as the course download zip, where the course
 * is the top of the tree, and synced into the mirror drive at the course's
 * site_url_path (e.g. courses/<slug>/), below the mirror's own home page. The
 * build points the OCW logo at the course home, which exists in both. Only the
 * page's location can tell the two apart, so this checks it in the browser.
 */

/**
 * Returns the mirror home page above the course whose home page is at
 * `courseHomeUrl`, or null if the course is not sitting at `siteUrlPath`
 * inside a mirror.
 */
export const getMirrorHomeUrl = (
  courseHomeUrl: string,
  siteUrlPath: string
): string | null => {
  const segments = siteUrlPath.split("/").filter(Boolean)
  if (segments.length === 0) return null

  const courseRoot = new URL("./", courseHomeUrl)
  if (!courseRoot.pathname.endsWith(`/${segments.join("/")}/`)) return null

  return new URL(`${"../".repeat(segments.length)}index.html`, courseRoot).href
}

export const initMirrorHomeLinks = () => {
  const siteUrlPath = document.querySelector<HTMLMetaElement>(
    'meta[name="ocw-site-url-path"]'
  )?.content
  if (!siteUrlPath) return

  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    "a.ocw-logo-link"
  )) {
    const mirrorHomeUrl = getMirrorHomeUrl(link.href, siteUrlPath)
    if (mirrorHomeUrl) link.href = mirrorHomeUrl
  }
}
