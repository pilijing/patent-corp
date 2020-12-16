<template>
  <div class="the-header">
    <div>{{ systemName }}</div>
    <el-dropdown
      trigger="click"
      class="user-profile"
      @command="handleClick"
    >
      <span class="el-dropdown-link">{{ userInfo.staffFullName }}</span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import {
  defineComponent,
} from '@vue/composition-api';
import { useUserInfo } from '@/context';

export default defineComponent({
  name: 'TheHeader',
  props: {
    systemName: String,
    userName: String,
  },
  setup(_, context) {
    const { $router } = context.root;
    const { userInfo } = useUserInfo();

    const handleClick = (command) => {
      switch (command) {
        case 'logout': {
          $router.replace('/login');
          break;
        }
        // no default
      }
    };
    return {
      handleClick,
      userInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.the-header {
  display: flex;
  justify-content: space-between;
  background-color: #262F3E;
  color: #fff;
  height: 60px;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  padding: 0 20px;
  flex-shrink: 0;
  flex: 1;
  .user-profile {
    .el-dropdown-link {
      color: #fff
    }
  }
}
</style>
