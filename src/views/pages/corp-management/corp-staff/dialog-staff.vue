<template>
  <div class="dialog-add-corp-staff">
    <el-dialog
      :title="editStaff ? '编辑员工' : '新增员工'"
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
        v-loading="corpLoading"
      >
        <div class="info-box">
          <el-form-item label="账号类型" prop="type" v-if="isFromCorp && !editStaff">
            <el-radio-group v-model="formData.type" size="medium" @change="onTypeChange">
              <el-radio border :label="0">普通</el-radio>
              <el-radio border :label="1">管理</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="员工账号" prop="staffName">
            <el-input placeholder="请输入员工账号"
            v-model="formData.staffName"
            :disabled="editStaff"/>
          </el-form-item>
          <el-form-item label="员工姓名" prop="name">
            <el-input placeholder="请输入员工姓名" v-model="formData.name" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender" size="medium">
              <el-radio border :label="0">男</el-radio>
              <el-radio border :label="1">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input placeholder="请输入手机号" v-model="formData.mobile" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input placeholder="请输入邮箱" v-model="formData.email" />
          </el-form-item>
          <div class="edit-more" @click="editMore = !editMore">
            <span>填写更多</span>
            <i :class="editMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </div>
        </div>
        <div v-show="editMore">
          <el-form-item label="座机号" prop="phone">
            <el-input placeholder="请输入座机号" v-model="formData.phone" />
          </el-form-item>
          <el-form-item label="邮编" prop="fax">
            <el-input placeholder="请输入邮编" v-model="formData.fax" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input
              type="textarea"
              placeholder="请输入地址"
              v-model="formData.address"
              rows="3"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>
        </div>
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
  name: 'DialogCorpStaff',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    staffInfo: Object || null,
    editStaff: Boolean,
    isFromCorp: Boolean,
  },
  components: { },
  setup(props, context) {
    const { $route, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const regexList = computed(() => ({
      phone: /^[1][3,4,5,6,7,8][0-9]{9}$/,
      landline: /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/,
    }));
    const validateRegex = (rule, value, callback) => {
      if (!value) return callback();
      if (rule.type === 'telephone') {
        const { phone, landline } = regexList.value;
        if (!phone.test(value) && !landline.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      } else if (rule.type === 'mobile') {
        const { phone } = regexList.value;
        if (!phone.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      } else if (rule.type === 'landline') {
        const { landline } = regexList.value;
        if (!landline.test(value) && rule.message) {
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
        corpId: null,
        staffName: null,
        staffLoginName: null,
        password: null,
        name: null,
        gender: null,
        email: null,
        mobile: null,
        phone: null,
        fax: null,
        address: null,
        type: 0,
      },
      validateRules: {
        type: [{ required: true, message: '请选择账号' }],
        staffName: [
          { required: true, message: '请输入员工账号' },
          { type: 'name', message: '账号必须是以字母、下划线（_）、中划线（-）、数字的组合', validator: validateRegex },
        ],
        name: [{ required: true, message: '请输入员工姓名' }],
        gender: [{ required: true, message: '请选择性别' }],
        mobile: [
          { required: true, message: '请输入手机号' },
          // { type: 'mobile', message: '请输入正确的手机号', validator: validateRegex },
        ],
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱' },
        ],
        phone: [
          { required: false, message: '请输入座机号' },
          // { type: 'landline', message: '请输入正确的座机号', validator: validateRegex },
        ],
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
      loading: corpLoading,
      data: corpData,
      fetchData: fetchCorpData,
    } = useHttp(`/patent-corp_api/corps/${$route.query.id}`);
    const onTypeChange = async (val) => {
      if (val) {
        await fetchCorpData();
        if (corpData.value) {
          const {
            clientId, contactName, contactEmail, contactMobile,
          } = corpData.value;
          state.formData.staffName = clientId;
          state.formData.name = contactName;
          state.formData.gender = 0;
          state.formData.email = contactEmail;
          state.formData.mobile = contactMobile;
        }
      } else {
        resetForm();
      }
    };

    const {
      loading: submitLoading,
      url: submitUrl,
      postData: postCorpStaff,
      putData: putCorpStaff,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
          };
          params.staffLoginName = params.staffName;
          if (props.editStaff) {
            submitUrl.value = `/patent-corp_api/corp-staffs/${props.staffInfo.id}`;
            await putCorpStaff(params);
          } else if (params.type === 1) {
            submitUrl.value = `/patent-corp_api/corps/${params.corpId}/setting-account`;
            await putCorpStaff(params);
          } else {
            submitUrl.value = '/patent-corp_api/corp-staffs';
            await postCorpStaff(params);
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
          state.formData.corpId = Number($route.query.id) || 0;
          if (props.staffInfo) {
            state.formData = { ...props.staffInfo };
            state.formData.type = 0;
          }
        } else {
          state.formData.id = 0;
          state.formData.corpId = 0;
          state.editMore = false;
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
      onTypeChange,
      corpLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.info-box {
  margin-bottom: 20px;
}
.edit-more {
  font-size: 14px;
  color: #0079FE;
  margin-left: 120px;
  cursor: pointer;
}
::v-deep {
  .el-dialog__body {
    overflow-y: auto;
    max-height: 550px;
  }
}
</style>
