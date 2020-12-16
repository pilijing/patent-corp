<template>
  <div class="password-login">
    <div class="login-form" v-loading="loading">
      <el-form
        :model="form"
        ref="loginForm"
        :rules="validateRules"
        @submit.native.prevent="toLogin"
        label-width="0px"
        :show-message="true"
      >
        <el-form-item prop="loginName">
          <el-input
            v-model.trim="form.loginName"
            @keydown.native.enter="toLogin"
            placeholder="请输入用户名"
          >
            <div slot="prefix" class="input-pre-icon">
              <i class="el-icon-user-solid" />
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
          <el-button class="btn-submit"
            @click="toLogin"
            ref="TencentCaptcha"
            type="primary"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, ref } from '@vue/composition-api';
import IconPassword from '@/assets/svg/password.svg';
import { useHttp } from '@/hooks/http';
import { setToken } from '@/utils/auth';

export default {
  name: 'PasswordLogin',
  components: { IconPassword },
  setup(_, context) {
    const { $message, $router, $route } = context.root;
    const loginForm = ref(null);
    const TencentCaptcha = ref(null);
    const state = reactive({
      loading: false,
      form: {
        loginName: '',
        password: '',
      },
      validateRules: {
        loginName: [{
          required: true, message: '请输入用户名', trigger: 'blur',
        }],
        password: [{
          required: true, message: '请输入密码', trigger: 'blur',
        }],
      },
    });

    const {
      postData: accessToken,
    } = useHttp('/patent-corp_api/authentications/access-token');

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
    const validLogin = async (res) => {
      if (res.ticket) {
        state.loading = true;
        try {
          const params = {
            ...state.form,
            loginType: 'name',
          };
          const data = await accessToken(params);
          state.loading = false;
          loginSuccess(data);
        } catch (error) {
          state.loading = false;
          $message.error(error.response.data);
        }
      }
    };

    const tencentCaptcha = () => {
      const dom = TencentCaptcha.value.$el;
      const captcha1 = new window.TencentCaptcha(dom, '2025564201', validLogin);
      captcha1.show();
    };

    const toLogin = async () => {
      try {
        await loginForm.value.validate();
        tencentCaptcha();
      } catch (error) {
        console.info(error);
      }
    };
    return {
      ...toRefs(state),
      loginForm,
      TencentCaptcha,
      toLogin,
    };
  },
};
</script>

<style lang="scss" scoped>
.password-login {
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
