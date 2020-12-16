<template>
  <div class="conditions-value-input">
    <el-date-picker
      v-if="exchangeKeyVal[selectValue] === 'DATE'"
      v-model="innerValue"
      type="date"
      placeholder="请选择日期"
      :size="size"
    />
    <el-input-number
      v-else-if="['NATURE_DAY', 'WORK_DAY'].includes(exchangeKeyVal[selectValue])"
      v-model="innerValue"
      :size="size"
      :min="0"
      :max="99999999"
      :step="1"
      step-strictly
    />
    <el-select
        v-else-if="isEnmuType"
        v-model="innerValue"
        :size="size"
        clearable
        :multiple="isMultiple"
        collapse-tags
        placeholder="请选择"
      >
        <el-option
          v-for="item in getTypeInfo(exchangeKeyVal[selectValue])"
          :key="item.id"
          :label="item.name"
          :value="String(item.id)"
        />
      </el-select>
    <el-input-number
      v-else-if="exchangeKeyVal[selectValue] === 'VALUE'"
      v-model="innerValue"
      :size="size"
      :min="0"
      :max="99999999"
    />
    <el-input
      v-else
      v-model="innerValue"
      :size="size"
      placeholder="请输入"
    />
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  watch,
} from '@vue/composition-api';
import { useLookupsInject, useCompareValueInject } from '@/context';
import PanelSelect from '@/components/panel-select.vue';

export default defineComponent({
  name: 'ConditionsValueInput',
  props: {
    value: [String, Number, Array, Date],
    size: String,
    selectValue: [String, Number, Array],
  },
  components: { PanelSelect },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({});

    const {
      getEnumsInfo,
      sortLookups,
      getCodeInfo,
    } = useLookupsInject();
    const compareType = computed(() => getEnumsInfo('COMPARISON'));

    const {
      compareValue,
    } = useCompareValueInject();
    // const demo = inject('compare-val'); // TODO
    const getTypeInfo = type => sortLookups.value[type];

    const exchangeKeyVal = computed(() => getCodeInfo('VALUE_TYPE'));

    // 枚举类型（lookup）
    const isEnmuType = computed(() => [
      'PATENT_STATUS',
      'CASE_GRADE',
      'LANGUAGE',
      'AGENT_GRADE',
      'ENTRUST_GRADE',
      'TEXT_TYPE',
    ].includes(exchangeKeyVal.value[props.selectValue]));

    // 是否多选
    const isMultiple = computed(() => String(compareValue.value) === String(compareType.value.IN));

    const innerValue = computed({
      get() {
        return props.value || undefined;
      },
      set(val) {
        emit('input', val || undefined);
      },
    });

    watch(() => props.selectValue, () => {
      innerValue.value = undefined;
    }, { lazy: true });

    return {
      ...toRefs(state),
      innerValue,
      exchangeKeyVal,
      isEnmuType,
      isMultiple,
      getTypeInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.conditions-value-input {}
</style>
