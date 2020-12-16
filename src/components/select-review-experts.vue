<template>
  <div class="select-review-experts">
    <panel-select-cascader
      v-bind="$attrs"
      v-on="$listeners"
      v-model="innerExpert"
      :options="options"
      :prop-opts="innerPropOpts"
    >
      <template #default="{ node, data }">
        <span>{{ data.name }}</span>
        <span
          v-if="node.isLeaf && data.typeName"
          class="tag-type"
          :style="{
            'color': styleType[data.typeId].color,
            'background-color': styleType[data.typeId].bgColor
          }"
        >
          {{ data.typeName }}
        </span>
      </template>
    </panel-select-cascader>
  </div>
</template>

<script>
import PanelSelectCascader from '@/components/panel-select-cascader.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useHttp } from '../hooks/http';

export default {
  name: 'SelectReviewExperts',
  components: { PanelSelectCascader },
  props: {
    value: [Array, String, Number],
    propOpts: Object,
    api: String,
    multiple: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      styleType: {
        4051: { bgColor: '#FFF0D5', color: '#FF7E01' },
        4052: { bgColor: '#DAFFF0', color: '#26B583' },
        4053: { bgColor: '#EAF5FF', color: '#0079FE' },
      },
    });

    const {
      url,
      data,
      fetchData,
    } = useHttp();

    data.value = [];
    url.value = props.api;

    if (props.api) {
      fetchData();
    }

    const options = computed(() => {
      if (props.api) {
        return data.value;
      }
      return props.data;
    });

    const innerPropOpts = computed(() => ({
      multiple: props.multiple,
      ...props.propOpts,
    }));
    const innerExpert = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });

    return {
      ...toRefs(state),
      innerExpert,
      innerPropOpts,
      options,
    };
  },
};
</script>

<style lang="scss">
  .select-cascader {
    .tag-type {
      padding: 2px 5px;
      border-radius: 10px;
    }
  }
</style>

<style lang="scss" scoped>
.select-review-experts {}
</style>
