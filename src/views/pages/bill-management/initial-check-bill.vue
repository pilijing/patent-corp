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
    </page-card>
    <page-card>
      <el-button
        type="primary"
        class="add-btn"
        size="medium"
        disabled
        style="width: auto;"
      >导出</el-button>
      <el-button
        type="primary"
        class="add-btn"
        size="medium"
        disabled
        style="width: auto;"
      >全部导出</el-button>
      <div class="unbilled-table">
        <table-paging
          v-loading="tableLoading"
          :data="innerTableData"
          :pagination="pagination"
          @page-change="handlePageChange"
          :header-cell-style="{ 'background-color': '#fafafa', }"
        >
          <el-table-column
            type="selection"
            width="55"
          >
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="billDate"
            label="代理机构"
          >
            <template #default="{ row }">
              {{utils.dateFormat(row.billDate)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="patentCaseNumber"
            label="国家/地区"
            width="130"
          >
            <template #default="{ row }">
              <router-link :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}">
                20CN1168
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="applicationTypeName"
            label="申请类型"
          />
          <el-table-column
            prop="currentStageName"
            label="阶段"
          />
          <el-table-column
            show-overflow-tooltip
            prop="currentStepName"
            label="步骤"
          >
            <template #default="{ row }">
              <router-link
                v-if="row.currentStepId === 456  || row.currentStepName === '立项初审'"
                :to="{ path: '/first-application/detail',query: {id: row.patentId}}"
              >
                {{ row.currentStepName || '暂无' }}
              </router-link>
              <router-link
                :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}"
                v-else
              >
                {{ row.currentStepName || '暂无' }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="workingDueDate"
            width="100"
            label="提交日期"
          >
            <template #default="{ row }">
              {{utils.dateFormat(row.workingDueDate)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="lawFirmInChargeName"
            label="批次号"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="费用类目"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="费用名称"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="请款币种"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="官费"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            width="100"
            label="本所代理费"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            width="100"
            label="外所代理费"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="出账状态"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="初核状态"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="复核状态"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
            label="支付状态"
          />
          <el-table-column
            show-overflow-tooltip
            prop="agentInChargeName"
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
            prop="agentInChargeName"
            width="150"
            label="外所代理费收费方式"
          />
          <!-- <el-table-column
                show-overflow-tooltip
                prop="agentInChargeName"
                label="备注"
              /> -->
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
import { useLookupsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';

export default defineComponent({
  name: 'Unbilled',
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
  },
  setup() {
    const { getEnumsInfo } = useLookupsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      filter: {
        lawFirmInCharge: null, // 代理机构
        regionCode: '', // 国家/地区
        payState: '', // 批次状态
      },
      filterColumns: [
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
          dataIndex: 'regionCode',
          type: 'region',
          label: '国家/地区',
          // placeholder: '',
        },
        {
          dataIndex: 'payState',
          type: 'select|BILL_PAYMENT_STATE',
          label: '批次状态',
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
    } = usePagingData('/patent-corp_api/progress-list');
    options.query = computed(() => state.filter);
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
      applyTypeList,
      utils,
    };
  },
});
</script>
<style lang="scss" scoped>
.unbilled {
  margin-left: 20px;
  width: 98%;
  .unbilled-table {
    width: calc(100vw - 328px);
  }
}
</style>
