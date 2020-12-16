<template>
  <div class="panel-select-cascader">
    <el-cascader
      v-bind="$attrs"
      v-on="$listeners"
      v-model="innerValue"
      :options="innerOptions"
      :props="innerPropOpts"
      clearable
      popper-class="select-cascader"
      style="width: 100%"
    >
      <template #default="{ node, data }">
        <slot :node="node" :data="data" />
      </template>
    </el-cascader>
  </div>
</template>

<script>
import {
  computed,
} from '@vue/composition-api';
import { useHttp } from '../hooks/http';

export default {
  name: 'PanelSelectCascader',
  props: {
    value: [Array, String, Number],
    api: String,
    options: Array,
    propOpts: Object,
    query: Object,
  },
  setup(props, context) {
    const { emit } = context;
    const innerValue = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });

    const innerPropOpts = computed(() => ({
      ...props.propOpts,
    }));

    const {
      url,
      data,
      fetchData,
    } = useHttp();

    data.value = [];
    url.value = props.api;
    if (props.api) {
      fetchData(props.query);
    }

    const innerOptions = computed(() => {
      if (props.api) {
        return data.value || [];
      }
      return props.options || [];
    });

    return {
      innerValue,
      innerPropOpts,
      innerOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-select-cascader {}
</style>
