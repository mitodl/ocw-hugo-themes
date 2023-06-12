import * as path from "path"
import { merge } from "webpack-merge"
import { Configuration } from "webpack"
import { CleanWebpackPlugin } from "clean-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import common from "./webpack.common"
import { env } from "../../../env"
import "webpack-dev-server" // this import tells webpack's typings about the devServer type

const devOverrides: Configuration = {
  mode: "development",

  output: {
    path:       path.join(__dirname, "../../static/static_shared"),
    publicPath: "/static_shared/",
    filename:   "js/[name].js"
  },

  devtool: "eval-source-map",

  devServer: {
    host:          env.WEBPACK_HOST,
    port:          env.WEBPACK_PORT,
    devMiddleware: {
      // Compiled assets are written to disk so that they can be
      // accessed through the hugo server.
      //
      // You can find more details here: https://github.com/mitodl/ocw-hugo-themes/issues/1096
      writeToDisk: true
    }
  },

  watch: env.WEBPACK_WATCH_MODE,

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
