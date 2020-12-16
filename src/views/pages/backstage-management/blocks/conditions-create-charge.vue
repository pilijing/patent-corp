<template>
  <div class="create-charge-conditions">
    <div class="btns-list">
      <el-button
        v-for="btnItem in conditionBtns"
        :key="btnItem.id"
        type="primary"
        size="small"
        @click="handleAddCondition(btnItem)"
      >
        {{ btnItem.name }}
      </el-button>
    </div>
    <div
      class="condition-list"
      v-for="(conditionItem, index) in conditionLists"
      :key="index"
      :class="currentEdit === index ? 'active' :  'not-active'"
      @click.capture="currentEdit = index"
    >
      <template v-if="conditionItem.length > 0">
        <div class="condition-item" v-for="(item, itemIndex) in conditionItem" :key="`${itemIndex}`">
          <charge-conditions-input
            :conditions-info="conditionsInfo"
            v-bind.sync="item"
            :is-in-formula="isInFormula"
            @filter-condition="handleFilterCondition"
            :compare-option="compareList"
            :value-option="valueTypeList"
          />
          <el-button type="text" icon="el-icon-remove-outline" @click="delConditionItem(index, itemIndex)" />
        </div>
      </template>
      <template v-else>
        <div class="tips">点击可添加收费规则~</div>
      </template>
      <div class="close" @click="delCondition(index)">
        <i class="el-icon-close" />
      </div>
    </div>
    <div v-if="limitBtnShow" class="new-add-condition">
      <el-button @click="handleNewAdd" style="width: 100%" size="small">+ 添加条件</el-button>
    </div>
  </div>
</template>

<script>
import {
  computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useLookupsInject, useCompareValueInject } from '@/context';
import ChargeConditionsInput from './conditions-charge-input.vue';

export default defineComponent({
  name: 'CreateChargeConditions',
  components: { ChargeConditionsInput },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    limit: Number,
    // 需要显示的信息
    conditionsInfo: {
      type: Array,
      default: () => [
        'field', // 字段
        'compare', // 比较
        'lBracket', // 左括号
        'rBracket', // 右括号
        'plus', // 加
        'minus', // 减
        'multiplication', // 乘
        'division', // 除
        'numerical', // 数值
        'value', // 值
      ],
    },
    isInFormula: { // true get到部分的数据，false 获取所有数据
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const state = reactive({
      compareList: [], // 比较条件opt
      valueTypeList: [], // 值类型条件opt
      currentEdit: null,
      limitBtnShow: true,
      // valKey定义需要传给后台的值(其中 ( ) + - x ÷)
      conditions: [
        { name: '字段', itemType: 'field', valKey: null },
        { name: '比较', itemType: 'compare', valKey: null },
        { name: '(', itemType: 'lBracket', valKey: '(' },
        { name: ')', itemType: 'rBracket', valKey: ')' },
        { name: '+', itemType: 'plus', valKey: '+' },
        { name: '-', itemType: 'minus', valKey: '-' },
        { name: 'x', itemType: 'multiplication', valKey: '*' },
        { name: '÷', itemType: 'division', valKey: '/' },
        { name: '数值', itemType: 'numerical', valKey: null },
        { name: '值', itemType: 'value', valKey: null },
      ],
    });

    const conditionLists = computed({
      get() {
        return props.value || [];
      },
      set(val) {
        emit('input', val || []);
      },
    });
    const {
      sortLookups,
    } = useLookupsInject();
    const {
      compareValue,
    } = useCompareValueInject();

    // 比较符
    const compareLookup = computed(() => sortLookups.value.COMPARISON);
    // 值类型
    const valueTypeLookup = computed(() => sortLookups.value.VALUE_TYPE);

    // 比较符条件过滤
    const handleCompare = (val) => {
      let currentCompareLookup = compareLookup.value;
      if ((val || []).length > 0 && !props.isInFormula) { // 字段拉取数据为了做条件过滤
        currentCompareLookup = currentCompareLookup.filter(item => val.includes(item.id));
      }
      state.compareList = currentCompareLookup;
    };
    // 值类型条件过滤
    const handleValueType = (val) => {
      let currentValueLookup = valueTypeLookup.value;
      if ((val || []).length > 0 && !props.isInFormula) { // 字段拉取数据为了做条件过滤
        currentValueLookup = currentValueLookup.filter(item => val.includes(item.id));
      }
      state.valueTypeList = currentValueLookup;
    };

    // 清空
    const resetInput = () => {
      (conditionLists.value[state.currentEdit] || []).forEach((item) => {
        if (item.itemType !== 'field') { // 除字段外都清空
          item.inputValue = undefined;
          item.itemValue = undefined;
        }
      });
    };
    watch(() => compareValue.value, () => { // 清空当前编辑的值类型
      (conditionLists.value[state.currentEdit] || []).forEach((item) => {
        if (item.itemType === 'value') {
          item.inputValue = undefined;
        }
      });
    }, { lazy: true });

    const handleFilterCondition = (val) => {
      handleCompare(val?.comparison);
      handleValueType(val?.valueType);
      resetInput();
    };

    // 条件控制
    const conditionBtns = computed(() => state.conditions.filter(item => props.conditionsInfo.includes(item.itemType)));

    const handleAddCondition = (val) => {
      if (conditionLists.value.length > 0 && state.currentEdit !== null) {
        conditionLists.value[state.currentEdit].push({
          itemValue: undefined,
          inputValue: undefined,
          itemType: val.itemType,
          name: val.name,
          valKey: val.valKey,
        });
      } else {
        $message.warning('请先添加条件!');
      }
    };

    // 删除条件
    const delCondition = (index) => {
      conditionLists.value.splice(index, 1);
    };

    // 删除条件项
    const delConditionItem = (index, indexItem) => {
      if (state.currentEdit === index) {
        conditionLists.value[state.currentEdit].splice(indexItem, 1);
      }
    };

    // 添加条件
    const handleNewAdd = () => {
      conditionLists.value.push([]);
      state.currentEdit = conditionLists.value.length - 1;
    };
    watch(() => conditionLists.value.length, () => {
      if (conditionLists.value.length >= props.limit) {
        state.limitBtnShow = false;
      } else {
        state.limitBtnShow = true;
      }
    }, { deep: true, immediate: true });

    return {
      ...toRefs(state),
      conditionBtns,
      handleAddCondition,
      delCondition,
      delConditionItem,
      handleNewAdd,
      conditionLists,
      handleFilterCondition,
    };
  },
});
</script>

<style lang="scss" scoped>
.create-charge-conditions {
  .condition-list {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    padding: 15px;
    position: relative;
    &.active {
      border: 1px solid #348bff;
    }
    &.not-active {
      border: 1px solid #ddd;
    }
    .condition-item {
      display: flex;
      margin-right: 20px;
    }
    .tips {
      color: #dcdfe6;
    }
    .close {
      width: 20px;
      height: 20px;
      background: #BDBDBD;
      position: absolute;
      right: 0;
      top: 0;
      color: #fff;
      text-align: center;
      line-height: 20px;
      cursor: pointer;
    }
  }
  .new-add-condition {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
