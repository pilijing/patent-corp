<template>
  <div class="dialog-setting-account">
    <el-dialog
      title="设置账号"
      :visible.sync="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetForm"
    >
      <el-form
        :model="formData"
        ref="viewForm"
        label-width="120px"
        :rules="validateRules"
      >
      <el-form-item v-if="!isEdit" :class="!isEdit ? 'add-item' : ''">
        <span style="color: #a9a6a6;">
            <i class="el-icon-question"
            style="color:#ff9500; font-size: 18px; vertical-align: text-bottom;"/>
            用户账号名设定后，将无法更改！
          </span>
      </el-form-item>
        <el-form-item label="用户账号名" prop="account">
          <el-input placeholder="请输入用户账号名"
          v-model="formData.account"
          :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="`${(isEdit ? '重置' : '设置')}密码`" prop="password">
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
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogAccount',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    staffInfo: Object || null,
  },
  components: { },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const validateRegex = (rule, value, callback) => {
      if (!value) return callback();
      if (rule.type === 'name') {
        if (!/^[a-zA-Z_-]+[a-zA-Z0-9_-]+$/.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const state = reactive({
      formData: {
        account: null,
        password: null,
      },
      validateRules: {
        account: [
          { required: true, message: '请输入用户账号名' },
          { type: 'name', message: '账号名必须是以字母、下划线（_）、中划线（-）、数字的组合', validator: validateRegex },
        ],
        password: [{ required: true, message: '请输入密码' }],
      },
      id: 0,
      isEdit: false,
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
      url: submitUrl,
      putData,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          submitUrl.value = `/patent-corp_api/corp-staffs/${state.id}/setting-account`;
          const { formData } = state;
          const params = {
            ...formData,
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
      if (val && props.staffInfo) {
        const { id, loginName, staffName } = props.staffInfo;
        state.id = id;
        state.isEdit = false;
        if (loginName) {
          state.isEdit = true;
          state.formData.account = loginName;
        } else {
          state.formData.account = staffName;
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
.add-item {
  margin-bottom: 0px;
}
</style>
