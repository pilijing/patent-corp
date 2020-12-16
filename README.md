# patent-cloud-corp-web

## Quick start

安装 vscode eslint 插件 可在保存时自动修复

```bash
# 确保安装 nvm，也可以手动安装 node 12.13.1
nvm use

# 也可以使用 npm ci
npm install

npm run serve

```

## .nvmrc
% 流水线 构建环境-LINUX： 2-1 依赖编译环境:12.13.1

## .npmrc

`tnpm` 被弃用，正常使用 `npm` 命令即可，此配置文件设定了`registry`。正常情况下，`npm install` 会自动获取此配置，如果没有，则可以手动设置.
> `npm config set registry https://mirrors.tencent.com/npm/`

参考：
[内部npm服务](https://iwiki.woa.com/pages/viewpage.action?pageId=113585381)
[tnpm用户迁移至软件源指引](https://iwiki.woa.com/pages/viewpage.action?pageId=103365626)


## composition api

```js
// 不用这个
import Vue from 'vue';

export default Vue.extend({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
// 用这个
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: Number,
  },
  setup() {
      ...
  }
});
```

### 例子与手册

[vue-composition-api-ts-todo](https://github.com/MrSung/vue-composition-api-ts-todo)

[Vue-3-Cheat-Sheet](https://www.vuemastery.com/pdf/Vue-3-Cheat-Sheet.pdf)

[provide-inject](https://composition-api.vuejs.org/#plugin-development)

## eslint 代码规范 和 .vscode/settings

安装 `vscode eslint extension` 之后可以自动修复.

腾讯代码规范的 `eslint` 配置与 `vue` 存在兼容问题,待改进

`tcode`目前不兼容`prettier`的格式化规范，故不引入。

参考：
- JavaScript 编码规范 
- [腾讯代码规范 快速上手](https://iwiki.woa.com/pages/viewpage.action?pageId=327435811)
- [EsLint本地工具使用指南](https://iwiki.woa.com/pages/viewpage.action?pageId=36319125)
- 腾讯统一代码规范——热点问题  



## unit test

```bash
# 运行单测并生成测试报告 
npm run test
# 或使用 `watch` 模式
npm run test:watch
```

测试报告可以在 `coverage/lcov-report/index.html` 查看

由于使用了 `husky` 设置 `git hooks`，`npm run test` 会在 `git push` 时自动触发。
如果因为特殊情况需要绕过，可以使用 `git push --no-verify`


## 构建打包 From trademark-web

> 环境变量说明：
> `NODE_ENV`是项目框架默认生成，开发环境为development，打好包后运行的就是production，
> 不管这个包是测试环境的包还是生产环境的包都是production，这样做的是为了确保生产环境的差异测试环境的差异尽可能的小
>
> 该项目中使用`.env`文件来管理自定义的环境变量，目前提供的是`VUE_APP_PUBLISH`,用于判断生产环境与测试环境，测试环境：test，开发环境：dev，生产环境：production
>
> `VUE_APP_`这个前缀是vue-cli3脚手架的约定，如果要新增环境变量，都要以 `VUE_APP_`打头

```
# 构建测试环境包
tnpm run build

# 构建生产环境包
tnpm run build:prod

```

## others
 
[autoprefixer 默认开启](https://cli.vuejs.org/zh/guide/css.html#postcss)

`npx browserslist` 可以列出当前支持浏览器。

`dufault.conf, Dockerfile, vue.config.js` 与上云、构建、前后端联调有关，待修改。

## 分支提交流程


`git checkout develop => git pull => git checkout <your feature branch> => git rebase develop => (fix conflict) => git push  => MR`
Or
`git checkout develop => git pull => git checkout <your feature branch> => git merge develop => (fix conflict) => git push  => MR`

`rebase` 有时候会造成`commit`丢失，慎用。

## Provide-Inject based state management
Example: `http://localhost:8080/patent-corp/example/provide-inject`

---------------------
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).