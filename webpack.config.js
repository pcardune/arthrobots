var path = require('path');

module.exports = {
  cache: true,
  entry: './src/main.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: 'build/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css/, loader: "style-loader!css-loader" },
      { test: /\.gif/, loader: "url-loader?limit=10000&minetype=image/gif" },
      { test: /\.jpg/, loader: "url-loader?limit=10000&minetype=image/jpg" },
      { test: /\.png/, loader: "url-loader?limit=10000&minetype=image/png" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ],
    noParse: /parse-latest.js/
  },
  resolve: {
    alias:{
      // this is to get showdown to load with webpack. See https://github.com/webpack/webpack/issues/411
      fs: require.resolve('./false.js')
    }
  },
  plugins:[]
};