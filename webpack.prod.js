const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "production",
  devServer: {
    static: './dist',
    watchFiles: ['src/**/*'],
  },
  output: {
    // Tweak this to match your GitHub project name
    publicPath: "/humaan-interface/",

  },
});