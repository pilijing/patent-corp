<template>
  <div class="login">
    <div class="login-card">
      <div class="login-logo">
        <img src="~@/assets/logo.png" alt="logo" width="390">
      </div>
      <div class="login-input">
        <div class="qr-code" @click="isShowQRCode = !isShowQRCode">
          <img v-if="!isShowQRCode"
            src="~@/assets/qr_code.png"
            alt="qr"
            width="70"
          >
          <img v-else
            src="~@/assets/account_number.png"
            alt="qr"
            width="70"
          >
        </div>
        <div v-if="isShowQRCode" class="login-qrCode">
          <div class="qr-code-login">扫码登录</div>
        </div>
        <div class="login-form" v-else>
          <div class="tab">
            <span
              v-for="(item, index) in tabs"
              :key="index"
              :class="activeTab === item.id ? 'active' : ''"
              @click="activeTab = item.id"
            >
              {{ item.name }}
            </span>
          </div>
          <div class="account-login" v-if="activeTab === 1">
            <password-login />
          </div>
          <div class="account-login" v-if="activeTab === 2">
            <sms-login />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, toRefs } from '@vue/composition-api';
import { removeToken } from '@/utils/auth';
import PasswordLogin from './password-login.vue';
import SmsLogin from './sms-login.vue';

export default {
  name: 'Login',
  components: {
    SmsLogin,
    PasswordLogin,
  },
  setup() {
    const state = reactive({
      isShowQRCode: false,
      activeTab: 1,
      tabs: [
        { id: 1, name: '密码登录' },
        { id: 2, name: '短信登录' },
      ],
    });

    onMounted(() => {
      removeToken();
    });
    return {
      ...toRefs(state),
    };
  },
};
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  width: 100%;
  background-image: url('~@/assets/bg_login.png');
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-card {
    width: 900px;
    height: 480px;
    padding: 20px;
    display: flex;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background: #fff;
    border-radius: 3px;
    .login-input {
      flex: 1;
      position: relative;
      .qr-code {
        position: absolute;
        right: 0;
        width: 70px;
      }
      .login-form {
        padding: 0 30px;
        margin-top: 75px;
        .tab {
          padding: 10px 80px;
          display: flex;
          justify-content: space-between;
          span {
            display: inline-block;
            font-size: 16px;
            padding: 5px 10px;
            cursor: pointer;
          }
          .active {
            font-size: 18px;
            color: #0079FE;
            border-bottom: 2px solid #0079FE;
          }
        }
        .account-login {
          margin-top: 20px;
          padding: 0 20px;
        }
      }
      .login-qrCode {
        margin-top: 75px;
        padding-top: 80px;
        .qr-code-login {
          width: 100px;
          height: 100px;
          background: #eee;
          margin: 0 auto;
        }
      }
    }
  }
}
</style>
