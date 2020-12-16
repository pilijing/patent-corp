<template>
<div>
  <div class="reviewer-list">
    <page-card>
        <panel-table-filter
          v-model="searchData"
          :columns="filterColumns"
          label-width="90px"
          @submit="submitForm"
          @reset="resetForm"
        />
      </page-card>
      <page-card>
        <el-button
          type="primary"
          icon="el-icon-plus"
          class="add-btn"
          size="medium"
          @click="(visibleAddReviewer = true)"
        >新增</el-button>
        <table-paging
          v-loading="tableLoading"
          :data="agencyList"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column
            :show-overflow-tooltip="true"
            prop="deptName"
            label="部门" />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="reviewerFullName"
            label="审核人" />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="clientFullName"
            label="委托人" />
          <el-table-column width="150px" label="操作" align="center">
            <template #default="{ row }">
            <i
              @click="handleDeleteField(row)"
              class="el-icon-delete icon-btn"
            />
            </template>
          </el-table-column>
        </table-paging>
      </page-card>
  </div>
  <dialog-add-reviewer
    :visible.sync="visibleAddReviewer"
    @success="handleAddReviewerSuccess"
  />
</div>
</template>
<script>
import {
  defineComponent, reactive, toRefs, computed, onMounted,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import DialogAddReviewer from './dialog-add-reviewer.vue';

export default defineComponent({
  name: 'ReviewerList',
  components: {
    PanelTableFilter,
    TablePaging,
    DialogAddReviewer,
  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const state = reactive({
      visibleAddReviewer: false,
      searchData: {
        deptId: '',
        reviewerStaffId: '',
      },
      filterColumns: [
        {
          dataIndex: 'deptId',
          type: 'search',
          api: '/patent-corp_api/groups/search',
          queryKey: 'name',
          labelKey: 'orgPath',
          valueKey: 'id',
          label: '部门',
          placeholder: '请输入部门',
          width: '40%',
        },
        {
          dataIndex: 'reviewerStaffId',
          type: 'search',
          api: '/patent-corp_api/staffs/names/like',
          queryKey: 'name',
          labelKey: 'staffFullName',
          valueKey: 'staffId',
          label: '审核人',
          placeholder: '请输入审核人',
          width: '40%',
        },
      ],
    });
    const {
      options,
      loading: tableLoading,
      data: agencyList,
      pagination,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent-corp_api/dept-reviewer');
    const {
      getTypeName,
    } = useLookupsInject();
    options.query = computed(() => ({
      ...state.searchData,
      isList: true,
      name: '',
    }));
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索条件请求
      await fetchList();
      agencyList.value.cooperationType = agencyList.value.map((item) => { // 类型转换
        item.cooperationType = getTypeName(Number(item.cooperationType));
        return item;
      });
    };
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件
      await fetchList();
      agencyList.value.cooperationType = agencyList.value.map((item) => { // 类型转换
        item.cooperationType = getTypeName(Number(item.cooperationType));
        return item;
      });
    };
    const handleDeleteField = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/dept-reviewer/${row.id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteData(row.id);
        $message.success('删除成功!');
        await fetchList();
      });
    };
    // 添加成功之后
    const handleAddReviewerSuccess = async () => {
      await fetchList();
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      submitForm,
      resetForm,
      tableLoading,
      agencyList,
      pagination,
      fetchList,
      handlePageChange,
      handleDeleteField,
      handleAddReviewerSuccess,
    };
  },
});
</script>
<style lang="scss" scoped>
.reviewer-list {
  margin-left: 20px;
  width: 98%;
  .icon-btn{
    color: #016EFF;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: middle;
    cursor:pointer;
  }
}
</style>
