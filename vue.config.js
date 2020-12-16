module.exports = {
  publicPath: '/patent-corp/',
  outputDir: 'dist/patent-corp',
  assetsDir: 'static',
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
      title: '专利平台',
    },
  },
  configureWebpack: {
    devServer: {
      host: '127.0.0.1',
      // port: 8080,
      public: '127.0.0.1:8080/patent-corp/',
      proxy: {
        '/patent-corp_api/': {
          target: 'http://9.134.94.237:18881', // 开发环境
          // target: 'http://localhost:18881', // 本地
          pathRewrite: { '^/patent-corp_api': '/api/v1' },
          changeOrigin: true,
        },
      },
    },
  },
  chainWebpack(config) {
    // Remove existing SVG rule which uses file-loader
    config.module.rules.delete('svg');

    // Use our loader instead
    config.module.rule('svg')
      .test(/\.svg$/)
      .use('vue')
      .loader('vue-loader')
      .end()
      .use('svg-to-vue-component')
      .loader('svg-to-vue-component/loader');
  },
};
