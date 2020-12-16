<template>
  <div class="dialog-setting-account">
    <el-dialog
      title="设置账号"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetForm"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="viewForm"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item label="用户名" prop="account">
          <el-input placeholder="请输入用户名" v-model="formData.account" />
        </el-form-item>
        <el-form-item label="重置密码" prop="password">
          <el-input placeholder="请输入密码"
            v-model="formData.password"
            show-password
            type="password"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
        v-loading="submitLoading"
        @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  toRefs, computed, reactive, ref, watch, defineComponent,
} from '@vue/composition-api';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogAccount',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    agentInfo: Object || null,
  },
  components: { PanelSelectSearch, PanelCheckbox, PanelSelect },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      formData: {
        account: null,
        password: null,
      },
      validateRules: {
        account: [{ required: true, message: '请输入账号' }],
        password: [{ required: true, message: '请输入密码' }],
      },
    });
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const resetForm = () => {
      viewForm.value.resetFields();
    };
    const {
      loading: submitLoading,
      putData,
    } = useHttp('/patent-corp_api/agents/setting-account');
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const { id } = props.agentInfo;
          const params = {
            ...formData,
            id,
          };
          await putData(params);
          emit('success', true);
          resetForm();
          dialogVisible.value = false;
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    watch(() => props.visible, async (val) => {
      if (val && props.agentInfo) {
        if (props.agentInfo.loginName) {
          state.formData.account = props.agentInfo.loginName;
        }
      }
    });
    return {
      ...toRefs(state),
      dialogVisible,
      submitLoading,
      viewForm,
      resetForm,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>

</style>
