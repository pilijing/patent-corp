<template>
  <div class="step-basic-config">
    <p class="font_title">
      <span class="border-blue"></span>
      步骤基本设置
      <span class="edit-icon"
      v-show="!isEditing"
      @click="isEditing = true"
      >
      <i class="el-icon-edit-outline" />编辑</span>
    </p>
    <descriptions
      :column="3"
      style="padding-left: 20px;"
      :label-width="100"
      v-if="!isEditing"
    >
      <descriptions-item label="负责人" :value="managersText" />
      <descriptions-item label="是否有待办">{{
            formData.hasBelong !== null
          ? formData.hasBelong
            ? "是"
            : "否"
          : "--"
      }}</descriptions-item>
      <template v-if="formData.hasBelong">
        <descriptions-item label="待办所属人" :value="todoBelongText" />
        <template v-if="mailTemplate">
          <descriptions-item label="邮件收件人" :value="mailReceiverText" />
          <descriptions-item label="邮件抄送人" :value="mailCCText" />
          <descriptions-item label="邮件内容模板" :value="mailTemplateText" />
        </template>
      </template>
      <descriptions-item label="工作时限" :value="workingTimeTypeText" />
      <descriptions-item label="法定期限" :value="legalTimeTypeText" />
      <descriptions-item label="是否有账单" >{{
        formData.hasBill !== null
          ? formData.hasBill
            ? "是"
            : "否"
          : "--"
      }}</descriptions-item>
        <descriptions-item label="账单名称"  v-if="formData.hasBill">{{getTypeName(formData.feeNameId)}}</descriptions-item>
    </descriptions>

    <el-form
      label-position="right"
      label-width="130px"
      class="form-border"
      ref="basicConfigForm"
      :model="formData"
      :rules="formRules"
      v-else
    >
      <el-form-item label="负责人" prop="ownerType">
        <panel-radio
          v-model="formData.ownerType"
          placeholder="请选择负责人"
          type="PROCESS_MANAGER"
          border
          size="small"
        />
      </el-form-item>
      <el-form-item
        class="required-sign"
        label="指定员工"
        v-show="formData.ownerType === processManager.DESIGNATEDSTAFF"
        prop="ownerStaffId"
        :rules="[{ type: formData.ownerType, message: '请输入员工姓名或者员工号', validator: validateStaff }]"
      >
        <panel-select-search
          v-model="formData.ownerStaffId"
          :default-options="ownerStaffOptions"
          placeholder="请输入员工姓名或者员工号"
          maxlength="50"
          api="/patent-corp_api/staffs/names/like"
          query-key="name"
          label-key="staffFullName"
          value-key="staffId"
          class="domwidth"
          size="small"
          style="height:32px !important;"
        />
      </el-form-item>
      <el-form-item
        label="角色名"
        prop="ownerRoleId"
        v-if="formData.ownerType === processManager.ROLENAME"
      >
        <el-select
          v-model="formData.ownerRoleId"
          placeholder="请选择角色名"
          :loading="loadingLookups"
          class="domwidth"
          size="small"
        >
          <el-option
            v-for="item in getRolesState.data"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否有待办" prop="hasBelong">
            <el-radio-group size="small" v-model="formData.hasBelong" >
              <el-radio border :label="true">是</el-radio>
              <el-radio border :label="false">否</el-radio>
            </el-radio-group>
      </el-form-item>
      <template v-if="formData.hasBelong">
        <el-form-item
          label="待办所属人"
          prop="todoBelongType"
        >
          <panel-checkbox
            v-model="formData.todoBelongType"
            placeholder="请选择待办所属人"
            type="PROCESS_MANAGER"
            border
            size="small"
          />
        </el-form-item>
        <el-form-item
            label="角色名"
            prop="todoBelongRoleId"
            v-if="formData.todoBelongType.includes(processManager.ROLENAME)"
          >
            <el-select
              v-model="formData.todoBelongRoleId"
              placeholder="请选择角色名"
              :loading="loadingLookups"
              size="small"
              multiple
              class="selectWidth"
            >
              <el-option
                v-for="item in getRolesState.data"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
              ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item
            class="required-sign"
            label="指定员工"
            prop="todoBelongStaffId"
            v-show="formData.todoBelongType.includes(processManager.DESIGNATEDSTAFF)"
            :rules="[{ type: formData.todoBelongType, message: '请输入员工姓名或者员工号', validator: validateStaff }]"
          >
            <panel-select-search
              v-model="formData.todoBelongStaffId"
              :default-options="todoBelongOptions"
              placeholder="请输入员工姓名或者员工号"
              maxlength="50"
              api="/patent-corp_api/staffs/names/like"
              query-key="name"
              label-key="staffFullName"
              value-key="staffId"
              size="small"
              multiple
              class="selectWidth"
            />
        </el-form-item>
        <el-form-item label="邮件模板" prop="mailTemplate">
          <span class="edit-icon" @click="dialogMailVisible = true">
            {{mailTemplate ? '查看' : '配置'}}
          </span>
        </el-form-item>
      </template>
      <div style="display:flex;">
        <el-form-item label="工作时限" prop="workingTimeType">
          <panel-select
            type="WORKINGTIME_LIMIT"
            v-model="formData.workingTimeType"
            size="small"
          ></panel-select>
        </el-form-item>
        <el-form-item
          label=""
          label-width="0"
          style="margin-left:20px;"
          v-if="formData.workingTimeType === workingLimit.STAGEDATEADDDAY"
          prop="workingFieldDate"
        >
          <el-select
            v-model="formData.workingFieldDate"
            placeholder="请选择阶段下日期字段"
            :loading="loadingLookups"
            size="small"
          >
            <el-option
              v-for="item in dateOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label=""
          label-width="0"
          style="margin-left:20px; flex-shrink: 0;"
          prop="workingTimeOperate">
          <el-radio-group size="small" v-model="formData.workingTimeOperate">
            <el-radio-button label="+"></el-radio-button>
            <el-radio-button label="-"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label=""
          label-width="0"
          style="margin-left:20px;margin-right:20px;"
          prop="workingTimeNum"
        >
          <el-input
            v-model="formData.workingTimeNum"
            placeholder="输入天数"
            size="small"
          ></el-input>
        </el-form-item>
      </div>
      <div style="display:flex;">
        <el-form-item label="法定期限" prop="legalTimeType">
          <panel-select
            type="WORKINGTIME_LIMIT"
            v-model="formData.legalTimeType"
            size="small"
          ></panel-select>
        </el-form-item>

        <el-form-item
          label-width="0"
          style="margin-left:20px;"
          v-if="formData.legalTimeType === workingLimit.STAGEDATEADDDAY"
          prop="legalFieldDate"
        >
          <el-select
            filterable
            v-model="formData.legalFieldDate"
            placeholder="请选择阶段下日期字段"
            :loading="loadingLookups"
            size="small"
          >
            <el-option
              v-for="item in dateOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label=""
          label-width="0"
          style="margin-left:20px; flex-shrink: 0;"
          prop="legalTimeOperate">
          <el-radio-group size="small" v-model="formData.legalTimeOperate">
            <el-radio-button label="+"></el-radio-button>
            <el-radio-button label="-"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label=""
          label-width="0"
          style="margin-left:20px;margin-right:20px;"
          prop="legalTimeNum"
          size="small"
        >
          <el-input v-model="formData.legalTimeNum" placeholder="输入天数"></el-input>
        </el-form-item>
      </div>
      <el-form-item label="是否有账单" prop="hasBill">
        <el-radio-group v-model="formData.hasBill" size="small">
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="账单名称"
        v-if="formData.hasBill"
        prop="feeNameId"
      >
        <panel-select type="FEENAME" v-model="formData.feeNameId" class="domwidth"></panel-select>
      </el-form-item>
      <el-row>
        <p class="result-btn">
          <el-button @click="handlerCancel" size="small">取消</el-button>
          <el-button
            type="primary"
            v-loading="submitLoading"
            size="small"
            @click="resultSubmit"
          >保存</el-button>
        </p>
      </el-row>
    </el-form>
    <!-- 配置邮件模板 -->
    <dialog-mail-template
      :visible.sync="dialogMailVisible"
      :roles-state="getRolesState"
      :mail-template="mailTemplate"
      @message-template="messageTemplate" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  computed,
  watch,
} from '@vue/composition-api';
import { ElForm } from 'element-ui/types/form';
import {
  useRolesInject, useLookupsInject, useBasicSourceInject, useStageStep,
} from '@/context';
import PanelSelect from '@/components/panel-select.vue';
import { useHttp } from '@/hooks/http';
import cloneDeep from 'lodash/cloneDeep';
import utils from '@/utils';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelRadio from '@/components/panel-radio.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import DialogMailTemplate from '../../blocks/dialog-mail-template.vue';

export default defineComponent({
  name: 'BasicConfig',
  components: {
    PanelSelect, PanelSelectSearch, PanelRadio, PanelCheckbox, DialogMailTemplate,
  },
  props: {
    detailData: Object,
    selectedStepId: Number,
    processStageId: Number,
  },
  setup(props, context) {
    const { $message } = context.root;
    const {
      loading: loadingLookups,
      getEnumsInfo,
      getTypeName,
      todoOwners,
    } = useLookupsInject();
    const { getStepDetail } = useStageStep();
    const { getRolesState, getRoles } = useRolesInject();
    const processManager = computed(() => getEnumsInfo('PROCESS_MANAGER'));
    const workingLimit = computed(() => getEnumsInfo('WORKINGTIME_LIMIT'));

    const state = reactive({
      formData: {
        ownerType: null,
        ownerStaffId: null,
        ownerRoleId: null,
        hasBelong: null,
        todoBelongType: [] as number[],
        todoBelongStaffId: [] as string[] | null,
        todoBelongRoleId: [] as number[] | null,
        workingTimeType: null,
        workingFieldDate: null, // 选择工作时限阶段下日期字段
        workingTimeOperate: null,
        workingTimeNum: null, // 工作时限阶段加减天数
        legalTimeType: null,
        legalFieldDate: null, // 选择工作时限阶段下日期字段
        legalTimeOperate: null, // 法定期限操作符
        legalTimeNum: null, // 法定期限阶段加减天数
        hasBill: null,
        feeNameId: null,
      },
      managersText: '', // 负责人文本
      todoBelongText: '' as string | null, // 待办所属人文本
      mailReceiverText: '' as string | null, // 邮件收件人
      mailCCText: '' as string | null, // 邮件抄送人
      mailTemplateText: '', // 邮件内容模板
      legalTimeTypeText: '',
      workingTimeTypeText: '', // 工作时限文本
      ownerStaffOptions: [] as object[],
      todoBelongOptions: [] as object[],
      mailTemplate: null as any,
      dateOption: [] as any[],
      dialogMailVisible: false,
    });

    const isEditing = ref(false);
    const basicConfigForm = ref<ElForm | null>(null);
    const regexList = computed(() => ({
      daynum: /^[0-9]{1,5}$/,
      email: /^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}$/,
    }));
    const validateRegex = (rule: any, value: any, callback: any) => {
      if (rule.field === 'workingTimeNum' || rule.field === 'legalTimeNum') {
        const { daynum } = regexList.value;
        if (!daynum.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const formRules = ref({
      ownerType: [{ required: true, message: '请选择负责人', trigger: 'change' }],
      hasBelong: [{ required: true, message: '请选择是否有待办', trigger: 'change' }],
      todoBelongType: [{ required: true, message: '请选择待办所属人', trigger: 'change' }],
      hasNotifyType: [{ required: true, message: '请选择是否有通知人', trigger: 'change' }],
      notifyToType: [{ required: true, message: '请选择通知人', trigger: 'change' }],
      workingTimeType: [{ required: true, message: '请选择工作时限', trigger: 'change' }],
      legalTimeType: [{ required: true, message: '请选择法定期限', trigger: 'change' }],
      hasBill: [{ required: true, message: '请选择是否有账单', trigger: 'change' }],
      feeNameId: [{ required: true, message: '请选择账单名称', trigger: 'change' }],
      notifyRoleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      todoBelongRoleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      ownerRoleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      legalFieldDate: [{ required: true, message: '请选择阶段下日期字段', trigger: 'change' }],
      workingFieldDate: [{ required: true, message: '请选择阶段下日期字段', trigger: 'change' }],
      workingTimeOperate: [{ required: true, message: '请选择加减操作符', trigger: 'change' }],
      legalTimeOperate: [{ required: true, message: '请选择加减操作符', trigger: 'change' }],
      workingTimeNum: [
        { required: true, message: '请填写天数' },
        { type: 'daynum', message: '请输入正确的天数', validator: validateRegex },
      ],
      legalTimeNum: [
        { required: true, message: '请填写天数' },
        { type: 'daynum', message: '请输入正确的天数', validator: validateRegex },
      ],

    });

    const handlerCancel = () => {
      isEditing.value = false;
      if (basicConfigForm.value) {
        basicConfigForm.value.resetFields();
      }
      state.mailTemplate = null;
    };
    const messageTemplate = (val: object) => {
      state.mailTemplate = cloneDeep(val) || null;
    };

    const { url: roleUrl, fetchData } = useHttp();
    const { getFieldTypesState } = useBasicSourceInject();
    const fieldTypes = getFieldTypesState.data.find(p => p.type === 'DateTime');
    const initDate = async () => {
      roleUrl.value = `/patent-corp_api/stage-fields/${props.processStageId}`;
      const fieldDate = await fetchData();
      let fieldTypeId = 0 as any;
      fieldTypeId = fieldTypes ? fieldTypes.id : 0;
      state.dateOption = (fieldDate || []).filter((item: any) => item.inputType
      === fieldTypeId).map((item: any) => item);
    };

    const workingtViewData = () => {
      const { formData } = state;
      // 工作时限
      state.workingTimeTypeText = getTypeName(formData.workingTimeType || 0) ?? '--';
      // 如果工作时限等于阶段某日期
      if (formData.workingTimeType === workingLimit.value.STAGEDATEADDDAY) {
        const fieldData = state.dateOption.find((p: any) => p.id === formData.workingFieldDate);
        state.workingTimeTypeText = fieldData?.name ?? '--';
      }
      const workingTimeNum = formData.workingTimeNum ?? '';
      const workingTimeNumDay = formData.workingTimeNum ? '天' : '';
      const workingTimeOperate = formData.workingTimeOperate ?? '';
      state.workingTimeTypeText = `${state.workingTimeTypeText} ${
        workingTimeOperate} ${workingTimeNum}${workingTimeNumDay}`;
      // 如果法定期限等于阶段某日期
      if (formData.legalTimeType === workingLimit.value.STAGEDATEADDDAY) {
        const fieldData = state.dateOption.find((p: any) => p.id === formData.legalFieldDate);
        state.legalTimeTypeText = fieldData?.name ?? '--';
      } else {
        // 法定期限为当前日期
        state.legalTimeTypeText = getTypeName(formData.legalTimeType || 0) ?? '--';
      }
      const legalTimeNum = formData.legalTimeNum ?? '';
      const legalTimeOperate = formData.legalTimeOperate ?? '';

      const legalTimeNumDay = formData.legalTimeNum ? '天' : '';
      state.legalTimeTypeText = `${state.legalTimeTypeText} ${legalTimeOperate} ${legalTimeNum}${legalTimeNumDay}`;
    };

    const handlePeopleText = (
      typeList: number[] | null | undefined,
      roleIdList: number[] | null | undefined,
      staffOptionsnumber: object[] | null | undefined,
    ) => {
      if (typeList && typeList.length > 0) {
        const todoBelong = (typeList || []).map((item: number) => {
          if (item !== processManager.value.ROLENAME && item !== processManager.value.DESIGNATEDSTAFF) {
            return getTypeName(item);
          }
          return false;
        });
        if (typeList.includes(processManager.value.ROLENAME)) {
          const roleNmame = getRolesState.data.map((p: any) => ((roleIdList || []).includes(p.roleId)
            ? p.roleName : false)).filter(Boolean)
            .join(',');
          todoBelong.push(`${getTypeName(processManager.value.ROLENAME)}(${roleNmame})`);
        }
        if (typeList.includes(processManager.value.DESIGNATEDSTAFF)) {
          const name = (staffOptionsnumber || []).map((item: any) => item.staffFullName).join(',');
          todoBelong.push(name);
        }
        const textView = todoBelong.filter(Boolean).join(',');
        return textView;
      }
      return null;
    };

    const initElement = () => {
      if (!props.selectedStepId) return;
      const decorateProcess = cloneDeep(props.detailData) || {};
      state.formData = { ...state.formData, ...decorateProcess };

      // 负责人
      if (decorateProcess.ownerType === processManager.value.DESIGNATEDSTAFF) {
        state.managersText = decorateProcess.ownerStaff?.staffFullName;
        state.ownerStaffOptions = decorateProcess.ownerStaff ? [decorateProcess.ownerStaff] : [];
      } else if (decorateProcess.ownerType === processManager.value.ROLENAME) {
        const role = getRolesState.data.find((p: any) => p.roleId === state.formData.ownerRoleId);
        state.managersText = role?.roleName ?? '';
      } else {
        state.managersText = getTypeName(decorateProcess.ownerType) || '';
      }
      state.mailTemplate = null;
      if (decorateProcess.hasBelong) {
        // 待办所属人
        state.todoBelongText = handlePeopleText(
          decorateProcess.todoBelongType,
          decorateProcess.todoBelongRoleId, decorateProcess.todoBelongStaff,
        );
        state.todoBelongOptions = decorateProcess.todoBelongType.includes(processManager.value.DESIGNATEDSTAFF)
          ? decorateProcess.todoBelongStaff : [];
        // 邮件模板
        const notification = decorateProcess.notificationConfig;
        if (notification?.recipientPeopleIds && notification.recipientPeopleIds.length > 0) {
          state.mailReceiverText = handlePeopleText(
            notification.recipientPeopleIds,
            notification.recipientRoleIds, notification.recipientStaff,
          );
          state.mailCCText = handlePeopleText(
            notification.copyPeopleIds,
            notification.copyRoleIds, notification.copyStaff,
          );
          state.mailTemplateText = notification.messageTemplate.name;
          state.mailTemplate = decorateProcess.notificationConfig;
        }
      } else {
        state.formData.todoBelongType = [];
      }
      workingtViewData();
    };

    onMounted(async () => {
      await initDate();
      if (getRolesState.data.length === 0) {
        await getRoles();
      }
    });

    const { loading: submitLoading, url: editUrl, putData } = useHttp();
    const resultSubmit = async () => {
      if (!basicConfigForm.value) {
        $message.success('表单DOM不存在!');
        return;
      }
      basicConfigForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const rolenme = processManager.value.ROLENAME;
          const staff = processManager.value.DESIGNATEDSTAFF;
          formData.ownerStaffId = formData.ownerType === staff ? formData.ownerStaffId : null;
          formData.ownerRoleId = formData.ownerType === rolenme ? formData.ownerRoleId : null;
          if (formData.hasBelong) {
            formData.todoBelongRoleId = formData.todoBelongType.includes(rolenme) ? formData.todoBelongRoleId : null;
            formData.todoBelongStaffId = formData.todoBelongType.includes(staff) ? formData.todoBelongStaffId : null;
          } else {
            formData.todoBelongType = [];
            formData.todoBelongStaffId = null;
            formData.todoBelongRoleId = null;
            state.mailTemplate = null;
          }
          formData.feeNameId = formData.hasBill ? formData.feeNameId : null;
          editUrl.value = `/patent-corp_api/stage-step-base/${props.selectedStepId}`;
          const putDataInfo = {
            ...formData,
            notificationConfig: state.mailTemplate,
          };
          await putData(putDataInfo);
          await getStepDetail(props.selectedStepId || 0);
          handlerCancel();
          $message.success('操作成功!');
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          }
        }
      });
    };
    watch(() => props.selectedStepId, () => {
      if (props.selectedStepId) {
        isEditing.value = false;
      }
    });
    watch(() => props.detailData, async (val) => {
      console.log('watch--props.detailData', val);
      if (val) {
        if (getRolesState.data.length === 0) {
          await getRoles();
        }
        initElement();
      }
    });

    const validateStaff = (rule: any, value: any, callback: any) => {
      if (rule.field === 'ownerStaffId' && rule.type === processManager.value.DESIGNATEDSTAFF) {
        if (utils.isEmpty(value) && rule.message) {
          return callback(new Error(rule.message));
        }
        return callback();
      }
      if (rule.field === 'todoBelongStaffId' && rule.type.includes(processManager.value.DESIGNATEDSTAFF)) {
        if (utils.isEmpty(value) && rule.message) {
          return callback(new Error(rule.message));
        }
        return callback();
      }
      return callback();
    };
    return {
      ...toRefs(state),
      handlerCancel,
      resultSubmit,
      formRules,
      basicConfigForm,
      validateStaff,
      loadingLookups,
      todoOwners,
      initElement,
      isEditing,
      getRolesState,
      processManager,
      messageTemplate,
      workingLimit,
      getTypeName,
      submitLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.step-basic-config {
  .domwidth {
    width: 220px;
  }
  .selectWidth{
    max-width: 763px;
  }
  .top-item {
    margin-top: 20px;
  }
  .right-select {
    margin-right: 30px;
  }
  .person-select {
    flex: 1;
    margin-right: 30px;
  }
  .el-form-item__content {
    margin-left: 10px !important;
  }

  .border-blue {
    display: inline-block;
    width: 4px;
    background-color: #0079fe;
    height: 14px;
    margin-right: 10px;
  }
  .edit-icon {
    font-size: 14px;
    font-weight: 400;
    color: #0079fe;
    cursor: pointer;
  }
  .form-border {
    border: 1px solid #016eff;
    margin: 10px 0;
    padding: 16px 32px 16px 0;
    .step-table {
      margin-left: 5%;
      margin-top: 10px;

    }
    .result-btn {
      width: 100%;
      height: 50px;
      text-align: center;
      margin-top: 10px;
    }
  }
}
</style>
