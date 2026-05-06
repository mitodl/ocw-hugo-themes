export const setLocalStorageItem = (key: string, value: string) => {
  return setOrGetLocalStorageItemHelper("set", key, value)
}

export const getLocalStorageItem = (key: string) => {
  return setOrGetLocalStorageItemHelper("get", key)
}

/**
 * depending upon action, either set or get a value in localstorage with validation/checks to avoid error/exception
 *
 * @param {string} action either "set" or "get"
 * @param {string} key The key against which the data is/will be stored
 * @param {any} value actual data/value to store, if any
 * @return {any} data fetched from localstorage
 */
function setOrGetLocalStorageItemHelper(
  action: "set",
  key: string,
  value: string
): boolean
function setOrGetLocalStorageItemHelper(
  action: "get",
  key: string
): boolean | string | null
function setOrGetLocalStorageItemHelper(
  action: string,
  key: string,
  value?: string
): string | null | boolean {
  try {
    // checking browser support for localStorage
    if (typeof Storage !== "undefined") {
      if (action === "set") {
        localStorage.setItem(key, String(value))
        return true
      } else {
        return localStorage.getItem(key)
      }
    }
    console.log("This browser has no web storage support.")
    return false
  } catch (e) {
    console.log(
      "An exception occurred while storing/fetching data in/from localStorage: ",
      e
    )
    return false
  }
}

/**
 * Appends Fastly Image Optimizer query params to an image URL.
 * Only applies to absolute (http/https) or root-relative (/) URLs;
 * relative paths (offline builds) are returned unchanged.
 */
export function fastlyOptimizedUrl(
  url: string,
  params: Record<string, string>
): string {
  if (!url || (!/^https?:\/\//.test(url) && !url.startsWith("/"))) return url
  const separator = url.includes("?") ? "&" : "?"
  const qs = new URLSearchParams(params).toString()
  return `${url}${separator}${qs}`
}

/**
 * Resolves gallery item hrefs against an online gallery base URL before adding
 * Fastly params. Relative offline paths are intentionally left unchanged.
 */
export function fastlyOptimizedGalleryUrl(
  url: string,
  baseUrl: string,
  params: Record<string, string>
): string {
  let resolvedUrl = url

  if (url && !/^https?:\/\//.test(url) && !url.startsWith("/")) {
    if (/^https?:\/\//.test(baseUrl)) {
      resolvedUrl = new URL(
        url,
        baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
      ).toString()
    } else if (baseUrl.startsWith("/")) {
      resolvedUrl = `${baseUrl.replace(/\/?$/, "/")}${url.replace(/^\/+/, "")}`
    }
  }

  return fastlyOptimizedUrl(resolvedUrl, params)
}
