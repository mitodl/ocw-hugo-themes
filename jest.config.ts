import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  clearMocks: true,

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>www/assets/js/test_setup.ts"],

  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "tests-e2e/"],
  testEnvironment:        "jsdom",
  moduleNameMapper:       { "^sinon$": "sinon/lib/sinon.js" },
  transform:              {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          paths: {
            "@mitodl/smoot-design/ai": [
              "./node_modules/@mitodl/smoot-design/dist/cjs/ai.d.ts"
            ]
          }
        }
      }
    ]
  }
}

export default config
