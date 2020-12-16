<template>
  <div class="dialog-add-field">
    <el-dialog
      title="添加邮件模板"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
    <el-form
      style="margin-top: 20px"
      :model="formData"
      ref="viewForm"
      label-width="120px"
      :rules="validateRules"
    >
      <el-form-item label="邮件收件人" prop="recipientPeopleIds">
        <panel-checkbox
          v-model="formData.recipientPeopleIds"
          placeholder="请选择邮件收件人"
          type="PROCESS_MANAGER"
          border
          size="small"
        />
      </el-form-item>
      <el-form-item
        label="角色名"
        prop="recipientRoleIds"
        v-if="formData.recipientPeopleIds.includes(processManager.ROLENAME)"
        key="recipientRoleIds"
      >
        <el-select
          v-model="formData.recipientRoleIds"
          placeholder="请选择角色"
          size="small"
          multiple
        >
          <el-option
            v-for="item in rolesState.data"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        class="required-sign"
        label="指定员工"
        prop="recipientStaffIds"
        v-if="formData.recipientPeopleIds.includes(processManager.DESIGNATEDSTAFF)"
        key="recipientStaffIds"
      >
        <panel-select-search
          v-model="formData.recipientStaffIds"
          :default-options="recipientStaffOptions"
          placeholder="请输入员工姓名或者员工号"
          maxlength="50"
          api="/patent-corp_api/staffs/names/like"
          query-key="name"
          label-key="staffFullName"
          value-key="staffId"
          size="small"
          multiple
          @changeitem="changeRecipientStaff"
        />
      </el-form-item>
      <el-form-item label="邮件抄送人" prop="copyPeopleIds">
        <panel-checkbox
          v-model="formData.copyPeopleIds"
          placeholder="请选择邮件抄送人"
          type="PROCESS_MANAGER"
          border
          size="small"
        />
      </el-form-item>
      <el-form-item
        label="角色名"
        prop="copyRoleIds"
        v-if="formData.copyPeopleIds.includes(processManager.ROLENAME)"
        key="copyRoleIds"
      >
        <el-select
          v-model="formData.copyRoleIds"
          placeholder="请选择角色"
          size="small"
          multiple
        >
          <el-option
            v-for="item in rolesState.data"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        class="required-sign"
        label="指定员工"
        prop="copyStaffIds"
        v-if="formData.copyPeopleIds.includes(processManager.DESIGNATEDSTAFF)"
        key="copyStaffIds"
      >
        <panel-select-search
          v-model="formData.copyStaffIds"
          :default-options="copyStaffOptions"
          placeholder="请输入员工姓名或者员工号"
          maxlength="50"
          api="/patent-corp_api/staffs/names/like"
          query-key="name"
          label-key="staffFullName"
          value-key="staffId"
          size="small"
          multiple
          @changeitem="changeCopyStaff"
        />
      </el-form-item>
      <el-form-item
        label="邮件内容模板"
        prop="messageTemplateId"
        class="message-template"
      >
        <el-select
          v-model="formData.messageTemplateId"
          placeholder="请选择邮件内容模板"
          size="small"
          @change="handleSelectChange"
        >
          <el-option
            v-for="item in messageTemplateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-popover
          placement="top"
          trigger="hover"
          v-if="formData.messageTemplateId && messageTemplate"
          >
          <div v-html="messageTemplate.template" />
          <div slot="reference" class="popover-preview">预览</div>
        </el-popover>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
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
import { useLookupsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogMailTemplate',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    rolesState: {
      type: Object,
      default: {},
    },
    mailTemplate: Object || null,
  },
  components: { PanelSelectSearch, PanelCheckbox },
  setup(props, context) {
    const { getEnumsInfo } = useLookupsInject();
    const processManager = computed(() => getEnumsInfo('PROCESS_MANAGER'));
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      formData: {
        recipientPeopleIds: [],
        recipientRoleIds: [],
        recipientStaffIds: [],
        copyPeopleIds: [],
        copyRoleIds: [],
        copyStaffIds: [],
        messageTemplateId: null,
      },
      recipientStaffOptions: [],
      copyStaffOptions: [],
      messageTemplateList: [],
      messageTemplate: {},
      validateRules: {
        recipientPeopleIds: [{ required: true, message: '请选择邮件收件人' }],
        recipientStaffIds: [{ required: true, message: '请输入员工姓名或者员工号' }],
        recipientRoleIds: [{ required: true, message: '请选择角色' }],
        // copyPeopleIds: [{ required: true, message: '请选择邮件抄送人' }],
        copyRoleIds: [{ required: true, message: '请选择角色' }],
        messageTemplateId: [{ required: true, message: '请选择邮件内容模板' }],
        copyStaffIds: [{ required: true, message: '请输入员工姓名或者员工号' }],
      },
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
    const changeRecipientStaff = (val) => {
      state.recipientStaffOptions = val;
    };
    const changeCopyStaff = (val) => {
      state.copyStaffOptions = val;
    };
    const handleSubmit = () => {
      viewForm.value.validate((valid) => {
        if (!valid) return;
        const { formData } = state;
        try {
          const rolenme = processManager.value.ROLENAME;
          const staff = processManager.value.DESIGNATEDSTAFF;
          formData.recipientRoleIds = formData.recipientPeopleIds.includes(rolenme) ? formData.recipientRoleIds : null;
          formData.recipientStaffIds = formData.recipientPeopleIds.includes(staff) ? formData.recipientStaffIds : null;
          formData.copyRoleIds = formData.copyPeopleIds.includes(rolenme) ? formData.copyRoleIds : null;
          formData.copyStaffIds = formData.copyPeopleIds.includes(staff) ? formData.copyStaffIds : null;
          const params = {
            ...state.formData,
            recipientStaff: state.recipientStaffOptions,
            copyStaff: state.copyStaffOptions,
          };
          emit('message-template', { ...params });
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

    const {
      url: getMessageUrl,
      fetchData,
    } = useHttp();
    const handleSelectChange = async (val) => {
      if (val) {
        getMessageUrl.value = `/patent-corp_api/message/${val}`;
        state.messageTemplate = await fetchData();
      } else {
        state.messageTemplate = null;
      }
    };
    // messageType: 100邮件 101短信 102企业微信 103微信
    const getMessageTemplateList = async () => {
      getMessageUrl.value = '/patent-corp_api/message';
      state.messageTemplateList = await fetchData({ messageType: 100 });
    };
    watch(() => props.visible, (val) => {
      if (val) {
        state.formData = { ...state.formData, ...props.mailTemplate };
        if (props.mailTemplate?.messageTemplateId) {
          handleSelectChange(state.formData.messageTemplateId);
          if (props.mailTemplate.recipientStaff) {
            state.recipientStaffOptions = [...state.recipientStaffOptions, ...props.mailTemplate.recipientStaff];
          }
          if (props.mailTemplate.copyStaff) {
            state.copyStaffOptions = [...state.copyStaffOptions, ...props.mailTemplate.copyStaff];
          }
        } else {
          state.formData.recipientRoleIds = [];
          state.formData.recipientStaffIds = [];
          state.formData.copyRoleIds = [];
          state.formData.copyStaffIds = [];
          state.recipientStaffOptions = [];
          state.copyStaffOptions = [];
        }
        getMessageTemplateList();
      } else { // 重置
        viewForm.value.resetFields();
      }
    });
    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      processManager,
      handleSubmit,
      getMessageTemplateList,
      handleSelectChange,
      changeRecipientStaff,
      changeCopyStaff,
    };
  },
});
</script>

<style lang="scss" scoped>
.message-template {
  ::v-deep {
    .el-form-item__content {
      display: flex;
    }
    .popover-preview {
      width: 40px;
      color: #016EFF;
      margin-left: 12px;
      cursor: pointer;
    }
  }
}
</style>
