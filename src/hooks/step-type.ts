import { useClaimTypeInject, useLookupsInject } from '@/context';
import { computed } from '@vue/composition-api';
import useCheckClaimType from './check-claim-type';

export default function useStepType() {
  const { lookups } = useLookupsInject();
  const { isOfficialClaim } = useCheckClaimType();
  const stepTypeLookups = computed(() => lookups.value.filter(lookup => lookup.type === 'STEP_TYPE'));
  const offcialClaimFlowStepType = computed(() => stepTypeLookups.value
    ?.find(lookup => lookup.code === 'OFFICIALACTIONFLOW'));

  const appealedClaimFlowStepType = computed(() => stepTypeLookups.value
    ?.find(lookup => lookup.code === 'INITIATEREQUESTFLOW'));

  const curClaimFlowStepType = computed(() => (isOfficialClaim.value
    ? offcialClaimFlowStepType.value : appealedClaimFlowStepType.value));

  const curClaimFlowStepTypeId = computed(() => curClaimFlowStepType.value?.id);
  return {
    curClaimFlowStepType,
    curClaimFlowStepTypeId,
  };
}
