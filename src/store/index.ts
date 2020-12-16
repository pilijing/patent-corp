import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    systemName: '专利平台',
    profile: { // 对于页面组件来说，不存在异步等待，可以直接使用
      permissions: [],
    },
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
