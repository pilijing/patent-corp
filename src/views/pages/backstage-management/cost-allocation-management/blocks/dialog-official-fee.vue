<template>
  <div class="dialog-add-field">
    <el-dialog
      :title="isEdit ? '编辑官费' : '新增官费'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
    <el-form
      style="margin-top: 20px"
      :model="formData"
      ref="viewForm"
      label-width="140px"
      :rules="validateRules"
    >
       <el-form-item
        label="国家/地区"
        prop="regionCode"
      >
        <selector-country
          autocomplete="new-password"
          v-model="formData.regionCode"
          placeholder="请选择国家/地区"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="申请类型" prop="applicationType">
        <panel-select
          v-model="formData.applicationType"
          placeholder="请选择申请类型"
          type="APPLY_TYPE"
          multiple
        />
      </el-form-item>
      <el-form-item
        label="专利类型"
        prop="patentType"
      >
        <panel-select
          v-model="formData.patentType"
          placeholder="请选择专利类型"
          type="PATENT_TYPE"
          multiple
        />
      </el-form-item>
      <el-form-item label="费用阶段" prop="phase">
        <panel-select
          v-model="formData.phase"
          placeholder="请选择费用阶段"
          type="FEE_STAGE"
        />
      </el-form-item>
      <el-form-item label="官费名称" prop="feeName">
        <el-input placeholder="请输入官费名称" v-model="formData.feeName" />
      </el-form-item>
      <el-form-item
        label="有效期"
        prop="termValidity"
      >
        <el-date-picker
          v-model="formData.termValidity"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 100%"
          :picker-options="datePickerOptions"
        />
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitForm">确 定</el-button>
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
import PanelSelect from '@/components/panel-select.vue';
import SelectorCountry from '@/components/selector-country.vue';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogOfficialFee',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    officialFeeData: Object,
  },
  components: { PanelSelect, SelectorCountry },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      formData: {
        applicationType: undefined,
        regionCode: undefined,
        phase: undefined,
        feeName: undefined,
        patentType: [],
        termValidity: [],
      },
      validateRules: {
        // applicationType: [{ required: true, message: '请选择申请类型' }],
        regionCode: [{ required: true, message: '请选择国家/地区' }],
        // patentType: [{ required: true, message: '请选择专利类型' }],
        phase: [{ required: true, message: '请选择费用阶段' }],
        termValidity: [{ required: true, message: '请选择有效期' }],
        feeName: [{ required: true, message: '请填写官费名称' }],
      },
      pickerMinDate: undefined,
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
    const isEdit = computed(() => !!props.officialFeeData?.id);

    watch(() => props.visible, (val) => {
      if (val) {
        state.formData = { ...state.formData, ...props.officialFeeData };
        state.formData.termValidity = isEdit.value
          ? [state.formData.validFrom, state.formData.validTo] : [];
      } else { // 重置
        viewForm.value.resetFields();
        delete state.formData.id;
      }
    });

    const {
      loading: submitLoading,
      url: submitOfficialFeeUrl,
      postData: postOfficialFeeForm,
      putData: putOfficialFeeForm,
    } = useHttp();

    const handleSubmitForm = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        const params = {
          ...state.formData,
          failureDateBegin: state.formData.termValidity[0],
          failureDateEnd: state.formData.termValidity[1],
        };
        try {
          if (isEdit.value) {
            submitOfficialFeeUrl.value = `/patent-corp_api/fee-category/${props.officialFeeData.id}`;
            await putOfficialFeeForm(params);
            $message.success('编辑成功!');
          } else {
            submitOfficialFeeUrl.value = '/patent-corp_api/fee-category';
            await postOfficialFeeForm(params);
            $message.success('添加成功!');
          }
          emit('success');
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
    // 时间区间限制
    const datePickerOptions = computed(() => {
      const onPick = (obj) => {
        state.pickerMinDate = undefined;
        if (!obj.maxDate) {
          state.pickerMinDate = new Date(obj.minDate).getTime();
        }
      };
      const disabledDate = (time) => {
        if (state.pickerMinDate) {
          return time.getTime() < state.pickerMinDate;
        }
        return false;
      };
      return {
        disabledDate,
        onPick,
      };
    });

    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSubmitForm,
      isEdit,
      submitLoading,
      datePickerOptions,
    };
  },
});
</script>

<style lang="scss" scoped>

</style>
