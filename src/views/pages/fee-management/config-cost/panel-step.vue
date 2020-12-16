<template>
  <div class="panel-step">
    <el-collapse
      class="collapse-step"
      v-model="activeIndexList"
    >
      <config-cost-node
        v-for="(item,index) in data || []"
        :key="index"
        :id="index"
        class="collapse-step-item"
        element-loading-spinner="el-icon-loading"
        :item="item"
        :collapose-item-name="item.id"
        :is-collaposed="checkCollaposed(data,index)"
        @checked="handleChecked(getCollaposeItemName(data,index),$event)"
        @expand-node="handleExpandNode(getCollaposeItemName(data,index))"
      ></config-cost-node>
    </el-collapse>
  </div>
</template>

<script lang='ts'>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  inject,
  watch,
} from '@vue/composition-api';
import utils from '@/utils';
import ConfigCostCard from './config-cost-card.vue';
import ConfigCostNode from './config-cost-node.vue';
import { EstimationType } from './enum';

/**
 *  步骤/来文/请求折叠面板
 */

export default defineComponent({
  name: 'PanelStep',
  components: {
    ConfigCostCard,
    ConfigCostNode,
  },
  props: {
    data: Array,
    nodeArr: Array,
  },
  setup(props, context) {
    const { emit } = context;

    const state = reactive({
      activeIndexList: [] as string[],
      propertyDetails: {},
    });

    function handleEventExpandedKeysChange(val: any) {
      emit('expanded-keys-change', val);
    }
    function handleSetFeeClick() {
      console.log('点击了设定费用');
    }

    const turnOnCommissionEstimate = computed(() => false);

    function getCollaposeItemName(data: any, index: number) {
      return `${data[index].id}-${data[index].stepClaimsType}`;
    }
    function checkCollaposed(data: any, index: number) {
      const name = getCollaposeItemName(data, index);
      return !state.activeIndexList.some(activeName => activeName === name);
    }
    function handleChecked(name: string, checked: boolean) {
      if (checked && !state.activeIndexList.find(activeName => activeName === name)) {
        state.activeIndexList.push(name);
      }
    }
    function handleExpandNode(name: string) {
      if (!state.activeIndexList.find(activeName => activeName === name)) {
        state.activeIndexList.push(name);
      }
    }

    const useIsAllOpen = inject('is-all-open') as any;
    watch(useIsAllOpen, (val) => {
      if (val.isOpen) { // 展开
        state.activeIndexList = ((props.data || []) as any).map((item: { id: any }) => item.id);
      } else { // 折叠
        state.activeIndexList = [];
      }
    }, { deep: true });

    return {
      ...toRefs(state),
      utils,
      handleSetFeeClick,
      handleEventExpandedKeysChange,
      handleChecked,
      turnOnCommissionEstimate,
      EstimationType,
      getCollaposeItemName,
      checkCollaposed,
      handleExpandNode,
    };
  },
});
</script>

<style lang="scss">
.collapse-step-item > div > .el-collapse-item__header {
  & {
    padding: 0 30px;
    height: 38px;
    justify-content: space-between;
    background-color: rgba(240, 248, 250, 1);
    box-sizing: border-box;
    border: 1px solid rgba(220, 230, 229, 1);
  }
  &.is-active {
    .el-icon-arrow-down {
      transform: rotate(-180deg);
    }
  }
  .el-collapse-item__arrow {
    display: none;
  }
}
.collapse-step-item > .el-collapse-item__wrap {
  border: 1px solid rgba(220, 230, 229, 1);
  border-top: 0;
}
</style>

<style lang="scss" scoped>
.panel-step {
  .arrow-detail {
    color: rgb(0, 118, 255);
  }
  .collapse-step {
    border: 0;
    ::v-deep {
      .display-list-item {
        line-height: 23px;
      }
    }
    .collapse-step-item {
      margin-top: 15px;
      .title-name {
        font-size: 15px;
        font-weight: 700;
      }
    }
  }
}
</style>
