<template>
  <div class="claim-property-field">
    <property-field
      :fieldTableData="fieldTableData"
      @reorder-cancel="handleReorderCancel"
      @reorder-submit="handleReorderSubmit"
      @dialog-add-confirm="handleDialogAddConfirm"
      @dialog-update-confirm="handleDialogUpdateConfirm"
      :updateLoading="updateClaimFieldState.loading"
      :addLoading="addClaimFieldState.loading"
      @delete-confirm="handleDeleteConfirm"
      :deleteLoading="deleteClaimFieldState.loading"
      :pageTitle="isOfficialClaim ? '来文属性字段' : '请求属性字段'"
      style="margin-top: 10px"
    ></property-field>
  </div>
</template>

<script lang='ts'>
import { useOfficialClaimDetailInject } from '@/context';
import useCheckClaimType from '@/hooks/check-claim-type';
import { computed, defineComponent } from '@vue/composition-api';
import { Message } from 'element-ui';
import PropertyField from '@/views/pages/backstage-management/blocks/property-field.vue';

export default defineComponent({
  name: 'ClaimPropertyField',

  components: {
    PropertyField,
  },
  setup(props, context) {
    const {
      getOfficialClaimDetail,
      getOfficialClaimDetailState: getDetailState,
      reorderStageClaimsFieldsState,
      reorderStageClaimsFields,
      addClaimField,
      addClaimFieldState,
      updateClaimField,
      updateClaimFieldState,
      deleteClaimField,
      deleteClaimFieldState,
      setIsPropertyFieldDialogVisible,
    } = useOfficialClaimDetailInject();
    const { root } = context;
    const { $message } = root;
    const stageClaimsId = computed(() => getDetailState.data.id);
    const fieldTableData = computed(() => (getDetailState.data.stageClaimsFields || [])
      .slice()
      .sort((a, b) => a.priority - b.priority));

    function handleReorderCancel() {
      if (stageClaimsId.value) {
        getOfficialClaimDetail(stageClaimsId.value);
      }
    }
    async function handleReorderSubmit() {
      if (!stageClaimsId.value) {
        Message.error('找不到来文ID');
        return;
      }
      const sortedFieldIds = fieldTableData.value.map(item => item.id);
      if (!getDetailState.data.id) {
        Message.error('获取来文ID失败');
        return;
      }
      await reorderStageClaimsFields(getDetailState.data.id, sortedFieldIds);
      if (reorderStageClaimsFieldsState.error !== null) {
        return;
      }
      getOfficialClaimDetail(stageClaimsId.value);
    }
    async function handleDialogAddConfirm(rowData: any) {
      if (!stageClaimsId.value) {
        Message.error('找不到来文ID');
        return;
      }
      await addClaimField({
        ...rowData,
        stageClaimsId: stageClaimsId.value,
      });
      if (addClaimFieldState.error !== null) {
        // dialog 的错误信息需要使用 $message
        $message.error(addClaimFieldState.error?.response?.data);
        return;
      }
      // 添加或更新成功之后重新获取来文详情
      getOfficialClaimDetail(stageClaimsId.value);
      setIsPropertyFieldDialogVisible(false);
    }
    async function handleDialogUpdateConfirm(rowData: any) {
      if (!stageClaimsId.value) {
        Message.error('找不到来文ID');
        return;
      }

      await updateClaimField({
        ...rowData,
        stageClaimsId: stageClaimsId.value,
      });
      if (updateClaimFieldState.error !== null) {
        $message.error(updateClaimFieldState.error?.response?.data);
        return;
      }

      // 添加或更新成功之后重新获取来文详情
      getOfficialClaimDetail(stageClaimsId.value);
      setIsPropertyFieldDialogVisible(false);
    }
    async function handleDeleteConfirm(curPropertyFieldId: any) {
      await deleteClaimField(curPropertyFieldId);
      if (deleteClaimFieldState.error !== null) {
        $message.error(deleteClaimFieldState.error?.response?.data);
        return;
      }
      if (deleteClaimFieldState.error === null) {
        const claimId = getDetailState.data.id;
        if (!claimId) {
          Message.error('找不到来文ID');
          return;
        }
        getOfficialClaimDetail(claimId);
      }
    }
    const { isOfficialClaim } = useCheckClaimType();

    return {
      fieldTableData,
      handleReorderCancel,
      handleReorderSubmit,
      handleDialogAddConfirm,
      handleDialogUpdateConfirm,
      handleDeleteConfirm,
      getDetailState,
      reorderStageClaimsFieldsState,
      addClaimFieldState,
      updateClaimFieldState,
      deleteClaimFieldState,
      isOfficialClaim,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
