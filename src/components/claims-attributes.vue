<template>
    <div class="claims-attributes">
        <p>事件属性字段</p>
        <el-table
        :data="tableData"
        :default-sort="{ prop: 'sortNum', order: 'ascending' }"
         @page-change="handlePageChange"
        style="width: 100%">
            <el-table-column prop="number" label="名称" />
            <el-table-column prop="name" label="英文名" />
            <el-table-column prop="type" label="必填" />
            <el-table-column prop="status" label="显示" />
            <el-table-column prop="event" label="只读" />
            <el-table-column prop="time" label="默认" />
            <el-table-column prop="type" label="更新对应的专利值" />
            <el-table-column prop="type" label="更新阶段字段值" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="type" label="更新事件主体字段" />
            <el-table-column label="操作">
            <template #default="{ row }">
                <a class="btn" @click="handleEditItem(row)">修改</a>
                <el-divider direction="vertical" />
                <a class="btn" @click="handleDeleteItem(row)">删除</a>
            </template>
            </el-table-column>
        </el-table>
    </div>

</template>
<script lang="ts">
import {
  defineComponent, reactive,
} from '@vue/composition-api';
import TableFilter from '@/components/table-filter.vue';
import TableFilterItem from '@/components/table-filter-item.vue';
import TablePaging from '@/components/table-paging.vue';
import { usePagingData } from '@/hooks/pagination';

interface State {
  input: string;
  select: string;
  options: object[];
  dateRange: string[];
}

export default defineComponent({
  name: 'claimsAttributes',
  components: {
    TableFilter,
    TableFilterItem,
    TablePaging,
  },
  setup() {
    const state = reactive<State>({
      input: '',
      select: '',
      options: [],
      dateRange: [],
    });
    const {
      loading: tableLoading,
      data: tableData,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent_api/list-table');
    fetchList();
    const handleEditItem = (row: object) => {
      console.info(row);
    };
    const handleDeleteItem = (row: object) => {
      console.info(row);
    };
    return {
      ...state,
      handlePageChange,
      handleEditItem,
      handleDeleteItem,
      tableLoading,
      tableData,
    };
  },
});
</script>
<style lang="scss" scoped>
.list-table {
  .table {
    margin-top: 20px;
  }
}
</style>
