var path = require('path')
var webpack = require('webpack')

module.exports = {
  cache: true,
  context: path.join(__dirname, "src"),
  entry: './main.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
//    preLoaders: [
//      { test: /\.js$/, exclude: /node_modules/, loader: "eslint-loader" }
//    ],
    loaders: [
      { test: /\.css/, loader: "style-loader!css-loader" },
      { test: /\.gif/, loader: "url-loader?limit=10000&mimetype=image/gif" },
      { test: /\.jpg/, loader: "url-loader?limit=10000&mimetype=image/jpg" },
      { test: /\.png/, loader: "url-loader?limit=10000&mimetype=image/png" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.md$/, loader: "url-loader?limit=10000&mimetype=text/markdown&name=[name]-[hash].[ext]" }
    ],
    noParse: /parse-latest.js/
  },
  resolve: {
    alias:{
      // this is to get showdown to load with webpack. See https://github.com/webpack/webpack/issues/411
      fs: require.resolve('./false.js')
    }
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  devServer: {
    historyApiFallback: true
  },
  eslint: {
    configFile: path.join(__dirname, '.eslintrc')
  }
}