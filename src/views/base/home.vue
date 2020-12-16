<template>
  <div class="home">
    <layout-auth v-if="hasAuth" />
    <layout v-if="noAuth || isError">
      <unauthorized v-if="noAuth" />
      <exception v-if="isError" :msg="errMsg" />
    </layout>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive, toRefs,
} from '@vue/composition-api';

import { isLogin } from '@/utils/auth';
import {
  useLookupsInject, useRegionsInject, useUserInfo,
} from '@/context';
import LayoutAuth from './layout-auth.vue';
import Layout from './layout.vue';
import Unauthorized from './unauthorized.vue';
import Exception from './exception.vue';

interface State {
  loading: boolean;
  hasAuth: boolean;
  noAuth: boolean;
  isError: boolean;
  errMsg: string;
}

export default defineComponent({
  name: 'Home',
  components: {
    LayoutAuth,
    Layout,
    Unauthorized,
    Exception,
  },
  // 路由守卫
  beforeRouteEnter(from, to, next) {
    if (!isLogin()) {
      next(`/login?from=${from.fullPath}`);
    } else {
      next();
    }
  },
  setup(_, context) {
    const { $router, $message } = context.root;
    const state = reactive<State>({
      loading: true,
      hasAuth: false,
      noAuth: false,
      isError: false,
      errMsg: '系统繁忙，请稍后再试',
    });

    const { getLookups } = useLookupsInject();
    const { getUserInfo, userInfo, error } = useUserInfo();
    const { getRegions } = useRegionsInject();
    const initData = async () => {
      await getUserInfo();
      // 错误
      if (error.value) {
        if (error.value.response?.status === 401) {
          $router.push('/login');
        }
        $message.error(error.value.response?.data);
        return;
      }
      if (userInfo.value.id) {
        // 有权限
        state.hasAuth = true;
        // 获取项目字典
        await getLookups();
        // 获取 Regions 信息
        await getRegions();
      } else {
        // 无权限
        state.isError = true;
      }
    };
    onMounted(async () => {
      await initData();
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
