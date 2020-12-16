// /api/v1/stage-claims/10086
export const officialClaimDetail = {
  id: 1, // id
  claimsType: 0, // 权利要求类型：官方来文、诉求官方
  documentType: 0, // 来文类型
  englishName: '官方来文', // 名称
  feeNameId: null, // 费用名称id', // 费用名称id
  hasBill: false, // 是否有账单
  name: '官方来文', // 权利名称
  officialName: '申请通知单', // 对应官方来文名称
  priority: 1, // 排序
  processId: 1, // 流程id
  processStageId: 1, // 阶段id
  createdAtUtc: '2020-09-23 14:34:00', // 创建时间
  createdBy: '1', // 创建人
  updatedAtUtc: '2020-09-23 14:34:00', // 创建时间
  updatedBy: '1', // 更新人
  stageClaimsFields: [// 官方/请求事件属性字段
    {
      id: 1, // id
      cascadedById: 2, // 受级联控制的字段id
      cascadedValues: '1;2;', // 级联控制的值(可多个，以;分隔)
      cascadedValuesName: '',
      defaultValueCriteria: '', // 默认
      defaultValueName: '', // 'string';
      englishName: 'test', // 英文名称
      inputType: 'patent_type', // 类型
      isReadonly: false, // 是否只读
      isRequired: true, // 是否必填
      isVisible: true, // 是否显示
      name: '专利类型', // 名称
      priority: 1, // 排序
      stageClaimsId: 1, // 权利要求id
      syncToParentField: '', // 更新事件主体列 更新步骤主体字段
      syncToPatentField: '', // 更新对应的专利值
      syncToStageField: '', // 更新阶段字段值
    },
    {
      id: 2, // id
      cascadedById: 2, // 受级联控制的字段id
      cascadedValues: '1;2;', // 级联控制的值(可多个，以;分隔)
      defaultValueCriteria: '', // 默认
      defaultValueName: '', // 'string';
      englishName: 'test', // 英文名称
      inputType: 'patent_type', // 类型
      isReadonly: true, // 是否只读
      isRequired: false, // 是否必填
      isVisible: false, // 是否显示
      name: '专利类型', // 名称
      priority: 2, // 排序
      stageClaimsId: 1, // 权利要求id
      syncToParentField: '111', // 更新事件主体列 更新步骤主体字段
      syncToPatentField: '123', // 更新对应的专利值
      syncToStageField: '456', // 更新阶段字段值
    },
  ],
  stageDocumentDependencies: [// 官方/事件依赖来文
    {
      id: 1, // id
      dependencyDocumentId: 1, // 依赖来文id
      dependencyStageId: 1, // 依赖来文对应processStageId
      stageClaimsId: 1, // 来文id
    },
  ],
  stageClaimsResults: [// 官方/请求事件结果动作
    {
      id: 1, // id
      isInCurrentStage: true, // 是否保留当前阶段
      newStageId: 2, // 新阶段id
      notifyToType: '2', // 通知人
      ownerType: '3', // 负责人
      stageClaimsId: '1', // 权利请求id
      todoName: '通过', // 待办名称
    },
  ],
  stageClaimsFlows: [// 官方/请求事件答辩
    {
      id: 1, // id
      priority: 1, // 排序
      stageClaimsId: 1, // 权利要求id
      stageStepId: 1, // 事件id
    },
  ],
};

// /api/v1/stage-claims/111
export const dataWithNull = {
  id: 0,
  claimsType: 0,
  documentType: null,
  englishName: '',
  feeNameId: null,
  hasBill: false,
  name: '',
  officialName: null,
  priority: 0,
  processId: 0,
  processStageId: 0,
  createdAtUtc: '0001-01-01T00:00:00Z',
  createdBy: '',
  updatedAtUtc: '0001-01-01T00:00:00Z',
  updatedBy: '',
  stageClaimsFields: null,
  stageDocumentDependencies: null,
  stageClaimsResults: null,
  stageClaimsFlows: null,
};
