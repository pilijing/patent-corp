<template>
  <div class="claim-result-action-edit">
    <el-form
      label-position="right"
      label-width="150px"
      :model="formData"
      :rules="rules"
      ref="resultActionForm"
      class="form-border"
    >
      <el-form-item
        label="进入阶段"
        prop="isInCurrentStage"
        required
      >
        <el-radio-group
          v-model="formData.isInCurrentStage"
          size="small"
        >
          <el-radio border :label="true">保留在当前</el-radio>
          <el-radio border :label="false">进入新阶段</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="请选择新阶段"
        prop="newStageId"
        required
        v-if="formData.isInCurrentStage === false"
      >
        <el-select
          filterable
          v-model="formData.newStageId"
          placeholder="请选择"
          style="width: 280px"
          size="small"
          :loading="false"
        >
          <el-option
            v-for="item in processStage"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="是否更新专利状态"
        required
        prop="isChangePatentState"
      >
        <el-radio-group
          v-model="formData.isChangePatentState"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="更新专利状态至"
        prop="changePatentState"
        required
        v-if="formData.isChangePatentState"
      >
        <panel-select
          type="CHANGE_PATENT_STATE"
          v-model="formData.changePatentState"
          size="small"
          style="width: 400px"
        />
      </el-form-item>
      <el-form-item
        label="是否有待办"
        required
        prop="hasTodo"
      >
        <el-radio-group
          v-model="formData.hasTodo"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.hasTodo">
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
          prop="todoBelongRoleIds"
          v-if="formData.todoBelongType.includes(processManager.ROLENAME)"
        >
          <el-select
            v-model="formData.todoBelongRoleIds"
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
          prop="todoBelongStaffIds"
          v-if="formData.todoBelongType.includes(processManager.DESIGNATEDSTAFF)"
        >
          <panel-select-search
            v-model="formData.todoBelongStaffIds"
            :default-options="staffDeafultOptions"
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
        <el-form-item
          label="邮件模板"
          prop="mailTemplate"
        >
          <span
            class="edit-icon"
            @click="dialogMailVisible = true"
          >
            {{notificationConfig ? '查看' : '配置'}}
          </span>
        </el-form-item>
      </template>

      <el-row
        type="flex"
        class="row-bg"
        justify="center"
      >
        <el-col :span="6">
          <el-button
            size="small"
            @click="handleCancel"
          >取消</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleSaveClaimAction"
            :loading="updateResultActionState.loading"
          >保存</el-button>
        </el-col>
      </el-row>
    </el-form>
    <!-- 配置邮件模板 -->
    <dialog-mail-template
      :visible.sync="dialogMailVisible"
      :roles-state="getRolesState"
      :mail-template="notificationConfig"
      @message-template="messageTemplate"
    />
  </div>
</template>

<script lang="ts">
import {
  useLookupsInject,
  useOfficialClaimDetailInject,
  useProcessStageInject,
  useRolesInject,
} from '@/context';
import {
  toRefs,
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
} from '@vue/composition-api';
import { Message } from 'element-ui';
import { ElForm } from 'element-ui/types/form';
import { getSelectRules } from '@/utils/form-rules';
import utils from '@/utils';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import PanelSelect from '@/components/panel-select.vue';
import DialogMailTemplate from '../../blocks/dialog-mail-template.vue';

const resultActionRules = {
  isInCurrentStage: getSelectRules('请选择进入阶段'),
  newStageId: getSelectRules('请选择新阶段'),
  hasTodo: getSelectRules('请选择是否有待办'),
  todoBelongType: getSelectRules('请选择待办所属人'),
  todoBelongStaffIds: getSelectRules('请选择指定员工'),
  todoBelongRoleIds: getSelectRules('请选择角色名'),
  isChangePatentState: getSelectRules('请选择是否更新专利状态'),
  changePatentState: getSelectRules('请选择更新专利状态'),
};

export default defineComponent({
  name: 'ClaimResultActionEdit',
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    DialogMailTemplate,
    PanelSelect,
  },
  setup(_, { emit }) {
    const { loading: loadingLookups, getEnumsInfo } = useLookupsInject();
    const processManager = computed(() => getEnumsInfo('PROCESS_MANAGER'));
    const { getRolesState, getRoles } = useRolesInject();

    const { getOfficialClaimDetailState } = useOfficialClaimDetailInject();

    const resultActionState = reactive({
      formData: {
        isInCurrentStage: null as boolean | null,
        newStageId: null as number | null,
        hasTodo: null as boolean | null,
        todoBelongType: [] as number[] | null,
        todoBelongStaffIds: [] as string[] | null,
        todoBelongRoleIds: [] as number[] | null,
        isChangePatentState: null as boolean | null,
        changePatentState: null as number | null,
      },
      notificationConfig: null as any,
      dialogMailVisible: false as boolean,
      todoBelongStaff: null as object[] | null,
      staffDeafultOption: null as object[] | null,
    });

    onMounted(() => {
      if (getRolesState.data.length === 0) {
        getRoles();
      }
      initFormData(getOfficialClaimDetailState);
    });

    // 阶段列表 // TODO processStage应该改名叫 processStageList
    const { processStage } = useProcessStageInject();

    const stageClaimsResultId = computed(() => getOfficialClaimDetailState.data.stageClaimsResults?.[0]?.id || 0);

    const resultActionForm = ref<ElForm | null>(null);

    const {
      getOfficialClaimDetail,
      updateResultAction,
      updateResultActionState,
    } = useOfficialClaimDetailInject();

    const rules = reactive(resultActionRules);
    async function handleSaveClaimAction() {
      // 表单验证
      if (!resultActionForm.value) {
        Message.error('表单DOM不存在');
        return;
      }
      const valid = await resultActionForm.value.validate().catch(() => false);
      if (!valid) {
        return;
      }
      // 更新来文结果动作
      const stageClaimsId = getOfficialClaimDetailState.data.id;
      if (!stageClaimsId) {
        Message.error('找不到来文ID');
        return;
      }
      const { formData } = resultActionState;
      handleHasTodo(formData);
      await updateResultAction(stageClaimsResultId.value, {
        ...formData,
        stageClaimsId,
        id: stageClaimsResultId.value,
        newStageId: formData.isInCurrentStage ? null : formData.newStageId,
        notificationConfig: resultActionState.notificationConfig,
      });
      if (updateResultActionState.error !== null) return;

      // 重新获取最新来文详情
      getOfficialClaimDetail(stageClaimsId);
      emit('success');
    }

    function resetForm() {
      if (!resultActionForm.value) {
        Message.error('表单DOM不存在');
        return;
      }
      resultActionForm.value.resetFields();
    }
    function handleCancel() {
      resetForm();
      emit('cancel');
    }

    // watch(() => getOfficialClaimDetailState.data, (curDetail) => {
    //   initFormData(curDetail);
    // });
    function initFormData(officialClaimDetail: any) {
      console.info(officialClaimDetail);
      const {
        isInCurrentStage,
        newStageId,
        hasTodo,
        todoBelongType,
        todoBelongStaffIds,
        todoBelongRoleIds,
        todoBelongStaff,
        notificationConfig,
        isChangePatentState,
        changePatentState,
      } = officialClaimDetail.data.stageClaimsResults?.[0] ?? {};
      resultActionState.formData = {
        isInCurrentStage,
        newStageId,
        hasTodo,
        todoBelongType,
        todoBelongStaffIds,
        todoBelongRoleIds,
        isChangePatentState,
        changePatentState,
      };
      resultActionState.notificationConfig = null;
      if (hasTodo) {
        resultActionState.todoBelongStaff = todoBelongStaff || [];
        if (
          notificationConfig?.recipientPeopleIds
          && notificationConfig.recipientPeopleIds.length > 0
        ) {
          resultActionState.notificationConfig = notificationConfig;
        }
        resultActionState.staffDeafultOption = resultActionState.todoBelongStaff;
      } else {
        resultActionState.formData.todoBelongType = [];
      }
    }

    function handleHasTodo(formData: any) {
      if (formData.hasTodo) {
        const rolenme = processManager.value.ROLENAME;
        const staff = processManager.value.DESIGNATEDSTAFF;
        formData.todoBelongRoleIds = formData.todoBelongType.includes(rolenme)
          ? formData.todoBelongRoleIds
          : null;
        formData.todoBelongStaffIds = formData.todoBelongType.includes(staff)
          ? formData.todoBelongStaffIds
          : null;
      } else {
        formData.todoBelongType = [];
        formData.todoBelongStaffIds = null;
        formData.todoBelongRoleIds = null;
        resultActionState.notificationConfig = null;
      }
    }

    const staffDeafultOptions = computed(() => resultActionState.todoBelongStaff || []);

    const validateStaff = (rule: any, value: any, callback: Function) => {
      // if (state.inventorForm.isInternal) {
      if (utils.isEmpty(value) && rule.message) {
        return callback(new Error(rule.message));
      }
      return callback();
      // }
      // return callback();
    };

    const messageTemplate = (val: object) => {
      resultActionState.notificationConfig = val || null;
    };
    return {
      ...toRefs(resultActionState),
      processManager,
      getOfficialClaimDetailState,
      updateResultActionState,
      loadingLookups,
      processStage,
      handleSaveClaimAction,
      resultActionForm,
      rules,
      handleCancel,
      validateStaff,
      staffDeafultOptions,
      getRolesState,
      messageTemplate,
      initFormData,
    };
  },
});
</script>

<style lang="scss" scoped>
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
}
</style>
