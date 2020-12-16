<template>
  <div class="filter">
    <slot />
  </div>
</template>

<script>
import { provide } from '@vue/composition-api';

export default {
  name: 'TableFilter',
  props: {
    labelWidth: {
      type: Number,
      default: 80,
    },
  },
  setup(props) {
    provide('labelWidth', props.labelWidth);
  },
};
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  flex-flow: wrap;
  padding-top: 15px;
  padding-bottom: 5px;
  border-radius: 3px;
  background: #fff;

  .query-btn {
    margin-left: 20px;
    width: 170px;
    min-width: 160px;
  }

  .date-range-item {
    width: 350px;
  }
}

</style>
