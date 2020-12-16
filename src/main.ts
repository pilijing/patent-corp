import Vue from 'vue';
import Element from 'element-ui';
import VueCompositionApi from '@vue/composition-api';
import App from './App.vue';
import router from './router';
import store from './store';

// import 'element-ui/lib/theme-chalk/index.css';
import './plugins/element';
import './plugins/base-component';

// 页面常用组件
import PageCard from './components/page-card.vue';
import PageTitle from './components/page-title.vue';
import Descriptions from './components/descriptions.vue';
import DescriptionsItem from './components/descriptions-item.vue';

import { useProvider } from './context';

import './styles.scss';
import './patent.scss';

Vue.component('page-card', PageCard);
Vue.component('page-title', PageTitle);
Vue.component('descriptions', Descriptions);
Vue.component('descriptions-item', DescriptionsItem);

Vue.use(Element);

Vue.use(VueCompositionApi);

// Vue.config.productionTip = false;

function init() {
  Vue.config.productionTip = false;

  new Vue({
    router,
    store,
    setup() {
      useProvider();
    },
    render: h => h(App),
  }).$mount('#app');
}
if (process.env.VUE_APP_PUBLISH !== 'production') {
  console.info(process.env.NODE_ENV);
  init();
  // import('./mock').then(() => init());
} else {
  console.info(process.env.NODE_ENV);
  init();
}
