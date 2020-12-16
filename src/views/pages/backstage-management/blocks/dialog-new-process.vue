<template>
  <div class="new-process">
    <el-dialog
      :title="isAddProcess ? '新建流程' : '编辑流程'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetFormModel"
    >
      <el-form :model="formData"
               ref="viewForm"
               :rules="validateRules"
               label-width="120px">
        <el-form-item
          label="名称"
          prop="name"
        >
          <el-input placeholder="请输入流程别名"
                    :maxlength="inputMaxLength"
                    v-model="formData.name"
                    />
        </el-form-item>
        <el-form-item
          label="申请类型"
          prop="applicationType"
        >
          <panel-radio
            v-model="formData.applicationType"
            placeholder="请选择申请类型"
            type="APPLY_TYPE"
            border
            :disabled="isEnable"
          />
        </el-form-item>
        <el-form-item
          label="专利类型"
          prop="patentTypes"
        >
          <panel-checkbox
            v-model="formData.patentTypes"
            placeholder="请选择专利类型"
            type="PATENT_TYPE"
            border
            :disabled="isEnable"
          />
        </el-form-item>
        <el-form-item
          v-if="showCountryArea"
          label="应用国家地区"
          prop="processRegions"
        >
          <selector-country
            multiple
            autocomplete="new-password"
            v-model="formData.processRegions"
            placeholder="该流程在哪些国家生效"
            style="width: 100%;"
            :disabled="isEnable"
          />
        </el-form-item>
        <div class="termValidity">
        <el-form-item
          label="有效期"
          prop="effectiveDate"
        >
            <el-date-picker
              class="width-full"
              v-model="formData.effectiveDate"
              type="date"
              placeholder="生效日期"
              format="yyyy-MM-dd"
              :disabled="isEnable">
            </el-date-picker>
        </el-form-item>
        <span style="margin: 0 10px; line-height: 40px;">-</span>
        <el-form-item
          label=""
          label-width="0"
          prop="expirationDate"
        >
          <el-date-picker
             class="width-full"
              v-model="formData.expirationDate"
              type="date"
              placeholder="失效日期"
              format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              >
            </el-date-picker>
        </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   :loading="submitLoading"
                   @click="submitProcessForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  toRefs, computed, reactive, ref, defineComponent, watch,
} from '@vue/composition-api';
import PanelRadio from '@/components/panel-radio.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import SelectorCountry from '@/components/selector-country.vue';
import { useLookupsInject, useUserInfo } from '@/context';
import { useHttp } from '@/hooks/http';
import cloneDeep from 'lodash/cloneDeep';
import utils from '@/utils';

interface State {
  loading: boolean;
  formData: {
    name: string;
    applicationType: undefined;
    patentTypes: number[];
    processRegions: string[];
    effectiveDate: string;
    expirationDate: string;
  };
  validateRules: {
    name: object[];
    applicationType: object[];
    patentTypes: object[];
    processRegions: object[];
    effectiveDate: object[];
    expirationDate: object[];
  };
  isDisabled: boolean;
  isEnable: boolean;
}
export default defineComponent({
  name: 'NewProcess',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isAddProcess: Boolean,
    decorateProcessId: Number,
  },
  components: {
    PanelRadio,
    PanelCheckbox,
    SelectorCountry,
  },
  setup(props: any, context: any) {
    const {
      getEnumsInfo,
    } = useLookupsInject();
    const { userInfo } = useUserInfo();
    const applyType = computed(() => getEnumsInfo('APPLY_TYPE'));
    const patentType = computed(() => getEnumsInfo('PATENT_TYPE'));
    const processType = computed(() => getEnumsInfo('PROCESS_STATE'));
    const { $router, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive<State>({
      loading: false,
      formData: {
        name: '',
        applicationType: undefined,
        patentTypes: [],
        processRegions: [],
        effectiveDate: '',
        expirationDate: '',
      },
      validateRules: {
        name: [{ required: true, message: '请输入流程别名' }],
        applicationType: [{ required: true, message: '请选择申请类型' }],
        patentTypes: [{ required: true, message: '请选择专利类型' }],
        processRegions: [{ required: true, message: '请选择应用国家地区' }],
        effectiveDate: [{ required: true, message: '请选择生效日期' }],
        expirationDate: [{ required: true, message: '请选择失效日期' }],
      },
      isDisabled: false,
      isEnable: false,
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
    const inputMaxLength = computed(() => {
      const input = state.formData.name;
      if (/[\u4e00-\u9fa5]+/g.test(input)) {
        return 50;
      }
      return 200;
    });
    const showCountryArea = computed(() => state.formData.applicationType !== applyType.value.DIRECTPCTINTL
        && state.formData.applicationType !== applyType.value.PCTINTL);

    const resetFormModel = () => {
      viewForm.value.resetFields();
      state.isDisabled = false;
      state.isEnable = false;
      state.loading = false;
    };
    const {
      loading: submitLoading,
      url: submitProcessUrl,
      postData: postNewProcess,
      putData: putEditProcess,
    } = useHttp();
    const submitForm = async () => {
      const { formData } = state;
      const submitData = {
        ...formData,
        corpId: userInfo.value.corpId,
        processRegions: showCountryArea.value ? formData.processRegions : [],
        isDesign: formData.patentTypes.includes(patentType.value.FACADE), // 设计
        isInvention: formData.patentTypes.includes(patentType.value.INVENTION), // 发明
        isUtility: formData.patentTypes.includes(patentType.value.PRACTICAL),
      };
      let id;
      try {
        if (props.isAddProcess) {
          submitProcessUrl.value = '/patent-corp_api/process';
          id = await postNewProcess(submitData);
          $message.success('提交成功!');
        } else {
          submitProcessUrl.value = `/patent-corp_api/process/${props.decorateProcessId}`;
          await putEditProcess(submitData);
          id = props.decorateProcessId;
          $message.success('编辑成功!');
        }
        resetFormModel();
        dialogVisible.value = false;
        $router.push(`/backstage-management/process-definition?id=${id}`);
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    const submitProcessForm = () => {
      viewForm.value.validate((valid: boolean) => {
        if (!valid) return;
        try {
          submitForm();
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
    const pickerOptions = computed(() => {
      const disabledDate = (time: any) => time.getTime() < Date.now();
      return {
        disabledDate,
      };
    });
    const {
      url: peocessDataUrl,
      fetchData: fetchPeocessData,
    } = useHttp();
    watch(() => props.visible, async (newVal) => {
      // 编辑流程显示弹框时给表单赋值（重置表单的数据）
      if (newVal && props.decorateProcessId) {
        peocessDataUrl.value = `/patent-corp_api/process/${props.decorateProcessId}`;
        const peocessData = await fetchPeocessData();
        const decorateProcess = cloneDeep(peocessData) || {};
        state.formData = {
          ...decorateProcess,
          patentTypes: [],
          processRegions: decorateProcess.processRegions || [],
        };
        const { dateFormat } = utils;
        if (decorateProcess.isDesign) {
          state.formData.patentTypes.push(patentType.value.FACADE);
        }
        if (decorateProcess.isInvention) {
          state.formData.patentTypes.push(patentType.value.INVENTION);
        }
        if (decorateProcess.isUtility) {
          state.formData.patentTypes.push(patentType.value.PRACTICAL);
        }
        const newDateTime = new Date(dateFormat(new Date(), 'yyyy-MM-DD 00:00:00')).getTime();
        const effectiveTime = new Date(dateFormat(decorateProcess.effectiveDate, 'yyyy-MM-DD 00:00:00')).getTime();
        state.isEnable = effectiveTime <= newDateTime && decorateProcess.state !== processType.value.DISABLE;
      }
    });
    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      submitProcessForm,
      showCountryArea,
      patentType,
      submitLoading,
      resetFormModel,
      inputMaxLength,
      pickerOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.width-full {
  width: 100%;
}
.termValidity {
  display: flex;
  .el-form-item {
    flex: 1;
  }
}
::v-deep .el-input__inner{
  border: 1px solid #DCDFE6;
}
</style>
