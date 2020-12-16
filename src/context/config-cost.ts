import { CommonState } from '@/types/common';
import { ConfigCostBaseNode } from '@/types/config-cost';
import {
  provide, inject, reactive, ref, Ref,
} from '@vue/composition-api';

import {
  DELETE, GET, initialState, POST, PUT, useAsyncV4,
} from './common';

interface ConfigCostContext {
  getFeeNodeState: CommonState<ConfigCostBaseNode[]>;
  getFeeNode: (processId: string | number) => void;
  getSourceOptionsState: CommonState<SourceOption[]>;
  getSourceOptions: (
    processId: number,
    estimationType: number,
    nodeId: number,
    stepClaimsType: number
  ) => void;
  setSourceState: CommonState<null>;
  setSource: (sourceData: SourceData) => void;
  setFeeItemsState: CommonState<null>;
  setFeeItems: (feeItemsData: FeeItemsData) => void;
  deleteCardState: CommonState<null>;
  deleteCard: (id: number, stepClaimsType: number, estimationType: number) => void;
  submitChangeState: CommonState<null>;
  submitChange: (processId: number) => void;
  curProcess: Ref<ProcessRow | null>;
}
interface SourceOption {
  id: string; // "219-212-455-700-7101",
  cnName: string; //  "发起申请-填写申请单-委托预估",
  enName: string; // ""
}

interface SourceData {
  estimationType: number; // 7102;
  processId: number; //  219;
  sourceId: string; // '219-212-455-700-7101';
  stageId: number; //  212;
  // nodeId: number; // 487;
  stepClaimsId: number; // TODO change to nodeId
  stepClaimsType: number; // 700;
}

interface FeeItemsData {
  stepClaimsType: number; //  700;
  processId: number; // 219;
  processStageId: number; //  212;
  nodeId: number; // 123;
  estimationType: number; // 7102;
  feeItemIds: number[];
}
/**
 * 费用环节配置的流程列表的行
 */
interface ProcessRow {
  applicationType: number; // 101
  effectiveDate: string; // "2022-12-08T00:00:00+08:00"
  expirationDate: string; //  "2023-12-15T00:00:00+08:00"
  hasFeeConfig: boolean; // false
  id: number; // 228
  name: string; //  "呼啦啦啦啦"
  patentTypeIds: number[] | null; // Array(2)
  regionCodes: string[]|null; // Array(9)
  state: number; // 301
}

export const symbol = Symbol('Symbol for fee node');

export function useConfigCostProvider() {
  /** 获取费用节点 */
  const getFeeNodeState = reactive({ ...initialState(), data: [] as ConfigCostBaseNode[] });
  async function getFeeNode(processId: string | number) {
    const result = await useAsyncV4(getFeeNodeState, () => getRemoteFeeNode(processId));
    getFeeNodeState.data = result || [];
    return result;
  }
  async function getRemoteFeeNode(processId: string | number) {
    const data = await GET<ConfigCostBaseNode[]>(`/patent-corp_api/fee-steps-claims/${processId}`);
    return data || [];
  }

  /** 获取来源选项列表 */
  const getSourceOptionsState = reactive({ ...initialState(), data: [] as SourceOption[] });
  async function getSourceOptions(
    processId: number,
    estimationType: number,
    nodeId: number,
    stepClaimsType: number,
  ) {
    const result = await useAsyncV4(
      getSourceOptionsState,
      () => getRemoteSourceOptions(processId, estimationType, nodeId, stepClaimsType),
    );
    getSourceOptionsState.data = result || [];
    return result;
  }
  async function getRemoteSourceOptions(
    processId: number,
    estimationType: number,
    nodeId: number,
    stepClaimsType: number,
  ) {
    const data = await GET<SourceOption[]>('/patent-corp_api/process-fee/source', {
      processId,
      estimationType,
      nodeId,
      stepClaimsType,
    });
    return data || [];
  }

  /** 设定来源（更新或添加） */
  const setSourceState = reactive(initialState());
  async function setSource(sourceData: SourceData) {
    const result = await useAsyncV4(setSourceState, () => setRemoteSource(sourceData), {
      successMessage: '设置来源成功',
    });
    return result;
  }
  async function setRemoteSource(sourceData: SourceData) {
    const data = await POST<{}, SourceData>('/patent-corp_api/process-fee/source', sourceData);
    return data;
  }

  /** 设定收费项（更新或添加） */
  const setFeeItemsState = reactive(initialState());
  async function setFeeItems(feeItemsData: FeeItemsData) {
    const result = await useAsyncV4(setFeeItemsState, () => setRemoteFeeItems(feeItemsData), {
      successMessage: '设置收费项成功',
    });
    return result;
  }
  async function setRemoteFeeItems(feeItemsData: FeeItemsData) {
    const result = await POST<{}, FeeItemsData>('/patent-corp_api/process-fee', feeItemsData);
    return result;
  }

  /** 删除费用节点中的预估类型对应数据（card数据） */
  const deleteCardState = reactive(initialState());
  async function deleteCard(id: number, stepClaimsType: number, estimationType: number) {
    const result = await useAsyncV4(
      deleteCardState,
      () => deleteRemoteCard(id, stepClaimsType, estimationType),
      {
        successMessage: '删除成功',
      },
    );
    return result;
  }

  // 数据来源 lookups, 来文 700，
  enum StepClaimsType {
    STEPPROCESS = 700,
    OFFICIALACTION = 701,
    INITIATEREQUEST = 702,
    OFFICIALACTIONFLOW = 703,
    INITIATEREQUESTFLOW = 704
  }
  interface DeleteParams {
    estimationType: number;
    stageClaimsId: number;
    stageStepId: number;
  }

  async function deleteRemoteCard(id: number, stepClaimsType: number, estimationType: number) {
    const nodeIds = {
      stageClaimsId: 0,
      stageStepId: 0,
    };

    switch (stepClaimsType) {
      case StepClaimsType.OFFICIALACTION:
      case StepClaimsType.INITIATEREQUEST:
        nodeIds.stageClaimsId = id;
        break;
      case StepClaimsType.STEPPROCESS:
      case StepClaimsType.OFFICIALACTIONFLOW:
      case StepClaimsType.INITIATEREQUESTFLOW:
        nodeIds.stageStepId = id;
        break;
      default:
        break;
    }

    const result = await DELETE<{}, DeleteParams>('/patent-corp_api/process-fees', {
      estimationType,
      ...nodeIds,
    });
    return result;
  }

  /** 提交变更，有效性检查 */
  const submitChangeState = reactive(initialState());
  async function submitChange(processId: number) {
    const result = useAsyncV4(submitChangeState, () => remoteSubmitChange(processId), {
      successMessage: '变更成功',
    });
    return result;
  }
  async function remoteSubmitChange(processId: number) {
    const result = await PUT(`/patent-corp_api/process-fee-modify/${processId}`);
    return result;
  }

  const curProcess = ref(null);

  provide<ConfigCostContext>(symbol, {
    getFeeNodeState,
    getFeeNode,
    getSourceOptionsState,
    getSourceOptions,
    setSourceState,
    setSource,
    setFeeItemsState,
    setFeeItems,
    deleteCard,
    deleteCardState,
    submitChangeState,
    submitChange,
    curProcess,
  });
}

export function useConfigCostInject() {
  const store = inject<ConfigCostContext>(symbol);
  if (!store) {
    throw new Error('error in useConfigCostInject!');
  }
  return store;
}
