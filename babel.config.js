const babelConfig = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
};
if (process.env.VUE_APP_PUBLISH === 'production') {
  babelConfig.plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
}

module.exports = babelConfig;
