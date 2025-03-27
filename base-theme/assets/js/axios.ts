import axios from "axios"

/**
 * Our axios instance with default baseURL, headers, etc.
 */
const instance = axios.create({
  xsrfCookieName:  process.env.CSRF_COOKIE_NAME,
  xsrfHeaderName:  "X-CSRFToken",
  withXSRFToken:   true,
  withCredentials: true
})

export default instance
