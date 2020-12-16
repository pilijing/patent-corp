import { CommonState, NullableData } from '@/types/common';
import { inject, provide, reactive } from '@vue/composition-api';
import { GET, initialState, useAsyncV3 } from './common';

export const basicSourceSymbol = Symbol('Symbol for basic source');

export type BasicSource = {
  id: number; // 5;
  group: string; // 'FIELD_TYPE';
  type: string; // 'TEXT';
  dataSourceType: string; // 'CONTROLS';
  dataSourceApi: string; // '';
  code: string; // '';
  name: string; // '单行文本';
  description: string; // '文本输入框';
  min: number | null; // null;
  max: number | null; // null;
  regular: number | null; // null;
  regularFailInfo: number | null; // null;
  precision: number | null; // null;
  order: number | null; // 6;
  isEnabled: boolean; // true;
  dynamicSourceApi: string;
  labelKey: string;
  queryKey: string | number;
  hasDynamicSource: boolean;
  multiple: boolean;
  valueKey: string;
  dictionaryType: string | null; // null;
  //  display_type: 'staff';
  filterKey: number | null; // null;
  isDictionary: boolean; //  false;
  tableName: number | null; // null;
};

export type BasicSourceContext = {
  getFieldTypesState: CommonState<NullableData<BasicSource>[]>;
  getFieldTypes: () => void;
  getFieldTypeName: (id: number) => string | undefined;
  getSyncToPatentsState: CommonState<NullableData<BasicSource>[]>;
  getSyncToPatents: () => void;
  getSyncToPatentName: (id: number) => string | undefined;
  getSyncStageDefinition: () => void;
  getStageDefinitionState: CommonState<NullableData<BasicSource>[]>;
  getSyncStepDefinition: () => void;
  getStepDefinitionState: CommonState<NullableData<BasicSource>[]>;
  getStageDefinitionName: (id: number) => string | undefined;
  getStepDefinitionName: (id: number) => string | undefined;

};

export function useBasicSourceProvider() {
  const getFieldTypesState = reactive({
    ...initialState(),
    data: [] as NullableData<BasicSource>[],
  });
  // 获取来文属性字段的字段类型
  async function getFieldTypes() {
    const result = await useAsyncV3(getFieldTypesState, () => getRemoteBasicSource('FIELD_TYPE'), {
      failureMessage: '获取字段类型列表失败',
      useRemoteFirst: true,
    });
    getFieldTypesState.data = result ?? [];
  }

  // 获取来文属性字段的“更新对应的专利值”
  const getSyncToPatentsState = reactive({
    ...initialState(),
    data: [] as NullableData<BasicSource>[],
  });

  async function getSyncToPatents() {
    const result = await useAsyncV3(
      getSyncToPatentsState,
      () => getRemoteBasicSource('PATENT_DEFINITIONS'),
      {
        failureMessage: '获取对应的专利值列表失败',
        useRemoteFirst: true,
      },
    );
    getSyncToPatentsState.data = result ?? [];
  }
  // 获取阶段主体字段
  const getStageDefinitionState = reactive({
    ...initialState(),
    data: [] as NullableData<BasicSource>[],
  });
  // 获取阶段主体字段
  async function getSyncStageDefinition() {
    const result = await useAsyncV3(
      getStageDefinitionState,
      () => getRemoteBasicSource('STAGE_DEFINITIONS'),
      {
        failureMessage: '获取对应的专利值列表失败',
        useRemoteFirst: true,
      },
    );
    getStageDefinitionState.data = result ?? [];
  }
  // 获取步骤主体字段
  const getStepDefinitionState = reactive({
    ...initialState(),
    data: [] as NullableData<BasicSource>[],
  });
  // 获取步骤主体字段
  async function getSyncStepDefinition() {
    const result = await useAsyncV3(
      getStepDefinitionState,
      () => getRemoteBasicSource('STEP_DEFINITIONS'),
      {
        failureMessage: '获取对应的专利值列表失败',
        useRemoteFirst: true,
      },
    );
    getStepDefinitionState.data = result ?? [];
  }

  // sample: /api/v1/basic-resource?group=FIELD_TYPE
  async function getRemoteBasicSource(group: string) {
    const result = await GET<NullableData<BasicSource>[] | null>(`/patent-corp_api/basic-resource?group=${group}`);
    return result;
  }

  function getFieldTypeName(id: number) {
    return getFieldTypesState.data.find(item => item.id === id)?.name ?? undefined;
  }

  function getSyncToPatentName(id: number) {
    return getSyncToPatentsState.data.find(item => item.id === id)?.name ?? undefined;
  }
  function getStageDefinitionName(id: number) {
    return getStageDefinitionState.data.find(item => item.id === id)?.name ?? '无';
  }
  function getStepDefinitionName(id: number) {
    return getStepDefinitionState.data.find(item => item.id === id)?.name ?? '无';
  }

  provide<BasicSourceContext>(basicSourceSymbol, {
    getFieldTypes,
    getFieldTypesState,
    getFieldTypeName,
    getSyncToPatents,
    getSyncToPatentsState,
    getSyncToPatentName,
    getStageDefinitionState,
    getSyncStageDefinition,

    getSyncStepDefinition,
    getStepDefinitionState,
    getStageDefinitionName,
    getStepDefinitionName,
  });
}

export function useBasicSourceInject() {
  const store = inject<BasicSourceContext>(basicSourceSymbol);
  if (!store) {
    throw new Error('Cannot found store in useBasicSourceInject');
  }
  return store;
}
