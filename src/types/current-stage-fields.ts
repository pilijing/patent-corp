// http://dev.ipatent.woa.com/patent-corp_api/progresses/830/current-step-fields
// BasicSource + StepPropertyField + others
export interface CurrentStepField {
  id: number | null; // 119;
  cascadedById: number | null; // null;
  cascadedValues: string | null; // null;
  defaultValueCriteria: string | null; //  '';
  englishName: string; // 'Tag';
  inputType: number | null; // 22;
  attachmentType: number|null;
  inputTypeName: string; // 'Tags';
  isReadonly: boolean | null; // true;
  isRequired: boolean | null; // true;
  isVisible: boolean | null; // true;
  name: string; // '标签';
  priority: number | null; // 1;
  syncToParentField: number | null; // null;
  syncToPatentField: number | null; // null;
  syncToStageField: number | null; // null;
  syncToStageBodyField: number | null; // ''; // 更新阶段主体字段值
  syncToStepBodyField: number | null; // ''; // 更新步骤主体字段值
  displayType: string; // '';
  isDictionary: boolean; // false;
  dictionaryType: string | null; // null;
  queryKey: string | number;
  labelKey: string; // 'name';
  valueKey: string; // 'id';
  hasDynamicSource: boolean; // true;
  dynamicSourceApi: string; // '/tags';
  value: string; //  '';
  displayName: string; //  '';
  multiple: boolean; // true;
  defaultValueType: number | null; // null;
  copyStepField: number | null; // null;
  copyPatentField: number | null; // null;
}

export type CurrentStepFieldsResponse = {
  progressId: number; // 830,
  progressName: string; // '填写专利信息',
  progressEnglishName: string; // 'Fill in patent information',
  staffInCharge: string; // '',
  workingDueDate: string; // '2020-11-15T14:11:57+08:00',
  officialDueDate: string | null;
  currentStepFields: CurrentStepField[];
};
