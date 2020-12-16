module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // eslint-disable-next-line max-len
  // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest#transform-dependencies-from-node_modules
  transformIgnorePatterns: ['/node_modules/(?!element-ui)'],
};
