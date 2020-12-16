<template>
  <div class="unbilled-bill">
    <div class="unbilled-page-card">
      <panel-table-filter
        v-model="filter"
        style="margin-bottom:20px"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
    </div>
    <div class="unbilled-page-card">
      <el-button
        type="primary"
        class="add-btn"
        size="small"
        @click="dialogSpecifyBatch = true"
        style="width: auto;margin:20px 0"
        :disabled="multipleSelection.length === 0"
        v-if="!batchId"
      >指定批次</el-button>
      <div class="unbilled-table">
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
            :selectable="(row) => !row.number"
          >
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="patentCaseNumber"
            width="130"
            label="专利案号"
          >
            <template #default="{ row }">
              <router-link :to="`/dashboard/patent-detail?id=${row.patentId}`">
                {{ row.patentCaseNumber || '暂无' }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="applicationTypeName"
            width="200"
            label="申请类型"
          >
            <template #default="{ row }">
              <span>{{getTypeName(Number(row.applicationType))}}</span>
              <span v-if="row.regionCode"> - {{getRegionName(row.regionCode)}}</span>
              <span v-if="row.patentType"> - {{getTypeName(Number(row.patentType))}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="processStageName"
            label="阶段"
          />
          <el-table-column
            show-overflow-tooltip
            prop="stageStepName"
            label="步骤"
            width="110"
          />
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
            width="100"
            label="批次号"
          />
          <el-table-column
            show-overflow-tooltip
            prop="category"
            width="150"
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
          >
            <template #default="{ row }">
              <span>{{currencyList[row.currency]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="officialFee"
            width="100"
            label="官费"
          >
            <template #default="{ row }">
              <span>{{row.officialFee}} </span>
              <span>{{currencyList[row.officialFeeUnit]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="agencyFee"
            width="100"
            label="本所代理费"
          >
            <template #default="{ row }">
              <span>{{row.agencyFee}} </span>
              <span>{{currencyList[row.agencyFeeUnit]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="agencysFee"
            width="100"
            label="外所代理费"
          >
            <template #default="{ row }">
              <span>{{row.agencysFee}} </span>
              <span>{{currencyList[row.agencysFeeUnit]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="outAccountState"
            width="100"
            label="出账状态"
          >
            <template #default="{ row }">
              {{getTypeName(row.outAccountState)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="initialAuditState"
            width="100"
            label="初核状态"
          >
            <template #default="{ row }">
              {{getTypeName(row.initialAuditState)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="checkState"
            width="100"
            label="复核状态"
          >
            <template #default="{ row }">
              {{getTypeName(row.checkState)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="payState"
            width="100"
            label="支付状态"
          >
            <template #default="{ row }">
              {{getTypeName(row.payState)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="officialStandardType"
            width="110"
            label="官费收费方式"
          >
            <template #default="{ row }">
              {{getTypeName(row.officialStandardType)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="agencyFeeStandardType"
            width="150"
            label="本所代理费收费方式"
          >
            <template #default="{ row }">
              {{getTypeName(row.agencyFeeStandardType)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="agencysFeeStandardType"
            width="150"
            label="外所代理费收费方式"
          >
            <template #default="{ row }">
              {{getTypeName(row.agencysFeeStandardType)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="remark"
            width="120"
            label="备注"
          />
        </table-paging>
      </div>
    </div>
    <dialog-specify-batch
      :visible.sync="dialogSpecifyBatch"
      :data="multipleSelection"
      @success="handleSpecifyBatch"
    />
  </div>

</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';

export default defineComponent({
  name: 'unbilled-bill',
  components: {
    // 指定批次
    DialogSpecifyBatch: () => import('./blocks/dialog-specify-batch.vue'),
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
  },
  props: {
    batchId: Number,
  },
  setup(props) {
    const { getTypeName, getCodeInfo, getEnumsInfo } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const payOutState = computed(() => getEnumsInfo('BILL_OUT_ACCOUNT_STATE'));
    const state = reactive({
      filter: {
        patentCaseNumber: null, // 专利案号
        applicationType: null, // 申请类型
        patentType: null, // 专利类型
        regionCode: null, // 国家/地区
        processStageName: '', // 当前阶段
        stageStepName: '', // 当前步骤
        submitAt: [], // 提交日期
        billAt: [], // 账单日期
        lawFirmInCharge: null, // 代理机构
        batchNumber: null, // 批次号
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
          type: 'select|PATENT_TYPE',
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
          dataIndex: 'batchNumber',
          type: 'input',
          label: '批次号',
          placeholder: '精确查询',
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
          type: 'select|BILL_OUT_ACCOUNT_STATE',
          label: '出账状态',
          placeholder: '',
        },
        {
          dataIndex: 'initialAuditState',
          type: 'select|BILL_PRIMARY_NUCLEAR_STATE',
          label: '初核状态',
          placeholder: '',
        },
        {
          dataIndex: 'checkState',
          type: 'select|BILL_REVIEW_STATE',
          label: '复核状态',
          placeholder: '',
        },
        {
          dataIndex: 'payState',
          type: 'select|BILL_PAYMENT_STATE',
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
    options.query = computed(() => state.filter);
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    const dialogSpecifyBatch = false;
    const handleSpecifyBatch = () => {
      fetchList();
    };
    const multipleSelection = ref([]);
    const handleSelectionChange = (val) => {
      multipleSelection.value = val;
    };
    const refs = toRefs(state);
    onMounted(async () => {
      if (props.batchId) {
        refs.filter.value.batchId = props.batchId;
        await fetchList();
      } else {
        refs.filter.value.outAccountState = payOutState.value.Outstanding_Bill;
        await fetchList();
      }
    });
    return {
      ...refs,
      options,
      tableLoading,
      innerTableData,
      pagination,
      handlePageChange,
      handleSelectionChange,
      multipleSelection,
      fetchList,
      submitForm,
      resetForm,
      utils,
      dialogSpecifyBatch,
      handleSpecifyBatch,
      // 字段转义
      getTypeName,
      getRegionName,
      currencyList,
    };
  },
});
</script>
<style lang="scss">
.unbilled-bill {
  .unbilled-table {
    width: calc(100vw - 328px);
  }
}
</style>
