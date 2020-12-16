import { CommonState, NullableData, RemoteData } from '@/types/common';
import { StepDetail, StepPropertyField } from '@/types/stage-step';
import { StepResultSetting } from '@/types/step-result-setting';
import {
  Ref, ref, provide, inject, reactive,
} from '@vue/composition-api';
import {
  GET, useAsyncCreator, DELETE, PUT, initialState, useAsyncV3,
} from './common';

export type StageStep = {
  id: number; // 7,
  name: string; //  '测试',
  englishName: string; //  'ceshi';
  eventResultType: number;
  feeNameID: number;
  focusType: string;
  hasBill: boolean;
  legalTimeType: string; // '0001-01-01T00:00:00Z',
  notifyToType: string;
  ownerType: string;
  priority: number;
  processId: number;
  processStageId: number;
  stepType: number;
  todoBelongType: [];
  createdAtUtc: string; // '0001-01-01T00:00:00Z',
  createdBy: string; // '',
  updatedBy: string; // '',
  updatedAtUtc: string; // '0001-01-01T00:00:00Z',
};

const initialStepDetail = {
  id: null,
  englishName: '',
  eventResultType: null,
  feeNameId: null,
  focusType: null,
  hasBill: null,
  legalTimeType: null,
  name: '',
  notifyToType: null,
  ownerType: null,
  priority: null,
  processId: null,
  processStageId: null,
  stepType: null,
  todoBelongType: [],
  createdAtUtc: '',
  createdBy: '',
  updatedAtUtc: '',
  updatedBy: '',
  workingTimeType: null,
  ownerStaffId: null,
  ownerFullName: '',
  todoBelongStaffId: null,
  todoBelongFullName: '',
  notifyStaffId: null,
  notifyFullName: '',
  ownerRoleId: null,
  todoBelongRoleId: null,
  notifyRoleId: null,
  hasBelong: null,
  hasNotifyType: null,
  workingTimeOperate: null,
  legalTimeOperate: null,
  legalTimeNum: null,
  workingTimeNum: null,
  workingFieldDate: null,
  legalFieldDate: null,
  stageStepFields: [],
  stepResultSetting: null,
};

// 排序entity
export type ProcessStageOrder = {
  processStageId: number;
  stageStepIds: number[];
};

export type RemoteStageStep = RemoteData<StageStep>;

export type StageStepContext = {
  stageStepList: Ref<StageStep[]>;
  setStagStepList: (Claimss: StageStep[]) => void;
  getStageStepList: (processId: number, processStageId: number, stepType: number) => Promise<void>;
  deleteProcessStageStep: (url: string) => Promise<void>;
  updateStageStepPriority: (url: string, params: ProcessStageOrder) => Promise<void>;
  loading: Ref<boolean>;
  error: Error | Ref<null>;
  getStepDetail: (stepId: number) => void;
  getStepDetailState: CommonState<NullableData<StepDetail>>;
};

export const stageStepSymbol = Symbol('Symbol for official Claimss');

async function deleteRemoteProcessStage(url: string) {
  return DELETE(url);
}

async function editRemoteProcessStepOrder(url: string, data?: ProcessStageOrder) {
  return PUT<{}, ProcessStageOrder>(url, data);
}

// a mock function to get remote data
async function getRemoteStagStepList(processId: number, processStageId: number, stepType: number) {
  // real usage:
  const response = await GET<RemoteStageStep[]>('/patent-corp_api/stage-steps', {
    processId,
    processStageId,
    stepType,
  });
  return response;
}

function processRemoteStepList(remoteClaimsList: RemoteStageStep[]): StageStep[] {
  return remoteClaimsList.map(remoteStep => ({
    id: remoteStep.id ?? 0,
    name: remoteStep.name ?? '', //  '测试',
    englishName: remoteStep.englishName ?? '', //  'ceshi';
    eventResultType: remoteStep.eventResultType ?? 0, //  '1';
    feeNameID: remoteStep.feeNameID ?? 0, //  'ceshi';
    focusType: remoteStep.focusType ?? '', //  'ceshi';
    hasBill: remoteStep.hasBill ?? false, //  null | boolean;//  true;
    legalTimeType: remoteStep.legalTimeType ?? '',
    notifyToType: remoteStep.notifyToType ?? '', // 1,
    ownerType: remoteStep.ownerType ?? '', // 1,
    priority: remoteStep.priority ?? 0, // 1,
    processId: remoteStep.processId ?? 0, // 1
    processStageId: remoteStep.processStageId ?? 0, //  1,
    stepType: remoteStep.stepType ?? 0, //  1,
    todoBelongType: remoteStep.todoBelongType ?? [], // 1,
    createdBy: remoteStep.createdBy ?? '', // '',
    createdAtUtc: remoteStep.createdAtUtc ?? '', // '0001-01-01T00:  00:  00Z',
    updatedBy: remoteStep.updatedBy ?? '', // '',
    updatedAtUtc: remoteStep.updatedAtUtc ?? '', // '0001-01-01T00:00:00Z',
  }));
}

export function useStagStepProvider() {
  const stageStepList = ref<StageStep[]>([]);
  const loading = ref(false);
  const error = ref(null);

  function setStagStepList(Claimss: StageStep[]) {
    stageStepList.value = Claimss;
  }
  // get
  async function getStageStepList(processId: number, processStageId: number, stepType: number) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<StageStep[]>(async () => {
      const remoteData = await getRemoteStagStepList(processId, processStageId, stepType);
      return processRemoteStepList(remoteData);
    });
    setStagStepList(data.value || []);
  }
  // get step detail
  const getStepDetailState = reactive<CommonState<NullableData<StepDetail>>>({
    ...initialState(),
    data: initialStepDetail,
  });

  async function getStepDetail(stepId: number) {
    const result = await useAsyncV3(getStepDetailState, () => getRemoteStepDetail(stepId), {
      failureMessage: '获取步骤详情失败',
      useRemoteFirst: true,
    });
    if (result !== null) {
      getStepDetailState.data = result;
    }
  }
  async function getRemoteStepDetail(stepId: number) {
    const result = await GET<NullableData<StepDetail> | null>(`/patent-corp_api/stage-steps/${stepId}`);
    return result;
  }

  // delete
  async function deleteProcessStageStep(url: string) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => deleteRemoteProcessStage(url));
  }

  // put
  async function updateStageStepPriority(url: string, data?: ProcessStageOrder) {
    const useAsync = useAsyncCreator(loading, error);
    await useAsync(() => editRemoteProcessStepOrder(url, data));
  }

  provide<StageStepContext>(stageStepSymbol, {
    stageStepList,
    setStagStepList,
    getStageStepList,
    deleteProcessStageStep,
    updateStageStepPriority,
    loading,
    error,
    getStepDetail,
    getStepDetailState,
  });
}
// TODO use inject
export function useStageStep() {
  const officialClaimsStore = inject<StageStepContext>(stageStepSymbol);
  if (!officialClaimsStore) {
    throw new Error('Please useStagStepProvider before useStageStep!');
  }
  return officialClaimsStore;
}
