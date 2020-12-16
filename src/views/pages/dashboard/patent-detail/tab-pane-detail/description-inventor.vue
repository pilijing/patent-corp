<template>
  <div class="description-inventor">
    <panel-popover :popover-offset="popoverOffset">
      <table-inventor :table-data="data" />
    </panel-popover>
  </div>
</template>

<script>
import {
  defineComponent,
} from '@vue/composition-api';

import TableInventor from './table-inventor.vue';
import PanelPopover from './panel-popover.vue';

export default defineComponent({
  name: 'DescriptionInventor',
  props: {
    data: Array,
    popoverOffset: Number,
  },
  components: {
    TableInventor,
    PanelPopover,
  },
});
</script>

<style lang="scss" scoped>
.patent-table {
  width: 100%;
  padding: 0;
  margin: 0;
  & ::v-deep {
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
