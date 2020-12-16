<template>
  <div class="table-paging">
    <el-table
      ref="table"
      v-bind="$attrs"
      v-on="$listeners"
      :data="data"
    >
      <slot />
    </el-table>
    <el-pagination
      class="pagination"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="limit"
      :layout="layout"
      :total="pagination.total"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api';

export default defineComponent({
  props: {
    data: Array,
    pagination: Object,
  },
  setup(props: any, context) {
    const { emit } = context;
    const table: object | null = ref<string | null>(null);
    const limit = computed(() => props.pagination.limit);
    const offset = computed(() => props.pagination.offset || 0);
    const currentPage = computed(() => (offset.value / limit.value) + 1);
    const pageSizes = computed(() => props.pagination.pageSizes || [10, 20, 50, 100]);
    const layout = computed(() => props.pagination.layout || 'total, prev, pager, next, sizes, jumper');

    const handleCurrentChange = (page: number) => {
      const newOffset = (page - 1) * limit.value;
      emit('page-change', newOffset, limit.value);
    };
    const handleSizeChange = (size: number) => {
      const defaultOffset = 0; // 改变每页条数时，应该重置当前页至第一页
      emit('page-change', defaultOffset, size);
    };
    return {
      table,
      limit,
      offset,
      currentPage,
      pageSizes,
      layout,
      handleCurrentChange,
      handleSizeChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.table-paging {
  background: #fff;
}
.pagination {
  margin: 10px 0;
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  padding: 5px 30px 5px 5px;
  background: #fff;
}
</style>
