<template>
  <div class="config-cost-card">
    <div :class="`config-cost-card-name ${colorStr}`"> {{estimationTypeText}}</div>
    <div
      class="config-cost-card-source"
      v-if="displaySourceCardItem"
    >
      <config-cost-card-item
        :estimation-type="sourceEstimationType"
        :feeItemList="card&&card.source&&card.source.feeItems"
        :isSource="true"
        @click="sourceDialogVisible = true"
      >
        <template>
          <dialog-source
            :visible.sync="sourceDialogVisible"
            :node="node"
            :card="card"
            @success="handleSetSourceSuccess"
          ></dialog-source>
        </template>
      </config-cost-card-item>
    </div>
    <div class="config-cost-card-fee-item">
      <config-cost-card-item
        :estimation-type="card&&card.estimationType"
        :feeItemList="card&&card.feeItems"
        @click="feeItemDialogVisible = true"
      >
        <dialog-set-fee-item
          :visible.sync="feeItemDialogVisible"
          :node="node"
          :card="card"
          @success="handleSetFeeItemsSuccess"
        ></dialog-set-fee-item>
      </config-cost-card-item>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { useConfigCostInject } from '@/context';
import ConfigCostCardItem from './config-cost-card-item.vue';
import { EstimationType } from './enum';
import DialogSource from './dialog-source.vue';
import DialogSetFeeItem from './dialog-set-fee-item.vue';

export default defineComponent({
  components: {
    ConfigCostCardItem,
    DialogSource,
    DialogSetFeeItem,
  },
  name: 'ConfigCostCard',
  props: {
    card: Object,
    node: Object,
  },
  setup(props, { root }) {
    const estimationTypeText = computed(() => {
      // 收费项 or 来源
      if (props?.card?.estimationType === EstimationType.CommissionEstimate) {
        return '委托预估 ';
      }
      if (props?.card?.estimationType === EstimationType.FinalEstimate) {
        return '定稿预估 ';
      }
      if (props?.card?.estimationType === EstimationType.BillConfirmation) {
        return '账单确定 ';
      }
      return '';
    });

    const displaySourceCardItem = computed(() => props?.card?.estimationType !== EstimationType.CommissionEstimate);
    const sourceEstimationType = computed(() => {
      if (props?.card?.estimationType === EstimationType.FinalEstimate) {
        return EstimationType.CommissionEstimate;
      }
      if (props?.card?.estimationType === EstimationType.BillConfirmation) {
        return EstimationType.FinalEstimate;
      }
      return null;
    });

    const sourceDialogVisible = ref(false);
    const feeItemDialogVisible = ref(false);
    const { getFeeNode } = useConfigCostInject();
    const colorStr = computed(() => {
      switch (props.card?.estimationType) {
        case EstimationType.CommissionEstimate:
          return 'color1';
        case EstimationType.FinalEstimate:
          return 'color2';
        case EstimationType.BillConfirmation:
          return 'color3';
        default:
          return 'color1';
      }
    });
    function handleSetSourceSuccess() {
      const { $route } = root;
      getFeeNode(Number($route.query.id));
    }
    function handleSetFeeItemsSuccess() {
      const { $route } = root;
      getFeeNode(Number($route.query.id));
    }
    return {
      estimationTypeText,
      displaySourceCardItem,
      sourceEstimationType,
      sourceDialogVisible,
      handleSetSourceSuccess,
      handleSetFeeItemsSuccess,
      feeItemDialogVisible,
      colorStr,
    };
  },
});
</script>

<style lang="scss" scoped>
.config-cost-card {
  display: flex;
  width: 100%;
  min-height: 58px;
  line-height: 100%;
  border: 1px solid #c8c8c8;
  margin: 8px 0;

  .config-cost-card-name {
    width: 85px;
    // text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .config-cost-card-source {
    border-left: 1px solid #c8c8c8;
    flex: 4;
  }
  .config-cost-card-fee-item {
    border-left: 1px solid #c8c8c8;

    flex: 4;
  }
}

.color1 {
  //委托预估
  background-color: #fff9ef;
  color: #fea218;
}

.color2 {
  //定稿预估
  background-color: #ebf5ff;
  color: #2f6db4;
}

.color3 {
  //账单确定
  background-color: #ffecfe;
  color: #880980;
}
</style>
