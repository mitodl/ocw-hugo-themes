module.exports = {
  clearMocks: true,

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  "setupFilesAfterEnv": ["<rootDir>www/assets/js/test_setup.ts"],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
  ],
  preset: 'ts-jest',
  testEnvironment: "jsdom"
};
