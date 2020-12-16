import { CommonState } from '@/types/common';
import {
  Ref, ref, provide, inject, reactive,
} from '@vue/composition-api';
import { AxiosError } from 'axios';

import {
  GET, POST, PUT, DELETE, useAsyncCreator, initialState, useAsyncV3,
} from './common';

export type GetStageField = {
  englishName: string | null; //  'Initial Date';
  id: number | null; // 89;
  inputType: string | null; // '90001';
  isReadOnly: boolean | null; // true;
  isVisible: boolean | null; // true;
  name: string | null; // '立项时间';
  type: string | null; // '类型';
};
export type PostStageField = {
  englishName: string;
  name: string;
  inputType: any;
  isReadOnly: boolean;
  isVisible: boolean;
};
export type PutStageField = {
  englishName: string;
  name: string;
  inputType: any;
  isReadOnly: boolean;
  isVisible: boolean;
};
export type PutOfficialStage = {
  id: number| undefined;
  officialStage: any;
};

export type StageFieldsContext = {
  stageFields: Ref<GetStageField[]>;
  getStageField: (url: string) => Promise<void>;
  addStageField: (url: string, params: PostStageField) => Promise<void>;
  editStageField: (url: string, params: PostStageField) => Promise<void>;
  deleteStageField: (url: string) => Promise<void>;
  sortStageField: (url: string, params: any) => Promise<void>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
  getStageFieldName: (id: number) => string;
  addStageFieldState: CommonState<any>;
  editOfficialStageField: (url: string, params: PutOfficialStage) => Promise<void>;
};

export const stageFieldSymbol = Symbol('Symbol for stage field');

async function getRemoteStageField(url: string) {
  return GET<GetStageField[]>(url);
}
async function addRemoteStageField(url: string, data?: PostStageField) {
  return POST<{}, PostStageField>(url, data);
}
async function editRemoteStageFielde(url: string, data?: PutStageField) {
  return PUT<{}, PutStageField>(url, data);
}
async function deleteRemoteStageField(url: string) {
  return DELETE(url);
}
async function sortRemoteStageField(url: string, data?: object) {
  return PUT<{}, object>(url, data);
}
async function editRemoteOfficialStage(url: string, data?: object) {
  return PUT<{}, object>(url, data);
}

export function useStageFieldsProvider() {
  const stageFields = ref<GetStageField[]>([]);
  const loading = ref(false);
  const error = ref<AxiosError | null>(null);
  const adding = ref(false);
  const errorInAdding = ref<AxiosError | null>(null);
  function setStageField(newStageField: GetStageField[]) {
    stageFields.value = newStageField;
  }
  // // get
  async function getStageField(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<GetStageField[]>(() => getRemoteStageField(url));
    setStageField(data.value || []);
  }

  // // post
  // async function addStageField(url: string, data?: PostStageField) {
  //   const useAsync = useAsyncCreator(adding, errorInAdding);
  //   await useAsync(() => addRemoteStageField(url, data));
  // }
  const addStageFieldState = reactive(initialState());
  async function addStageField(url: string, data?: PostStageField) {
    await useAsyncV3(addStageFieldState, () => addRemoteStageField(url, data));
  }

  // // put
  async function editStageField(url: string, data?: PutStageField) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => editRemoteStageFielde(url, data));
  }
  // delete
  async function deleteStageField(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => deleteRemoteStageField(url));
  }
  // sort
  async function sortStageField(url: string, data?: any) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => sortRemoteStageField(url, data));
  }

  function getStageFieldName(id: number) {
    return stageFields.value.find(stage => stage.id === id)?.name ?? '';
  }

  async function editOfficialStageField(url: string, data?: PutOfficialStage) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => editRemoteOfficialStage(url, data));
  }

  provide<StageFieldsContext>(stageFieldSymbol, {
    getStageField,
    addStageField,
    editStageField,
    deleteStageField,
    sortStageField,
    stageFields,
    addStageFieldState,
    loading,
    error,
    getStageFieldName,
    editOfficialStageField,
  });
}
export function useStageFieldsInject() {
  const stageFieldsStore = inject<StageFieldsContext>(stageFieldSymbol);
  if (!stageFieldsStore) {
    throw new Error('Please useStageFieldsProvider before useStageFieldsInject!');
  }
  return stageFieldsStore;
}
