import { CascadeType, CommonState } from '@/types/common';
import { StepResultSetting } from '@/types/step-result-setting';
import { reactive, provide, inject } from '@vue/composition-api';
import {
  initialState, useAsyncV3, GET, POST,
} from './common';

const symbol = Symbol('Symbol for step result setting');
type StepResultSettingContext = {
  updateStepResultSettingState: CommonState<any>;
  updateStepResultSetting: (resultSetting: StepResultSetting) => void;
  getStageStepTreeState: CommonState<CascadeType[]>;
  getStageStepTree: (processId: number) => void;
};

// 单独接口请求  fieldOptions: FieldOption[]; // 对应字段值选项

export function useStepResultSettingProvider() {
  // 更新步骤步骤结果动作
  const updateStepResultSettingState = reactive(initialState());
  async function updateStepResultSetting(resultSetting: StepResultSetting) {
    await useAsyncV3(
      updateStepResultSettingState,
      () => updateRemoteStepResultSetting(resultSetting),
      {
        successMessage: '更新步骤结果设置成功',
        failureMessage: '更新步骤结果设置失败',
        useRemoteFirst: true,
      },
    );
  }
  async function updateRemoteStepResultSetting(resultSetting: StepResultSetting) {
    await POST<{}, StepResultSetting>('/patent-corp_api/stage-step-flow', resultSetting);
  }

  // 获取下一步步骤列表
  const getStageStepTreeState = reactive<CommonState<CascadeType[]>>({ ...initialState(), data: [] });
  async function getStageStepTree(processId: number) {
    const result = await useAsyncV3(getStageStepTreeState, () => getRemoteStageStepTree(processId));
    getStageStepTreeState.data = result || [];
  }
  async function getRemoteStageStepTree(processId: number) {
    const result = await GET<CascadeType[]|null>(`/patent-corp_api/stage-step-tree/${processId}`);
    return result;
  }

  provide<StepResultSettingContext>(symbol, {
    updateStepResultSettingState,
    updateStepResultSetting,
    getStageStepTree,
    getStageStepTreeState,
  });
}

export function useStepResultSettingInject() {
  const claimDetailStore = inject<StepResultSettingContext>(symbol);
  if (!claimDetailStore) {
    throw new Error('error in useStepPropertyFieldInject');
  }
  return claimDetailStore;
}
