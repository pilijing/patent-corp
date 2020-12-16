<template>
  <div class="the-header">

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
import { defineComponent } from '@vue/composition-api';
import { useUserInfo } from '@/context';

export default defineComponent({
  name: 'UserProfile',
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
          $router.push('/login');
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
  // justify-content: space-between;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  // height: 60px;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  padding: 0 20px;
  // flex-shrink: 0;
  // flex: 1;
  .user-profile {
    cursor: pointer;
    .el-dropdown-link {
      color: rgb(48, 45, 45);
    }
  }
  box-shadow: 0 1px 2px #e0e1e2;
}
</style>
