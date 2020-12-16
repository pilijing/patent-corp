<template>
  <el-col class="descriptions-item" :span="colSpan" v-bind="$attrs">
    <div
      v-if="label"
      class="label"
      :title="label"
      :style="labelStyle"
    >
      {{ label }}
      <span>{{ colon ? ':' : '' }} </span>
    </div>
    <template v-if="value">
      <div v-if="type === 'icon'" class="value icon-css">
        <div :title="value" class="ellip">{{ value }}</div>
        <slot />
      </div>
      <div v-else class="value ellip" :title="value">
        <a v-if="type === 'link'" :href="value" target="_blank">{{ value }}</a>
        <template v-else>{{ value }}</template>
      </div>
    </template>
    <div v-else class="value" :class="{'wrap': type !== 'tags'}">
      <slot />
    </div>
  </el-col>
</template>

<script>
import {
  inject, computed,
  // toRefs,
} from '@vue/composition-api';

export default {
  props: {
    type: String,
    span: {
      type: Number,
      default: 1,
    },
    label: String,
    value: [String, Number],
  },
  setup(props) {
    const itemProps = inject('itemProps');
    const colSpan = computed(() => {
      const avgCol = 24 / itemProps.column;
      return avgCol * props.span;
    });
    const labelStyle = computed(() => {
      if (itemProps.labelWidth === 0) { // 当labelWidth = 0时，自适应宽度
        return {};
      }
      return {
        width: `${itemProps.labelWidth}px`,
      };
    });
    return {
      labelStyle,
      colSpan,
      // ...toRefs(itemProps),
      ...(itemProps),
    };
  },
};
</script>

<style lang="scss" scoped>
.descriptions-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 20px;
  margin-bottom: 10px;
  .value-slot {
    flex: 1;
  }
}
.label {
  flex: none;
  padding-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #757575;
  font-size: 14px;
  text-align: right;
}
.value{
  color: #333;
  flex: 1;
  font-size: 14px;
  &.wrap {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}
.ellip {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-css {
  display: flex;
  align-items: center;
  overflow: hidden;
}
</style>
