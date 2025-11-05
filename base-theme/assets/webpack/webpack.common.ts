import * as path from "path"
import * as webpack from "webpack"
import CopyWebpackPlugin from "copy-webpack-plugin"
import { WebpackManifestPlugin } from "webpack-manifest-plugin"
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import Dotenv from "dotenv-webpack"
import packageJson from "../../../package.json"

/**
 * Resolve a path relative to package root.
 */
const fromRoot = (pathFromRoot: string) =>
  path.resolve(__dirname, "../../../", pathFromRoot)

const entryNames = {
  instructorInsights: "instructor_insights",
  courseV2:           "course_v2",
  courseOffline:      "course_offline",
  www:                "www",
  wwwOffline:         "www_offline",
  fields:             "fields"
}

const config: webpack.Configuration = {
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  entry: {
    [entryNames.courseV2]: [
      fromRoot("./base-theme/assets/expose-jQuery.ts"),
      fromRoot("./course-v2/assets/course-v2.tsx"),
      fromRoot("./base-theme/assets/index.ts")
    ],
    [entryNames.courseOffline]: [
      fromRoot("./base-theme/assets/expose-jQuery.ts"),
      fromRoot("./course-offline/assets/course-offline.ts"),
      fromRoot("./base-theme/assets/index.ts")
    ],
    [entryNames.instructorInsights]: [
      fromRoot("./course-v2/assets/css/instructor-insights.scss")
    ],
    [entryNames.www]: [
      fromRoot("./base-theme/assets/expose-jQuery.ts"),
      fromRoot("./www/assets/www.tsx"),
      fromRoot("./base-theme/assets/index.ts")
    ],
    [entryNames.wwwOffline]: [
      fromRoot("./base-theme/assets/expose-jQuery.ts"),
      fromRoot("./www-offline/assets/www-offline.tsx"),
      fromRoot("./base-theme/assets/index.ts")
    ],
    [entryNames.fields]: [
      fromRoot("./fields/assets/fields.js"),
      fromRoot("./base-theme/assets/index.ts")
    ]
  },

  output: {
    path:     fromRoot("./base-theme/dist/static_shared"),
    filename: "js/[name].js"
  },

  module: {
    rules: [
      {
        test: /nanogallery2(?!.*\.(woff|woff2)$)/,
        use:  {
          loader:  "imports-loader",
          options: {
            additionalCode:
              "var module = (module || {}); module.exports = undefined; var exports = undefined;"
          }
        }
      },
      {
        test:      /\.(jpg)|(png)|(svg)|(gif)$/,
        type:      "asset/resource",
        generator: {
          filename: "images/[fullhash][ext]"
        }
      },
      {
        test:  /\.(woff|ttf|woff2|eot)$/,
        oneOf: [
          {
            test:      /nanogallery2/,
            type:      "asset/resource",
            generator: {
              filename:   "fonts/[contenthash][ext]",
              outputPath: "css"
            }
          },
          {
            type:      "asset/resource",
            generator: {
              filename: "fonts/[contenthash][ext]"
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
      }
    ]
  },
  plugins: [
    new Dotenv({
      systemvars: true
    }),
    new WebpackManifestPlugin({
      fileName: path.join(process.cwd(), "base-theme", "data/webpack.json")
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from:        "./base-theme/assets/fonts/**/*.{ttf,woff,woff2}",
          to:          "fonts/[name].[contenthash][ext]",
          globOptions: {
            ignore: [
              "**/MaterialIcons-Regular.{ttf,woff,woff2}",
              "**/MaterialIconsRound-Regular.{ttf,woff,woff2}"
            ]
          }
        }
      ]
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./base-theme/assets/images/",
          to:   "images/[name].[contenthash][ext]"
        }
      ]
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./node_modules/mathjax/es5/",
          to:   "mathjax/[name].[contenthash][ext]"
        }
      ]
    }),
    new webpack.ProvidePlugin({
      $:      "jquery",
      jQuery: "jquery",
      Popper: "popper.js/dist/umd/popper"
    }),
    new webpack.DefinePlugin({
      RELEASE_VERSION: JSON.stringify(packageJson.version)
    })
  ].concat(
    process.env.WEBPACK_ANALYZE === "true" ?
      new BundleAnalyzerPlugin({
        // Webpack sets process.env.WEBPACK_DEV_SERVER when the dev server is running
        analyzerMode: process.env.WEBPACK_DEV_SERVER ? "server" : "static",
        openAnalyzer: true
      }) :
      []
  ),
  optimization: {
    splitChunks: {
      minChunks:   2,
      cacheGroups: {
        common: {
          test:   /[\\/]node_modules[\\/]/,
          name:   "common",
          chunks: chunk => {
            const splitChunks = [entryNames.www, entryNames.courseV2]
            return splitChunks.includes(chunk.name)
          }
        }
      }
    }
  }
}

export default config
