import { CommonState } from '@/types/common';
import { StepPropertyField } from '@/types/stage-step';
import { inject, provide, reactive } from '@vue/composition-api';
import {
  DELETE, initialState, POST, PUT, useAsyncV2,
} from './common';

const symbol = Symbol('Symbol for step property field');
type StepPropertyFieldContext = {
  addStepField: (newField: StepPropertyField) => void;
    addStepFieldState: CommonState<any>;
    updateStepField: (updatedStepField: StepPropertyField) => void;
    updateStepFieldState: CommonState<any>;
    deleteStepField: (stageStepId: number, fieldId: number) => void;
    deleteStepFieldState: CommonState<any>;
    reorderStepFields: (stageStepId: number, stageStepFiledIds: number[]) => void;
    reorderStepFieldsState: CommonState<any>;

};

export function useStepPropertyFieldProvider() {
  // 新增步骤属性字段
  const addStepFieldState = reactive(initialState());
  async function addStepField(newField: StepPropertyField) {
    await useAsyncV2(addStepFieldState, () => addRemoteStepField(newField), {
      failureMessage: '新增步骤属性字段失败',
      successMessage: '新增步骤属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function addRemoteStepField(newField: StepPropertyField) {
    await POST<{}, StepPropertyField>('/patent-corp_api/stage-steps/stage-step-field', newField);
  }

  // 更新步骤属性字段
  const updateStepFieldState = reactive(initialState());
  async function updateStepField(updatedStepField: StepPropertyField) {
    await useAsyncV2(updateStepFieldState, () => updateRemoteStepField(updatedStepField), {
      failureMessage: '更新步骤属性字段失败',
      successMessage: '更新步骤属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function updateRemoteStepField(updatedStepField: StepPropertyField) {
    // const stageClaimsFieldId = updatedStepField.id;
    await PUT<{}, StepPropertyField>(
      '/patent-corp_api/stage-steps/stage-step-field',
      updatedStepField,
    );
  }

  // 删除步骤属性字段
  const deleteStepFieldState = reactive(initialState());
  async function deleteStepField(stageStepId: number, fieldId: number) {
    await useAsyncV2(deleteStepFieldState, () => deleteRemoteStepField(stageStepId, fieldId), {
      failureMessage: '删除步骤属性字段失败',
      successMessage: '删除步骤属性字段成功',
      useRemoteFirst: true,
    });
  }
  async function deleteRemoteStepField(stageStepId: number, fieldId: number) {
    await DELETE(`/patent-corp_api/stage-steps/${stageStepId}/stage-step-fields/${fieldId}`);
  }

  // 更新来文详情中属性字段列表的排序

  const reorderStepFieldsState = reactive(initialState());
  async function reorderStepFields(stageStepId: number, stageStepFiledIds: number[]) {
    useAsyncV2(
      reorderStepFieldsState,
      () => reorderRemoteStepFields(stageStepId, stageStepFiledIds),
      {
        failureMessage: '排序步骤属性字段列表失败',
        successMessage: '排序步骤属性字段列表成功',
        useRemoteFirst: true,
      },
    );
  }
  async function reorderRemoteStepFields(stageStepId: number, stageStepFiledIds: number[]) {
    await PUT<
      {},
      {
        stageStepId: number;
        stageStepFiledIDs: number[];
      }
    >('/patent-corp_api/stage-steps/stage-step-field/priority', {
      stageStepId,
      stageStepFiledIDs: stageStepFiledIds,
    });
  }

  provide<StepPropertyFieldContext>(symbol, {
    addStepField,
    addStepFieldState,
    updateStepField,
    updateStepFieldState,
    deleteStepField,
    deleteStepFieldState,
    reorderStepFields,
    reorderStepFieldsState,
  });
}

export function useStepPropertyFieldInject() {
  const claimDetailStore = inject<StepPropertyFieldContext>(symbol);
  if (!claimDetailStore) {
    throw new Error('error in useStepPropertyFieldInject');
  }
  return claimDetailStore;
}
