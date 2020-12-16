<template>
  <div :class="['header', { 'underline': underline }]">
    <div class="title" :style="{ 'font-size': fontSize }">
      <span class="block" />
      {{ title }}
      <div class="left-block">
        <slot name="left" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
import { computed } from '@vue/composition-api';

export default {
  props: {
    title: String,
    size: { // 可选值：large, medium, small
      type: String,
      default: 'medium',
    },
    underline: Boolean,
  },
  setup(props) {
    const titleFontSizes = {
      large: '18px',
      medium: '16px',
      small: '14px',
    };
    const fontSize = computed(() => titleFontSizes[props.size]);
    return {
      fontSize,
    };
  },
};
</script>

<style lang="scss" scoped>

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  &.underline {
    padding-bottom: 5px;
    margin-bottom: 10px;
    border-bottom: 1px solid #d5d5d5;
  }
  .title {
    margin-right: 20px;
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    color: #1F1F1F;
    font-weight: 650;
    .block {
      display: inline-block;
      width: 4px;
      background-color: #0079FE;
      height: 14px;
      margin-right: 10px;
    }
    .left-block {
      font-size: 14px;
      margin-left: 10px;
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>
