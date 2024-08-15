const path = require('path');

module.exports = {
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias.set('@',           path.resolve(__dirname, 'src'));
    config.resolve.alias.set('@assets',     path.resolve(__dirname, 'src/assets'));
    config.resolve.alias.set('@css',        path.resolve(__dirname, 'src/assets/css'));
    config.resolve.alias.set('@components', path.resolve(__dirname, 'src/components'));
    config.resolve.alias.set('@slots',      path.resolve(__dirname, 'src/slots'));
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    }
  }
};
