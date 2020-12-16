<template>
  <select-search
    v-on="$listeners"
    v-bind="$attrs"
    v-model="innerValue"
    :default-options="deptDeafultOptions"
    api="/patent-corp_api/groups/search/10/1"
    query-key="name"
    :label-key="labelKey"
    :value-key="valueKey"
  />
</template>

<script>
import {
  computed,
} from '@vue/composition-api';
import SelectSearch from '@/components/panel-select-search.vue';

export default {
  props: {
    value: [String, Array, Number],
    labelKey: {
      type: String,
      default: 'name',
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    deptDeafultOptions: Array,
  },
  components: {
    SelectSearch,
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

    return {
      innerValue,
    };
  },
};
</script>
