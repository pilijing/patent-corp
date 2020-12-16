<template>
  <el-select
    v-model="innerValue"
    popper-class="g-country-popper"
    filterable
    :multiple="multiple"
    v-bind="$attrs"
    v-on="$listeners"
    clearable
    ref="select"
  >
    <country-options :list="countryList" />
  </el-select>
</template>

<script>
import {
  ref,
  computed, defineComponent, reactive, toRefs, onMounted,
} from '@vue/composition-api';
import { useRegionsInject } from '@/context';
import CountryOptions from './selector-country-options.vue';

export default defineComponent({
  props: {
    value: [Array, String],
    focus: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CountryOptions,
  },
  setup(props, context) {
    const { emit } = context;
    const { $nextTick } = context.root;
    const state = reactive({
      countryList: [],
    });

    const innerValue = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
        const regionItem = state.countryList.find(item => item.code === val);
        emit('country-item', regionItem);
      },
    });

    const needFocus = () => {
      if (props.focus) {
        const refKey = ref('select');
        const el = refKey.value;
        if (el && typeof el.focus === 'function') {
          $nextTick(() => {
            el.focus();
          });
        }
      }
    };

    const innerData = () => {
      const { regions } = useRegionsInject();
      state.countryList = regions.value;
      needFocus();
    };
    onMounted(() => {
      innerData();
    });
    return {
      ...toRefs(state),
      innerValue,
    };
  },
});
</script>
<style lang="scss">
.g-country-popper {
  .el-scrollbar__view {
    padding: 0;
  }
}
.g-country-popper.el-popper .popper__arrow:after {
  border-bottom-color: #E7F4FF;
}
</style>
