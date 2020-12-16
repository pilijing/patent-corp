import {
  ref, provide, inject, Ref,
} from '@vue/composition-api';
import { AxiosError } from 'axios';
import { GET, useAsyncCreator } from './common';

interface Region {
  code: string; // 'AD';
  englishName: string; //  'Andorra';
  id: number; // 1;
  isPopular: number; // 0;
  name: string; //  '安道尔共和国';
}

interface RegionContext {
  regions: Ref<Region[]>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
  setRegions: (regions: Region[]) => void;
  getRegions: () => void;
  getRegionName: (code: string) => string | undefined;
  getRegionEnglishName: (code: string) => string | undefined;
}

export const regionSymbol = Symbol('Symbol for regions');

async function getRemoteRegions() {
  const data = await GET<Region[] | null>('/patent-corp_api/regions');
  return data || [];
}

export function useRegionsProvider() {
  const regions = ref<Region[]>([]);
  const loading = ref(false);
  const error = ref(null);

  function setRegions(newRegions: Region[]) {
    regions.value = newRegions;
  }
  async function getRegions() {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<Region[]>(() => getRemoteRegions());
    if (data.value) {
      setRegions(data.value);
    }
  }
  function getRegionName(code: string) {
    return regions.value.find(region => region.code === code)?.name;
  }
  function getRegionEnglishName(code: string) {
    return regions.value.find(region => region.code === code)?.englishName;
  }

  provide<RegionContext>(regionSymbol, {
    regions,
    loading,
    error,
    setRegions,
    getRegions,
    getRegionName,
    getRegionEnglishName,
  });
}

export function useRegionsInject() {
  const store = inject<RegionContext>(regionSymbol);
  if (!store) {
    throw new Error('Please useRegionsProvider before useRegionsInject!');
  }
  return store;
}
