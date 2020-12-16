import {
  Ref, ref, provide, inject,
} from '@vue/composition-api';

export type ClaimTypeContext = {
  curClaimsTypeId: Ref<number | null>;
  curClaimsTaskId: Ref<number | null>;
  setCurClaimsTypeId: (id: number | null) => void;
  setCurClaimsTaskId: (id: number | null) => void;
};

const symbol = Symbol('Symbol for claim type');

export function useClaimTypeProvider() {
  const curClaimsTypeId = ref<number | null>(null);
  const curClaimsTaskId = ref<number | null>(null);
  function setCurClaimsTypeId(id: number | null) {
    curClaimsTypeId.value = id;
  }
  function setCurClaimsTaskId(id: number | null) {
    curClaimsTaskId.value = id;
  }
  provide<ClaimTypeContext>(symbol, {
    curClaimsTypeId,
    setCurClaimsTypeId,
    curClaimsTaskId,
    setCurClaimsTaskId,
  });
}

export function useClaimTypeInject() {
  const store = inject<ClaimTypeContext>(symbol);
  if (!store) {
    throw new Error('error in useClaimTypeInject');
  }
  return store;
}
