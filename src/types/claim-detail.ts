import { ComputedRef, Ref } from '@vue/composition-api';
// stageClaimsId 表示当前正在编辑的来文的id

import {
  CascadeType, CommonState, NullableData, RemoteData,
} from './common';

export interface OfficialClaimBasic {
  id: null | number; // 1; // id
  claimsType: null | number; //  0; // 权利要求类型：官方来文、诉求官方
  documentType: null | number; // 0; // 来文类型
  englishName: string; // '官方来文'; // 名称
  feeNameId: null | number; // '费用名称id'; // 费用名称id
  hasBill: boolean; //  true; // 是否有账单
  name: string; // '官方来文'; // 权利名称
  officialName: string; // '申请通知单'; // 对应官方来文名称
  priority: null | number; // 1; // 排序
  processId: null | number; // 1; // 流程id
  processStageId: null | number; // 1; // 阶段id
  createdAtUtc: string; // '2020-09-23 14:34:00'; // 创建时间
  createdBy: string; // '1'; // 创建人
  updatedAtUtc: string; // '2020-09-23 14:34:00'; // 创建时间
  updatedBy: string; //  '1'; // 更新人
  isRequired: boolean; //  是否必要来文字段
  allowModifyPatentState: number[];
  isRepeat: boolean;
}

export interface OfficialClaimDetail extends OfficialClaimBasic {
  stageClaimsFields: StageClaimsField[] | null; // 官方/请求事件属性字段
  stageDocumentDependencies: StageDocumentDependency[] | null; // 官方/事件依赖来文
  stageClaimsResults: StageClaimResultAction[] | null; // 官方/请求事件结果动作
  stageClaimsFlows: StageClaimsFlow[] | null; // 官方/请求事件答辩
}
// 官方/请求事件属性字段
export type StageClaimsField = {
  id: number; // 1; // id
  cascadedById: number; // 2; // 受级联控制的字段id
  cascadedValues: string; // '1;2;'; // 级联控制的值(可多个，以;分隔)
  defaultValueCriteria: null; // ''; // 默认
  defaultValueName: null; // ''; // 默认
  englishName: string; // 'test'; // 英文名称
  inputType: number | null; // 'patent_type'; // 类型
  attachmentType: number|null;
  isReadonly: boolean; // false; // 是否只读
  isRequired: boolean; // true; // 是否必填
  isVisible: boolean; // true; // 是否显示
  name: string; // '专利类型'; // 名称
  priority: number; // 1; // 排序
  stageClaimsId: number; // 1; // 权利要求id
  syncToParentField: number | null; // ''; // 更新事件主体列 更新步骤主体字段
  syncToPatentField: number | null; // ''; // 更新对应的专利值
  syncToStageField: number | null; // ''; // 更新阶段字段值
  syncToStageBodyField: number | null; // ''; // 更新阶段主体字段值
  syncToStepBodyField: number | null; // ''; // 更新步骤主体字段值
  staffFullName: string;
  cascadedValuesName: string; // 'string';
  // copyStepField: number|null;
  // copyPatentField: number|null;
};
// 官方/事件依赖来文
export type StageDocumentDependency = {
  id?: number; // 1; // id
  dependencyDocumentId: number; // 1; // 依赖来文id
  dependencyStageId: number; // 1; // 依赖来文对应processStageId
  stageClaimsId: number | null; // 1; // 来文id
};

// 官方/请求事件答辩
export type StageClaimsFlow = {
  englishName: string; // "1212"
  id: number; // 36
  name: string; //  "212"
  priority: number; // 1
  stageClaimsId: number; // 159
  stageStepId: number; // 375
};

export type RemoteDetail = RemoteData<OfficialClaimDetail>;

export type OfficialClaimDetailContext = {
  // officialClaimDetail: Ref<OfficialClaimDetail>;
  // setOfficialClaimDetail: (value: OfficialClaimDetail) => void;
  getOfficialClaimDetail: (claimId: number) => void;
  getOfficialClaimDetailState: CommonState<NullableData<OfficialClaimDetail>>;
  // loading: Ref<boolean>;
  // error: Ref<AxiosError | null>;
  /** add claims field */

  addClaimField: (newClaimField: StageClaimsField) => void;
  addClaimFieldState: CommonState<null>;
  /** update claims field*/

  updateClaimField: (updatedClaimField: StageClaimsField) => void;
  updateClaimFieldState: CommonState<null>;
  /** delete claims field*/
  // deletingStageClaimsField: Ref<boolean>;
  // errorInDeletingField: Ref<AxiosError | null>;
  deleteClaimField: (stageClaimsFieldId: number) => void;
  deleteClaimFieldState: CommonState<null>;
  /** reorder fields */
  // reorderingStageClaimsFields: Ref<boolean>;
  // errorInReorderingFields: Ref<AxiosError | null>;
  // reorderClaimFields: (stageClaimId: number, stageClaimsFieldIds: number[]) => void;
  reorderStageClaimsFields: (stageClaimId: number, stageClaimsFieldIds: number[]) => void;
  reorderStageClaimsFieldsState: CommonState<null>;

  /** get claim dependency list */

  getDependencyClaimList: (stageClaimId: number, claimsType: number) => void;
  // dependencyClaimList: Ref<CascadeType[]>;
  // gettingDependencyClaimList: Ref<boolean>;
  // errorInGettingDependencyClaimList: Ref<AxiosError | null>;

  getDependencyClaimListState: CommonState<CascadeType[]>;
  /** update basic config */
  updateBasicConfig: (basicConfig: ClaimBasicConfig) => void;
  // updatingBasicConfig: Ref<boolean>;
  // errorInUpdatingBasicConfig: Ref<AxiosError | null>;
  updateBasicConfigState: CommonState<null>;
  /** property field dialog */
  isPropertyFieldDialogVisible: Ref<boolean>;
  setIsPropertyFieldDialogVisible: (visible: boolean) => void;
  /** claim result action */
  updateResultAction: (stageClaimsResultId: number, resultAction: StageClaimResultAction) => void;
  updateResultActionState: CommonState<null>;
  claimId: ComputedRef<number | null>;
  processId: ComputedRef<number | null>;
  processStageId: ComputedRef<number | null>;
};

export interface StageClaimResultAction {
  id: number; // 当前结果动作 id，刚新增来文时，结果动作 stageClaimsResults 为null，则传0
  stageClaimsId: number;
  isInCurrentStage: boolean | null; //  是否保留当前阶段
  newStageId: number | null; // 新阶段id,当 isInCurrentStage 为 false时必须传
  hasTodo?: boolean | null; // 是否有代办
  todoBelongType?: number[] | null; // 待办所属人
  todoBelongStaffIds?: string[] | null; // 指定员工
  todoBelongRoleIds?: number[] | null; // 指定员工
  notificationConfig?: null | any; // 邮件模板
  todoBelongStaff?: object[] | null; // 指定员工集合
}

export interface ClaimBasicConfig {
  hasBill: boolean;
  feeNameId: number | null;
  isRequired: boolean;
  stageClaimsId: number;
  dependencyDocumentIds: number[];
  allowModifyPatentState: number[];
  isRepeat: boolean;
}
