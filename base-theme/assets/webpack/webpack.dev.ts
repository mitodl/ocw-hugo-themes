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
    path:       path.join(__dirname, "../../dist/static_shared"),
    publicPath: "/static_shared",
    filename:   "js/[name].js"
  },

  devtool: "eval-source-map",

  devServer: {
    port:    env.WEBPACK_PORT,
    /**
     * This is intentially not set to the WEBPACK_HOST environment variable.
     * WEBPACK_HOST tells Hugo how to query webpack. Binding the dev server to
     * 0.0.0 allows testing OCW on other devices within your local network.
     */
    host:    "0.0.0.0",
    hot:     true,
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
      filename:      "css/[name].css",
      chunkFilename: "css/[id].css"
    })
  ]
}

export default merge(common, devOverrides)
