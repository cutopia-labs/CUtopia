const path = require('path');
module.exports = {
  entry: [
    path.join(__dirname, 'graphql.js')
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node'
};
