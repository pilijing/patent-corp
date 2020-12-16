import {
  Ref, ref, provide, inject,
} from '@vue/composition-api';
import { GET, useAsyncCreator } from './common';

export type claimsType = {
      id: number; // 7,
      group: string; //  1,
      isEnabled: number; //  1,
      order: number; // 0,
      name: string; //  '测试',
      code: string;//  'ceshi';
      type: string;// '1';
  };

export type RemoteClaimsType = {
      id: null | number; // 7,
      group: null | string; //  1,
      isEnabled: null | number; //  1,
      order: null | number; // 0,
      name: null | string; //  '测试',
      code: null | string;//  'ceshi';
      type: null | string;// '1';
  }

    type RemoteResult = {
      code: number | null;// 200,
    //   total: number | null;// 2,
      results: RemoteClaimsType[] | null;
  }

export type ClaimsTypeContext = {
  claimsTypeList: Ref<claimsType[]>;
      setClaimsTypeList: (Claimss: claimsType[]) => void;
      getType: () => Promise<void>;
      loading: Ref<boolean>;
      error: Error | Ref<null>;

  };

export const ClaimsTypeSymbol = Symbol('Symbol for claims type');

// a mock function to get remote data
async function getRemoteTypeList(): Promise<RemoteClaimsType[]> {
  // real usage:
  // {type:'APPLY_TYPE'}
  const response = await GET<RemoteResult>('/patent-corp_api/lookups');
  return response.results || [];
}

//
function processRemoteTypeList(remoteTypeList: RemoteClaimsType[]): claimsType[] {
  return remoteTypeList.map(remoteType => ({
    id: remoteType.id ?? 0,
    group: remoteType.group ?? '', // TODO: 与后端沟通，确定逻辑
    isEnabled: remoteType.isEnabled ?? 0, //  1,
    order: remoteType.order ?? 0, // 0,
    name: remoteType.name ?? '', //  '测试',
    code: remoteType.code ?? '', //  'ceshi';
    type: remoteType.type ?? '', // '1';
  }));
}

export function useClaimsTypeProvider() {
  const claimsTypeList = ref<claimsType[]>([]);
  const loading = ref(false);
  const error = ref(null);

  function setClaimsTypeList(Claimss: claimsType[]) {
    claimsTypeList.value = Claimss;
  }

  async function getType() {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<claimsType[]>(async () => {
      const remoteData = await getRemoteTypeList();
      return processRemoteTypeList(remoteData);
    });
    setClaimsTypeList(data.value || []);
  }

  provide<ClaimsTypeContext>(ClaimsTypeSymbol, {
    claimsTypeList,
    setClaimsTypeList,
    getType,
    loading,
    error,
  });
}

export function useClaimsTypes() {
  const claimsStore = inject<ClaimsTypeContext>(ClaimsTypeSymbol);
  if (!claimsStore) {
    throw new Error('Please useClaimsTypes before useClaimsType!');
  }
  return claimsStore;
}
