<template>
  <div
    class="claim-detail-config"
    v-loading="getOfficialClaimDetailState.loading"
  >
    <basic-config></basic-config>
    <claim-property-field></claim-property-field>
    <claim-result-action></claim-result-action>
    <enter-defense-flow></enter-defense-flow>
  </div>
</template>

<script lang='ts'>
import {
  defineComponent, onMounted, ref, watch,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context/lookup';
import { useOfficialClaimDetailInject } from '@/context';
import useCheckClaimType from '@/hooks/check-claim-type';
import BasicConfig from './basic-config.vue';
import ClaimPropertyField from './claim-property-field.vue';
import ClaimResultAction from './claim-result-action.vue';
import EnterDefenseFlow from './enter-defense-flow';

export default defineComponent({
  name: 'ClaimDetailConfig',
  props: {
    selectedOfficialClaimId: Number,
    selectedAppealedClaimId: Number,
  },
  components: {
    BasicConfig,
    ClaimPropertyField,
    ClaimResultAction,
    EnterDefenseFlow,
  },
  setup(props) {
    const claimDetailConfig = ref({});
    const {
      lookups, loading, error, getLookups,
    } = useLookupsInject();
    const {
      getOfficialClaimDetail,
      getOfficialClaimDetailState,
    } = useOfficialClaimDetailInject();

    const { isOfficialClaim } = useCheckClaimType();

    onMounted(async () => {
      if (lookups.value.length === 0) {
        await getLookups();
      }
      if (isOfficialClaim && props.selectedOfficialClaimId) {
        await getOfficialClaimDetail(props.selectedOfficialClaimId);
      } else if (props.selectedAppealedClaimId) {
        await getOfficialClaimDetail(props.selectedAppealedClaimId);
      }
    });

    // get detail of the official claim when the id changes
    watch(
      () => props.selectedOfficialClaimId,
      async (selectedOfficialClaimId) => {
        if (selectedOfficialClaimId) {
          await getOfficialClaimDetail(selectedOfficialClaimId);
        }
      },
    );
    watch(
      () => props.selectedAppealedClaimId,
      async (selectedAppealedClaimId) => {
        if (selectedAppealedClaimId) {
          await getOfficialClaimDetail(selectedAppealedClaimId);
        }
      },
    );

    watch(isOfficialClaim, async (isOfficial) => {
      if (isOfficial && props.selectedOfficialClaimId) {
        await getOfficialClaimDetail(props.selectedOfficialClaimId);
      } else if (!isOfficial && props.selectedAppealedClaimId) {
        await getOfficialClaimDetail(props.selectedAppealedClaimId);
      }
    });

    return {
      claimDetailConfig,
      loading,
      error,
      lookups,
      // loadingDetail,
      // errorInGettingDetail,
      getOfficialClaimDetailState,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
