const { merge } = require("webpack-merge")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const common = require("./webpack.common")

module.exports = merge(common, {
  mode: "development",

  output: {
    filename:      "[name].js",
    chunkFilename: "[id].css",
    publicPath:    "/"
  },

  devtool: "eval-source-map",

  devServer: {
    port:    process.env.PORT || 3001,
    hot:     true,
    quiet:   false,
    open:    false,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization"
    },
    historyApiFallback: {
      rewrites: [{ from: /./, to: "404.html" }]
    }
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        "dist/**/*.js",
        "dist/**/*.css",
        "data/webpack.json"
      ]
    }),

    new MiniCssExtractPlugin({
      filename:      "[name].css",
      chunkFilename: "[id].css"
    })
  ]
})
