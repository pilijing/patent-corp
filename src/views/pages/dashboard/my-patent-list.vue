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
              <template #default="{ row }">
                <template v-if="row.applicationType && row.applicationType !== applyTypeList.DIRECTPCTINTL">
                  <router-link :to="{ path: '/dashboard/patent-detail', query: {id: row.id}}">
                    {{ row.patentCaseNumber || '暂无' }}
                  </router-link>
                </template>
                <router-link
                  v-else
                  :to="{ path: '/dashboard/patent-detail',
                query: {id: row.id}}"
                >
                  {{ row.patentCaseNumber || '暂无' }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="patentName"
              label="专利名称"
              :show-overflow-tooltip="true"
              min-width="200"
            />
            <el-table-column
              prop="patentTypeName"
              label="专利类型"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="applicationTypeName"
              label="申请类型"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="regionName"
              label="申请国家"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="ppeInChargeStaffName"
              label="专利工程师"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="currentStageName"
              label="当前阶段"
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

export default defineComponent({
  name: 'MyPatentList',
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
        patentName: '',
        patentType: '',
        applicationType: null,
        regionCode: '',
        ppeInCharge: null,
        currentStageName: '',
        currentStepName: '',
        applicationNumber: '',
        applicationDate: [],
        applicationPurpose: '',
        inventorId: null,
        lawFirmId: null,
      },
      filterColumns: [
        {
          dataIndex: 'patentCaseNumber',
          type: 'input',
          label: '专利案号',
          placeholder: '专利案号',
        },
        {
          dataIndex: 'patentName',
          type: 'input',
          label: '专利名称',
          placeholder: '专利名称',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '专利类型',
          placeholder: '专利类型',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '申请类型',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '申请国家',
          placeholder: '申请国家',
        },
        {
          dataIndex: 'ppeInCharge',
          type: 'search',
          api: '/patent-corp_api/staffs/names/like',
          queryKey: 'name',
          labelKey: 'staffFullName',
          valueKey: 'staffId',
          label: '专利工程师',
          placeholder: '专利工程师',
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
          dataIndex: 'applicationNumber',
          type: 'input',
          label: '申请号',
          placeholder: '申请号',
        },
        {
          dataIndex: 'applicationDate',
          type: 'date',
          label: '申请日期',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'applicationPurpose',
          type: 'select|PATENT_APPLICATION_PURPOSE',
          label: '申请目的',
          placeholder: '申请目的',
        },
        {
          dataIndex: 'inventorId',
          type: 'search',
          api: '/patent-corp_api/inventors',
          label: '第一发明人',
          labelKey: 'fullName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '第一发明人',
          inventorInfo: true,
        },
        {
          dataIndex: 'lawFirmId',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          label: '委托代理所',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '委托代理所',
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
    } = usePagingData('/patent-corp_api/my-patents');

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
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
