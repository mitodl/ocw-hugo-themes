// For some reason, with dynamic imports, using default exports means
// I need to to access as `.default`, i.e., import("my-module").then(mod => mod.default)
export const initVideoJS = () => {
  console.log("Hello world!")
}
