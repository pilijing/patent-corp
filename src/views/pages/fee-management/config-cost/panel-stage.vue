<template>
  <div class="panel-stage">
    <el-collapse
      class="collapse-stage"
      v-model="activeIndexList"
    >
      <el-collapse-item
        class="collapse-stage-item"
        v-for="(item, index) in data || []"
        :key="index"
        :name="item.processStageId"
        element-loading-spinner="el-icon-loading"
        :id="`stage-${item.id}`"
      >
        <template slot="title">
          <div class="title-name">{{ item.name }}</div>
          <div class="arrow-detail">
            展开详情<i class="el-icon-arrow-down"></i>
          </div>
        </template>
        <div style="padding: 10px 20px">
          <panel-step :data="item.stageItems||[]" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
/**
 * 阶段详情
 */
import {
  inject,
  defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import utils from '@/utils';
import PanelStep from './panel-step.vue';

export default defineComponent({
  name: 'PanelStage',
  components: { PanelStep },
  props: {
    nodeArr: Array,
    data: Array,
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      activeIndexList: [],
      stageDetails: {},
    });

    function handleStepExpandedKeysChange(val) {
      emit('update:expanded-keys', val);
    }

    const useIsAllOpen = inject('is-all-open');

    watch(useIsAllOpen, (val) => {
      if (val.isOpen) { // 展开
        state.activeIndexList = (props.data || []).map(item => item.processStageId);
      } else { // 折叠
        state.activeIndexList = [];
      }
    }, { deep: true });

    return {
      ...toRefs(state),
      utils,
      handleStepExpandedKeysChange,
    };
  },
});
</script>

<style lang="scss">
.collapse-stage-item {
  margin-top: 15px;
}
.collapse-stage-item > div > .el-collapse-item__header {
  & {
    padding: 0 30px;
    height: 46px;
    justify-content: space-between;
    background-color: rgba(239, 249, 255, 1);
    box-sizing: border-box;
    border: 1px solid rgba(179, 209, 244, 1);
  }
  & .title-name {
    font-size: 16px;
    font-weight: 700;
  }
  & .label-tag-done {
    color: #139f39;
    border-radius: 30px;
    padding: 3px 6px;
    background-color: rgba(210, 246, 212, 1);
  }
  & .label-tag-todo {
    color: #ff5b01;
    border-radius: 30px;
    padding: 3px 6px;
    background-color: #ffdfc8;
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
.collapse-stage-item > .el-collapse-item__wrap {
  border: 1px solid rgba(179, 209, 244, 1);
  border-top: 0;
}
.el-collapse-item__content {
  padding-bottom: 0px;
}
</style>

<style lang="scss" scoped>
.panel-stage {
  .arrow-detail {
    color: rgb(0, 118, 255);
  }
  .collapse-stage {
    border: 0;
    ::v-deep {
      .display-list-item {
        line-height: 23px;
      }
    }
  }
}
</style>
