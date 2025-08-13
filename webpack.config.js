const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      'background/service-worker': './background/service-worker.js',
      'content-scripts/content': './content-scripts/content.js',
      'content-scripts/focus-timer': './content-scripts/focus-timer.js',
      'content-scripts/page-cleaner': './content-scripts/page-cleaner.js',
      'popup/popup': './popup/popup.js',
      'options/options': './options/options.js',
      'pages/focus-redirect': './pages/focus-redirect.js'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    chrome: '88' // 支持Manifest V3的最低版本
                  }
                }]
              ],
              plugins: [
                '@babel/plugin-transform-runtime'
              ]
            }
          }
        }
      ]
    },
    
    plugins: [
      // 复制静态文件
      new CopyWebpackPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'popup/index.html', to: 'popup/index.html' },
          { from: 'options/index.html', to: 'options/index.html' },
          { from: 'pages/focus-redirect.html', to: 'pages/focus-redirect.html' }
        ]
      })
    ],
    
    resolve: {
      extensions: ['.js', '.json']
    },
    
    optimization: {
      minimize: isProduction,
      splitChunks: false
    },
    
    devtool: isProduction ? false : 'cheap-module-source-map',
    
    watch: !isProduction,
    
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000
    }
  };
};
