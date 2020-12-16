<template>
  <div class="tree-container" v-if="treeData">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      :default-expanded-keys="defaultExpandedKeys"
      class="tree"
      highlight-current
      @node-click="handleClickTree"
      ref="treeRef"
      :current-node-key="currentNodeKey"
    >
      <span
        class="custom-tree-node"
        :class="`tree-node-${node.level}`"
        slot-scope="{ node, data }"
      >
        <span>
          <span
            class="tree-item-node"
            :class="`tree-level-${node.level}`"
          ></span>
          <span class="node-label" :title="node.label" :class="`node-label-${node.level}`">
            {{ node.label }}</span
          >
          <span class="data-createdOn">{{
            data.createdOn | dateFormat("yyyy-MM-DD")
          }}</span>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  computed,
  ref,
  watch,
} from '@vue/composition-api';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DirectoryTree',
  filters: {
    dateFormat: utils.dateFormat,
  },
  props: { expandedKeys: Array },
  setup(props, context) {
    const { emit } = context;
    const { $route } = context.root;
    const state = reactive({
      defaultProps: {
        children: 'item',
        label: 'name',
      },
    });

    const { data: treeData, fetchData: fetchTreeData } = useHttp(`/patent-corp_api/patents/${$route.query.id}/catalog`);

    onMounted(async () => {
      await fetchTreeData();
      (treeData.value || []).forEach((parent) => {
        parent.nodeArr = [parent.id];
        if (parent.item) {
          parent.item.forEach((child) => {
            child.nodeArr = [parent.id, child.id];
            if (child.item) {
              child.item.forEach((grandson) => {
                grandson.nodeArr = [parent.id, child.id, grandson.id];
              });
            }
          });
        }
      });
    });

    const defaultExpandedKeys = computed(() => {
      // 优先使用 props 中设定的 expandedKeys
      if (props.expandedKeys && props.expandedKeys.length > 0) {
        return props.expandedKeys;
      }
      if (treeData.value) {
        // 默认展开最后一个
        const lastNode = treeData.value[treeData.value.length - 1];
        if (lastNode?.item) {
          return lastNode?.item[lastNode.item.length - 1].nodeArr;
        }
        return lastNode.nodeArr;
      }
      return [];
    });

    const handleClickTree = (data) => {
      emit('update:checked-node-tree', data.nodeArr);
    };

    const treeRef = ref(null);
    const currentNodeKey = computed(() => {
      if (props.expandedKeys && props.expandedKeys.length > 0) {
        return props.expandedKeys[props.expandedKeys.length - 1];
      }
      return null;
    });
    watch(
      () => props.expandedKeys,
      () => {
        if (treeRef.value && currentNodeKey.value) {
          treeRef.value.setCurrentKey(currentNodeKey.value);
        }
      },
      { deep: true },
    );

    return {
      ...toRefs(state),
      treeData,
      handleClickTree,
      treeRef,
      defaultExpandedKeys,
      currentNodeKey,
    };
  },
});
</script>

<style lang="scss" scoped>
.tree {
  padding-left: 10px;
  background-color: transparent;
  color: #333333;
}
.tree:after {
  content: "";
  position: absolute;
  height: calc(100% - 38px);
  border-left: 2px solid #d0d0d0;
  top: 4px;
  top: 20px;
  left: 18px;
}
.tree-node-3 {
  position: relative;
  display: flex;
  align-items: center;
}
.tree-node-3:after {
  content: "";
  width: 5px;
  height: 5px;
  background-color: #d0d0d0;
  position: absolute;
  left: -10px;
  border-radius: 50%;
}
.tree-item-node {
  left: 2px;
  top: 7px;
  width: 14px;
  height: 14px;
  position: absolute;
  background-color: #999999;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.tree-item-node:after {
  content: "";
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
}
.tree-item-node.tree-level-2 {
  width: 8px;
  height: 8px;
  left: 5px;
  top: 9px;
  background-color: #d0d0d0;
}
.tree-item-node.tree-level-2:after {
  display: none;
}
.tree-item-node.tree-level-3 {
  width: 0;
  height: 0;
}
.node-label {
  display: inline-block;
  vertical-align: bottom;
  font-size: 13px;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.647058823529412);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-label-1 {
  font-size: 14px;
  color: #333333;
  max-width: 160px;
}
.data-createdOn {
  font-size: 12px;
  display: inline-block;
}
::v-deep {
  .el-tree-node__content {
    position: relative;
    padding-bottom: 8px;
  }
  .el-tree-node__children {
    overflow: inherit;
  }
  .el-tree-node.is-current > .el-tree-node__content {
    color: #016eff;
    background-color: transparent;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-item-node {
    background-color: #016eff;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-node-3:after {
    background-color: #016eff;
  }
  .el-tree-node.is-current > .el-tree-node__content .node-label {
    color: #016eff;
  }
}
</style>
