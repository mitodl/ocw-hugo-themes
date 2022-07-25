const { merge } = require("webpack-merge")
const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const common = require("./webpack.common.js")

module.exports = merge(common, {
  mode: "production",

  output: {
    path:       path.join(__dirname, "../../dist/static"),
    publicPath: "/static",
    filename:   "js/[name].[fullhash:5].js"
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel:      true,
        terserOptions: {
          ecma: 6
        }
      }),

      new MiniCssExtractPlugin({
        // publicPath option has been removed I believe as
        //it is not listed in docs
        //https://webpack.js.org/plugins/mini-css-extract-plugin/#plugin-options
        filename:      "css/[name].[fullhash:5].css",
        chunkFilename: "css/[id].[fullhash:5].css"
      }),
      new CssMinimizerPlugin({})
    ]
  }
})
