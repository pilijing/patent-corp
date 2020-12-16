<template>
  <div class="description-tags">
    <div class="tag-value">
      <span class="tags-wrapper">
        <span
          v-for="(item, index) in data"
          :key="index"
          class="tag-class"
          :title="`${item.firstName}/${item.secondName}/${item.thirdName}`">
          {{item.firstName}}/{{item.secondName}}/{{item.thirdName}}
          <span v-if="item.isPriorityTag === 1" class="tag-first">优先</span>
        </span>
      </span>
      <panel-popover>
        <el-table :data="data"
          class="patent-table"
          border
          max-height="190px"
        >
          <el-table-column property="firstName" label="一级标签"></el-table-column>
          <el-table-column property="secondName" label="二级标签"></el-table-column>
          <el-table-column property="thirdName" label="三级标签"></el-table-column>
        </el-table>
      </panel-popover>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
} from '@vue/composition-api';
import PanelPopover from './panel-popover.vue';

export default defineComponent({
  name: 'DescriptionTags',
  props: {
    data: Array,
  },
  components: {
    PanelPopover,
  },
});
</script>

<style lang="scss" scoped>
.tag-value {
  display: flex;
  align-items: center;
  height: 24px;
}
.tags-wrapper {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.tag-class::after{
  content: '；';
}
.tag-class:last-child::after{
  content: ' ';
  color: transparent;
}
.tag-first {
  background-color: rgba(255, 240, 213, 1);
  font-size: 12px;
  color: #FF7E01;
  padding: 2px 5px;
  border-radius: 47px;
}
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
