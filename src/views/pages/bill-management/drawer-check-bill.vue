<template>
  <div class="batch-bill">
    <el-drawer
      :title="billBatchTitle"
      style="font-size:18px;font-weight: bold;color:#333"
      :visible.sync="dialogVisible"
      size="85%"
      :inner="true"
      :mask="false"
      class="drawer-padding"
      :before-close="handleClose"
    >
      <div style="padding:0 20px">
        <panel-table-filter
          v-model="filter"
          :columns="filterColumns"
          label-width="100px"
          @submit="submitForm"
          @reset="resetForm"
        />
        <div class="btn-list">
          <el-button
            type="primary"
            class="add-btn"
            size="small"
            style="width: auto;"
            :disabled="(billsDownloadList.length === 0) || (btmDisabled === false)"
            @click="pass"
          >通过</el-button>
          <el-button
            type="danger"
            class="add-btn"
            size="small"
            :disabled="(billsDownloadList.length === 0) || (btmDisabled === false)"
            @click="dialogShow = true"
            style="width: auto;"
          >驳回</el-button>
          <el-button
            type="danger"
            class="add-btn"
            size="small"
            style="width: auto;"
            :disabled="(billsDownloadList.length === 0) || (btmDisabled === false)"
            @click="removeBatch"
          >移出批次</el-button>
        </div>
        <div class="batch-bill-table">
          <table-paging
            v-loading="tableLoading"
            :data="innerTableData"
            :pagination="pagination"
            @page-change="handlePageChange"
            @selection-change="handleSelectionChange"
            :header-cell-style="{ 'background-color': '#fafafa', }"
          >
            <el-table-column
              type="selection"
              width="55"
            >
            </el-table-column>
            <el-table-column
              prop="patentCaseNumber"
              :show-overflow-tooltip="true"
              label="专利案号"
              width="130"
            >
              <template #default="{ row }">
                <router-link :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}">
                  {{row.patentCaseNumber}}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column
              label="申请类型"
              min-width="160px"
              :show-overflow-tooltip="true"
            >
              <template #default="{ row }">
                <span>{{getTypeName(Number(row.applicationType))}}</span>
                <span v-if="row.regionCode"> - {{getRegionName(row.regionCode)}}</span>
                <span v-if="row.patentType"> - {{getTypeName(Number(row.patentType))}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="processStageName"
              label="阶段"
            />
            <el-table-column
              show-overflow-tooltip
              prop="stageStepName"
              min-width="100px"
              label="步骤"
            >
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="submitAt"
              width="100"
              label="提交日期"
            >
              <template #default="{ row }">
                {{utils.dateFormat(row.submitAt)}}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="lawFirmName"
              label="代理机构"
            />
            <el-table-column
              show-overflow-tooltip
              prop="number"
              label="批次号"
            />
            <el-table-column
              show-overflow-tooltip
              prop="category"
              label="费用类目"
            />
            <el-table-column
              show-overflow-tooltip
              prop="feeName"
              label="费用名称"
            />
            <el-table-column
              show-overflow-tooltip
              prop="currency"
              label="请款币种"
            />
            <el-table-column
              show-overflow-tooltip
              label="官费"
            >
              <template #default="{ row }">
                <span> {{row.officialFee}} </span>
                <span>{{CurrencyList[row.officialFeeUnit]}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="agencyFee"
              width="100"
              label="本所代理费"
            >
              <template #default="{ row }">
                <span> {{row.agencyFee}} </span>
                <span>{{CurrencyList[row.agencyFeeUnit]}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="agencysFee"
              width="100"
              label="外所代理费"
            >
              <template #default="{ row }">
                <span> {{row.agencysFee}} </span>
                <span>{{CurrencyList[row.agencysFeeUnit]}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="outAccountState"
              label="出账状态"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.outAccountState)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="initialAuditState"
              label="初核状态"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.initialAuditState)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="checkState"
              label="复核状态"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.checkState)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="payState"
              label="支付状态"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.payState)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="officialStandardType"
              width="110"
              label="官费收费方式"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.officialStandardType)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="agencyFeeStandardType"
              width="150"
              label="本所代理费收费方式"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.agencyFeeStandardType)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="agencysFeeStandardType"
              width="150"
              label="外所代理费收费方式"
            >
              <template #default="{ row }">
                <span>{{getTypeName(row.agencysFeeStandardType)}}</span>
              </template>
            </el-table-column>
          </table-paging>
          <dialog-turn-down
            v-if="dialogShow"
            :visible.sync="dialogShow"
            :batch-data="billsDownloadList"
            @success="handleBatchBillSuccess"
          ></dialog-turn-down>
        </div>
      </div>
    </el-drawer>
  </div>

</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import DialogTurnDown from './blocks/dialog-turn-down.vue';

export default defineComponent({
  name: 'DrawerCheckBill',
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    batchObject: Object,
  },
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    DialogTurnDown,
  },
  setup(props, context) {
    const { emit } = context;
    const { getRegionName } = useRegionsInject();
    const { getTypeName, getCodeInfo, getEnumsInfo } = useLookupsInject();
    const CurrencyList = computed(() => getCodeInfo('CURRENCY'));
    const { dateFormat } = utils;
    const { $message, $confirm } = context.root;
    const stateData = computed(() => getEnumsInfo('STATE'));
    const statusList = computed(() => getEnumsInfo('BILL_PRIMARY_NUCLEAR_STATE'));
    // const statNum = computed(() => getEnumsInfo('PRIMARY_NUCLEAR_STAT'));
    const batchStatus = computed(() => getEnumsInfo('PRIMARY_NUCLEAR_STATE'));
    const state = reactive({
      billsDownloadList: [],
      dialogShow: false,
      btmDisabled: true,
      billBatchTitle: '',
      filter: {
        patentCaseNumber: '', // 专利案号
        applicationType: null, // 申请类型
        patentType: null, // 专利类型
        regionCode: '', // 国家/地区
        processStageName: '', // 阶段
        stageStepName: '', // 步骤
        submitAt: [], // 提交日期0
        billAt: [], // 账单日期0
        lawFirmInCharge: null, // 代理机构
        batchNumber: '', // 批次号
        category: '', // 费用类目
        feeName: '', // 费用名称
        outAccountState: '', // 出账状态
        initialAuditState: '', // 初核状态
        checkState: '', // 复核状态
        payState: '', // 支付状态
      },
      filterColumns: [
        {
          dataIndex: 'patentCaseNumber',
          type: 'input',
          label: '专利案号',
          placeholder: '请输入专利案号',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '请选择申请类型',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '专利类型',
          placeholder: '请选择申请类型',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '国家/地区',
          // placeholder: '',
        },
        {
          dataIndex: 'processStageName',
          type: 'input',
          label: '阶段',
          placeholder: '请输入阶段',
        },
        {
          dataIndex: 'stageStepName',
          type: 'input',
          label: '步骤',
          placeholder: '请输入步骤',
        },
        {
          dataIndex: 'submitAt',
          type: 'date',
          label: '提交日期',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'billAt',
          type: 'date',
          label: '账单日期',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'lawFirmInCharge',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          label: '代理机构',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '',
        },
        {
          dataIndex: 'batchNumber',
          type: 'input',
          label: '批次号',
          placeholder: '请输入批次号',
        },
        {
          dataIndex: 'category',
          type: 'input',
          label: '费用类目',
          placeholder: '请输入费用类目',
        },
        {
          dataIndex: 'feeName',
          type: 'input',
          label: '费用名称',
          placeholder: '请输入费用名称',
        },
        {
          dataIndex: 'outAccountState',
          type: 'select|BILL_OUT_ACCOUNT_STATE',
          label: '出账状态',
          placeholder: '请选择出账状态',
        },
        {
          dataIndex: 'initialAuditState',
          type: 'select|BILL_PRIMARY_NUCLEAR_STATE',
          label: '初核状态',
          placeholder: '请选择初核状态',
        },
        {
          dataIndex: 'checkState',
          type: 'select|BILL_REVIEW_STATE',
          label: '复核状态',
          placeholder: '请选择复核状态',
        },
        {
          dataIndex: 'payState',
          type: 'select|BILL_PAYMENT_STATE',
          label: '支付状态',
          placeholder: '请选择支付状态',
        },
      ],
    });
    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/bills');
    options.query = computed(() => ({
      ...state.filter,
      batchId: props.batchObject.id,
    }));
    // 传入的显示/隐藏状态
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const pass = async () => {
      if (state.billsDownloadList) {
        const billIds = state.billsDownloadList.map(item => item.id);
        const params = {
          billState: statusList.value.INITIAL_NUCLEAR_PASS,
          billIds,
          mainState: stateData.value.PRIMARY_NUCLEAR_STATE,
          rejectionReason: '',
        };
        const { putData: putCheck } = useHttp('/patent-corp_api/approve-bills');
        $confirm('确认通过?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          try {
            await putCheck(params);
            $message.success('通过成功!');
            await fetchList();
          } catch (error) {
            if (error.response) {
              $message.error(error.response.data);
            } else {
              $message.error('操作失败');
            }
          }
        });
      }
    };
    const removeBatch = async () => {
      if (state.billsDownloadList) {
        const billIds = state.billsDownloadList.map(item => item.id);
        const params = {
          billIds,
        };
        const { deleteData } = useHttp(`/patent-corp_api/bill-batch/${props.batchObject.id}`);
        $confirm('确认移出?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          await deleteData(params);
          $message.success('移出成功!');
          await fetchList();
        });
      }
    };
    const handleSelectionChange = (val) => {
      state.billsDownloadList = val;
    };
    const resetForm = async () => {
      state.filter.initialAuditState = null;
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    const handleClose = () => {
      props.batchObject.drawerState = null;
      dialogVisible.value = false;
    };
    const handleBatchBillSuccess = async () => {
      await fetchList();
    };
    onMounted(async () => {
      const statusNum = statusList.value.INITIAL_NUCLEAR_PASS;
      const statusNums = statusList.value.INITIAL_VERFICATION_FAILED;
      state.billBatchTitle = `账单列表 [ ${props.batchObject.number} ]`;
      if (props.batchObject.drawerState === statusNum) {
        state.filter.initialAuditState = statusNum;
      } else if (props.batchObject.drawerState === statusNums) {
        state.filter.initialAuditState = statusNums;
      } else {
        state.filter.initialAuditState = null;
      }
      const batchState = props.batchObject.initialAuditState;
      if (
        batchState === batchStatus.value.INITIAL_NUCLEAR_PASS
        || batchState === batchStatus.value.INITIAL_VERFICATION_FAILED
      ) {
        state.btmDisabled = false;
      }
      await fetchList();
    });
    return {
      ...toRefs(state),
      options,
      tableLoading,
      innerTableData,
      pagination,
      handlePageChange,
      fetchList,
      submitForm,
      resetForm,
      utils,
      getRegionName,
      dialogVisible,
      handleClose,
      handleSelectionChange,
      dateFormat,
      getTypeName,
      CurrencyList,
      pass,
      removeBatch,
      handleBatchBillSuccess,
    };
  },
});
</script>
<style lang="scss" scoped>
.batch-bill {
  margin-left: 20px;
  width: 98%;
  .batch-bill-table {
    width: calc(100vw - 340px);
  }
  .btn-list {
    margin: 30px 0 10px 0;
  }
}
::v-deep .el-drawer__header {
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
  margin-bottom: 20px;
}
::v-deep .el-drawer__header > :first-child {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  padding: 20px;
}
::v-deep .el-drawer__open .el-drawer.rtl {
  padding: 0;
}
::v-deep .el-table .cell {
  font-weight: 400;
}
::v-deep .el-form-item__label {
  font-weight: 400;
}
::v-deep .el-range-editor--medium .el-range-separator {
    font-weight: 400;
}
</style>
<style rel="stylesheet/scss" lang="scss">
:focus {
  outline: 0;
}
.el-drawer__open .el-drawer.rtl {
  padding: 0 20px;
  overflow: scroll;
}
</style>
