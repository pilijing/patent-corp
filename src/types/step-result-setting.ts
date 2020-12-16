import { StaffInfo } from './staff-info';

export interface StepResultSetting {
  isBlockStep: boolean | null;
  simultaneousSteps: number[] | null; // 步骤id [1,2,3,4]
  simulStepFinishType: number | null; // 并行步骤完成方式 id ;3900 全部通过才进入下一步; 3901 任一通过进入下一步; 3902 任一不通过结束;
  finishType: number | null; // 完成方式id,3920 提交完成,3921 以字段选项为结果
  stepResultField: number | null; // 字段id，只做选择器类型的字段
  stepResult: StepResult[]; // 步骤可能结果
  stageStepId: number | null; // 步骤id
}

export interface StepResult {
  stepResultId: number | null; // 1101  通过；不通过；补交交底书, name 从lookups里面拿
  fieldValue: string | null; // '[1,2]'
  isEnd: boolean | null; // 是否结项
  nextStepId: number | null; // 下一个步骤id
  nextStageId: number | null; // 下一个步骤所在阶段id
  notificationConfig: NotificationConfig | null;
  isInCurrent: boolean | null;
  isChangePatentState: boolean | null;
  changePatentState: number | null;
}

export interface NotificationConfig {
  id: number | null; // 136;
  recipientPeopleIds: number[] | null; // [51];
  recipientRoleIds: number[] | null; // null;
  recipientStaffIds: number[] | null; // null;
  copyPeopleIds: number[] | null; // [51];
  copyRoleIds: number[] | null; // null;
  copyStaffIds: number[] | null; // null;
  messageTemplateId: number | null; // 1;
  recipientStaff: StaffInfo[] | null;
  copyStaff: StaffInfo[] | null;
  messageTemplate: MessageTemplate | null;
}

export interface MessageTemplate {
  id: number; // 1;
  name: string; // '测试';
  title: string; // '测试邮件模板';
}

export interface FieldOption {
  value: number;
  label: string;
}
// 单独接口请求  fieldOptions: FieldOption[]; // 对应字段值选项
