import * as path from "path"
import { merge } from "webpack-merge"
import { Configuration } from "webpack"
import TerserPlugin from "terser-webpack-plugin"
import CssMinimizerPlugin from "css-minimizer-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import common from "./webpack.common"

const prodOverrides: Configuration = {
  mode:    "production",
  devtool: "source-map",

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
          ecma: 5
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
}

export default merge(common, prodOverrides)
