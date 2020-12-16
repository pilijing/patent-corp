import { CommonState, NullableData } from './common';

export interface ReorderDefenseFlowStep {
  stageClaimsId: number; // 173;
  stageClaimsFlowIds: number[];
}
export interface DefenseFlowStep {
  id: number; //  370;
  englishName: string; // '15';
  eventResultType: number; //  0;
  feeNameId: number; // null;
  focusType: number; //  null;
  hasBill: boolean; //  null;
  legalTimeType: number; // null;
  name: string; //  '事件流程步骤-16';
  notifyToType: number; // null;
  ownerType: number; // null;
  priority: number; // 0;
  processId: number; // 194;
  processStageId: number; // 154;
  stepType: number; //  700;
  todoBelongType: number; // null;
  createdAtUtc: string; // '2020-11-02T14:53:49+08:00';
  createdBy: string; // '';
  updatedAtUtc: string; // '2020-11-02T14:53:49+08:00';
  updatedBy: string; // '';
  workingTimeType: number; //  null;
  ownerStaffId: number; // null;
  ownerStaff: boolean; // null;
  todoBelongStaffId: number; // null;
  todoBelongFullName: string; // '';
  notifyStaffId: number; // null;
  notifyFullName: string; // '';
  ownerRoleId: number; // null;
  todoBelongRoleId: number; // null;
  notifyRoleId: number; // null;
  hasBelong: boolean; //  null;
  hasNotifyType: boolean; // null;
  workingTimeOperate: null;
  legalTimeOperate: null;
  legalTimeNum: number; // null;
  workingTimeNum: number; // null;
  workingFieldDate: null;
  legalFieldDate: null;
  isBlockStep: boolean; //  null;
  parallelFinishType: number; // null;
  parallelStep: number; // null;
  finishType: number; // null;
  stepFieldId: number; // null;
  notifyId: number; // null;
  stageStepFields: null;
  stageStepFlows: null;
  notificationConfig: null;
  todoBelongStaff: null;
  stageClaimsFlowId: number; // 31;
}

export interface DefenseFlowStepBasic {
  name: string; // '事件流程步骤-16';
  englishName: string; // '15';
  stageClaimsId: number; // 173;
  processId: number; // 194;
  processStageId: number; // 154;
  stepType: number; // 700;
}

export type DefenseFlowContext = {
  // /api/v1/stage-claims-flow
  addDefenseFlowStep: (newStep: DefenseFlowStepBasic) => void;
  addDefenseFlowStepState: CommonState<any>;
  // /api/v1/stage-claims-flow/173
  getDefenseFlowStepList: (claimId: number, type: number) => void;
  getDefenseFlowStepListState: CommonState<NullableData<DefenseFlowStep>[]>;
  // /api/v1/stage-claims-flow?stageStepId=xx&&stageClaimsFlowId=xx
  deleteDefenseFlowStep: (stageStepId: number, stageClaimsFlowId: number) => void;
  deleteDefenseFlowStepState: CommonState<any>;
  // /api/v1/stage-claims-flow/priority
  reorderDefenseFlowStep: (reorderData: ReorderDefenseFlowStep) => void;
  reorderDefenseFLowStepState: CommonState<any>;
  // /api/v1/stage-claims-flow/173
  deleteWholeDefenseFlow: (claimId: number) => void;
  deleteWholeDefenseFlowState: CommonState<any>;
  updateDefenseFlowStepState: CommonState<any>;
  updateDefenseFlowStep: (updatedStep: UpdatedDefenseFlowStep, stageClaimsFlowId: number) => void;
};

export interface UpdatedDefenseFlowStep {
  name: string; //  '步骤答辩-33';
  englishName: string; // 'step flow 33';
  stageClaimsId: number; // 277;
}
