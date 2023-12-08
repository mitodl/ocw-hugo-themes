import { CoursesApi, Configuration } from "./generated-sources/openapi/"
import { env } from "./env"

const coursesApi = new CoursesApi(
  new Configuration({
    basePath: env.MITOPEN_API_BASE_PATH
  })
)

coursesApi
  .coursesList(
    undefined,
    undefined,
    undefined,
    undefined,
    "ocw",
    undefined,
    undefined,
    undefined
  )
  .then(response => {
    console.log(response.data)
  })
  .catch(error => {
    console.error(error)
  })
