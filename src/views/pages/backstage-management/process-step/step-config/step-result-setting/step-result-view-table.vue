<template>
  <div class="step-result-view-table">
    <el-table :data="stepResult" border style="width: 100%">
      <el-table-column fixed prop="stepResultId" label="步骤结果">
        <template #default="{ row }">
          {{ row.stepResultId !== null ? getTypeName(row.stepResultId) : "--" }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isBasedOnField"
        prop="fieldValue"
        label="对应字段值选项"
        width="120"
      >
        <template #default="{ row }">
          {{ getFieldValueText(row) }}
        </template>
      </el-table-column>
      <el-table-column label="是否保留当前不变" width="140">
        <template #default="{ row }">
          {{ row.isInCurrent !== null ? (row.isInCurrent ? "是" : "否") : "--" }}
        </template>
      </el-table-column>
      <el-table-column label="是否结项" width="120">
        <template #default="{ row }">
          {{ row.isEnd !== null ? (row.isEnd ? "是" : "否") : "--" }}
        </template>
      </el-table-column>
      <el-table-column label="进入其他步骤" width="120">
        <template #default="{ row }">
          {{ getEnterOtherStepText(row.nextStageId, row.nextStepId) }}
        </template>
      </el-table-column>
      <el-table-column label="是否更新专利状态" width="120">
        <template #default="{ row }">
          {{ row.isChangePatentState !== null ? (row.isChangePatentState ? "是" : "否") : "--" }}
        </template>
      </el-table-column>
      <el-table-column label="更新专利状态至" width="120">
        <template #default="{ row }">
          {{ getTypeName(row.changePatentState) }}
        </template>
      </el-table-column>
      <el-table-column label="邮件收件人">
        <template #default="{ row }">
          {{ getRecipientsText(row) }}
        </template>
      </el-table-column>
      <el-table-column label="邮件抄送人">
        <template #default="{ row }">
          {{ getCopyToNames(row) }}
        </template>
      </el-table-column>
      <el-table-column label="邮件内容模板">
        <template #default="{ row }">
          {{ getEmailTemplateText(row) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang='ts'>
import {
  useLookupsInject,
  useRolesInject,
  useStageStep,
  useStepResultSettingInject,
} from '@/context';
import { StepResult } from '@/types/step-result-setting';
import { getNameFromCascadeList } from '@/utils';
import {
  computed,
  defineComponent,
  onMounted,
  watch,
} from '@vue/composition-api';

type Props = {
  stepResult: StepResult[];
  isBasedOnField: boolean;
};
export default defineComponent({
  name: 'StepResultViewTable',
  props: { stepResult: Array, isBasedOnField: Boolean },
  setup() {
    // const state = reactive({
    //   tableData: props.stepResult,
    // });
    const { getTypeName } = useLookupsInject();
    const { getRoleName } = useRolesInject();
    //  邮件接收人
    function getRecipientsText(stepResult: StepResult) {
      const { notificationConfig } = stepResult;
      if (!notificationConfig) return '--';
      const {
        recipientStaff,
        recipientPeopleIds,
        recipientRoleIds,
      } = notificationConfig;
      const recipientNames: string[] = [];
      if (recipientPeopleIds) {
        recipientPeopleIds.forEach((id) => {
          const peopleName = getTypeName(id);
          if (peopleName) {
            recipientNames.push(peopleName);
          }
        });
      }
      if (recipientRoleIds) {
        recipientRoleIds.forEach((id) => {
          const roleName = getRoleName(id);
          if (roleName) {
            recipientNames.push(roleName);
          }
        });
      }
      if (recipientStaff) {
        recipientStaff.forEach(staffInfo => recipientNames.push(staffInfo.staffFullName));
      }
      return recipientNames.toString();
    }
    // 邮件抄送人
    function getCopyToNames(stepResult: StepResult) {
      const { notificationConfig } = stepResult;
      if (!notificationConfig) return '--';
      const { copyPeopleIds, copyRoleIds, copyStaff } = notificationConfig;
      const copyNames: string[] = [];
      if (copyPeopleIds) {
        copyPeopleIds.forEach((id) => {
          const peopleName = getTypeName(id);
          if (peopleName) {
            copyNames.push(peopleName);
          }
        });
      }
      if (copyRoleIds) {
        copyRoleIds.forEach((id) => {
          const roleName = getRoleName(id);
          if (roleName) {
            copyNames.push(roleName);
          }
        });
      }
      if (copyStaff) {
        copyStaff.forEach(staffInfo => copyNames.push(staffInfo.staffFullName));
      }
      return copyNames.toString();
    }
    // 进入其他步骤
    const {
      getStageStepTreeState,
      getStageStepTree,
    } = useStepResultSettingInject();
    // TODO: refactor: use hooks to abstruct similar logic in step-result-setting.vue
    const { getStepDetailState } = useStageStep();
    const processId = computed(() => getStepDetailState.data.processId);
    onMounted(async () => {
      if (processId.value !== null && getStageStepTreeState.data.length === 0) {
        await getStageStepTree(processId.value);
      }
    });
    watch(processId, (id: number | null) => {
      if (id !== null) {
        getStageStepTree(id);
      }
    });

    function getEnterOtherStepText(
      stageId: number | null,
      stepId: number | null,
    ) {
      if (!stageId || !stepId) return '--';

      return `${getNameFromCascadeList(
        getStageStepTreeState.data,
        stageId,
      )}-${getNameFromCascadeList(getStageStepTreeState.data, stepId)}`;
    }
    function getEmailTemplateText(stepResult: StepResult) {
      return stepResult?.notificationConfig?.messageTemplate?.name || '--';
    }
    function getFieldValueText(row: any) {
      if (row.fieldValue) {
        const data = JSON.parse(row.fieldValue);
        if (Array.isArray(data)) {
          const typeNames = data.map(item => getTypeName(item));
          return typeNames.join(';');
        }
      }

      return '--';
    }
    return {
      // ...toRefs(state),
      getRecipientsText,
      getFieldValueText,
      getCopyToNames,
      getTypeName,
      getEnterOtherStepText,
      getEmailTemplateText,
    };
  },
});
</script>
