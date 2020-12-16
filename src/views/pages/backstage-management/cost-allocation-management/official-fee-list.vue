<template>
  <div class="official-fee-list">
    <panel-table-filter
      v-model="filter"
      :columns="filterColumns"
      @submit="submitForm"
      @reset="resetForm"
      label-width="90px"
      :cols="5"
    />
    <el-button
      class="add-btn"
      type="primary"
      icon="el-icon-plus"
      @click="dialogOfficialFee = true; officialFeeData= {};"
      size="medium"
    >新增
    </el-button>
    <table-paging
      v-loading="tableLoading"
      :data="innerTableData"
      :pagination="pagination"
      @page-change="handlePageChange"
      :header-cell-style="{ 'background-color': '#fafafa', }"
    >
      <el-table-column
        prop="regionName"
        label="国家地区"
        show-overflow-tooltip
        min-width="90"
      />
      <el-table-column
        prop="applicationName"
        label="申请类型"
        show-overflow-tooltip
        min-width="140"
      />
      <el-table-column
        prop="patentName"
        label="专利类型"
        show-overflow-tooltip
        min-width="140"
      />
      <el-table-column
        prop="phaseName"
        label="费用阶段"
        show-overflow-tooltip
        min-width="90"
      />
      <el-table-column
        prop="feeName"
        label="官费名称"
        show-overflow-tooltip
        min-width="100"
      />
      <el-table-column
        prop="chargeStandardName"
        label="收费规则"
        show-overflow-tooltip
        min-width="200"
      />
       <el-table-column
        prop="failureDate"
        label="有效期"
        show-overflow-tooltip
        min-width="140"
      />
      <el-table-column min-width="100" label="操作" align="center">
        <template #default="{ row }">
          <i
            @click="handleEditOfficialFee(row)"
             class="el-icon-edit-outline edit-btn"
          />
          <i @click="handleDeleteOfficialFee(row)"
            class="el-icon-delete edit-btn"
          />
        </template>
      </el-table-column>
    </table-paging>
    <dialog-official-fee
      :visible.sync="dialogOfficialFee"
      :official-fee-data="officialFeeData"
      @success="handleOfficialFee" />
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, computed, onMounted,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject, useRegionsInject } from '@/context';
import utils from '@/utils';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import DialogOfficialFee from './blocks/dialog-official-fee.vue';

export default defineComponent({
  name: 'OfficialFeeList',
  components: { PanelTableFilter, TablePaging, DialogOfficialFee },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const { getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const state = reactive({
      filter: {
        applicationType: null,
        patentType: null,
        stage: null,
        regionCode: null,
      },
      filterColumns: [
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
          dataIndex: 'stage',
          type: 'select|FEE_STAGE',
          label: '费用阶段',
          placeholder: '费用阶段',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '申请国家',
          placeholder: '申请国家',
        },
      ],
      dialogOfficialFee: false,
      officialFeeData: {},
    });
    const {
      options,
      loading: tableLoading,
      data: innerTableDatas,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/fee-category-list');

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

    const innerTableData = computed(() => {
      const data = innerTableDatas.value || [];
      const newData = data.map((item) => {
        item.regionName = getRegionName(item.regionCode);
        const effectiveDate = utils.dateFormat(item.validFrom, 'yyyy-MM-DD');
        const invalidDate = utils.dateFormat(item.validTo, 'yyyy-MM-DD');
        item.failureDate = `${effectiveDate} ~ ${invalidDate}`;
        item.phaseName = getTypeName(item.phase);
        return item;
      });
      return [...newData];
    });

    const handleEditOfficialFee = (row) => {
      state.officialFeeData = row;
      state.dialogOfficialFee = true;
    };
    const { url: deleteUrl, deleteData } = useHttp();
    const handleDeleteOfficialFee = (row) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        deleteUrl.value = `/patent-corp_api/fee-category/${row.id}`;
        await deleteData();
        $message.success('删除成功!');
        await fetchList();
      });
    };
    const handleOfficialFee = async () => {
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
      handleDeleteOfficialFee,
      submitForm,
      resetForm,
      handleOfficialFee,
      handleEditOfficialFee,
    };
  },
});
</script>

<style lang="scss" scoped>
.panel-table-filter {
  margin-top: 6px;
  margin-bottom: 20px;
}
.edit-btn {
  color: #016EFF;
  cursor: pointer;
  padding: 0 8px;
  font-size: 18px;
}
::v-deep {
  .el-tabs__item {
    font-size: 20px;
    color: #999999;
  }
  .el-tabs__item.is-active {
    color: rgb(0, 121, 254);
  }
  .form-btn-group {
    flex-grow: 0 !important;
  }
}
</style>
