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
    <panel-select
      v-else-if="isEnmuType"
      v-model="innerValue"
      :type="exchangeKeyVal[selectValue]"
      :size="size"
      placeholder="请选择"
    />
    <!-- <el-select
      v-else-if="isEnmuType"
      v-model="innerValue"
      :size="size"
      :type="exchangeKeyVal[selectValue]"
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
    </el-select> -->
    <el-input-number
      v-else-if="['VALUE'].includes(exchangeKeyVal[selectValue])"
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
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PanelSelect from '@/components/panel-select.vue';

export default defineComponent({
  name: 'ConditionsValueInput',
  props: {
    value: [String, Number],
    size: String,
    selectValue: [String, Number],
    valueOption: Array, // 值类型条件opt
  },
  components: { PanelSelect },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({});

    const {
      getEnumsInfo,
    } = useLookupsInject();
    const valueType = computed(() => getEnumsInfo('VALUE_TYPE'));
    console.info(valueType.value);

    const exchangeKeyVal = computed(() => {
      const result = {};
      /* eslint-disable guard-for-in */
      /* eslint-disable no-restricted-syntax */
      for (const key in valueType.value) {
        const val = valueType.value[key];
        result[val] = key;
      }
      return result;
    });

    // 枚举类型（lookup）
    const isEnmuType = computed(() => [
      'PATENT_STATUS',
      'CASE_GRADE',
      'LANGUAGE',
      'AGENT_GRADE',
      'ENTRUST_GRADE',
      'TEXT_TYPE',
    ].includes(exchangeKeyVal.value[props.selectValue]));

    const innerValue = computed({
      get() {
        console.log('0000');
        return props.value || undefined;
      },
      set(val) {
        emit('input', val);
      },
    });
    onMounted(() => {
      console.log('1111111');
      console.log(props.valueOption);
      // emit('filter-condition', innerSelect);
    });
    watch(() => props.selectValue, () => {
      innerValue.value = undefined;
    }, { lazy: true });

    return {
      ...toRefs(state),
      innerValue,
      exchangeKeyVal,
      isEnmuType,
    };
  },
});
</script>

<style lang="scss" scoped>
.conditions-value-input {}
</style>
