import { CoursesApi, Configuration } from "./generated-sources/openapi/"
const coursesApi = new CoursesApi(
  new Configuration({
    basePath: "https://mitopen-rc-2ea15531374d.herokuapp.com/"
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
