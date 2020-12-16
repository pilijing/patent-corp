<template>
  <div class="bill-check">
    <page-card>
      <panel-table-filter
        v-model="filter"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
      <div class="bill-check-table">
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
            min-width="120px"
            label="代理机构"
          />
          <el-table-column
            label="国家/地区"
            :show-overflow-tooltip="true"
            min-width="100"
          >
            <template #default="{ row }">{{getRegionName(row.region)}}</template>
          </el-table-column>
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
            label="账单期间"
            min-width="120"
          >
            <template #default="{ row }">
              <span v-if="row.billStartDate">{{utils.dateFormat(row.billStartDate)}}</span>
              <span v-if="row.billEndDate"> ~ {{utils.dateFormat(row.billEndDate)}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="批次状态"
            min-width="100"
          >
            <template #default="{ row }">
              <span>{{getTypeName(row.initialAuditState)}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="通过数"
          >
            <template #default="{ row  }">
              <el-button
                type="text"
                @click="passNumber(row)"
              >
                {{row.passNumber}}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="驳回数"
          >
            <template #default="{ row  }">
              <el-button
                type="text"
                @click="rejectNumber(row)"
              >
                {{row.rejectNumber}}
              </el-button>
            </template>
          </el-table-column>
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
            width="100"
            align="center"
          >
            <template #default="{ row  }">
              <el-button
                type="text"
                :disabled="(row.passNumber + row.rejectNumber !== row.totalNumber) ||
                ((row.initialAuditState !== reviewState.WAITING) &&
                (row.initialAuditState !== reviewState.DISMISSED_REVIEW)) || (row.totalNumber === 0)"
                @click.native="onComplateAudit(row)"
              >
                完成审核
              </el-button>
            </template>
          </el-table-column>
        </table-paging>
      </div>
      <drawer-check-bill
        v-if="drawerBatchBillShow"
        :visible.sync="drawerBatchBillShow"
        :batch-object="batchObject"
        @success="handleBatchBillSuccess"
      ></drawer-check-bill>
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
import DrawerCheckBill from './drawer-check-bill.vue';

export default defineComponent({
  name: 'BillCheck',
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    DrawerCheckBill,
  },
  setup(_, context) {
    const { getRegionName } = useRegionsInject();
    const { getCodeInfo, getTypeName, getEnumsInfo } = useLookupsInject();
    const { dateFormat } = utils;
    const { $message, $confirm } = context.root;
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const reviewState = computed(() => getEnumsInfo('PRIMARY_NUCLEAR_STATE'));
    const batchPhaseList = computed(() => getEnumsInfo('STATE'));
    const primaryCoreState = computed(() => getEnumsInfo('BILL_PRIMARY_NUCLEAR_STATE'));
    const state = reactive({
      batchObject: null,
      drawerBatchBillShow: false,
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
          type: 'select|PRIMARY_NUCLEAR_STATE',
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
      billStage: batchPhaseList.value.PRIMARY_NUCLEAR_STATE || 8902,
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
    const batchBillDialogVisible = ref(false);
    const onComplateAudit = async (row) => {
      state.batchObject = JSON.parse(JSON.stringify(row));
      const { putData: putCheck } = useHttp(`/patent-corp_api/batch-bills/${row.id}/batch-state`);
      $confirm('确认完成审核?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const params = {
          id: row.id,
          remark: '',
          billStage: batchPhaseList.value.PRIMARY_NUCLEAR_STATE || 8902,
        };
        try {
          await putCheck(params);
          $message.success('审核成功!');
          await fetchList();
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    function onOpenBillList(row) {
      state.batchObject = row;
      state.drawerBatchBillShow = true;
    }
    const passNumber = (row) => {
      row.drawerState = primaryCoreState.value.INITIAL_NUCLEAR_PASS;
      state.batchObject = row;
      state.drawerBatchBillShow = true;
    };
    const rejectNumber = (row) => {
      row.drawerState = primaryCoreState.value.INITIAL_VERFICATION_FAILED;
      state.batchObject = row;
      state.drawerBatchBillShow = true;
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
      getRegionName,
      getTypeName,
      fetchList,
      submitForm,
      resetForm,
      onComplateAudit,
      onOpenBillList,
      rejectNumber,
      passNumber,
      utils,
      dateFormat,
      batchBillDialogVisible,
      handleBatchBillSuccess,
      reviewState,
      currencyList,
    };
  },
});
</script>
<style lang="scss" scoped>
.bill-check {
  margin-left: 20px;
  width: 98%;
  .el-tabs {
    .el-tabs__item.is-active {
      font-weight: bold;
    }
  }
  .bill-check-table {
    margin-top: 20px;
    width: calc(100vw - 282px);
  }
}
</style>
