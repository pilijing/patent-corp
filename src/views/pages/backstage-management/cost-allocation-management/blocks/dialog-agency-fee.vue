<template>
  <div>
    <el-dialog
      title="费用类目管理"
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
          <!-- autocomplete="new-password" -->
          <selector-country
            v-model="formData.regionCode"
            placeholder="请选择国家/地区"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item
          label="申请类型"
          prop="applicationTypeIds"
        >
          <panel-select
            multiple
            v-model="formData.applicationTypeIds"
            placeholder="请选择申请类型"
            type="APPLY_TYPE"
          />
        </el-form-item>
        <el-form-item
          label="专利类型"
          prop="patentTypeIds"
        >
          <panel-select
            v-model="formData.patentTypeIds"
            placeholder="专利类型"
            type="PATENT_TYPE"
            multiple
          />
        </el-form-item>
        <el-form-item
          label="费用阶段"
          prop="phase"
        >
          <panel-select
            v-model="formData.phase"
            placeholder="请选择阶段"
            type="FEE_STAGE"
          />
        </el-form-item>
        <el-form-item
          label="费用类目"
          prop="category"
          required
        >
          <el-input v-model="formData.category"></el-input>
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
  watch,
  defineComponent,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';
import SelectorCountry from '@/components/selector-country.vue';

const initformData = {
  regionCode: null,
  applicationTypeIds: null,
  patentTypeIds: null,
  category: null,
  phase: null,
};
export default defineComponent({
  name: 'DialogAgencyFee',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    agencyFeeInfo: Object,
    isEditing: Boolean,
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
        applicationTypeIds: null,
        patentTypeIds: null,
        category: null,
        phase: null,
      },
      validateRules: {
        category: [{ required: true, message: '请输入代理费类目' }],
        regionCode: [{ required: true, message: '请选择国家/地区' }],
        phase: [{ required: true, message: '请选择阶段' }],
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
    const {
      loading: submitLoading, url, postData, putData,
    } = useHttp();
    const handleSubmit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const {
            phase,
            category,
            patentTypeIds,
            regionCode,
            applicationTypeIds,
          } = state.formData;
          const params = {
            phase,
            category,
            patentTypeIds,
            regionCode,
            applicationTypeIds,
          };
          if (props.isEditing) {
            url.value = `/patent-corp_api/fee-category/${props.agencyFeeInfo.id}`;
            await putData(params);
          } else {
            url.value = '/patent-corp_api/fee-category';
            await postData(params);
          }
          emit('success', true);
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };

    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          if (props.agencyFeeInfo) {
            state.formData = { ...state.formData, ...props.agencyFeeInfo };
          } else {
            state.formData = { ...state.formData, ...initformData };
          }
        }
      },
    );

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
