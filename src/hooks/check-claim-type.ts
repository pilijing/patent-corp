import { useClaimTypeInject, useLookupsInject } from '@/context';
import { computed } from '@vue/composition-api';

export default function useCheckClaimType() {
  const { curClaimsTypeId } = useClaimTypeInject();
  const { officialClaimTypeId, lookups } = useLookupsInject();
  const isOfficialClaim = computed(() => curClaimsTypeId.value === officialClaimTypeId.value);
  const stepTypeLookups = computed(() => lookups.value.filter(lookup => lookup.type === 'STEP_TYPE'));
  const offcialClaimFlowStepType = computed(() => stepTypeLookups.value
  ?.find(lookup => lookup.code === 'OFFICIALACTIONFLOW'));
  const appealedClaimFlowStepType = computed(() => stepTypeLookups.value
  ?.find(lookup => lookup.code === 'INITIATEREQUESTFLOW'));
  const curClaimFlowStepType = computed(() => (isOfficialClaim.value
    ? offcialClaimFlowStepType.value : appealedClaimFlowStepType.value));
  const curClaimFlowStepTypeId = computed(() => curClaimFlowStepType.value?.id);
  return {
    isOfficialClaim,
    curClaimFlowStepTypeId,
  };
}
