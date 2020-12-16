import {

  ClaimBasicConfig,
  OfficialClaimDetail,
  OfficialClaimDetailContext,
  RemoteDetail,
  StageClaimResultAction,
  StageClaimsField,
} from '@/types/claim-detail';
import { CascadeType, RemoteData } from '@/types/common';

import {
  ref, provide, inject, reactive, computed,
} from '@vue/composition-api';

import {
  DELETE, GET, initialState, POST, PUT, useAsyncV2,
} from './common';

export const officialClaimSymbol = Symbol('Symbol for official claims');

const initialOfficialClaimDetail: OfficialClaimDetail = {
  id: null, // number; // 1; // id
  claimsType: null, // number; //  0; // 权利要求类型：官方来文、诉求官方
  documentType: null, // number; // 0; // 来文类型
  englishName: '', // string; // '官方来文'; // 名称
  feeNameId: null, // number; // '费用名称id'; // 费用名称id
  hasBill: false, // boolean; //  true; // 是否有账单
  name: '', // string; // '官方来文'; // 权利名称
  officialName: '', // string; // '申请通知单'; // 对应官方来文名称
  priority: null, // number; // 1; // 排序
  processId: null, // number; // 1; // 流程id
  processStageId: null, // number; // 1; // 阶段id
  createdAtUtc: '', // string; // '2020-09-23 14:34:00'; // 创建时间
  createdBy: '', // string; // '1'; // 创建人
  updatedAtUtc: '', // string; // '2020-09-23 14:34:00'; // 创建时间
  updatedBy: '', // string; //  '1'; // 更新人
  stageClaimsFields: [], // 官方/请求事件属性字段
  stageDocumentDependencies: [], // 官方/事件依赖来文
  stageClaimsResults: [], // 官方/请求事件结果动作
  stageClaimsFlows: [], // 官方/请求事件答辩
  isRequired: false,
  allowModifyPatentState: [],
  isRepeat: false,
};

export function useOffcialClaimDetailProvider() {
  /**
   * 获取官方来文详情
   */
  const getOfficialClaimDetailState = reactive({
    ...initialState(),
    data: initialOfficialClaimDetail,
  });

  async function getOfficialClaimDetail(claimsId: number) {
    await useAsyncV2(getOfficialClaimDetailState, () => getRemoteDetail(claimsId), {
      failureMessage: '获取来文详情失败',
      useRemoteFirst: true,
    });
    // getOfficialClaimDetailState.data = processRemoteData<OfficialClaimDetail>(
    //   getOfficialClaimDetailState.data,
    //   initialOfficialClaimDetail,
    // );
  }
  async function getRemoteDetail(claimsId: number) {
    const data = await GET<RemoteDetail | null>(`/patent-corp_api/stage-claims/${claimsId}`);
    return data;
  }

  // 新增来文属性字段
  const addClaimFieldState = reactive(initialState());
  async function addClaimField(newClaimField: StageClaimsField) {
    await useAsyncV2(addClaimFieldState, () => addRemoteClaimField(newClaimField), {
      failureMessage: '新增来文属性字段失败',
      successMessage: '新增来文属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function addRemoteClaimField(newClaimField: StageClaimsField) {
    await POST<{}, StageClaimsField>('/patent-corp_api/stage-claims-field', newClaimField);
  }

  // 更新来文属性字段
  const updateClaimFieldState = reactive(initialState());
  async function updateClaimField(updatedClaimField: StageClaimsField) {
    await useAsyncV2(updateClaimFieldState, () => updateRemoteClaimField(updatedClaimField), {
      failureMessage: '更新来文属性字段失败',
      successMessage: '更新来文属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function updateRemoteClaimField(updatedClaimField: StageClaimsField) {
    const stageClaimsFieldId = updatedClaimField.id;
    await PUT<{}, StageClaimsField>(
      `/patent-corp_api/stage-claims-field/${stageClaimsFieldId}`,
      updatedClaimField,
    );
  }

  // 删除来文属性字段
  const deleteClaimFieldState = reactive(initialState());
  async function deleteClaimField(stageClaimsFieldId: number) {
    await useAsyncV2(deleteClaimFieldState, () => deleteRemoteClaimField(stageClaimsFieldId), {
      failureMessage: '删除来文属性字段失败',
      successMessage: '删除来文属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function deleteRemoteClaimField(stageClaimsFieldId: number) {
    await DELETE(`/patent-corp_api/stage-claims-field/${stageClaimsFieldId}`);
  }

  // 更新来文详情中属性字段列表的排序
  // const reorderingStageClaimsFields = ref(false);
  // const errorInReorderingFields = ref<AxiosError | null>(null);
  // async function reorderClaimFields(stageClaimId: number, stageClaimsFieldIds: number[]) {
  //   const useAsync = useAsyncCreator(
  //     reorderingStageClaimsFields,
  //     errorInReorderingFields,
  //     '排序来文属性字段列表失败',
  //     '排序来文属性字段列表成功',
  //   );
  //   await useAsync(() => reorderRemoteClaimFields(stageClaimId, stageClaimsFieldIds));
  // }

  const reorderStageClaimsFieldsState = reactive(initialState());
  async function reorderStageClaimsFields(stageClaimId: number, stageClaimsFieldIds: number[]) {
    await useAsyncV2(
      reorderStageClaimsFieldsState,
      () => reorderRemoteClaimFields(stageClaimId, stageClaimsFieldIds),
      {
        failureMessage: '排序来文属性字段列表失败',
        successMessage: '排序来文属性字段列表成功',
      },
    );
  }
  async function reorderRemoteClaimFields(stageClaimId: number, stageClaimsFieldIds: number[]) {
    await PUT<
      {},
      {
        stageClaimsId: number;
        stageClaimsFieldIds: number[];
      }
    >('/patent-corp_api/stage-claims-field-priority', {
      stageClaimsId: stageClaimId,
      stageClaimsFieldIds,
    });
  }

  /**
   * 获取当前来文的可选依赖来文列表（所有阶段的所有来文）
   */
  const getDependencyClaimListState = reactive({
    ...initialState(),
    data: [],
  });
  async function getDependencyClaimList(processId: number, claimsType: number) {
    await useAsyncV2(
      getDependencyClaimListState,
      () => getRemoteDependencyClaimList(processId, claimsType),
      {
        failureMessage: '获取依赖来文列表失败',
      },
    );
  }
  async function getRemoteDependencyClaimList(processId: number, claimsType: number) {
    const result = await GET<CascadeType[] | null>('/patent-corp_api/process-claims-combo', {
      processId,
      claimsType,
    });
    return result;
  }

  /**
   * 更新来文基本设置
   */
  const updateBasicConfigState = reactive(initialState());
  async function updateBasicConfig(basicConfig: ClaimBasicConfig) {
    await useAsyncV2(updateBasicConfigState, () => updateRemoteBasicConfig(basicConfig), {
      failureMessage: '更新基本设置失败',
      successMessage: '更新基本设置成功',
      // useRemoteFirst: true, // 可选
    });
  }
  async function updateRemoteBasicConfig(basicConfig: ClaimBasicConfig) {
    await PUT('/patent-corp_api/stage-claims-setting', basicConfig);
  }

  /**
   * 来文属性字段弹框状态
   */
  const isPropertyFieldDialogVisible = ref(false);
  function setIsPropertyFieldDialogVisible(visible: boolean) {
    isPropertyFieldDialogVisible.value = visible;
  }

  /**
   * 更新来文结果动作
   */
  const updateResultActionState = reactive(initialState());
  async function updateResultAction(
    stageClaimsResultId: number,
    resultAction: StageClaimResultAction,
  ) {
    await useAsyncV2(
      updateResultActionState,
      () => updateRemoteResultAction(stageClaimsResultId, resultAction),
      {
        failureMessage: '更新来文结果动作失败',
        successMessage: '更新来文结果动作成功',
        useRemoteFirst: true,
      },
    );
  }
  async function updateRemoteResultAction(
    stageClaimsResultId: number,
    resultAction: StageClaimResultAction,
  ) {
    const result = await PUT<{}, StageClaimResultAction>(
      `/patent-corp_api/stage-claims-result/${stageClaimsResultId}`,
      resultAction,
    );
    return result;
  }

  const claimId = computed(() => getOfficialClaimDetailState.data.id);
  const processId = computed(() => getOfficialClaimDetailState.data.processId);
  const processStageId = computed(() => getOfficialClaimDetailState.data.processStageId);

  provide<OfficialClaimDetailContext>(officialClaimSymbol, {
    /** get details */
    getOfficialClaimDetail,
    getOfficialClaimDetailState,
    /** add claim field */
    addClaimField,
    addClaimFieldState,
    /** update claim field */
    updateClaimField,
    updateClaimFieldState,
    /** delete claim field */
    deleteClaimField,
    deleteClaimFieldState,
    /** reorder fields TODO */
    // reorderingStageClaimsFields,
    // errorInReorderingFields,
    // reorderClaimFields,
    reorderStageClaimsFieldsState,
    reorderStageClaimsFields,
    /** get dependency claim list */
    getDependencyClaimList,
    getDependencyClaimListState,
    /** update basic config */
    updateBasicConfig,
    updateBasicConfigState,
    /** property field dialog */
    isPropertyFieldDialogVisible,
    setIsPropertyFieldDialogVisible,
    /** claim result action */
    updateResultAction,
    updateResultActionState,
    /** ids */
    claimId,
    processId,
    processStageId,
  });
}

export function useOfficialClaimDetailInject() {
  const claimDetailStore = inject<OfficialClaimDetailContext>(officialClaimSymbol);
  if (!claimDetailStore) {
    throw new Error('Please useOfficialClaimDetailProvider before useOfficialClaimDetailInject!');
  }
  return claimDetailStore;
}

export function processRemoteData<T extends object>(remoteData: RemoteData<T>, initialData: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validRemoteDetail = Object.fromEntries(Object.entries(remoteData).filter(([_, value]) => value !== null));
  return {
    ...initialData,
    ...validRemoteDetail,
  };
}
