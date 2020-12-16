import {
  provide, inject, ref, Ref,
} from '@vue/composition-api';
import { AxiosError } from 'axios';
import {
  GET, POST, useAsyncCreator,
} from './common';

export type FirstApplicationContext = {
  fields: Ref<[]>;
  getFields: (url: string) => Promise<void>;
  postPatent: (params: object) => Promise<void>;
  addId: Ref<number>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
};

export const firstApplicationSymbol = Symbol('Symbol for first application');

export function useFirstApplicationProvider() {
  const fields = ref();
  const addId = ref();
  const loading = ref(false);
  const error = ref<AxiosError|null>(null);

  async function getFields(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync(() => GET(url));
    fields.value = data.value;
  }
  async function postPatent(params: object) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync(() => POST('/patent-corp_api/patents/init-patent-progress', params));
    addId.value = data.value;
  }

  provide<FirstApplicationContext>(firstApplicationSymbol, {
    getFields,
    postPatent,
    addId,
    fields,
    loading,
    error,
  });
}

export function useFirstApplicationInject() {
  const firstApplicationStore = inject<FirstApplicationContext>(firstApplicationSymbol);
  if (!firstApplicationStore) {
    throw new Error('Please useFirstApplicationProvider before useFirstApplicationInject!');
  }
  return firstApplicationStore;
}
