module.exports = {
  plugins: {
    "postcss-import":     {},
    "postcss-preset-env": {
      browsers: "last 2 versions"
    },
    autoprefixer:                  {},
    "@fullhuman/postcss-purgecss": {
      content:  ["./**/*.html", "./base-theme/assets/js/**/*.js"],
      safelist: {
        standard: [/vjs/, /video/]
      }
    }
  }
}
