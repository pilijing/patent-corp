import { CommonState, NullableData } from '@/types/common';
import {
  DefenseFlowStepBasic,
  DefenseFlowStep,
  ReorderDefenseFlowStep,
  DefenseFlowContext,
  UpdatedDefenseFlowStep,
} from '@/types/defense-flow';
import { inject, provide, reactive } from '@vue/composition-api';
import {
  DELETE, GET, initialState, POST, PUT, useAsyncV3,
} from './common';

const symbol = Symbol('Symbol for defense flow');

export function useDefenseFlowProvider() {
  const addDefenseFlowStepState = reactive(initialState());
  async function addDefenseFlowStep(newStep: DefenseFlowStepBasic) {
    await useAsyncV3(addDefenseFlowStepState, () => addRemoteDefenseFlowStep(newStep));
  }
  async function addRemoteDefenseFlowStep(newStep: DefenseFlowStepBasic) {
    await POST('/patent-corp_api/stage-claims-flow', newStep);
  }
  const updateDefenseFlowStepState = reactive(initialState());
  async function updateDefenseFlowStep(
    updatedStep: UpdatedDefenseFlowStep,
    stageClaimsFlowId: number,
  ) {
    await useAsyncV3(updateDefenseFlowStepState, () => updateRemoteDefenseFlowStep(updatedStep, stageClaimsFlowId));
  }
  async function updateRemoteDefenseFlowStep(
    updatedStep: UpdatedDefenseFlowStep,
    stageClaimsFlowId: number,
  ) {
    await PUT(`/patent-corp_api/stage-claims-flow-step/${stageClaimsFlowId}`, updatedStep);
  }

  const getDefenseFlowStepListState = reactive<CommonState<NullableData<DefenseFlowStep>[]>>({
    ...initialState(),
    data: [],
  });
  async function getDefenseFlowStepList(claimId: number, type: number) {
    const result = await useAsyncV3(getDefenseFlowStepListState, () => getRemoteDefenseFlowStepList(claimId, type));
    getDefenseFlowStepListState.data = result || [];
  }
  async function getRemoteDefenseFlowStepList(claimId: number, type: number) {
    // eslint-disable-next-line max-len
    const result = await GET<NullableData<DefenseFlowStep>[]>(`/patent-corp_api/task-flow/${claimId}?claimsType=${type}`);
    return result;
  }

  const deleteDefenseFlowStepState = reactive(initialState());
  async function deleteDefenseFlowStep(stageStepId: number, stageClaimsFlowId: number) {
    await useAsyncV3(deleteDefenseFlowStepState, () => deleteRemoteDefenseFlowStep(stageStepId, stageClaimsFlowId));
  }
  async function deleteRemoteDefenseFlowStep(stageStepId: number, stageClaimsFlowId: number) {
    await DELETE('/patent-corp_api/stage-claims-flow', { stageStepId, stageClaimsFlowId });
  }

  const reorderDefenseFLowStepState = reactive(initialState());
  async function reorderDefenseFlowStep(reorderData: ReorderDefenseFlowStep) {
    await useAsyncV3(reorderDefenseFLowStepState, () => reorderRemoteDefenseFlowStep(reorderData));
  }
  async function reorderRemoteDefenseFlowStep(reorderData: ReorderDefenseFlowStep) {
    await PUT('/patent-corp_api/stage-claims-flow/priority', reorderData);
  }

  const deleteWholeDefenseFlowState = reactive(initialState());
  async function deleteWholeDefenseFlow(claimId: number) {
    await useAsyncV3(deleteWholeDefenseFlowState, () => deleteRemoteWholeDefenseFlow(claimId));
  }
  async function deleteRemoteWholeDefenseFlow(claimId: number) {
    await DELETE(`/patent-corp_api/task-flow/${claimId}`);
  }

  provide<DefenseFlowContext>(symbol, {
    addDefenseFlowStepState,
    addDefenseFlowStep,
    getDefenseFlowStepListState,
    getDefenseFlowStepList,
    deleteDefenseFlowStepState,
    deleteDefenseFlowStep,
    reorderDefenseFLowStepState,
    reorderDefenseFlowStep,
    deleteWholeDefenseFlowState,
    deleteWholeDefenseFlow,
    updateDefenseFlowStepState,
    updateDefenseFlowStep,
  });
}

export function useDefenseFlowInject() {
  const store = inject<DefenseFlowContext>(symbol);
  if (!store) {
    throw new Error('error in useDefenseFlowInject');
  }
  return store;
}
