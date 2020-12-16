<template>
  <div class="step-result-action-view">
    <descriptions
      style="padding-left: 20px;"
      :label-width="140"
      :column="1"
    >
      <el-row>
        <descriptions-item label="是否阻塞性步骤">
          {{ state.isBlockStepText }}</descriptions-item
        >
      </el-row>
      <el-row>
        <descriptions-item label="并行步骤">{{
          state.simultaneousStepsText
        }}</descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="并行步骤完成方式">{{
          state.simulStepFinishTypeText
        }}</descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="完成方式">{{
          state.finishTypeText
        }}</descriptions-item>
      </el-row>
      <el-row v-if="isSubmitToFinish">
        <descriptions-item label="完成后"> </descriptions-item>
        <step-result-view-table
          :step-result="stepResultSetting.stepResult"
        ></step-result-view-table>
      </el-row>

      <el-row v-if="isBasedOnField">
        <descriptions-item label="步骤结果字段">{{
          state.stepResultFieldText
        }}</descriptions-item>
      </el-row>
      <el-row v-if="isBasedOnField">
        <descriptions-item label="步骤可能结果"> </descriptions-item>
        <step-result-view-table
          :step-result="stepResultSetting.stepResult"
           :is-based-on-field="true"
        ></step-result-view-table>
      </el-row>
    </descriptions>
  </div>
</template>

<script lang="ts">
import { useLookupsInject, useStageStep } from '@/context';
import { StepResultSetting } from '@/types/step-result-setting';
import { computed, defineComponent } from '@vue/composition-api';
import StepResultViewTable from './step-result-view-table.vue';

export default defineComponent({
  name: 'StepResultSettingView',
  components: { StepResultViewTable },
  setup() {
    const { getStepDetailState } = useStageStep();
    const stepResultSetting = computed(() => getStepDetailState.data.stepResultSetting);
    const state = computed(() => ({
      isBlockStepText: getIsBlockStepText(stepResultSetting.value),
      simultaneousStepsText: getSimultaneousStepsText(stepResultSetting.value),
      simulStepFinishTypeText: getSimulStepFinishTypeText(stepResultSetting.value),
      finishTypeText: getFinishTypeText(stepResultSetting.value),
      stepResultFieldText: getStepResultFieldText(stepResultSetting.value),
    }));

    function getIsBlockStepText(resultSetting: StepResultSetting | null) {
      if (resultSetting === null) return '--';
      if (resultSetting.isBlockStep === null) return '--';
      if (resultSetting.isBlockStep === true) return '是';
      if (resultSetting.isBlockStep === false) return '否';
      return '--';
    }
    const { stageStepList } = useStageStep();
    function getSimultaneousStepsText(resultSetting: StepResultSetting | null) {
      if (resultSetting === null) return '--';
      if (resultSetting.simultaneousSteps === null) return '--';
      const simulStepIds = resultSetting.simultaneousSteps;
      if (Array.isArray(simulStepIds) && simulStepIds.length > 0) {
        return simulStepIds
          .map(id => stageStepList.value.find(step => step?.id === Number(id))?.name)
          .filter(name => typeof name === 'string')
          .join('; ');
      }
      return '--';
    }
    const { getTypeName } = useLookupsInject();
    function getSimulStepFinishTypeText(resultSetting: StepResultSetting | null) {
      if (resultSetting === null) return '--';
      if (resultSetting.simulStepFinishType === null) return '--';
      const name = getTypeName(resultSetting.simulStepFinishType);
      if (name) return name;
      return '--';
    }
    function getFinishTypeText(resultSetting: StepResultSetting | null) {
      if (resultSetting === null) return '--';
      if (resultSetting.finishType === null) return '--';
      const name = getTypeName(resultSetting.finishType);
      if (name) return name;
      return '--';
    }

    function getStepResultFieldText(resultSetting: StepResultSetting | null) {
      if (resultSetting === null) return '--';
      // 通过选项“选择字段作为步骤结果”选择的字段 id 拿到对应的字段名称

      const curField = getStepDetailState.data.stageStepFields?.find(
        field => field.id === resultSetting.stepResultField
      );
      return curField?.name || '--';
    }

    // 完成方式 为 提交完成
    const isSubmitToFinish = computed(() => stepResultSetting.value?.finishType === 3920);
    // 完成方式 为 以字段选项为结果
    const isBasedOnField = computed(() => stepResultSetting.value?.finishType === 3921);

    return {
      state,
      isSubmitToFinish,
      isBasedOnField,
      stepResultSetting,
    };
  },
});
</script>

<style lang="scss" scoped></style>
