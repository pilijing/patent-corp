<template>
  <div class="panel-radio">
    <el-checkbox-group
      v-model="currentValue"
      v-on="$listeners"
      v-bind="$attrs"
      :clearable="clearable"
    >
      <el-checkbox
        :border="border"
        v-for="item in currentOptions"
        :key="item.id"
        :label="item.id"
      >
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api';
import { useLookupsInject } from '@/context';

export default {
  name: 'PanelCheckbox',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    type: String,
    clearable: {
      type: Boolean,
      default: true,
    },
    // 是否带边框
    border: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    const {
      sortLookups,
    } = useLookupsInject();
    const { emit } = context;
    const currentValue = computed({
      get() {
        return props.value || [];
      },
      set(val) {
        emit('input', val);
      },
    });
    const currentOptions = computed(() => sortLookups.value[props.type]);
    return {
      currentValue,
      currentOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-radio {}
</style>
