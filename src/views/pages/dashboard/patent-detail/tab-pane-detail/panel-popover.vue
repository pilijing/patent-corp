<template>
  <el-popover
    width="860"
    trigger="hover"
    popper-class="patent-popover"
    :offset="popoverOffset"
    >
    <slot />
    <i class="el-icon-question icon-question" slot="reference" />
  </el-popover>
</template>

<script>
import {
  defineComponent,
} from '@vue/composition-api';

export default defineComponent({
  name: 'PanelPopover',
  props: {
    popoverOffset: {
      type: Number,
      default: 160,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
  .patent-popover {
    padding: 0;
    border: 0;
  }
</style>

<style lang="scss" scoped>
.icon-question {
  margin-left: 8px;
  font-size: 18px;
  color: #B9B9B9;
  line-height: 25px;
}
</style>
