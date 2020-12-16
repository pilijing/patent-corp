import { OfficialClaimBasic } from '@/types/claim-detail';
import { CommonState, RemoteData } from '@/types/common';
import {
  provide, inject, reactive, computed, ComputedRef,
} from '@vue/composition-api';
import {
  GET, initialState, useAsyncV2, useAsyncV3,
} from './common';

export type OfficialClaimsContext = {
  getOfficialClaimListState: CommonState<RemoteData<OfficialClaimBasic>[]>;
  getOfficialClaimList: (processId: number, processStageId: number, claimsType: number) => void;
  processId: ComputedRef<number | null>;
};

export const officialClaimsSymbol = Symbol('Symbol for official Claimss');

export function useOfficialClaimsProvider() {
  const getOfficialClaimListState = reactive<CommonState<RemoteData<OfficialClaimBasic>[]>>({
    ...initialState(),
    data: [],
  });

  async function getOfficialClaimList(
    processId: number,
    processStageId: number,
    claimsType: number,
  ) {
    // await useAsyncV2(
    //   getOfficialClaimListState,
    //   () => getRemoteClaimsList(processId, processStageId, claimsType),
    //   {
    //     failureMessage: '获取来文列表失败',
    //     useRemoteFirst: true,
    //   },
    // );
    const result = await useAsyncV3(
      getOfficialClaimListState,
      () => getRemoteClaimsList(processId, processStageId, claimsType),
      {
        failureMessage: '获取来文列表失败',
        useRemoteFirst: true,
      },
    );
    getOfficialClaimListState.data = result || [];
  }

  async function getRemoteClaimsList(
    processId: number,
    processStageId: number,
    claimsType: number,
  ) {
    const response = await GET<RemoteData<OfficialClaimBasic>[]>('/patent-corp_api/stage-claims-list', {
      processId,
      processStageId,
      claimsType,
    });
    return response;
  }

  const processId = computed(() => {
    const claimList = getOfficialClaimListState.data;
    if (Array.isArray(claimList) && claimList.length > 0) {
      return claimList[0].processId;
    }
    return null;
  });

  provide<OfficialClaimsContext>(officialClaimsSymbol, {
    getOfficialClaimListState,
    getOfficialClaimList,
    processId,
  });
}

export function useOfficialClaimsInject() {
  const officialClaimsStore = inject<OfficialClaimsContext>(officialClaimsSymbol);
  if (!officialClaimsStore) {
    throw new Error('Please useOfficialClaimsProvider before useOfficialClaims!');
  }
  return officialClaimsStore;
}
