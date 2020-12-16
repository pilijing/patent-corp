<template>
  <div class="panel-radio">
    <el-radio-group
      v-model="currentValue"
      v-on="$listeners"
      v-bind="$attrs"
      :clearable="clearable"
    >
      <template v-if="button">
        <el-radio-button
          v-for="item in currentOptions"
          :key="item.id"
          :label="item.id"
          @click.native.prevent="handleClick(item.id)"
        >
          {{ item.name }}
        </el-radio-button>
      </template>
      <template v-else>
        <el-radio
          v-for="item in currentOptions"
          :key="item.id"
          :label="item.id"
          :border="border"
          @click.native.prevent="handleClick(item.id)"
        >
          {{ item.name }}
        </el-radio>
      </template>
    </el-radio-group>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api';
import { useLookupsInject } from '@/context';

export default {
  name: 'PanelRadio',
  props: {
    value: {
      type: [String, Boolean, Number, Array],
      default: '',
    },
    type: String,
    clearable: {
      type: Boolean,
      default: true,
    },
    border: {
      type: Boolean,
      default: true,
    },
    button: {
      type: Boolean,
      default: false,
    },
    clickToCancel: Boolean,
  },
  setup(props, context) {
    const { sortLookups } = useLookupsInject();
    const { emit } = context;
    const currentValue = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });
    const currentOptions = computed(() => sortLookups.value[props.type]);
    // 是否选择器点击取消
    function handleClick(value) {
      if (value === currentValue.value && props.clickToCancel) {
        currentValue.value = null;
      } else {
        currentValue.value = value;
      }
    }
    return {
      currentValue,
      currentOptions,
      handleClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-radio {
}
</style>
