<template>
  <div class="bill">
    <page-card>
      <panel-table-filter
        v-model="filter"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
    </page-card>
    <page-card>
      <div class="bill-table">
        <table-paging
          v-loading="tableLoading"
          :data="innerTableData"
          :pagination="pagination"
          @page-change="handlePageChange"
          :header-cell-style="{ 'background-color': '#fafafa', }"
        >
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
          >
            <template #default="{ row  }">
              <el-button
                type="text"
                @click="onOpenBillList(row)"
              >
                {{row.number}}
              </el-button>
            </template>
          </el-table-column>
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
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template #default="{ row  }">
              <el-button
                type="text"
                :disabled="row.payState !== paymentState.PENDING_CERTIFICATE"
                @click.native="onUploadVoucher(row)"
              >
                上传凭证
              </el-button>
            </template>
          </el-table-column>
        </table-paging>
      </div>
    </page-card>
    <drawer-voucher-bill
      v-if="batchBillDialogVisible"
      :visible.sync="batchBillDialogVisible"
      :batch="batchObject"
      @success="handleBatchBillSuccess"
    />
    <dialog-bill-voucher-upload
      v-if="dialogBillVloucherUploadVisible"
      :visible.sync="dialogBillVloucherUploadVisible"
      :batchInfo="batchObject"
      @success="fetchList"
    />
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

export default defineComponent({
  name: 'BillVoucher',
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    DrawerVoucherBill: () => import('./drawer-voucher-bill.vue'),
    DialogBillVoucherUpload: () => import('./dialog-bill-voucher-upload.vue'),
  },
  setup() {
    const { getRegionName } = useRegionsInject();
    const { getCodeInfo, getEnumsInfo, getTypeName } = useLookupsInject();
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const paymentState = computed(() => getEnumsInfo('PAYMENT_STATE'));
    const batchPhaseList = computed(() => getEnumsInfo('STATE'));
    const state = reactive({
      batchBillDialogVisible: false,
      dialogBillVloucherUploadVisible: false,
      batchObject: {},
      filter: {
        lawFirmId: null, // 代理机构
        regionCode: '', // 国家/地区
        batchState: paymentState.value.PENDING_CERTIFICATE, // 出账状态
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
          type: 'select|PAYMENT_STATE', // TODO:待审批项需要移除
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
    options.query = computed(() => ({
      ...state.filter,
      billStage: batchPhaseList.value.REVIEW_STATE || 8904,
      billStatus: 'bill-voucher',
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
    const onOpenBillList = (row) => {
      state.batchBillDialogVisible = true;
      state.batchObject = JSON.parse(JSON.stringify(row));
    };
    const onUploadVoucher = (row) => {
      state.batchObject = JSON.parse(JSON.stringify(row));
      state.dialogBillVloucherUploadVisible = true;
    };
    const handleBatchBillSuccess = async () => {
      await fetchList();
    };
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
      setTableData,
      onOpenBillList,
      utils,
      onUploadVoucher,
      handleBatchBillSuccess,
      paymentState,
      getTypeName,
      currencyList,
    };
  },
});
</script>
<style lang="scss" scoped>
.bill {
  margin-left: 20px;
  width: 98%;
  .el-tabs {
    .el-tabs__item.is-active {
      font-weight: bold;
    }
  }
  .bill-table {
    margin-top: 20px;
    width: calc(100vw - 284px);
  }
}
</style>
