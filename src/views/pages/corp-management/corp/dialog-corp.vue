<template>
  <div class="dialog-add-corp">
    <el-dialog
      :title="editCorp ? '编辑企业' : '新增企业'"
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
        <el-form-item label="企业ID" prop="clientId">
          <el-input placeholder="请输入企业ID"
          v-model="formData.clientId"
          :disabled="editCorp" />
        </el-form-item>
        <el-form-item label="企业名称" prop="name">
          <el-input placeholder="请输入企业名称" v-model="formData.name" />
        </el-form-item>
        <el-form-item label="英文名称" prop="englishName">
          <el-input placeholder="请输入英文名称" v-model="formData.englishName" />
        </el-form-item>
        <el-form-item label="机构代码" prop="licenseCode">
          <el-input placeholder="请输入机构代码" v-model="formData.licenseCode" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input placeholder="请输入联系人" v-model="formData.contactName" />
        </el-form-item>
        <el-form-item label="联系人邮箱" prop="contactEmail">
          <el-input placeholder="请输入联系人邮箱" v-model="formData.contactEmail" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactMobile">
          <el-input placeholder="请输入联系人电话" v-model="formData.contactMobile" />
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input
            type="textarea"
            placeholder="备注说明"
            v-model="formData.remark"
            rows="3"
            maxlength="2000"
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
  name: 'DialogCorp',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    corpInfo: Object || null,
    editCorp: Boolean,
  },
  components: { },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const regexList = computed(() => ({
      phone: /^[1][3,4,5,6,7,8][0-9]{9}$/,
      landline: /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/,
    }));
    const validateRegex = (rule, value, callback) => {
      if (!value) return callback();
      if (rule.type === 'email') {
        const email = /^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}$/;
        if (!email.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      } else if (rule.type === 'telephone') {
        const { phone, landline } = regexList.value;
        if (!phone.test(value) && !landline.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      } else if (rule.type === 'name') {
        if (!/^[a-zA-Z_-]+[a-zA-Z0-9_-]+$/.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const state = reactive({
      formData: {
        clientId: null,
        name: null,
        englishName: null,
        licenseCode: null,
        contactName: null,
        contactEmail: null,
        contactMobile: null,
        remark: null,
      },
      validateRules: {
        clientId: [
          { required: true, message: '请输入企业ID' },
          { type: 'name', message: '企业ID必须是以字母、下划线（_）、中划线（-）、数字的组合', validator: validateRegex },
        ],
        name: [{ required: true, message: '请输入企业名称' }],
        contactMobile: [
          { required: true, message: '请输入联系电话' },
        ],
        contactEmail: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱', validator: validateRegex },
        ],
        contactName: [
          { required: true, message: '请输入联系人' },
        ],
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
      url: submitUrl,
      postData: postCorp,
      putData: putCorp,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
          };
          if (props.editCorp) {
            submitUrl.value = `/patent-corp_api/corps/${props.corpInfo.id}`;
            await putCorp(params);
          } else {
            submitUrl.value = '/patent-corp_api/corps';
            await postCorp(params);
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
          if (props.corpInfo) {
            state.formData = { ...props.corpInfo };
          }
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
