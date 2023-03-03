import * as path from "path"
import { merge } from "webpack-merge"
import { Configuration } from "webpack"
import { CleanWebpackPlugin } from "clean-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import common from "./webpack.common"
import "webpack-dev-server" // this import tells webpack's typings about the devServer type

const devOverrides: Configuration = {
  mode: "development",

  output: {
    path:       path.join(__dirname, "../../static/static_shared"),
    publicPath: "/static_shared/",
    filename:   "js/[name].js"
  },

  devtool: "eval-source-map",

  watch: true,

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        "dist/**/*.js",
        "dist/**/*.css",
        "data/webpack.json"
      ]
    }),

    new MiniCssExtractPlugin({
      filename:      "css/[name].css",
      chunkFilename: "css/[id].css"
    })
  ]
}

export default merge(common, devOverrides)
