<template>
  <div class="charge-conditions-input">
    <el-select
      v-if="itemType === 'field' && isShowCondition('field')"
      v-model="innerSelect"
      :size="size"
      @change="handleSelectChange"
      placeholder="请选择字段"
    >
      <el-option
        v-for="item in fieldList"
        :key="item.id"
        :label="item.fieldDisplayName"
        :value="item.id"
      />
    </el-select>
    <el-select
      v-else-if="itemType === 'compare' && isShowCondition('compare')"
      v-model="innerSelect"
      :size="size"
      placeholder="请选择比较符"
    >
      <el-option
        v-for="item in compareOption"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    <el-button
      :size="size"
      v-else-if="btnTypeGroups.includes(itemType) && isShowCondition(itemType)"
    >
      {{ name }}
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
      <panel-select
        v-model="innerSelect"
        type="VALUE_TYPE"
        :size="size"
        style="margin-right: 10px"
        palceholder="请选择值"
      />
      <!-- 根据值类型读取不同的组件 -->
      <conditions-value-input
        v-model="innerValue"
        :select-value="innerSelect"
        :size="size"
      />
    </div>
    <el-input v-else v-model="innerValue" :size="size" />
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import PanelSelect from '@/components/panel-select.vue';
import { useLookupsInject } from '@/context';
import ConditionsValueInput from './conditions-value-input.vue';

export default defineComponent({
  name: 'ChargeConditionsInput',
  props: {
    name: String,
    itemValue: [String, Number],
    inputValue: [String, Number],
    itemType: String,
    type: String,
    size: {
      type: String,
      default: 'small',
    },
    conditionsInfo: Array,
    fieldUrl: String,
    compareOption: Array, // 比较条件opt
  },
  components: {
    PanelSelect,
    ConditionsValueInput,
  },

  setup(props, context) {
    const { emit } = context;
    const state = reactive({});

    const innerSelect = computed({
      get() {
        return props.itemValue;
      },
      set(val) {
        emit('update:itemValue', val);
      },
    });
    const innerValue = computed({
      get() {
        return props.inputValue;
      },
      set(val) {
        emit('update:inputValue', val);
      },
    });

    // 字段下拉source
    const {
      url,
      data: fieldList,
      fetchData,
    } = useHttp();

    if (props.fieldUrl) {
      url.value = props.fieldUrl;
      fetchData();
    }
    const {
      sortLookups,
    } = useLookupsInject();

    // 处理比较条件
    const handleCompareOpt = (val) => {
      let currentLookup = sortLookups.value.COMPARISON;
      if (val.length > 0) {
        currentLookup = currentLookup.filter(item => val.includes(item.id));
      }
      emit('update:compare-list', currentLookup);
    };

    // 比较符过滤条件
    const handleSelectChange = (val) => {
      const filterOpts = (fieldList.value || []).filter(item => item.id === val)[0].comparison;
      handleCompareOpt(filterOpts);
    };

    // 按钮类型的显示
    const btnTypeGroups = computed(() => ['lBracket', 'rBracket', 'plus', 'minus', 'multiplication', 'division']);

    const isShowCondition = type => props.conditionsInfo.includes(type);

    return {
      ...toRefs(state),
      innerSelect,
      innerValue,
      isShowCondition,
      btnTypeGroups,
      fieldList,
      handleSelectChange,
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
