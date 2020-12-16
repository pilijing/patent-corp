<template>
  <div class="unbilled">
    <page-card>
      <panel-table-filter
        v-model="filter"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
      <div class="btn-margin">
        <el-button
          type="primary"
          class="add-btn"
          size="small"
          style="width: auto;"
          :disabled="billsDownloadList.length === 0"
          @click="exportBillsList"
        >导出</el-button>
        <el-button
          type="primary"
          class="add-btn"
          size="small"
          @click="exportAllBillsList"
          :disabled="innerTableData === null"
          style="width:auto;"
        >全部导出</el-button>
      </div>
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
          >
            <template #default="{ row }">
              <span>{{currencyList[row.currency]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="官费"
          >
            <template #default="{ row }">
              <span> {{row.officialFee}} </span>
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
              <span> {{row.agencyFee}} </span>
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
              <span> {{row.agencysFee}} </span>
              <span>{{currencyList[row.agencysFeeUnit]}}</span>
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
      </div>
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
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import PanelTableFilter from '@/components/panel-table-filter.vue';

export default defineComponent({
  name: 'Unbilled',
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    PanelTableFilter,
  },
  setup(_, context) {
    const { getEnumsInfo, getTypeName, getCodeInfo } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const { $message } = context.root;
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const state = reactive({
      billsDownloadList: [],
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
    options.query = computed(() => state.filter);
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const handleSelectionChange = (val) => {
      state.billsDownloadList = val;
    };
    const exportBillsList = async () => {
      if (state.billsDownloadList) {
        const billIds = state.billsDownloadList.map(item => `&billIds[]=${item.id}`);
        const params = {
          type: 1,
          billIds: billIds.join(''),
        };
        const url = `/patent-corp_api/bills-download?type=${params.type}${params.billIds}`;
        const date = utils.dateFormat(new Date());
        const fileName = `账单 ${date}`;
        utils.getBlob(url, true)
          .then((blob) => {
            utils.saveAs(blob, `${fileName}.xlsx`);
          })
          .catch((err) => {
            $message.error(err);
          });
      }
    };
    const exportAllBillsList = async () => {
      let result = '';
      const { filter } = state;
      Object.keys(filter).forEach((key) => {
        if (filter[key] === null) {
          filter[key] = '';
        }
        result += `&${key}=${filter[key]}`;
      });
      const params = {
        type: 2,
      };
      const url = `/patent-corp_api/bills-download?type=${params.type}${result}`;
      const date = utils.dateFormat(new Date());
      let fileName = '';
      if (
        params.type !== 1
        && state.filter.lawFirmInCharge
        && state.filter.batchNumber
      ) {
        fileName = `${state.filter.lawFirmInCharge} ${state.filter.batchNumber}`;
      } else if (params.type !== 1 && state.filter.lawFirmInCharge) {
        fileName = `${state.filter.lawFirmInCharge} ${date}`;
      } else {
        fileName = `账单 ${date}`;
      }
      utils.getBlob(url, true)
        .then((blob) => {
          utils.saveAs(blob, `${fileName}.xlsx`);
        })
        .catch((err) => {
          $message.error(err);
        });
    };
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      options,
      getTypeName,
      getRegionName,
      currencyList,
      tableLoading,
      innerTableData,
      pagination,
      handlePageChange,
      handleSelectionChange,
      fetchList,
      submitForm,
      resetForm,
      applyTypeList,
      utils,
      exportBillsList,
      exportAllBillsList,
    };
  },
});
</script>
<style lang="scss" scoped>
.unbilled {
  margin-left: 20px;
  width: 98%;
  .unbilled-table {
    width: calc(100vw - 300px);
  }
}
.btn-margin{
  margin: 20px 0 10px 0;
}
</style>
