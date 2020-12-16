<template>
  <div class="claim-property-field">
    <property-field
      :fieldTableData="fieldTableData"
      @reorder-cancel="handleReorderCancel"
      @reorder-submit="handleReorderSubmit"
      @dialog-add-confirm="handleDialogAddConfirm"
      @dialog-update-confirm="handleDialogUpdateConfirm"
      :updateLoading="updateStepFieldState.loading"
      :addLoading="addStepFieldState.loading"
      @delete-confirm="handleDeleteConfirm"
      :deleteLoading="deleteStepFieldState.loading"
      pageTitle="步骤属性字段"
      style="margin-top: 10px"
    ></property-field>
  </div>
</template>

<script lang='ts'>
import {
  useOfficialClaimDetailInject,
  useStageStep,
  useStepPropertyFieldInject,
} from '@/context';
import { computed, defineComponent } from '@vue/composition-api';
import { Message } from 'element-ui';
import PropertyField from '@/views/pages/backstage-management/blocks/property-field.vue';

export default defineComponent({
  name: 'StepPropertyField',

  components: {
    PropertyField,
  },
  setup(props, { root }) {
    const {
      addStepField,
      addStepFieldState,
      reorderStepFields,
      reorderStepFieldsState,
      updateStepField,
      updateStepFieldState,
      deleteStepField,
      deleteStepFieldState,
    } = useStepPropertyFieldInject();
    const { setIsPropertyFieldDialogVisible } = useOfficialClaimDetailInject();
    const { getStepDetail, getStepDetailState } = useStageStep();
    const stepId = computed(() => getStepDetailState.data.id);
    const fieldTableData = computed(() => (getStepDetailState.data.stageStepFields || [])
      .slice()
      .sort((a, b) => a.priority - b.priority));
    const { $message } = root;
    function handleReorderCancel() {
      if (stepId.value) {
        getStepDetail(stepId.value);
      }
    }
    async function handleReorderSubmit() {
      if (!stepId.value) {
        Message.error('找不到步骤ID');
        return;
      }
      const fieldIds = fieldTableData.value.map(item => item.id);

      await reorderStepFields(stepId.value, fieldIds as number[]);
      if (reorderStepFieldsState.error !== null) {
        $message.error(reorderStepFieldsState.error?.response?.data);
        return;
      }

      getStepDetail(stepId.value);
    }
    async function handleDialogAddConfirm(rowData: any) {
      if (!stepId.value) {
        Message.error('找不到步骤ID');
        return;
      }
      await addStepField({
        ...rowData,
        stageStepId: stepId.value,
      });
      if (addStepFieldState.error !== null) {
        $message.error(addStepFieldState.error?.response?.data);
        return;
      }
      $message.success('新增步骤属性字段成功');
      // 添加或更新成功之后重新获取来文详情
      getStepDetail(stepId.value);
      setIsPropertyFieldDialogVisible(false);
    }
    async function handleDialogUpdateConfirm(rowData: any) {
      if (!stepId.value) {
        Message.error('找不到步骤ID');
        return;
      }

      await updateStepField({
        ...rowData,
        stageStepId: stepId.value,
      });
      if (updateStepFieldState.error !== null) {
        $message.error(updateStepFieldState.error?.response?.data);
        return;
      }
      $message.success('更新步骤属性字段成功');
      // 添加或更新成功之后重新获取来文详情
      getStepDetail(stepId.value);
      setIsPropertyFieldDialogVisible(false);
    }
    async function handleDeleteConfirm(curPropertyFieldId: any) {
      if (!stepId.value) {
        Message.error('找不到步骤ID');
        return;
      }
      await deleteStepField(stepId.value, curPropertyFieldId);

      if (deleteStepFieldState.error !== null) {
        $message.error(deleteStepFieldState.error?.response?.data);
        return;
      }
      $message.success('删除步骤属性字段成功');
      getStepDetail(stepId.value);
    }

    return {
      fieldTableData,
      handleReorderCancel,
      handleReorderSubmit,
      handleDialogAddConfirm,
      handleDialogUpdateConfirm,
      handleDeleteConfirm,
      addStepFieldState,
      reorderStepFieldsState,
      updateStepFieldState,
      deleteStepFieldState,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
