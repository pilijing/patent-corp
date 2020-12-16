<template>
  <select-search
    v-on="$listeners"
    v-bind="$attrs"
    v-model="innerValue"
    :default-options="staffDeafultOptions"
    api="/patent-corp_api/staffs/names/like"
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
      default: 'staffFullName',
    },
    valueKey: {
      type: String,
      default: 'staffId',
    },
    staffDeafultOptions: Array,
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
