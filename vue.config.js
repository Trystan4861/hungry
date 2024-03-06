const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias.set('@assets', path.resolve(__dirname, 'src/assets'));
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
    config.resolve.alias.set('@components', path.resolve(__dirname, 'src/components'));
  },
  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html', // Nombre del archivo de salida
        template: 'public/index.html', // Ruta del archivo HTML de entrada
        inject: true, // Inyectar automáticamente los scripts generados
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // Otros ajustes de minificación si son necesarios
        }
      })
    ]
  }
};