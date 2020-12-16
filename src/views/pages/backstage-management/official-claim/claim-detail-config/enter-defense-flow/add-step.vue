<template>
  <div class="add-claims">
    <el-dialog
      :title="isEdit ? '编辑步骤' : '新增步骤'"
      width="720px"
      :visible.sync="innerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
      <el-form
        class="form"
        label-width="120px"
        ref="form"
        :model="formData"
        :rules="formRules"
      >
        <el-form-item
          class="labelName"
          label="步骤名称"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入步骤名称"
          />
        </el-form-item>
        <el-form-item
          class="labelName"
          label="英文名称"
          prop="englishName"
        >
          <el-input
            type="text"
            v-model="formData.englishName"
            placeholder="请输入英文名称"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="
            addDefenseFlowStepState.loading ||
            updateDefenseFlowStepState.loading
          "
          @click="handleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  computed,
  ref,
  watch,
  defineComponent,
  inject,
} from '@vue/composition-api';
import { useDefenseFlowInject, useOfficialClaimDetailInject } from '@/context';

import { DefenseFlowStep } from '@/types/defense-flow';
import { NullableData } from '@/types/common';
import useStepType from '@/hooks/step-type';

interface Props {
  visible: boolean;
  selectedStep: NullableData<DefenseFlowStep>;
}
export default defineComponent({
  name: 'AddClaims',
  props: {
    visible: Boolean,
    selectedStep: Object,
  },
  setup(props: Props, context) {
    const { emit } = context;
    const { $message } = context.root;

    const { curClaimFlowStepTypeId } = useStepType();
    const {
      addDefenseFlowStep,
      addDefenseFlowStepState,
      updateDefenseFlowStep,
      updateDefenseFlowStepState,
    } = useDefenseFlowInject();
    const {
      processId,
      processStageId,
    } = useOfficialClaimDetailInject();

    const updateProcessData = inject('updateProcessData') as any;

    const state = reactive({
      formData: {
        name: '',
        englishName: '',
      },
      inputVisible: false,
    });
    const form = ref();
    const formRules = ref({
      name: [{ required: true, message: '请输入步骤名称', trigger: 'blur' }],
      englishName: [
        { required: true, message: '请输入英文名称', trigger: 'blur' },
      ],
    });
    // 步骤新增

    // 是否是编辑
    const isEdit = computed(() => !!props.selectedStep);
    const innerVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    watch(
      () => innerVisible.value,
      async (newVal) => {
        if (newVal && props.selectedStep) {
          state.formData = {
            name: props.selectedStep.name as string,
            englishName: props.selectedStep.englishName as string,
          };
        } else {
          form.value.resetFields();
        }
      },
    );

    function handleSubmit() {
      form.value.validate(async (valid: boolean) => {
        if (!valid) return;
        if (!isEdit.value) {
          if (
            processId.value
            && processStageId.value
            && updateProcessData.value.id
            && curClaimFlowStepTypeId.value
          ) {
            const newStep = {
              ...state.formData,
              processId: processId.value,
              processStageId: processStageId.value,
              stageClaimsId: updateProcessData.value.id,
              stepType: curClaimFlowStepTypeId.value,
            };
            await addDefenseFlowStep(newStep);
            if (addDefenseFlowStepState.error !== null) {
              $message.error(addDefenseFlowStepState.error?.response?.data);
              return;
            }
            // $message.success('新增步骤成功');
          }
        } else if (updateProcessData.value.id && props.selectedStep.stageClaimsFlowId) {
          await updateDefenseFlowStep(
            {
              ...state.formData,
              stageClaimsId: updateProcessData.value.id,
            },
            props.selectedStep.stageClaimsFlowId,
          );
          if (updateDefenseFlowStepState.error !== null) {
            $message.error(updateDefenseFlowStepState.error?.response?.data);
            return;
          }
          $message.success('编辑步骤成功!');
        }
        emit('success');
        innerVisible.value = false;
      });
    }
    return {
      ...toRefs(state),
      innerVisible,
      form,
      formRules,
      handleSubmit,
      isEdit,
      addDefenseFlowStepState,
      updateDefenseFlowStepState,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-claims {
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
