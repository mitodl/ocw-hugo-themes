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
