<template>
  <el-table
      class="table-wrap"
      :data="tableData"
      border
      max-height="190px"
      :header-cell-style="{ 'background-color': '#fafafa', }"
    >
      <el-table-column
        label="发明人"
        show-overflow-tooltip
        prop="inventorName"
        min-width="160"
      >
      </el-table-column>
      <el-table-column
        label="姓"
        show-overflow-tooltip
        prop="lastName"
      >
      </el-table-column>
      <el-table-column
        label="名"
        prop="firstName"
        min-width="100"
      />
      <el-table-column
        label="国籍"
        prop="nationality"
      />
      <el-table-column
        label="证件号码"
        prop="certificateName"
        min-width="180"
      >
      </el-table-column>
  </el-table>
</template>

<script>
import {
  defineComponent,
} from '@vue/composition-api';

export default defineComponent({
  name: 'TableInventor',
  props: {
    tableData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.table-wrap {
  ::v-deep {
    .el-table__header tr,
    .el-table__header th {
      padding: 0;
      height: 32px;
      line-height: 32px;
    }
    .cell {
      padding-left: 18px;
    }
    .el-table__body tr,
    .el-table__body td {
      padding: 0;
      height: 32px;
      line-height: 32px;
    }
  }
}
</style>
