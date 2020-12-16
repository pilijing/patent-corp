<template>
  <div class="panel-step-detail">
    <el-collapse-item
      class="collapse-step-item"
      element-loading-spinner="el-icon-loading"
      :name="collaposeItemName"
    >
      <template slot="title">
        <div class="title-name">{{ node.name }}</div>
        <!-- todo 705 706 -->
        <div
          class="estimation-type_checkbox-group"
          v-if="node.stepClaimsType !== 705 && node.stepClaimsType !==706"
        >
          <!-- Commission estimate -->
          <el-checkbox v-model="turnOnCommissionEstimate">
            启用委托预估</el-checkbox>
          <!-- Final estimate -->
          <el-checkbox v-model="turnOnFinalEstimate">
            启用定稿预估</el-checkbox>
          <!-- Bill confirmation -->
          <el-checkbox v-model="turnOnBillConfirmation">
            启用账单确定</el-checkbox>
        </div>
        <div class="arrow-detail">展开详情<i class="el-icon-arrow-down"></i></div>
      </template>
      <div
        style="padding: 10px 20px"
        v-loading="getFeeNodeState.loading"
      >
        <transition
          name="el-fade-in-linear"
          :duration="300"
        >
          <config-cost-card
            v-if="turnOnCommissionEstimate"
            :card="commissionEstimateData"
            :node="node"
          ></config-cost-card>
        </transition>
        <transition
          name="el-fade-in-linear"
          :duration="300"
        >
          <config-cost-card
            v-if="turnOnFinalEstimate"
            :card="finalEstimateData"
            :node="node"
          ></config-cost-card>
        </transition>
        <transition
          name="el-fade-in-linear"
          :duration="300"
        >
          <config-cost-card
            v-if="turnOnBillConfirmation"
            :card="billConfirmationData"
            :node="node"
          ></config-cost-card>
        </transition>
        <div class="panel-event-detail">
          <el-collapse
            class="collapse-event"
            v-model="activeIndexList"
          >
            <config-cost-node
              v-for="(item,index) in node.stageItems || []"
              :key="index"
              :id="index"
              class="collapse-event-item"
              element-loading-spinner="el-icon-loading"
              :item="item"
              :collapose-item-name="item.id"
              :is-collaposed="checkCollaposed(node.stageItems,index)"
              @checked="handleChecked(getCollaposeItemName(node.stageItems,index),$event)"
            ></config-cost-node>
          </el-collapse>
        </div>
      </div>
    </el-collapse-item>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  ref,
  watch,
  inject,
} from '@vue/composition-api';
import utils from '@/utils';
import { ConfigCostNode, EstimationData } from '@/types/config-cost';
import { useConfigCostInject } from '@/context';
import useUrlParams from '@/hooks/url-params';
import ConfigCostCard from './config-cost-card.vue';
import { EstimationType } from './enum';

interface Props {
  item: ConfigCostNode;
  isCollaposed?: boolean;
  nodeArr?: any[];
  collaposeItemName?: string | number;
}
const defaultCommissionEstimate: EstimationData = {
  estimationType: EstimationType.CommissionEstimate,
  feeItems: null,
  source: null,
};
const defaultFinalEstimate: EstimationData = {
  estimationType: EstimationType.FinalEstimate,
  feeItems: null,
  source: null,
};
const defaultBillConfirmation: EstimationData = {
  estimationType: EstimationType.BillConfirmation,
  feeItems: null,
  source: null,
};

export default defineComponent({
  name: 'ConfigCostNode',
  components: {
    ConfigCostCard,
  },
  props: {
    nodeArr: Array,
    item: Object,
    collaposeItemName: [String, Number],
    isCollaposed: Boolean,
  },
  setup(props: Props, context) {
    const { emit, root } = context;
    const { $confirm } = root;
    const state = reactive({
      activeIndexList: [] as string[],
    });
    const {
      getFeeNode,
      getFeeNodeState,
      deleteCard,
      deleteCardState,
    } = useConfigCostInject();
    function handleEventExpandedKeysChange(val: any) {
      emit('expanded-keys-change', val);
    }
    function handleSetFeeClick() {
      console.log('点击了设定费用');
    }
    // TODO: ref => computed
    const node = ref({
      ...props.item,
      estimationList: props.item?.estimationList ?? [],
    });

    watch(
      () => props.item,
      () => {
        node.value = {
          ...props.item,
          estimationList: props.item?.estimationList ?? [],
        };
      },
    );

    const turnOnCommissionEstimate = computed({
      get() {
        return !!node.value?.estimationList?.some(
          (card: any) => card?.estimationType === EstimationType.CommissionEstimate
        );
      },
      set(checked: boolean) {
        handleCommissionEstimateClick(checked);
      },
    });

    const turnOnFinalEstimate = computed({
      get() {
        return !!node.value?.estimationList?.some(
          (card: any) => card?.estimationType === EstimationType.FinalEstimate
        );
      },
      set(checked: boolean) {
        handleFinalEstimateClick(checked);
      },
    });
    const turnOnBillConfirmation = computed({
      get() {
        return !!node.value?.estimationList?.some(
          (card: any) => card?.estimationType === EstimationType.BillConfirmation
        );
      },
      set(checked: boolean) {
        handleBillConfirmationChange(checked);
      },
    });

    const commissionEstimateData = computed(() => node.value.estimationList
      .find(card => card.estimationType === EstimationType.CommissionEstimate));
    const finalEstimateData = computed(() => node.value.estimationList
      .find(card => card.estimationType === EstimationType.FinalEstimate));
    const billConfirmationData = computed(() => node.value.estimationList
      .find(card => card.estimationType === EstimationType.BillConfirmation));

    function handleCommissionEstimateClick(checked: boolean) {
      if (!checked) {
        removeCard(EstimationType.CommissionEstimate);
      } else {
        node.value.estimationList.push(defaultCommissionEstimate);
        emit('expand-node');
      }
    }
    function handleFinalEstimateClick(checked: boolean) {
      if (!checked) {
        removeCard(EstimationType.FinalEstimate);
      } else {
        node.value.estimationList.push(defaultFinalEstimate);
        emit('expand-node');
      }
    }
    const { processId } = useUrlParams(context);

    function handleBillConfirmationChange(checked: boolean) {
      if (!checked) {
        removeCard(EstimationType.BillConfirmation);
      } else {
        node.value.estimationList.push(defaultBillConfirmation);
        emit('expand-node');
      }
    }

    function getCollaposeItemName(data: any, index: number) {
      return `${data[index].id}-${data[index].stepClaimsType}`;
    }
    function checkCollaposed(data: any, index: number) {
      const name = getCollaposeItemName(data, index);
      return !state.activeIndexList.some(activeName => activeName === name);
    }
    function handleChecked(name: string, checked: boolean) {
      if (
        checked
        && !state.activeIndexList.find(activeName => activeName === name)
      ) {
        state.activeIndexList.push(name);
      }
    }
    function removeCard(estimationType: EstimationType) {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { stepClaimsType, id } = node.value;
          await deleteCard(id, stepClaimsType, estimationType);
          if (deleteCardState.error !== null) {
            return;
          }
          getFeeNode(processId.value);
        })
        .catch(() => {
          // TODO 取消之后按2次才触发提醒
          // console.log('checked', checked);
        });
    }

    const useIsAllOpen = inject('is-all-open') as any;
    watch(useIsAllOpen, (val) => {
      if (val.isOpen) { // 展开
        state.activeIndexList = (node.value.stageItems || []).map((item: { id: any }) => item.id);
      } else { // 折叠
        state.activeIndexList = [];
      }
    }, { deep: true });

    return {
      ...toRefs(state),
      utils,
      handleSetFeeClick,
      handleEventExpandedKeysChange,
      node,
      turnOnCommissionEstimate,
      turnOnFinalEstimate,
      turnOnBillConfirmation,
      commissionEstimateData,
      finalEstimateData,
      billConfirmationData,
      getCollaposeItemName,
      checkCollaposed,
      handleChecked,
      getFeeNodeState,
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
.panel-step-detail {
  .arrow-detail {
    color: rgb(0, 118, 255);
  }

  .collapse-step-item {
    margin-top: 15px;
    .title-name {
      font-size: 15px;
      font-weight: 700;
    }
  }

  .estimation-type_checkbox-group {
    flex-grow: 2;
    justify-content: flex-end;
    display: flex;
    margin-right: 30px;
  }

  .collapse-event-item > div > .el-collapse-item__header {
    & {
      padding: 0 30px;
      height: 38px;
      justify-content: space-between;
      background-color: #fff;
      box-sizing: border-box;
      border: 1px solid rgba(220, 230, 229, 1);
      border-left: 5px solid #016eff;
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
  .collapse-event-item > .el-collapse-item__wrap {
    border: 1px solid rgba(220, 230, 229, 1);
    border-top: 0;
  }
  .panel-event-detail {
    .arrow-detail {
      color: rgb(0, 118, 255);
    }
    .collapse-event {
      border: 0;
      ::v-deep {
        .display-list-item {
          line-height: 23px;
        }
      }
      .collapse-event-item {
        margin-top: 15px;
        .title-name {
          font-size: 15px;
        }
      }
    }
  }
}
</style>
