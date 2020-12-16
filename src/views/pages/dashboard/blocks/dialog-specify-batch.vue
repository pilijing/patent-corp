<template>
  <div class="dialog-specify-batch">
    <el-dialog
      title="指定批次"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item
          label="指定可用批次"
          prop="batch"
        >
          <panel-select
            v-if="dialogVisible"
            v-model="formData.batch"
            api="/patent-corp_api/batch/available"
            :apiCallback="(e) => {
              return {
                label: `${e.number || ''} -【${e.lawFirmName || ''}】-【${getRegionName(e.regionCode) || ''}】`,
                value: e.id,
              };
            }"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  toRefs,
  computed,
  reactive,
  ref,
  defineComponent,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';
import SelectorCountry from '@/components/selector-country.vue';

export default defineComponent({
  name: 'DialogSpecifyBatch',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: Array,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    SelectorCountry,
  },
  setup(props, context) {
    const { getRegionName } = useRegionsInject();
    const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();

    const { feeStages } = useLookupsInject();
    const state = reactive({
      formData: {
        batch: null,
      },
      validateRules: {
        batch: [{ required: true, message: '请选择可用批次' }],
      },
    });

    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const submitLoading = ref(false);
    const handleSubmit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        const params = {
          batchId: state.formData.batch,
          billIds: props.data.map(e => e.id),
        };
        submitLoading.value = true;
        try {
          const { postData } = useHttp('/patent-corp_api/bills/batch');
          await postData(params);
          $message.success('操作成功');
          emit('success', true);
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
        submitLoading.value = false;
      });
    };

    const handleClose = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };
    return {
      ...toRefs(state),
      dialogVisible,
      formRef,
      handleSubmit,
      handleClose,
      submitLoading,
      feeStages,
      // 转义
      getRegionName,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
