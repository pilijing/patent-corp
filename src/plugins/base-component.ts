// from trademark-web

/**
 * 动态注册base-前缀的基础组件
 */
import Vue from 'vue';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

const requireComponent = require.context(
  // 其组件目录的相对路径
  '../components',
  // 是否查询其子目录
  false,
  // 匹配基础组件文件名的正则表达式
  /(base|layout)-.*\.(vue|js)$/,
);

requireComponent.keys().forEach((fileName) => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName);
  // 剥去文件名开头的 `./` 和结尾的扩展名
  const newFileName = fileName.replace(/^\.\/(.*)\.\w+$/, '$1');
  // 获取组件的 PascalCase 命名
  const componentName = upperFirst(camelCase(newFileName));

  // 全局注册组件
  Vue.component(
    componentName,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig,
  );
});
