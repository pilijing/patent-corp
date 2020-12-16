<template>
  <div>
    <el-dialog
      title="新建批次"
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
          label="国家/地区"
          prop="regionCode"
          required
        >
          <selector-country
            v-model="formData.regionCode"
            placeholder="请选择国家/地区"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item
          label="代理所"
          prop="lawFirmId"
        >
          <panel-select-search
            v-model="formData.lawFirmId"
            placeholder="请输入代理所"
            maxlength="50"
            api="/patent-corp_api/law-firms"
            query-key="key"
            label-key="lawFirmName"
            value-key="id"
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
import { useLookupsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';
import SelectorCountry from '@/components/selector-country.vue';

export default defineComponent({
  name: 'DialogAgencyFee',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    agencyFeeInfo: Object,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    SelectorCountry,
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();

    const { feeStages } = useLookupsInject();
    const state = reactive({
      formData: {
        regionCode: null,
        lawFirmId: null,
      },
      validateRules: {
        regionCode: [{ required: true, message: '请选择国家/地区' }],
        lawFirmId: [{ required: true, message: '请选择代理所' }],
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
          regionCode: state.formData.regionCode,
          lawFirmId: state.formData.lawFirmId,
        };
        submitLoading.value = true;
        try {
          const { postData } = useHttp('/patent-corp_api/bill-batch');
          await postData({
            lawFirmId: params.lawFirmId,
            region: params.regionCode,
          });
          $message.success('新建成功');
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
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
