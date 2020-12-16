<template>
  <div class="step-result-setting-edit">
    <el-form
      label-position="right"
      label-width="180px"
      :model="formData"
      :rules="rules"
      ref="formRef"
    >
      <el-form-item
        label="是否阻塞性步骤"
        prop="isBlockStep"
        required
      >
        <el-radio-group
          v-model="formData.isBlockStep"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="并行步骤"
        prop="simultaneousSteps"
      >
        <el-select
          v-model="formData.simultaneousSteps"
          style="width: 280px"
          v-loading="loadingStepList"
          clearable
          size="small"
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in filteredStageStepList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="并行步骤完成方式"
        prop="simulStepFinishType"
        v-if="
          formData.simultaneousSteps && formData.simultaneousSteps.length > 0
        "
        required
      >
        <el-radio-group
          v-model="formData.simulStepFinishType"
          size="small"
        >
          <el-radio
            :label="3900"
            border
          >全部通过才进入下一步</el-radio>
          <el-radio
            :label="3901"
            border
          >任一通过进入下一步</el-radio>
          <el-radio
            :label="3902"
            border
          >任一不通过结束</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="完成方式"
        prop="finishType"
        required
      >
        <el-radio-group
          v-model="formData.finishType"
          size="small"
        >
          <el-radio border :label="3920">提交完成</el-radio>
          <el-radio border :label="3921">以字段选项为结果</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="完成后"
        v-if="formData.finishType === 3920"
        required
      >
        <step-result-table
          :finishType="3920"
          :stepResults="formData.stepResultSubmitToFinsh"
          @change="handleStepResultSubmitToFinshChange"
        />
      </el-form-item>
      <el-form-item
        label="选择字段作为步骤结果"
        prop="stepResultField"
        required
        v-if="formData.finishType === 3921"
      >
        <el-select
          v-model="formData.stepResultField"
          placeholder="请选择"
          size="small"
          :style="{ width: '207px' }"
        >
          <el-option
            v-for="item in stepResultFieldOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="步骤可能结果"
        required
        v-if="formData.finishType === 3921"
      >
        <!-- <step-result-table
          :finishType="3921"
          :stepResults="formData.stepResultBasedOnField"
          @change="handleStepResultBasedOnFieldChange"
          :fieldType="resultFieldType"
        /> -->
      </el-form-item>
      <el-form-item
        required
        v-if="formData.finishType === 3921"
        label-width="20px"
      >
        <step-result-table
          :finishType="3921"
          :stepResults="formData.stepResultBasedOnField"
          @change="handleStepResultBasedOnFieldChange"
          :fieldType="resultFieldType"
        />
      </el-form-item>
      <el-row
        type="flex"
        class="row-bg"
        justify="center"
      >
        <el-col :span="6">
          <el-button
            size="small"
            @click="handleCancel"
          >取消</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleSave"
            :loading="updateStepResultSettingState.loading"
          >保存</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts">
import {
  useDefenseFlowInject,
  useStageStep,
  useStepResultSettingInject,
} from '@/context';
import { StepResult, StepResultSetting } from '@/types/step-result-setting';
import {
  computed,
  defineComponent,
  reactive,
  ref,
  toRefs,
} from '@vue/composition-api';
import { Message } from 'element-ui';
import { ElForm } from 'element-ui/types/form';
import StepResultTable from './step-result-table.vue';

const defaultStepResultSetting = {
  isBlockStep: null,
  simultaneousSteps: null,
  simulStepFinishType: null,
  finishType: null,
  stepResultField: null,
  stepResult: [],
  stageStepId: null,
};

type FormData = StepResultSetting & {
  selectedSimultaneousSteps?: number[];
  stepResultBasedOnField: StepResult[] | null;
  stepResultSubmitToFinsh: StepResult[] | null;
};

export default defineComponent({
  name: 'StepResultSettingEdit',
  components: { StepResultTable },
  props: { isDefenseFlow: Boolean },
  setup(props, { emit, root }) {
    const {
      stageStepList,
      loading: loadingStepList,
      getStepDetailState,
      getStepDetail,
    } = useStageStep();
    const { getDefenseFlowStepListState } = useDefenseFlowInject();
    const { $message } = root;
    const state = reactive({
      formData: initFormData(),
      filteredStageStepList:
        props.isDefenseFlow === true
          ? getDefenseFlowStepListState.data.filter(item => item.id !== getStepDetailState.data.id)
          : stageStepList.value.filter(item => item.id !== getStepDetailState.data.id),
    });
    const formRef = ref<ElForm | null>(null);
    const rules = ref({});
    // 通过选项“选择字段作为步骤结果”选择的字段 id 拿到对应的字段类型
    const resultFieldType = computed(() => {
      const curField = getStepDetailState.data.stageStepFields?.find(
        field => field.id === state.formData.stepResultField
      );
      return curField?.inputType;
    });

    function handleCancel() {
      emit('cancel');
    }

    const {
      updateStepResultSetting,
      updateStepResultSettingState,
    } = useStepResultSettingInject();
    //  步骤字段，
    // TODO  加入更多
    const stepResultFieldOptions = computed(() => getStepDetailState.data.stageStepFields?.filter(
          // item => item.inputType === 21 //  交底书不通过理由选择器
          () => true
        ) || []);

    function initFormData(): FormData {
      const temp = {
        ...defaultStepResultSetting,
        ...getStepDetailState.data.stepResultSetting,
      };

      return {
        ...temp,
        stepResultSubmitToFinsh:
          temp.finishType === 3920 ? temp.stepResult : null,
        stepResultBasedOnField:
          temp.finishType === 3921 ? temp.stepResult : null,
      };
    }

    async function handleSave() {
      // TODO 表单验证
      // 数据处理
      state.formData = setStepResultFieldByFinishType(state.formData);
      state.formData = setStepResultListByFinishType(state.formData);
      state.formData = setSimulStepFinishTypeBySimulSteps(state.formData);
      state.formData = setIsEndNextStageStepIdByIsInCurrent(state.formData);

      // 提交更新
      const stageStepId = getStepDetailState.data.id;

      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        stepResultBasedOnField,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        stepResultSubmitToFinsh,
        ...rest
      } = state.formData;
      await updateStepResultSetting({
        ...rest,
        stageStepId,
      });
      if (updateStepResultSettingState.error !== null) {
        $message.error(updateStepResultSettingState.error?.response?.data);
        return;
      }
      $message.success('更新步骤结果设置成功');
      if (!stageStepId) {
        Message.error('找不到步骤ID');
        return;
      }
      getStepDetail(stageStepId);
      emit('success');
    }

    function handleStepResultSubmitToFinshChange(updatedStepResultList: StepResult[]) {
      state.formData.stepResultSubmitToFinsh = updatedStepResultList;
    }
    function handleStepResultBasedOnFieldChange(updatedStepResultList: StepResult[]) {
      state.formData.stepResultBasedOnField = updatedStepResultList;
    }

    return {
      ...toRefs(state),
      formRef,
      handleSave,
      handleCancel,
      rules,
      updateStepResultSettingState,
      loadingStepList,
      stepResultFieldOptions,
      handleStepResultSubmitToFinshChange,
      handleStepResultBasedOnFieldChange,
      resultFieldType,
    };
  },
});

// 根据完成方式来设定步骤结果字段
// 原因是：当用户切换“完成方式”时，需要保留上一次用户选择的“选择字段作为步骤结果”。
// 所以只在最后提交的时候做数据的清理
function setStepResultFieldByFinishType(formData: FormData) {
  // TODO 3920 需要从数据字典获取
  const temp = { ...formData };
  if (formData.finishType === 3920) {
    temp.stepResultField = null;
  }
  return temp;
}
// 根据“完成方式“来设定步骤结果，原因同上
function setStepResultListByFinishType(formData: FormData) {
  const temp = { ...formData };
  if (temp.finishType === 3920) {
    temp.stepResult = setNextIdsByIsEnd(temp.stepResultSubmitToFinsh) || [];
  } else if (temp.finishType === 3921) {
    temp.stepResult = setNextIdsByIsEnd(temp.stepResultBasedOnField) || [];
    // 当使用是否选择器时，只选择2个选项，此时需要过滤未选择的数据用以通过后端api的校验
    // 这里根据需求，全部过滤
    temp.stepResult = filterNullFieldValue(temp.stepResult) || [];
  }
  return temp;
}
// 根据是否结项来设定下一个阶段步骤，原因同上
function setNextIdsByIsEnd(stepResult: StepResult[] | null) {
  return stepResult?.map((item) => {
    if (item.isEnd) {
      item.nextStepId = null;
      item.nextStageId = null;
      return item;
    }
    if (!item.isChangePatentState) {
      item.changePatentState = null;
      return item;
    }
    return item;
  });
}

// 根据是否存在并行步骤来设定并行步骤完成方式，原因同上
function setSimulStepFinishTypeBySimulSteps(formData: FormData) {
  const temp = { ...formData };
  if (
    !(
      Array.isArray(formData.simultaneousSteps)
      && formData.simultaneousSteps.length > 0
    )
  ) {
    temp.simulStepFinishType = null;
  }
  return temp;
}
// 根据是否是否保留当前不变来设定是否结项，下一个阶段步骤等，原因同上
function setIsEndNextStageStepIdByIsInCurrent(formData: FormData) {
  const temp = { ...formData };
  const newStepResult = temp.stepResult.map((item) => {
    if (item.isInCurrent) {
      return {
        ...item,
        isEnd: null,
        nextStepId: null,
        nextStageId: null,
      };
    }
    return item;
  });
  return { ...temp, stepResult: newStepResult };
}

function filterNullFieldValue(stepResult: StepResult[] | null) {
  return stepResult?.filter(item => item.fieldValue);
}
</script>

<style lang="scss" scoped></style>
