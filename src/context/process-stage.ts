import { CommonState } from '@/types/common';
import {
  Ref, ref, provide, inject, reactive,
} from '@vue/composition-api';
import { AxiosError } from 'axios';
import {
  GET, POST, PUT, DELETE, useAsyncCreator, initialState, useAsyncV3,
} from './common';
import { PostStageField } from './stage-fields';

export type GetProcessStage = {
  createdAtUtc: string;
  createdBy: string;
  englishName: string;
  id: number;
  name: string;
  priority: number;
  processId: number;
  updatedAtUtc: string;
  updatedBy: string;
}
export type PostProcessStage = {
  processId: number;
  englishName: string;
  name: string;
}
export type PutProcessStage = {
  id: number;
  englishName: string;
  name: string;
}
export type ProcessStageContext = {
  processStage: Ref<GetProcessStage[]>;
  getProcessStage: (url: string) => Promise<void>;
  addProcessStage: (url: string, params: PostProcessStage) => Promise<void>;
  editProcessStage: (url: string, params: PutProcessStage) => Promise<void>;
  deleteProcessStage: (url: string) => Promise<void>;
  sortProcessStage: (url: string, params: any) => Promise<void>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
  getStageName: (id: number) => string | undefined;
  addProcessStageState: CommonState<any>;
};

export const processStageSymbol = Symbol('Symbol for process stage');

async function getRemoteProcessStage(url: string) {
  console.log(url);
  return GET<GetProcessStage[]>(url);
}
async function addRemoteProcessStage(url: string, data?: PostProcessStage) {
  return POST<{}, PostProcessStage>(url, data);
}
async function editRemoteProcessStage(url: string, data?: PutProcessStage) {
  return PUT<{}, PutProcessStage>(url, data);
}
async function deleteRemoteProcessStage(url: string) {
  return DELETE(url);
}
async function sortRemoteProcessStage(url: string, data?: any) {
  return PUT<{}, any>(url, data);
}

export function useProcessStageProvider() {
  const processStage = ref<GetProcessStage[]>([]);
  const loading = ref(false);
  const error = ref(null);
  function setProcessStage(newProcessStage: GetProcessStage[]) {
    processStage.value = newProcessStage;
  }
  // get
  async function getProcessStage(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<GetProcessStage[]>(() => getRemoteProcessStage(url));
    setProcessStage(data.value || []);
  }

  // post
  // async function addProcessStage(url: string, data?: PostProcessStage) {
  //   const useAsync = useAsyncCreator(loading, error);
  //   await useAsync(() => addRemoteProcessStage(url, data));
  // }
  const addProcessStageState = reactive(initialState());
  async function addProcessStage(url: string, data?: PostProcessStage) {
    await useAsyncV3(addProcessStageState, () => addRemoteProcessStage(url, data));
  }

  // put
  async function editProcessStage(url: string, data?: PutProcessStage) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => editRemoteProcessStage(url, data));
  }
  // delete
  async function deleteProcessStage(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => deleteRemoteProcessStage(url));
  }

  // sort
  async function sortProcessStage(url: string, data?: any) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => sortRemoteProcessStage(url, data));
  }

  function getStageName(id: number) {
    return processStage.value.find(stage => stage.id === id)?.name;
  }

  provide<ProcessStageContext>(processStageSymbol, {
    getProcessStage,
    addProcessStage,
    editProcessStage,
    deleteProcessStage,
    sortProcessStage,
    processStage,
    loading,
    error,
    getStageName,
    addProcessStageState,
  });
}
export function useProcessStageInject() {
  const processStageStore = inject<ProcessStageContext>(processStageSymbol);
  if (!processStageStore) {
    throw new Error('Please useProcessStageProvider before useProcessStageInject!');
  }
  return processStageStore;
}
