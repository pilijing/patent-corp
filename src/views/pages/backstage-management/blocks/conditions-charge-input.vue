<template>
  <div class="charge-conditions-input">
    <el-select
      v-if="itemType === 'field' && isShowCondition('field')"
      v-model="innerSelect"
      :size="size"
      @change="handleSelectChange"
      placeholder="请选择字段"
      style="width: 160px;"
      clearable
    >
      <el-option
        v-for="item in fieldList"
        :key="item.id"
        :label="item.name"
        :value="String(item.id)"
      />
    </el-select>
    <el-select
      v-else-if="itemType === 'compare' && isShowCondition('compare')"
      v-model="innerSelect"
      :size="size"
      placeholder="请选择比较符"
      style="width: 160px;"
      @change="handleCompareChange"
      clearable
    >
      <el-option
        v-for="item in compareOption"
        :key="item.id"
        :label="item.name"
        :value="String(item.id)"
      />
    </el-select>
    <el-button
      :size="size"
      v-else-if="btnTypeGroups.includes(itemType) && isShowCondition(itemType)"
    >
      {{ operator[itemType] }}
    </el-button>
    <el-input-number
      v-else-if="itemType === 'numerical' && isShowCondition('numerical')"
      v-model="innerSelect"
      :size="size"
      :min="0"
      :max="99999999"
      palceholder="请输入数值"
    />
    <div v-else-if="itemType === 'value' && isShowCondition('value')" class="value-type">
      <el-select
        v-model="innerSelect"
        :size="size"
        clearable
        placeholder="请选择值"
        style="width: 160px; margin-right: 10px"
      >
        <el-option
          v-for="item in valueOption"
          :key="item.id"
          :label="item.name"
          :value="String(item.id)"
        />
      </el-select>
      <!-- 根据值类型读取不同的组件 -->
      <conditions-value-input
        v-model="innerValue"
        :select-value="innerSelect"
        :size="size"
        style="width: 160px;"
      />
    </div>
    <el-input v-else v-model="innerValue"  :size="size" />
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import PanelSelect from '@/components/panel-select.vue';
import { useCompareValueInject } from '@/context';
import ConditionsValueInput from './conditions-value-input.vue';

export default defineComponent({
  name: 'ChargeConditionsInput',
  props: {
    name: String,
    itemValue: [String, Number, Array],
    inputValue: [String, Number, Array, Date],
    itemType: String,
    type: String,
    size: {
      type: String,
      default: 'small',
    },
    conditionsInfo: Array,
    compareOption: Array, // 比较条件opt
    valueOption: Array, // 值类型条件opt
    isInFormula: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PanelSelect,
    ConditionsValueInput,
  },

  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      operator: {
        lBracket: '(',
        rBracket: ')',
        plus: '+',
        minus: '-',
        multiplication: 'x',
        division: '÷',
      },
    });

    const innerSelect = computed({
      get() {
        return props.itemValue || undefined;
      },
      set(val) {
        emit('update:itemValue', val || undefined);
      },
    });
    const innerValue = computed({
      get() {
        return props.inputValue || undefined;
      },
      set(val) {
        emit('update:inputValue', val || undefined);
      },
    });

    const {
      setCompareValue,
    } = useCompareValueInject();

    // 字段下拉source
    const {
      data: fieldList,
      fetchData,
    } = useHttp('/patent-corp_api/fee-config-resource');

    fetchData({ isInFormula: props.isInFormula }); // 接口拉取
    // const compareVal = ref({ val: null });
    // provide('compare-val', {
    //   compareVal,
    //   setVal,
    // });
    // const demo = inject('compare-val');

    // 比较条件变更
    const handleCompareChange = (val) => {
      // emit('update:compare-value', val);

      setCompareValue(val);
    };

    // 字段条件变更
    const handleFieldOpt = (val) => {
      emit('filter-condition', val);
    };

    // 比较符过滤条件
    const handleSelectChange = (val) => {
      const filterOpts = (fieldList.value || []).filter(item => String(item.id) === val);
      handleFieldOpt(filterOpts[0]);
    };

    // 按钮类型的显示
    const btnTypeGroups = computed(() => ['lBracket', 'rBracket', 'plus', 'minus', 'multiplication', 'division']);

    const isShowCondition = type => props.conditionsInfo.includes(type);
    onMounted(() => {
      emit('filter-condition', innerSelect);
    });

    return {
      ...toRefs(state),
      innerSelect,
      innerValue,
      isShowCondition,
      btnTypeGroups,
      fieldList,
      handleSelectChange,
      handleCompareChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.charge-conditions-input {
  .value-type {
    display: flex;
  }
}
</style>
