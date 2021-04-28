module.exports = api => {
  const config = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: ["@babel/plugin-syntax-dynamic-import"]
  }

  if (api.env("production")) {
    config.plugins.push(
      "@babel/plugin-transform-react-constant-elements",
      "@babel/plugin-transform-react-inline-elements"
    )
  }
  return config
}
