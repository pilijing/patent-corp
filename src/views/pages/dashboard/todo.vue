<template>
  <div class="">
    <div style="margin-left: 20px;width: 98%;">
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
        <div style="margin:12px;">
          <table-paging
            v-loading="tableLoading"
            :data="innerTableData"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa', }"
          >
            <el-table-column
              prop="patentCaseNumber"
              label="专利案号"
              :show-overflow-tooltip="true"
              width="130"
            >
              <template
                #default="{ row }"
              >
                <template v-if="row.applicationType && row.applicationType !== applyTypeList.DIRECTPCTINTL">
                  <router-link
                    v-if="row.currentStepId === 456  || row.currentStepName === '立项初审'"
                    :to="{ path: '/first-application/detail',query: {id: row.patentId}}">
                    {{ row.patentCaseNumber || '暂无' }}
                  </router-link>
                  <router-link :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}" v-else >
                    {{ row.patentCaseNumber || '暂无' }}
                  </router-link>
                </template>
              </template>
            </el-table-column>
            <el-table-column
              prop="patentName"
              label="专利名称"
              :show-overflow-tooltip="true"
              min-width="200"
            />
            <el-table-column
              prop="applicationTypeName"
              label="申请类型"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="currentStageName"
              label="当前阶段"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="currentStepName"
              label="当前步骤"
              :show-overflow-tooltip="true"
            >
              <template #default="{ row }">
               <router-link
                  v-if="row.currentStepId === 456  || row.currentStepName === '立项初审'"
                  :to="{ path: '/first-application/detail',query: {id: row.patentId}}">
                  {{ row.currentStepName || '暂无' }}
                </router-link>
                <router-link :to="{ path: '/dashboard/patent-detail', query: {id: row.patentId}}" v-else >
                  {{ row.currentStepName || '暂无' }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="workingDueDate"
              label="工作时限"
              :show-overflow-tooltip="true"
            >
            <template #default="{ row }">
              {{utils.dateFormat(row.workingDueDate)}}
            </template>
            </el-table-column>
            <el-table-column
              prop="officialDueDate"
              label="法定时限"
              :show-overflow-tooltip="true"
            >
            <template #default="{ row }">
              {{utils.dateFormat(row.officialDueDate)}}
            </template>
            </el-table-column>
            <el-table-column
              prop="lawFirmInChargeName"
              label="当前代理所"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="agentInChargeName"
              label="当前代理人"
              :show-overflow-tooltip="true"
            />
          </table-paging>
        </div>
      </page-card>
    </div>
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
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
// import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import utils from '@/utils';

export default defineComponent({
  name: 'MyTodoList',
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    // TooltipPatentNumber,
  },
  setup() {
    const { getEnumsInfo } = useLookupsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      filter: {
        patentCaseNumber: '',
        applicationType: null,
        currentStageName: '',
        currentStepName: '',
        workingDueDate: [],
        officialDueDate: [],
        lawFirmInCharge: null,
        agentInCharge: null,
      },
      filterColumns: [
        {
          dataIndex: 'patentCaseNumber',
          type: 'input',
          label: '专利案号',
          placeholder: '专利案号',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '申请类型',
        },
        {
          dataIndex: 'currentStageName',
          type: 'input',
          label: '当前阶段',
          placeholder: '当前阶段',
        },
        {
          dataIndex: 'currentStepName',
          type: 'input',
          label: '当前步骤',
          placeholder: '当前步骤',
        },
        {
          dataIndex: 'workingDueDate',
          type: 'date',
          label: '工作时限',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'officialDueDate',
          type: 'date',
          label: '法定时限',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'lawFirmInCharge',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          label: '当前代理所',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '当前代理所',
        },
        {
          dataIndex: 'agentInCharge',
          type: 'search',
          api: '/patent-corp_api/agent-list',
          label: '当前代理人',
          labelKey: 'name',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '当前代理人',
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
</style>
