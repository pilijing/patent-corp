<template>
  <div class="dialog-add-role">
    <el-dialog
      :title="editRole ? '编辑角色' : '新增角色'"
      :visible.sync="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetForm"
    >
      <el-form
        style="margin-top: 20px;"
        :model="formData"
        ref="viewForm"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item label="角色代码" prop="roleCode">
          <el-input placeholder="请输入角色代码" v-model="formData.roleCode" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input placeholder="请输入角色名称" v-model="formData.roleName"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="formData.description"
            rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  toRefs,
  computed,
  reactive,
  ref,
  watch,
  defineComponent,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogRole',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    roleInfo: Object || null,
    editRole: Boolean,
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
        roleId: null,
        roleName: null,
        roleCode: null,
        description: null,
      },
      validateRules: {
        roleCode: [
          { required: true, message: '请输入角色代码' },
          { type: 'name', message: '角色代码必须是以字母、下划线（_）、中划线（-）、数字的组合', validator: validateRegex },
        ],
        roleName: [{ required: true, message: '请输入角色名称' }],
      },
      editMore: false,
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
      postData: postRole,
      putData: putRole,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
          };
          if (props.editRole) {
            submitUrl.value = `/patent-corp_api/roles/${props.roleInfo.roleId}`;
            await putRole(params);
          } else {
            submitUrl.value = '/patent-corp_api/roles';
            await postRole(params);
          }
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
    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          if (props.roleInfo) {
            state.formData = { ...props.roleInfo };
          }
        } else {
          state.formData.roleId = null;
        }
      },
    );
    return {
      ...toRefs(state),
      dialogVisible,
      submitLoading,
      viewForm,
      handleSubmit,
      resetForm,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
