<template>
  <div class="card-fee-item">
    <div
      class="edit-icon"
      @click="handleSettingClick"
    >
      <i class="el-icon-edit" />设定
    </div>
    <div class="title"> {{estimationTypeText}} </div>
    <el-tag
      v-for="tag in feeItemList"
      :key="tag.id"
      type="success"
      class="tag-item"
      :style="
        feeTypeObj[tag.feeType] ?
        {
          background: feeTypeObj[tag.feeType].bgColor,
          color: feeTypeObj[tag.feeType].color,
          border: `1px solid ${feeTypeObj[tag.feeType].color}`
        } : ''
      "
    >
      <span v-if="!tag.isValid" class="draft">草稿</span>
      {{tag.name}}
    </el-tag>
    <slot></slot>

  </div>

</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { EstimationType } from './enum';

export default defineComponent({
  name: 'ConfigCostCardItem',
  props: {
    estimationType: Number,
    feeItemList: {
      type: Array,
      default: () => [],
    },
    isSource: Boolean,
  },
  setup(props, context) {
    const suffix = props.isSource ? '来源' : '收费项';
    const { emit } = context;
    const estimationTypeText = computed(() => {
      // 收费项 or 来源
      if (props.estimationType === EstimationType.CommissionEstimate) {
        return `委托预估${suffix}`;
      }
      if (props.estimationType === EstimationType.FinalEstimate) {
        return `定稿预估${suffix}`;
      }
      if (props.estimationType === EstimationType.BillConfirmation) {
        return `账单确定${suffix}`;
      }
      return '';
    });

    const feeTypeObj = computed(() => ({
      1600: { color: '#0079FE', bgColor: '#E1EDFF' },
      1601: { color: '#FE6500', bgColor: '#FFEFCD' },
      1602: { color: '#FE6500', bgColor: '#FFEFCD' },
    }));

    const dialogVisible = ref(false);
    function handleSettingClick() {
      emit('click');
    }
    return {
      estimationTypeText,
      dialogVisible,
      handleSettingClick,
      feeTypeObj,
    };
  },
});
</script>
<style lang="scss" scoped>
.card-fee-item {
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  .edit-icon {
    width: 57px;
    height: 26px;
    position: absolute;
    right: 0;
    top: 0;
    color: #1456fe;
    background-color: #e4ecff;
    text-align: center;
    line-height: 26px;
    cursor: pointer;
  }
  .title {
    padding-bottom: 8px;
  }
  .tag-item {
    margin: 0 10px 10px 0;
    .draft {
      background: #E63B16;
      color: #fff;
      padding: 3px 5px;
      border-radius: 3px;
    }
  }
}
</style>
