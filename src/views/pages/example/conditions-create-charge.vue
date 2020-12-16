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
      @click="currentEdit = index"
    >
      <template v-if="conditionItem.length > 0">
        <div class="condition-item" v-for="(item, itemIndex) in conditionItem" :key="`${itemIndex}`">
          <charge-conditions-input
            :conditions-info="conditionsInfo"
            v-bind.sync="item"
            :field-url="fieldUrl"
            :compare-list.sync="compareList"
            :compare-option="compareList"
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
    <div class="new-add-condition">
      <el-button @click="handleNewAdd" style="width: 100%" size="small">+ 添加条件</el-button>
    </div>
  </div>
</template>

<script>
import {
  computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import ChargeConditionsInput from './conditions-charge-input.vue';

export default defineComponent({
  name: 'CreateChargeConditions',
  components: { ChargeConditionsInput },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    fieldUrl: {
      type: String,
      default: '/patent-corp_api/fee-config-resource',
    },
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
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const state = reactive({
      compareList: [], // 比较条件opt
      currentEdit: null,
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
        emit('input', val);
      },
    });

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

    return {
      ...toRefs(state),
      conditionBtns,
      handleAddCondition,
      delCondition,
      delConditionItem,
      handleNewAdd,
      conditionLists,
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
