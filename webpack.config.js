module.exports = {
  module: {
    loaders: [
      { test: /\.css/, loader: "style-loader!css-loader" },
      { test: /\.gif/, loader: "url-loader?limit=10000&minetype=image/gif" },
      { test: /\.jpg/, loader: "url-loader?limit=10000&minetype=image/jpg" },
      { test: /\.png/, loader: "url-loader?limit=10000&minetype=image/png" },
      { test: /\.js$/, loader: "jsx-loader" }
    ],
    noParse: /parse-latest.js/
  },
  resolve: {
    alias:{
      // this is to get showdown to load with webpack. See https://github.com/webpack/webpack/issues/411
      fs: require.resolve('./false.js')
    }
  }
};