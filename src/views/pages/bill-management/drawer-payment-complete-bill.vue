<template>
  <div class="batch-bill">
    <el-drawer
      :title="`账单列表[${batch.number}]`"
      :visible.sync="dialogVisible"
      size="85%"
      :inner="true"
      :mask="false"
      class="drawer-padding"
      :before-close="handleClose"
    >
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
        <div class="unbilled-table">
          <table-paging
            v-loading="tableLoading"
            :data="innerTableData"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa', }"
          >
            <el-table-column
              show-overflow-tooltip
              prop="patentCaseNumber"
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
              show-overflow-tooltip
              prop="applicationType"
              label="申请类型"
              :formatter="setTableData"
            />
            <el-table-column
              show-overflow-tooltip
              prop="processStageName"
              label="阶段"
            />
            <el-table-column
              show-overflow-tooltip
              prop="stageStepName"
              label="步骤"
            >
              <template #default="{ row }">
                <router-link
                  v-if="row.currentStepId === 456  || row.currentStepName === '立项初审'"
                  :to="{ path: '/first-application/detail',query: {id: row.patentId}}"
                >
                  {{ row.stageStepName || '暂无' }}
                </router-link>
                <router-link
                  :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}"
                  v-else
                >
                  {{ row.stageStepName || '暂无' }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="submitAt"
              width="100"
              label="提交日期"
              :formatter="setTableData"
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
              prop="feeName"
              label="费用类目"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agentInChargeName"
              label="费用名称"
            />
            <el-table-column
              show-overflow-tooltip
              prop="currencyName"
              label="请款币种"
            />
            <el-table-column
              show-overflow-tooltip
              prop="officialFee"
              label="官费"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agencyFee"
              width="100"
              label="本所代理费"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agencysFee"
              width="100"
              label="外所代理费"
            />
            <el-table-column
              show-overflow-tooltip
              prop="outAccountState"
              label="出账状态"
              :formatter="setTableData"
            />
            <el-table-column
              show-overflow-tooltip
              prop="initialAuditState"
              label="初核状态"
              :formatter="setTableData"
            />
            <el-table-column
              show-overflow-tooltip
              prop="checkState"
              label="复核状态"
              :formatter="setTableData"
            />
            <el-table-column
              show-overflow-tooltip
              prop="payState"
              label="支付状态"
              :formatter="setTableData"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agencyFeeStandardTypeName"
              width="110"
              label="官费收费方式"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agentInChargeName"
              width="150"
              label="本所代理费收费方式"
            />
            <el-table-column
              show-overflow-tooltip
              prop="agencyFeeStandardTypeName"
              width="150"
              label="外所代理费收费方式"
            />
            <el-table-column
              show-overflow-tooltip
              prop="remark"
              label="备注"
            />
          </table-paging>
        </div>
      </page-card>
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

export default defineComponent({
  name: 'DrawerPaymentCompleteBill',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    batch: {
      type: Object,
      default: {},
    },
  },
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
  },
  setup(props, context) {
    const { emit } = context;
    const { getRegionName } = useRegionsInject();
    const { getTypeName, getEnumsInfo } = useLookupsInject();
    const state = reactive({
      filter: {
        patentCaseNumber: '', // 专利案号
        applicationType: null, // 申请类型
        patentType: null, // 专利类型
        regionCode: '', // 国家/地区
        processStageName: '', // 当前阶段
        stageStepName: '', // 当前步骤
        submitAt: [], // 提交日期
        billAt: [], // 账单日期
        lawFirmInCharge: null, // 代理机构
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
          placeholder: '模糊查询',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '',
        },
        {
          dataIndex: 'patentType',
          type: 'select|APPLY_TYPE',
          label: '专利类型',
          placeholder: '',
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
          label: '当前阶段',
          placeholder: '模糊查询',
        },
        {
          dataIndex: 'stageStepName',
          type: 'input',
          label: '当前步骤',
          placeholder: '模糊查询',
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
          dataIndex: 'category',
          type: 'input',
          label: '费用类目',
          placeholder: '模糊查询',
        },
        {
          dataIndex: 'feeName',
          type: 'input',
          label: '费用名称',
          placeholder: '模糊查询',
        },
        {
          dataIndex: 'outAccountState',
          type: 'select|APPLY_TYPE',
          label: '出账状态',
          placeholder: '',
        },
        {
          dataIndex: 'initialAuditState',
          type: 'select|APPLY_TYPE',
          label: '初核状态',
          placeholder: '',
        },
        {
          dataIndex: 'checkState',
          type: 'select|APPLY_TYPE',
          label: '复核状态',
          placeholder: '',
        },
        {
          dataIndex: 'payState',
          type: 'select|APPLY_TYPE',
          label: '支付状态',
          placeholder: '',
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
    const batchPhaseList = computed(() => getEnumsInfo('STATE'));
    options.query = computed(() => ({
      ...state.filter,
      billStage: batchPhaseList.value.PAYMENT_STATE || 8904,
      batchId: props.batch.id,
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

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    onMounted(async () => {
      if (dialogVisible.value) {
        await submitForm();
      }
    });
    const setTableData = (row, column) => {
      const { dateFormat } = utils;
      switch (column.label) {
        case '申请类型':
          return `${row.applicationTypeName}-${getRegionName(row.regionCode)}-${getTypeName(Number(row.patentType))}`;
        case '提交日期':
          return dateFormat(row.submitDate, 'yyyy-MM-DD');
        case '出账状态':
          return row.outAccountState !== null ? getTypeName(row.outAccountState) : '无';
        case '初核状态':
          return row.initialAuditState !== null ? getTypeName(row.initialAuditState) : '无';
        case '复核状态':
          return row.checkState !== null ? getTypeName(row.checkState) : '无';
        case '支付状态':
          return row.payState !== null ? getTypeName(row.payState) : '无';
        default:
          return '--';
      }
    };
    const handleClose = () => {
      dialogVisible.value = false;
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
      utils,
      setTableData,
      dialogVisible,
      handleClose,
    };
  },
});
</script>
<style lang="scss">
.batch-bill {
  margin-left: 20px;
  width: 98%;
  .el-tabs {
    .el-tabs__item.is-active {
      font-weight: bold;
    }
  }
  .batch-bill-table {
    width: calc(100vw - 328px);
  }
}
.el-drawer.rtl{
    overflow-y: auto;
}
</style>
