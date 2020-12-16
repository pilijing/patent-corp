<template>
  <div>
    <div style="text-align:left;margin-left: 20px;width: 98%;">
      <page-card>
        <panel-table-filter
          v-model="filter"
          :columns="filterColumns"
          label-width="100px"
          @submit="submitForm"
          @reset="resetForm"
          btnSize="medium"
        />
      </page-card>
      <page-card>
        <div>
          <table-paging
            v-loading="tableLoading"
            :data="processFeeList"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa' }"
            ref="tableRef"
          >
            <el-table-column
              prop="applicationType"
              label="申请类型"
              :show-overflow-tooltip="true"
              min-width="80"
              :formatter="setTableData"
            />
            <el-table-column
              prop="patentTypeIds"
              label="专利类型"
              :show-overflow-tooltip="true"
              min-width="150"
              :formatter="setTableData"
            />
            <el-table-column
              prop="regionCodes"
              label="国家/地区"
              :show-overflow-tooltip="true"
              min-width="150"
              :formatter="setTableData"
            />
            <el-table-column
              prop="name"
              label="流程名称"
              :show-overflow-tooltip="true"
              min-width="150"
            />
            <el-table-column
              prop="effectiveDate"
              label="有效期"
              :show-overflow-tooltip="true"
              min-width="120"
              :formatter="setTableData"
            />
            <el-table-column
              prop="state"
              label="状态"
              :show-overflow-tooltip="true"
              min-width="80"
              :formatter="setTableData"
            />
            <el-table-column
              prop="hasFeeConfig"
              label="是否已配置"
              :show-overflow-tooltip="true"
              min-width="80"
              :formatter="setTableData"
            />
            <el-table-column
              label="操作"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  type="text"
                  @click="handleClick(row)"
                >费用配置</el-button>
              </template>
            </el-table-column>
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
  ref,
} from '@vue/composition-api';
import { useConfigCostInject, useLookupsInject, useRegionsInject } from '@/context';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import utils from '@/utils';

export default defineComponent({
  name: 'ProcessFeesList',
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    TooltipPatentNumber,
  },
  setup(_, context) {
    const { getEnumsInfo, getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      filter: {
        applicationType: null,
        patentType: null,
        regionCode: null,
        name: '',
      },
      filterColumns: [
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '请选择',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '专利类型',
          placeholder: '请选择',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '国家/地区',
          placeholder: '国家/地区',
        },
        {
          dataIndex: 'name',
          type: 'input',
          label: '流程名称',
          placeholder: '请输入',
        },
      ],
    });
    const tableData = ref([]);
    const {
      options,
      loading: tableLoading,
      data: processFeeList,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/process-list');
    options.query = computed(() => state.filter);
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const handleDelete = (row) => {
      console.info('后续删除时用的到==>', row);
      // const { url: deleteUrl, deleteData } = useHttp();
      // deleteUrl.value = `/patent-corp_api/fee-category/${row.id}`;
      // $confirm('是否确认删除?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      // }).then(async () => {
      //   await deleteData();
      //   $message.success('删除成功!');
      //   await fetchList();
      // });
    };
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    const tableRef = ref(null);
    onMounted(async () => {
      await fetchList();
    });
    function getNameByIds(ids) {
      const name = (ids || []).map(item => getTypeName(item)).join('; ');
      return name;
    }
    function getRegionNames(ids) {
      const name = (ids || []).map(item => getRegionName(item)).join('; ');
      return name;
    }
    function setTableData(row, column) {
      const { dateFormat } = utils;
      switch (column.label) {
        case '申请类型':
          return row.applicationType !== null
            ? getTypeName(row.applicationType)
            : '无';
        case '专利类型':
          return row.patentTypeIds !== null
            ? getNameByIds(row.patentTypeIds)
            : '无';
        case '国家/地区':
          return row.regionCodes !== null
            ? getRegionNames(row.regionCodes)
            : '无';
        case '状态':
          return row.state !== null ? getTypeName(row.applicationType) : '无';
        case '是否已配置':
          // eslint-disable-next-line no-nested-ternary
          return row.hasFeeConfig !== null
            ? row.hasFeeConfig
              ? '是'
              : '否'
            : '无';
        case '有效期':
          return row.effectiveDate !== null && row.expirationDate !== null
            ? `${dateFormat(row.effectiveDate, 'yyyy-MM-DD')}~${dateFormat(
              row.expirationDate,
              'yyyy-MM-DD',
            )}`
            : '无';
        default:
          return '';
      }
    }
    const { curProcess } = useConfigCostInject();
    function handleClick(process) {
      curProcess.value = process;
      console.log('process', process);
      const { $router } = context.root;
      $router.push({
        path: '/fee-management/cost-configuration',
        query: { id: process.id },
      });
    }

    return {
      ...toRefs(state),
      tableRef,
      tableData,
      options,
      tableLoading,
      pagination,
      handlePageChange,
      fetchList,
      submitForm,
      resetForm,
      applyTypeList,
      handleDelete,
      processFeeList,
      getRegionName,
      getTypeName,
      setTableData,
      handleClick,
    };
  },
});
</script>
<style lang="scss" scoped>
.icon-btn {
  color: #016eff;
  margin-left: 7px;
  font-size: 18px;
  vertical-align: middle;
  cursor: pointer;
}
.el-icon-question {
  margin-left: 12px;
  font-size: 18px;
  color: #b9b9b9;
  line-height: 25px;
}
</style>
<style lang="scss">
.el-switch__label * {
  font-size: 10px;
}
.switchStyle .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}
.switchStyle .el-switch__label--left {
  z-index: 9;
  left: 6px;
}
.switchStyle .el-switch__label--right {
  z-index: 9;
  left: -17px;
}
.switchStyle .el-switch__label.is-active {
  display: block;
}
.switchStyle.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 50px !important;
}
</style>
