<template>
  <div class="payment-approval">
    <page-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="审批列表"
          name="bill"
        >
          <approval-list />
        </el-tab-pane>
        <el-tab-pane
          label="批次列表"
          name="batch"
        >
          <panel-table-filter
            v-model="filter"
            :columns="filterColumns"
            label-width="100px"
            @submit="submitForm"
            @reset="resetForm"
          />
          <el-button
            type="primary"
            class="add-btn"
            size="small"
            :disabled="(batchs.length === 0)"
            style="margin-top: 20px;width: auto;"
            @click="onAddPaymentApproval"
          >发起支付</el-button>
          <div class="payment-approval-table">
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
                :selectable="(row) => row.canCheck"
              />
              <el-table-column
                show-overflow-tooltip
                prop="lawFirmName"
                label="代理机构"
              />
              <el-table-column
                prop="region"
                label="国家/地区"
                :show-overflow-tooltip="true"
                min-width="100"
                :formatter="setTableData"
              />
              <el-table-column
                show-overflow-tooltip
                prop="number"
                label="批次号"
                min-width="100"
              />
              <el-table-column
                show-overflow-tooltip
                prop="billDateRange"
                label="账单期间"
                min-width="180"
                :formatter="setTableData"
              />
              <el-table-column
                show-overflow-tooltip
                prop="payState"
                label="批次状态"
                min-width="100"
                :formatter="setTableData"
              />
              <el-table-column
                show-overflow-tooltip
                prop="passNumber"
                label="通过数"
              />
              <el-table-column
                show-overflow-tooltip
                prop="rejectNumber"
                label="驳回数"
              />
              <el-table-column
                show-overflow-tooltip
                prop="totalNumber"
                label="总数"
              />
              <el-table-column
                show-overflow-tooltip
                prop="totalFee"
                min-width="100px"
                label="费用总额"
              >
                <template #default="{ row }">
                  <span> {{row.totalFee}} </span>
                  <span>{{currencyList[row.totalFeeCurrency]}}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="officialFee"
                min-width="100px"
                label="官费"
              >
                <template #default="{ row }">
                  <span> {{row.officialFee}} </span>
                  <span>{{currencyList[row.officialFeeCurrency]}}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="agencyFee"
                min-width="100px"
                label="本所代理费"
              >
                <template #default="{ row }">
                  <span> {{row.agencyFee}} </span>
                  <span>{{currencyList[row.agencyFeeCurrency]}}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="agencysFee"
                min-width="100px"
                label="外所代理费"
              >
                <template #default="{ row }">
                  <span> {{row.agencysFee}} </span>
                  <span>{{currencyList[row.agencysFeeCurrency]}}</span>
                </template>
              </el-table-column>
            </table-paging>
          </div>
        </el-tab-pane>
      </el-tabs>
    </page-card>
  </div>

</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
  ref,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import ApprovalList from './approval-list.vue';

export default defineComponent({
  name: 'PaymentApproval',
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    ApprovalList,
  },
  setup(_, context) {
    const { getRegionName } = useRegionsInject();
    // const { $message, $confirm } = context.root;
    const { getCodeInfo, getTypeName, getEnumsInfo } = useLookupsInject();
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const { $message, $confirm } = context.root;
    const state = reactive({
      batchs: [],
      filter: {
        lawFirmId: null, // 代理机构
        regionCode: '', // 国家/地区
        batchState: null, // 批次状态
      },
      filterColumns: [
        {
          dataIndex: 'lawFirmId',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          label: '代理机构',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          queryKey: 'key',
          // placeholder: '',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '国家/地区',
          // placeholder: '',
        },
        {
          dataIndex: 'batchState',
          type: 'select|PAYMENT_STATE',
          label: '批次状态',
          // placeholder: '',
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
    } = usePagingData('/patent-corp_api/batch-list');
    const batchPhaseList = computed(() => getEnumsInfo('STATE'));
    options.query = computed(() => ({
      ...state.filter,
      billStage: batchPhaseList.value.PAYMENT_STATE || 8904,
      billStatus: 'payment-approval',
      isList: true,
    }));
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    const handleSelectionChange = (val) => {
      state.batchs = val;
    };
    onMounted(async () => {
      await fetchList();
    });
    function setTableData(row, column) {
      const { dateFormat } = utils;
      switch (column.label) {
        case '批次状态':
          return row.payState !== null ? getTypeName(row.payState) : '无';
        case '国家/地区':
          return row.region !== null ? getRegionName(row.region) : '无';
        case '状态':
          return row.state !== null ? getTypeName(row.applicationType) : '无';
        case '账单期间':
          return row.billStartDate && row.billEndDate
            ? `${dateFormat(row.billStartDate, 'yyyy-MM-DD')}~${dateFormat(
              row.billEndDate,
              'yyyy-MM-DD',
            )}`
            : '无';
        default:
          return '';
      }
    }
    const batchBillDialogVisible = ref(false);
    const batchObject = ref({});
    function onOpenBillList(row) {
      // batchBillDialogVisible.value = true;
      batchObject.value = JSON.parse(JSON.stringify(row));
    }
    const handleBatchBillSuccess = async () => {
      await fetchList();
    };
    const onAddPaymentApproval = async () => {
      if (state.batchs) {
        const batchIds = state.batchs.map(item => item.id);
        const params = {
          batchIds,
        };
        const { putData: putCheck } = useHttp('/patent-corp_api/batch/pay');
        $confirm('确认发起支付?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          try {
            await putCheck(params);
            $message.success('发起支付成功!');
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
    return {
      activeTab: 'bill',
      ...toRefs(state),
      options,
      tableLoading,
      innerTableData,
      pagination,
      handlePageChange,
      fetchList,
      submitForm,
      resetForm,
      setTableData,
      onOpenBillList,
      utils,
      onAddPaymentApproval,
      batchBillDialogVisible,
      handleSelectionChange,
      batchObject,
      handleBatchBillSuccess,
      getTypeName,
      currencyList,
    };
  },
});
</script>
<style lang="scss" scoped>
.payment-approval {
  margin-left: 20px;
  width: 98%;
  .el-tabs {
    .el-tabs__item.is-active {
      font-weight: 500;
    }
  }
  .payment-approval-table {
    margin-top: 20px;
    width: calc(100vw - 284px);
  }
}
::v-deep .is-top {
  font-size: 18px;
}
</style>
