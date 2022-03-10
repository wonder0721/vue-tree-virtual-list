const config = {
  publicPath: './',
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  config.configureWebpack.externals = {
    'vue-virtual-scroll-list': {
      commonjs: 'vue-virtual-scroll-list',
      commonjs2: 'vue-virtual-scroll-list',
      amd: 'vue-virtual-scroll-list',
      root: 'virtualList'
    }
  }
}

module.exports = config
