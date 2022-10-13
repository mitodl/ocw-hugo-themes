declare var isHugoDevServer: boolean

export const setLocalStorageItem = (key: string, value: any) => {
  return setOrGetLocalStorageItemHelper("set", key, value)
}

export const getLocalStorageItem = (key: string): any => {
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
const setOrGetLocalStorageItemHelper = (
  action: string,
  key: string,
  value: any = null
): any => {
  try {
    // checking browser support for localStorage
    if (typeof Storage !== "undefined") {
      if (action === "set") {
        localStorage.setItem(key, value)
        return true
      } else {
        return localStorage.getItem(key)
      }
    }
    console.log("This browser has no web storage support.")
    return false
  } catch (e) {
    console.log(
      "An exception occurred while storing/fetching data in/from localstorage: ",
      e
    )
    return false
  }
}

/**
 * @return {boolean} returns true is app is running on local server, else false.
 */
export const isLocalServerRunning = (): boolean =>
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname === "" ||
  isHugoDevServer
