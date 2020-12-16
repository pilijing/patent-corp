<template>
  <div class="official-event">
    <el-container>
      <el-aside width="136px">
        <claims-selection
          :process-id="processId"
          @update:switch="handleClaimsSelection"
          :claimTypeId="claimTypeId"
        ></claims-selection>
      </el-aside>
      <el-main>
        <claim-detail-config
          :selectedOfficialClaimId="selectedOfficialClaimId"
          :selectedAppealedClaimId="selectedAppealedClaimId"
          :claimTaskId="claimTaskId"
          v-if="displayClaimDetailConfig"
        ></claim-detail-config>
      </el-main>
    </el-container>
  </div>
</template>

<script lang='ts'>
import {
  computed, defineComponent, provide, ref,
} from '@vue/composition-api';
import useCheckClaimType from '@/hooks/check-claim-type';
import ClaimsSelection from './claims-selection.vue';
import ClaimDetailConfig from './claim-detail-config';

export default defineComponent({
  name: 'OfficialClaim',
  props: {
    processId: Number,
    claimTypeId: Number,
    claimTaskId: Number,
  },
  components: { ClaimsSelection, ClaimDetailConfig },
  setup(props) {
    provide('claimTaskId', props.claimTaskId);
    const selectedOfficialClaimId = ref<number | null>(null);
    const selectedAppealedClaimId = ref<number | null>(null);
    const parentStageClaimsId = ref<number | null>(null);
    const { isOfficialClaim } = useCheckClaimType();

    const updateParentStageClaimsId = (val: number) => {
      parentStageClaimsId.value = val;
    };
    provide('parentStageClaimsId', parentStageClaimsId);

    function handleClaimsSelection(activeMenu: number) {
      updateParentStageClaimsId(activeMenu);
      if (isOfficialClaim.value) {
        selectedOfficialClaimId.value = activeMenu;
      } else {
        selectedAppealedClaimId.value = activeMenu;
      }
    }

    const displayClaimDetailConfig = computed(() => {
      if (isOfficialClaim.value) {
        return selectedOfficialClaimId.value !== null;
      }
      return selectedAppealedClaimId.value !== null;
    });
    return {
      handleClaimsSelection,
      selectedOfficialClaimId,
      selectedAppealedClaimId,
      displayClaimDetailConfig,
      isOfficialClaim,
    };
  },
});
</script>

<style lang="scss" scoped>
.el-container {
  border: 1px solid #dcdfe6;
  min-height: 600px;
}
.el-aside {
  border-right: 1px solid #dcdfe6;
}
// .official-event{
//   min-height: 500px;
// }
</style>
