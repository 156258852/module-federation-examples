const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const package = require('./package.json');

const name = ('my-project/product/' + package.version).replace(/[\.\-\/]/gi, '_');


module.exports = {
  entry: './src/Product',
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3002,
    allowedHosts: 'auto',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename: 'remoteEntry.js',
      exposes: {
        './my-project/product': './src/Product',
        './utils/productUtils': './src/utils/productUtils',
        "./share-com": './src/components'
      },
      shared: {
        'react-dom': {
          singleton: true,
        },
        react: {
          singleton: true,
        },
      },
    }),
  ],
};
