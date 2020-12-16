import { CommonState } from '@/types/common';
import { reactive, provide, inject } from '@vue/composition-api';
import { GET, initialState, useAsyncV3 } from './common';

const symbol = Symbol('Symbol for roles');

type RemoteDomains = Domains[];
type Domains = {
  id: number; // 1;
  name: string; // '测试领域';
};
type DomainsContext = {
  getDomainsState: CommonState<Domains[]>;
  getDomains: () => void;
  getDomainName: (id: string | number | null) => string | null;
};
async function getDomainsData() {
  const result = await GET<RemoteDomains | null>('/patent-corp_api/domains/search?limit=0&offset=0');
  return result || [];
}

export function useDomainsProvider() {
  const getDomainsState = reactive({ ...initialState(), data: [] as Domains[] });
  async function getDomains() {
    const result = await useAsyncV3(getDomainsState, () => getDomainsData());
    getDomainsState.data = result || [];
  }

  function getDomainName(id: number | string | null) {
    return getDomainsState.data.find(item => item.id === Number(id))?.name || null;
  }

  provide<DomainsContext>(symbol, {
    getDomains,
    getDomainsState,
    getDomainName,
  });
}

export function useDomainsInject() {
  const stroe = inject<DomainsContext>(symbol);
  if (!stroe) {
    throw new Error('error in useDomainsInject');
  }
  return stroe;
}
