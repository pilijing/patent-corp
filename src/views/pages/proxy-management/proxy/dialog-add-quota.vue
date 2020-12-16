<template>
  <div class="dialog-add-field">
    <el-dialog
      :title="isEdit ? '编辑份额' : '添加份额'"
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
      <el-form-item label="申请类型" prop="applicationType">
        <panel-select
          v-model="formData.applicationType"
          placeholder="请选择申请类型"
          type="APPLY_TYPE"
        />
      </el-form-item>
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
      <el-form-item label="委托等级" prop="entrustGrade">
        <panel-select
          v-model="formData.entrustGrade"
          placeholder="请选择委托等级"
          type="ENTRUST_GRADE"
        />
      </el-form-item>
      <el-form-item label="案件量" prop="caseTotal">
        <el-input-number v-model="formData.caseTotal"
          :min="1"
          :max="999999"
          @change="toInteger">
        </el-input-number>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitQuota">确 定</el-button>
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
  name: 'DialogAddQuota',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    quotaData: Object,
  },
  components: { PanelSelect, SelectorCountry },
  setup(props, context) {
    const { $route, $nextTick, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      formData: {
        applicationType: undefined,
        regionCode: undefined,
        entrustGrade: undefined,
        caseTotal: undefined,
      },
      validateRules: {
        // applicationType: [{ required: true, message: '请选择申请类型' }],
        regionCode: [{ required: true, message: '请选择国家/地区' }],
        // entrustGrade: [{ required: true, message: '请选择委托等级' }],
        caseTotal: [{ required: true, message: '请输入案件量' }],
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
    const isEdit = computed(() => !!props.quotaData?.id);

    watch(() => props.visible, (val) => {
      if (val) {
        state.formData = { ...state.formData, ...props.quotaData };
        state.formData.applicationType = state.formData.applicationType === 0
          ? undefined : state.formData.applicationType;
        state.formData.entrustGrade = state.formData.entrustGrade === 0 ? undefined : state.formData.entrustGrade;
      } else { // 重置
        delete state.formData.id;
        viewForm.value.resetFields();
      }
    });

    const {
      loading: submitLoading,
      url: submitQuotaUrl,
      postData: postQuotaForm,
      putData: putQuotaForm,
    } = useHttp();

    const handleSubmitQuota = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        const params = {
          ...state.formData,
          lawFirmId: Number($route.query.id),
        };
        try {
          if (isEdit.value) {
            submitQuotaUrl.value = `/patent-corp_api/law-firms/${$route.query.id}/quota`;
            await putQuotaForm(params);
            $message.success('编辑成功!');
          } else {
            submitQuotaUrl.value = '/patent-corp_api/law-firms/quota';
            await postQuotaForm(params);
            $message.success('添加成功!');
          }
          emit('success');
          dialogVisible.value = false;
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    const toInteger = () => {
      const reg = /^[0-9]+$/;
      if (!reg.test(state.formData.caseTotal)) {
        $message.warning('只能输入整数');
        // 用以在dom渲染挂载后重新触发dom渲染挂载
        $nextTick(() => {
          // eslint-disable-next-line radix
          state.formData.caseTotal = parseInt(state.formData.caseTotal);
        });
      }
    };

    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSubmitQuota,
      isEdit,
      submitLoading,
      toInteger,
    };
  },
});
</script>

<style lang="scss" scoped>

</style>
