// interface for stage
export interface ConfigCostBaseNode {
  processStageId: number; // 1;
  processId: number; // 1;
  name: string; // "填写委托信息";
  stageItems: ConfigCostNode[] | null;
}
// interface for step, claims, request, events
export interface ConfigCostNode extends ConfigCostBaseNode {
  id: number;
  stepClaimsType: number;
  estimationList: EstimationData[] | null;
  processId: number; // 223,
  processStageId: number; // 214,
}

export interface EstimationData {
  feeItems: FeeItem[] | null;
  estimationType: number;
  source: Source | null;
}
export interface Source {
  id: string;
  name: string;
  feeItems: FeeItem[] | null;
  estimationType: number;
}

export interface FeeItem {
  id: number; // 312,
  name: string; // "申请费用-超权费",
}

// export const ESTIMATION_TYPE = {
//   CommissionEstimate: 7001,
//   FinalEstimate: 7002,
//   BillConfirmation: 7003,
// };
