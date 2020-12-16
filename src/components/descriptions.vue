<template>
  <el-row
    class="field-wrapper"
    v-bind="$attrs"
  >
    <slot />
  </el-row>
</template>

<script>
import { provide } from '@vue/composition-api';

export default {
  props: {
    title: String,
    column: {
      type: Number,
      default: 2,
    },
    colon: {
      type: Boolean,
      default: true,
    },
    labelWidth: {
      type: Number,
      default: 80,
    },
  },
  setup(props) {
    const { title, ...itemProps } = props;
    provide('itemProps', itemProps);
  },
};
</script>

<style scoped>
  .field-wrapper {
  }
</style>
