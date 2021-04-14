const webpack = require("webpack")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const AssetsPlugin = require("assets-webpack-plugin")
const Dotenv = require("dotenv-webpack")

module.exports = {
  entry: {
    main: ["@babel/polyfill", path.join(__dirname, "..", "index.js")],
    course: ["@babel/polyfill", path.join(__dirname, "..", "..", "course", "assets", "course.js")],
    instructor_insights: ["@babel/polyfill", path.join(__dirname, "..", "..", "course", "assets", "instructor-insights.js")],
    www: ["@babel/polyfill", path.join(__dirname, "..", "..", "www", "assets", "www.js")]
  },

  output: {
    path: path.join(__dirname, "../../dist")
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

      { test: /\.json$/, loader: "json-loader" },

      {
        test:    /\.js$/,
        exclude: /(node_modules)/,
        use:     {
          loader: "babel-loader"
        }
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use:  [
          "style-loader",
          {
            loader:  MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./",
              hmr:        process.env.NODE_ENV !== "production"
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
      path:        path.join(process.cwd(), "data"),
      prettyPrint: true
    }),

    new CopyWebpackPlugin([
      {
        from:    "./assets/fonts/",
        to:      "fonts/",
        flatten: true
      }
    ]),

    new CopyWebpackPlugin([
      {
        from:    "./node_modules/mathjax/es5/",
        to:      "mathjax/",
        flatten: true
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
