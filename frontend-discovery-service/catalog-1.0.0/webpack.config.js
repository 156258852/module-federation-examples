const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const package = require('./package.json');

const name = ('my-project/catalog/' + package.version).replace(/[\.\-\/]/gi, '_');

module.exports = {
  entry: './src/Catalog',
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3003,
    allowedHosts: 'auto',
  
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
        './my-project/catalog': './src/Catalog',
        './utils/catalogUtils': './src/utils/catalogUtils',
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
