<template>
  <div class="dialog-add-field">
    <el-dialog
      :title="editEngineer ? '编辑专利工程师' : '新增专利工程师'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
    <el-form
      style="margin-top: 20px"
      :model="formData"
      ref="viewForm"
      label-width="120px"
      :rules="validateRules"
    >
      <el-form-item label="负责组织" prop="orgId">
        <panel-select-search
          v-model="formData.orgId"
          placeholder="请输入负责组织"
          maxlength="50"
          api="/patent-corp_api/groups/search"
          query-key="name"
          label-key="orgPath"
          value-key="id"
          multiple
          :default-options="groupOptions"
          @changeitem="handleChangeEngineer"
        />
      </el-form-item>
      <el-form-item
        label="姓名"
        prop="staffId"
      >
        <panel-select-search
          v-model="formData.staffId"
          placeholder="请输入姓名"
          maxlength="50"
          api="/patent-corp_api/staffs/names/like"
          query-key="name"
          label-key="staffFullName"
          value-key="staffId"
          :default-options="staffOptions"
          @changeitem="handleChangeStaff"
          @input="handleSearchInput"
          :disabled="editEngineer"
        />
      </el-form-item>
      <el-form-item
        label="所属企业"
        prop="corpName"
      >
        <el-input placeholder="请输入所属企业" v-model="formData.corpName" disabled />
      </el-form-item>
      <el-form-item
         label="邮箱"
         prop="email"
       >
         <el-input placeholder="请输入邮箱"
                   v-model="formData.email" />
      </el-form-item>
      <el-form-item
        label="手机号"
        prop="phone"
      >
        <el-input placeholder="手机号" v-model="formData.phone" />
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" v-loading="submitLoading" @click="handleSubmit">确 定</el-button>
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
import { useUserInfo } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogEditEngineer',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    engineerInfo: Object || null,
    editEngineer: Boolean,
  },
  components: { PanelSelectSearch, PanelCheckbox, PanelSelect },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const { userInfo } = useUserInfo();
    const validateRegex = (rule, value, callback) => {
      if (rule.field === 'email') {
        const email = /^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}$/;
        if (!email.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      // if (rule.field === 'phone') {
      //   const phone = /^[1][3,4,5,6,7,8][0-9]{9}$/;
      //   if (!phone.test(value) && rule.message) {
      //     return callback(new Error(rule.message));
      //   }
      // }
      return callback();
    };
    const state = reactive({
      formData: {
        staffId: null,
        corpId: null,
        email: null,
        phone: null,
        orgId: [],
        staffName: null,
        corpName: userInfo.value.corpName,
        groupEngineerList: [],
      },
      validateRules: {
        staffId: [{ required: true, message: '请输入姓名' }],
        corpName: [{ required: true, message: '请输入所属企业' }],
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的email', validator: validateRegex }],
        // phone: [
        //   { required: true, message: '请输入手机号' },
        //   { type: 'phone', message: '请输入正确的手机号', validator: validateRegex }],
        orgId: [{ required: true, message: '请选择负责组织' }],
      },
      staffOptions: [],
      groupOptions: [],
    });

    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const {
      loading: submitLoading,
      url: submitEngineerUrl,
      postData: postEngineer,
      putData: putEngineer,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
            corpId: userInfo.value.corpId,
          };
          if (props.editEngineer) {
            submitEngineerUrl.value = `/patent-corp_api/patent-engineer/${props.engineerInfo.id}`;
            await putEngineer(params);
            $message.success('编辑成功');
          } else {
            submitEngineerUrl.value = '/patent-corp_api/patent-engineer';
            await postEngineer(params);
            $message.success('新增成功');
          }
          emit('success', true);
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
    const handleChangeEngineer = (val) => {
      if (val.length > 0) {
        state.formData.groupEngineerList = val.map(item => ({
          groupId: item.id,
          groupName: item.orgPath,
        }));
      }
    };
    watch(() => props.visible, async (val) => {
      if (val && props.engineerInfo) {
        state.formData = { ...state.formData, ...props.engineerInfo };
        state.staffOptions = [{
          staffId: props.engineerInfo.staffId,
          staffFullName: props.engineerInfo.staffName,
        }];
        state.groupOptions = props.engineerInfo.groupEngineerList.map(item => ({
          id: item.groupId,
          orgPath: item.groupName,
        }));
        state.formData.orgId = props.engineerInfo.groupEngineerList.map(item => item.groupId);
      }
    });
    const handleChangeStaff = async (val) => {
      if (val) {
        const { formData } = state;
        formData.email = val.email;
        formData.phone = val.mobile;
        formData.staffName = val.staffFullName;
      }
    };
    const handleSearchInput = (val) => {
      if (!val) {
        const { formData } = state;
        formData.email = null;
        formData.phone = null;
        formData.staffName = null;
      }
    };
    const handleClose = () => {
      if (viewForm.value) {
        viewForm.value.resetFields();
      }
      delete state.formData.id;
      state.staffOptions = [];
      state.groupOptions = [];
    };
    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSearchInput,
      handleChangeStaff,
      handleSubmit,
      handleChangeEngineer,
      handleClose,
      submitLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
