<template>
  <el-dialog
    title="设定来源"
    :visible.sync="visible"
    width="30%"
    @close="handleDialogClose"
  >
    <span>
      <el-form
        :model="formData"
        ref="formRef"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item
          label="是否有来源"
          prop="hasSource"
          required
        >
          <el-radio-group
            v-model="formData.hasSource"
            size="mini"
          >
            <el-radio
              border
              :label="true"
            >是</el-radio>
            <el-radio
              border
              :label="false"
            >否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="formData.hasSource"
          label="预估来源"
          prop="sourceId"
          required
        >
          <el-select
            v-model="formData.sourceId"
            placeholder="请选择来源"
            size="mini"
            :loading="getSourceOptionsState.loading"
            clearable
          >
            <el-option
              v-for="item in getSourceOptionsState.data"
              :key="item.id"
              :label="item.cnName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </span>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { ElForm } from 'element-ui/types/form';
import { getSelectRules } from '@/utils/form-rules';
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import { useConfigCostInject } from '@/context';
import { ConfigCostNode, EstimationData } from '@/types/config-cost';
import { EstimationType } from './enum';

const sourceRules = {
  hasSource: getSelectRules('请选择是否有来源'),
  sourceId: getSelectRules('请选择来源'),
};

interface Props {
  visible: boolean;
  node: ConfigCostNode;
  card: EstimationData;
}

export default defineComponent({
  name: 'DialogSource',
  props: {
    visible: Boolean,
    node: Object,
    card: Object,
  },
  setup(props: Props, context) {
    const { emit, root } = context;
    const { $message, $route } = root;
    const formRef = ref<ElForm | null>(null);
    const state = reactive({
      formData: {
        hasSource: false,
        sourceId: null as string | null,
      },
    });
    const rules = reactive(sourceRules);

    const {
      getSourceOptions,
      getSourceOptionsState,
      setSource,
      setSourceState,
    } = useConfigCostInject();
    const processId = computed(() => Number($route.query.id));

    const sourceEstimationType = computed(() => {
      if (props?.card?.estimationType === EstimationType.FinalEstimate) {
        return EstimationType.CommissionEstimate;
      }
      if (props?.card?.estimationType === EstimationType.BillConfirmation) {
        return EstimationType.FinalEstimate;
      }
      return null;
    });

    onMounted(() => {
      getSourceOptions(
        processId.value,
        Number(sourceEstimationType.value),
        Number(props?.node.id),
        Number(props?.node.stepClaimsType),
      );
    });

    watch(
      () => props.visible,
      (cur) => {
        if (cur) {
          getSourceOptions(
            processId.value,
            Number(sourceEstimationType.value),
            Number(props?.node.id),
            Number(props?.node.stepClaimsType),
          );
        }
      },
    );
    function handleConfirm() {
      if (!formRef.value) {
        $message.error('未找到来源表单DOM');
        return;
      }
      formRef.value.validate(async (valid: boolean) => {
        if (!valid) {
          return;
        }
        const { stepClaimsType, processStageId, id } = props.node;
        const { estimationType } = props.card;
        if (!state.formData.hasSource) {
          state.formData.sourceId = '';
        }
        // 设定来源
        await setSource({
          estimationType,
          processId: processId.value,
          sourceId: state.formData.sourceId || '',
          stageId: processStageId, //  212;
          stepClaimsId: id,
          stepClaimsType,
        });
        if (setSourceState.error !== null) {
          // Message.error('错误');
        }
        // todo
        emit('update:visible', false);
        emit('success');
      });
    }
    function handleCancel() {
      resetForm();
      emit('update:visible', false);
    }
    function handleDialogClose() {
      resetForm();
      emit('update:visible', false);
    }

    function resetForm() {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    }

    return {
      ...toRefs(state),
      handleConfirm,
      handleCancel,
      formRef,
      handleDialogClose,
      rules,
      getSourceOptionsState,
      sourceEstimationType,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
