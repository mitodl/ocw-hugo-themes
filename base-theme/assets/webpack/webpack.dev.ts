import * as path from "path"
import { merge } from "webpack-merge"
import { Configuration } from "webpack"
import { CleanWebpackPlugin } from "clean-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import common from "./webpack.common"
import "webpack-dev-server" // this import tells webpack's typings about the devServer type
import * as envalid from "envalid"

const env = envalid.cleanEnv(process.env, {
  WEBPACK_PORT: envalid.port({ default: 3001 })
})

const devOverrides: Configuration = {
  mode: "development",

  output: {
    path:       path.join(__dirname, "../../dist/static"),
    publicPath: "/static",
    filename:   "js/[name].js"
  },

  devtool: "eval-source-map",

  devServer: {
    port:    env.WEBPACK_PORT,
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
