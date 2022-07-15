const webpack = require("webpack")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const AssetsPlugin = require("assets-webpack-plugin")
const Dotenv = require("dotenv-webpack")

module.exports = {
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  entry: {
    main:   path.join(__dirname, "..", "index.ts"),
    course: path.join(
      __dirname,
      "..",
      "..",
      "..",
      "course",
      "assets",
      "course.ts"
    ),
    course_v2: path.join(
      __dirname,
      "..",
      "..",
      "..",
      "course-v2",
      "assets",
      "course-v2.ts"
    ),
    instructor_insights: path.join(
      __dirname,
      "..",
      "..",
      "..",
      "course",
      "assets",
      "instructor-insights.js"
    ),
    www:    path.join(__dirname, "..", "..", "..", "www", "assets", "www.tsx"),
    fields: path.join(
      __dirname,
      "..",
      "..",
      "..",
      "fields",
      "assets",
      "fields.js"
    )
  },

  output: {
    path:     path.join(__dirname, "../../dist/static"),
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
              name: "images/[hash].[ext]"
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
              name: "fonts/[hash].[ext]"
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
          "style-loader",
          {
            loader:  MiniCssExtractPlugin.loader,
            options: {
              publicPath:    "./",
              filename:      "css/[name].css",
              chunkFilename: "css/[id].css",
              hmr:           process.env.NODE_ENV !== "production"
            }
          },
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },

      {
        test: require.resolve("shifty"),
        use:  [{ loader: "expose-loader", options: "NGTweenable" }]
      },

      {
        test: require.resolve("hammerjs"),
        use:  [{ loader: "expose-loader", options: "NGHammer" }]
      },

      {
        test: require.resolve("imagesloaded"),
        use:  [
          { loader: "expose-loader", options: "ngimagesLoaded" },
          { loader: "expose-loader", options: "ngImagesLoaded" }
        ]
      },

      {
        test: require.resolve("screenfull"),
        use:  [{ loader: "expose-loader", options: "ngscreenfull" }]
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

    new CopyWebpackPlugin([
      {
        from:    "./base-theme/assets/fonts/",
        to:      "fonts/",
        flatten: true
      }
    ]),

    new CopyWebpackPlugin([
      {
        from: "./node_modules/mathjax/es5/",
        to:   "mathjax/"
      }
    ]),

    new webpack.ProvidePlugin({
      $:               "jquery",
      jQuery:          "jquery",
      "window.jQuery": "jquery",
      Popper:          "popper.js/dist/umd/popper"
    })
  ]
}
