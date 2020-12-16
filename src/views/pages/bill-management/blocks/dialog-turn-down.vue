<template>
  <div>
    <el-dialog
      title="驳回"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="dialogVisible = false;formData.rejectionReason=''"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item
          label="驳回理由"
        >
          <el-input
            type="textarea"
            v-model="formData.rejectionReason"
            rows="3"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false;formData.rejectionReason=''">取 消</el-button>
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
  name: 'DialogTurnDown',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    batchData: Array, // 初核
    billsDownloadList: Array, // 复核
    listData: Array, //  审批
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
    const { getEnumsInfo } = useLookupsInject();
    const stateData = computed(() => getEnumsInfo('STATE'));
    const statusList = computed(() => getEnumsInfo('BILL_PRIMARY_NUCLEAR_STATE'));
    const reviewStatusList = computed(() => getEnumsInfo('BILL_REVIEW_STATE'));
    const applyTypeList = computed(() => getEnumsInfo('PAYMENT_APPROVAL_STATE'));
    const { feeStages } = useLookupsInject();
    const state = reactive({
      formData: {
        rejectionReason: null,
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
    // const resetForm = () => {
    //   formRef.value.resetFields();
    // };
    const submitLoading = ref(false);
    const { putData: putTurnDown } = useHttp('/patent-corp_api/approve-bills');
    const handleSubmit = async () => {
      if (props.billsDownloadList) {
        try {
          const billIds = props.billsDownloadList.map(item => item.id);
          const params = {
            billState: reviewStatusList.value.REVIEW_FAILED,
            billIds,
            mainState: stateData.value.REVIEW_STATE,
            rejectionReason: state.formData.rejectionReason || '',
          };
          await putTurnDown(params);
          emit('success');
          $message.success('操作成功!');
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      } else if (props.batchDatat) {
        try {
          const billIds = props.batchData.map(item => item.id);
          const params = {
            billState: statusList.value.INITIAL_VERFICATION_FAILED,
            billIds,
            mainState: stateData.value.PRIMARY_NUCLEAR_STATE,
            rejectionReason: state.formData.rejectionReason || '',
          };
          await putTurnDown(params);
          emit('success');
          $message.success('操作成功!');
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      } else if (props.listData) {
        try {
          const paymentApprovalIds = props.listData.map(item => item.id);
          const params = {
            paymentApprovalIds,
            state: applyTypeList.value.REJECT,
            remark: state.formData.rejectionReason || '',
          };
          const { putData: putCheck } = useHttp('/patent-corp_api/payment-packages/approval');
          await putCheck(params);
          emit('success');
          $message.success('操作成功!');
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      }
      submitLoading.value = false;
    };
    return {
      ...toRefs(state),
      dialogVisible,
      handleSubmit,
      submitLoading,
      feeStages,
      formRef,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
