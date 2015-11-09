var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var webpackConfig = require('./webpack.config.js');
var gulpWebpack = require('gulp-webpack');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

gulp.task('default', ['copy','webpack-dev-server'], function() {});

gulp.task('clean', function(cb) {
  del(['build/**'], cb);
});

gulp.task('build', ['copy', 'webpack:build'], function() {});

gulp.task('copy', function() {
  gulp.src('index.html')
    .pipe(gulp.dest('build'));
  gulp.src('ABOUT.md')
    .pipe(gulp.dest('build'));
});

gulp.task('webpack:build', function(callback) {
  // Modify some webpack config options
  var myConfig = Object.create(webpackConfig);

  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );

  // Run webpack
  gulp.src(webpackConfig.entry)
    .pipe(gulpWebpack(myConfig, webpack, function(err, stats) {
      if (err) {
        throw new gutil.PluginError('webpack:build', err);
      }

      gutil.log('[webpack:build]', stats.toString({
        colors: true
      }));
    }))
    .pipe(gulp.dest(webpackConfig.output.publicPath));
});

gulp.task("webpack-dev-server", function(callback) {
    // Start a webpack-dev-server
    var compiler = webpack(webpackConfig);

    new WebpackDevServer(compiler, {
        // server and middleware options
        historyApiFallback: true
    }).listen(8000, "localhost", function(err) {
        if(err) {
          throw new gutil.PluginError("webpack-dev-server", err);
        }
        // Server listening
        gutil.log("[webpack-dev-server]", "http://local.carduner.net:8000/webpack-dev-server/index.html");

        // keep the server alive or continue?
        // callback();
    });
});