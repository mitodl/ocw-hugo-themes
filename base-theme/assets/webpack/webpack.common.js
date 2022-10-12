const webpack = require("webpack")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const AssetsPlugin = require("assets-webpack-plugin")
const Dotenv = require("dotenv-webpack")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")
const packageJson = require("../../../package.json")

/**
 * Resolve a path relative to package root.
 */
const fromRoot = pathFromRoot =>
  path.resolve(__dirname, "../../../", pathFromRoot)

module.exports = {
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  entry: {
    main:                fromRoot("./base-theme/assets/index.ts"),
    course:              fromRoot("./course/assets/course.ts"),
    course_v2:           fromRoot("./course-v2/assets/course-v2.ts"),
    instructor_insights: fromRoot("./course/assets/instructor-insights.js"),
    www:                 fromRoot("./www/assets/www.tsx"),
    fields:              fromRoot("./fields/assets/fields.js")
  },

  output: {
    path:     fromRoot("./base-theme/dist/static"),
    filename: "js/[name].js"
  },

  module: {
    rules: [
      {
        test: /\.(jpg)|(png)|(svg)|(gif)$/,
        use:  [
          {
            loader:  "file-loader",
            options: {
              name: "images/[fullhash].[ext]"
            }
          }
        ]
      },

      {
        test: /\.(woff|ttf|woff2|eot)$/,
        use:  [
          {
            loader:  "file-loader",
            options: {
              name: "fonts/[fullhash].[ext]"
            }
          }
        ]
      },
      {
        test:    /\.(t|j)sx?$/,
        exclude: /(node_modules)/,
        use:     {
          loader: "ts-loader"
        }
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use:  [
          {
            loader:  MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./"
            }
          },
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },

      {
        test: require.resolve("shifty"),
        use:  [
          { loader: "expose-loader", options: { exposes: ["NGTweenable"] } }
        ]
      },

      {
        test: require.resolve("hammerjs"),
        use:  [
          {
            loader:  "expose-loader",
            options: { exposes: ["NGHammer"] }
          }
        ]
      },

      {
        test: require.resolve("imagesloaded"),
        use:  [
          {
            loader:  "expose-loader",
            options: { exposes: ["ngimagesLoaded", "ngImagesLoaded"] }
          }
        ]
      },

      {
        test: require.resolve("screenfull"),
        use:  [
          { loader: "expose-loader", options: { exposes: ["ngscreenfull"] } }
        ]
      }
    ]
  },

  plugins: [
    new Dotenv({
      systemvars: true
    }),

    new AssetsPlugin({
      filename:    "webpack.json",
      path:        path.join(process.cwd(), "base-theme", "data"),
      prettyPrint: true
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: "./base-theme/assets/fonts/", to: "fonts/[name][ext]" }
      ]
    }),

    new CopyWebpackPlugin({
      patterns: [{ from: "./node_modules/mathjax/es5/", to: "mathjax/" }]
    }),

    new webpack.ProvidePlugin({
      $:               "jquery",
      jQuery:          "jquery",
      "window.jQuery": "jquery",
      Popper:          "popper.js/dist/umd/popper"
    }),
    new webpack.DefinePlugin({
      RELEASE_VERSION: JSON.stringify(packageJson.version),
    }),
  ].concat(
    process.env.WEBPACK_ANALYZE === "true" ?
      new BundleAnalyzerPlugin({
        // Webpack sets process.env.WEBPACK_DEV_SERVER when the dev server is running
        analyzerMode: process.env.WEBPACK_DEV_SERVER ? "server" : "static",
        openAnalyzer: true
      }) :
      []
  ),
}
