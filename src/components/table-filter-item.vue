<template>
  <div class="filter-item">
    <div class="label" :style="{ flex: `0 0 ${labelWidth}px` }">{{ label }}</div>
    <slot class="input" />
  </div>
</template>

<script>
import { inject } from '@vue/composition-api';

export default {
  props: {
    label: String,
  },
  setup() {
    const labelWidth = inject('labelWidth');
    return {
      labelWidth,
    };
  },
};
</script>

<style lang="scss" scoped>
.filter-item {
  width: 25%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .label {
    text-align: right;
    margin-right: 10px;
  }

  .input {
    flex: 1 1 auto;
  }
}
</style>
