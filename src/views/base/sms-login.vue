<template>
  <div class="sms-login">
    <div class="login-form" v-loading="loading">
      <el-form
        :model="form"
        ref="loginForm"
        :rules="validateRules"
        @submit.native.prevent="toLogin"
        label-width="0px"
        :show-message="true"
      >
        <el-form-item prop="phone">
          <el-input
            v-model.trim="form.phone"
            @keydown.native.enter="toLogin"
            :maxlength="13"
            placeholder="请输入手机号"
          >
            <div slot="prefix" class="input-pre-icon">
              <icon-phone />
            </div>
          </el-input>
        </el-form-item>
        <el-form-item prop="validateCode">
          <el-input
            v-model.trim="form.validateCode"
            :maxlength="6"
            @keydown.native.enter="toLogin"
            placeholder="请输入验证码"
          >
            <div slot="prefix" class="input-pre-icon">
              <icon-validate-code />
            </div>
            <div slot="suffix">
              <el-button
                class="primary-color"
                type="text"
                ref="TencentCaptcha"
                :disabled="isDisable"
                @click="sendCode"
              >
                {{ countFlag ? `${second}s后再获取`: '获取验证码' }}
              </el-button>
            </div>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            @keydown.native.enter="toLogin"
            :maxlength="20"
            placeholder="请输入密码"
            show-password
            type="password"
            autocomplete="off"
          >
            <div slot="prefix" class="input-pre-icon">
              <icon-password />
            </div>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-submit" @click="toLogin" type="primary">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, ref } from '@vue/composition-api';
import IconPhone from '@/assets/svg/phone.svg';
import IconValidateCode from '@/assets/svg/validate-code.svg';
import IconPassword from '@/assets/svg/password.svg';
import { useHttp } from '@/hooks/http';
import { setToken } from '@/utils/auth';

export default {
  name: 'SmsLogin',
  components: { IconPhone, IconValidateCode, IconPassword },
  setup(_, context) {
    const { $message, $router, $route } = context.root;
    const loginForm = ref(null);
    const TencentCaptcha = ref(null);
    const state = reactive({
      second: 60,
      countFlag: false,
      isDisable: false,
      loading: false,
      form: {
        phone: '',
        validateCode: '',
        password: '',
        useType: 1,
        messageType: 1,
        loginType: 'phone',
      },
      validateRules: {
        phone: [{
          required: true, pattern: /^1(3|4|5|6|7|8)\d{9}$/, message: '请输入正确的手机号', trigger: 'blur',
        }],
        validateCode: [{
          required: true, message: '请输入6位验证码', pattern: /^\d{6}$/, trigger: 'blur',
        }],
        password: [{
          required: true, message: '请输入密码', trigger: 'blur',
        }],
      },
    });
    const {
      postData: validationCode,
    } = useHttp('/patent-corp_api/authentications/validation-code');
    const {
      postData: authAccessToken,
    } = useHttp('/patent-corp_api/authentications/access-token');
    const countDown = () => {
      state.countFlag = true;
      const t = setInterval(() => {
        if (state.second > 0) {
          state.second -= 1;
        } else {
          clearInterval(t);
          state.second = 60;
          state.countFlag = false;
          state.isDisable = false;
        }
      }, 1000);
    };

    const validCode = async (res) => {
      if (res.ticket) {
        state.isDisable = true;
        const params = {
          phone: state.form.phone,
          useType: 0,
          messageType: 501,
          appId: res.appid,
          randStr: res.randstr,
          ticket: res.ticket,
        };
        try {
          const data = await validationCode(params);
          if (data) {
            state.form.validateCode = data;
            loginForm.value.validateField('validateCode');
          }
          countDown();
        } catch (error) {
          state.isDisable = false;
          $message.error(error.response.data);
        }
      }
    };

    const tencentCaptcha = () => {
      const dom = TencentCaptcha.value.$el;
      const captcha1 = new window.TencentCaptcha(dom, '2025564201', validCode);
      captcha1.show();
    };
    const sendCode = () => {
      loginForm.value.validateField('phone', (errorMessage, string) => {
        if (!errorMessage && !string) {
          tencentCaptcha();
        }
      });
    };
    const loginSuccess = async (data) => {
      const mseconds = new Date(data.expire).getTime() - new Date().getTime();
      const expired = new Date().getTime() + (mseconds / 2);
      setToken(data.token, expired);
      const { from } = $route.query;
      if (from) {
        $router.push(from);
      } else {
        $router.push('/');
      }
    };
    const toLogin = async () => {
      try {
        await loginForm.value.validate();
        state.loading = true;
        try {
          const data = await authAccessToken(state.form);
          state.loading = false;
          loginSuccess(data);
        } catch (error) {
          state.loading = false;
          $message.error(error.response.data);
        }
      } catch (error) {
        console.info(error);
      }
    };
    return {
      ...toRefs(state),
      loginForm,
      TencentCaptcha,
      sendCode,
      toLogin,
    };
  },
};
</script>

<style lang="scss" scoped>
.sms-login {
  .btn-submit {
    width: 100%;
  }
  .input-pre-icon {
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #c0c4cc;
    margin-left: 2px;
  }
}
</style>
