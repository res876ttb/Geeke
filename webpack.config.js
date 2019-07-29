const path = require('path');

const srcPath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'dist');

module.exports = {
  context: srcPath,
  mode: 'development',
  /* mode: 'production', */
  resolve: {
    alias: {
      states: path.resolve(srcPath, 'states'),
      utilities: path.resolve(srcPath, 'utilities'),
      components: path.resolve(srcPath, 'components'),
      api: path.resolve(srcPath, 'api')
    }
  },
  entry: './Geeke.js',
  // entry: {
  //   index: './index.jsx',
  //   vendor: ['react', 'react-dom']
  // },
  output: {
    path: distPath,
    filename: 'Geeke.js',
    libraryTarget: 'var',
    library: 'Geeke'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env', {
                  modules: false
                }
              ],
              'react'
            ],
            plugins: [
              'babel-plugin-transform-class-properties',
              'transform-object-rest-spread'
            ]
          }
        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options : {
              url: false
            }
          }
        ]
      }, {
        test: /\.scss$/,
        use: [
          'style-loader', 
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  // plugins: [
    // new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.bundle.js', minChunks: 2}), 
    // new webpack.optimize.UglifyJsPlugin({test: /\.(js|jsx|css)$/, exclude: [/node_modules/, /bundle.js/], minimize: true, parallel: 4, sourceMap: true}),
  // ],
  optimization: {
    splitChunks: {
      minChunks: 2,
      name: 'common'
    },
    // minimize: true
  },
  devtool: 'cheap-source-map'
};
