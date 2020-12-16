<template>
  <el-container class="page-container">
    <el-container>
      <el-header class="header">
        <the-header :user-name="userInfo && userInfo.fullName" :system-name="systemName" />
      </el-header>
      <el-main class="main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import TheHeader from './the-header.vue';

export default {
  name: 'Layout',
  components: {
    TheHeader,
  },
  data() {
    return {
      systemName: '专利平台',
    };
  },
};
</script>
<style lang="scss" scoped>
$header-height: 60px;

.page-container {
  // height: 100vh;
  //  min-height:  100vh;
   height: 100%;
  background-color: #f6f7fc;
  .header {
    display: flex;
    align-items: center;
    height: $header-height !important;
    z-index: 2;
    box-shadow: 0 2px 5px #e0e1e2;
    background: #262F3E;
  }
  .logo {
    flex: 1 1 auto;
    font-size: 24px;
  }
  .user-profile {
    flex: 0 0 auto;
    .profile {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      .avatar {
        width: 26px;
        height: 26px;
        border-radius: 100%;
        margin-right: 10px;
        border: 1px solid #e9e9e9;
      }
    }
  }
  .main {
    position: relative;
    display: flex;
  }
}
</style>
