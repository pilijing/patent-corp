<template>
  <div class="panel-select">
    <el-select
      v-model="currentValue"
      v-on="$listeners"
      v-bind="$attrs"
      :clearable="clearable"
      :multiple="multiple"
    >
      <el-option
        v-for="item in currentOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import { computed, ref } from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import { useHttp } from '../hooks/http';

export default {
  name: 'PanelSelect',
  props: {
    value: {
      type: [String, Boolean, Number, Array],
      default: '',
    },
    api: String,
    apiCallback: Function,
    labelKey: {
      type: String,
      default: 'name',
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    type: String,
    group: String,
    clearable: {
      type: Boolean,
      default: true,
    },
    defaultOptions: {
      type: Array,
      default() {
        return [];
      },
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    // 是否需要过滤
    isFilter: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { $message } = context.root;
    const { sortLookups } = useLookupsInject();
    const { emit } = context;
    const enums = computed(() => sortLookups.value);
    const currentValue = computed({
      get() {
        return props.value;
      },
      set(val) {
        const chooseItem = props.defaultOptions.filter(item => item.id === val);
        // 抛出选中的所有值
        if (chooseItem.length > 0) {
          emit('changeitem', chooseItem[0]);
        }
        if (!val) {
          emit('changeitem', null);
        }
        emit('input', val);
      },
    });
    // 接口返回的选项
    const apiOptions = ref([]);
    if (props.api && props.apiCallback) {
      const { data, fetchData } = useHttp(props.api);
      fetchData()
        .then(() => {
          apiOptions.value = data.value.map(props.apiCallback);
        })
        .catch((error) => {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('请求数据失败');
          }
        });
    }
    const currentOptions = computed(() => {
      if (props.api) {
        return apiOptions.value;
      }
      let enumList = [];
      if (props.type) {
        enumList = enums.value[props.type];
      } else if (props.group) {
        enumList = enums.value[props.group];
      }
      enumList = (enumList || []).filter((item) => {
        if (props.isFilter) {
          return item.isEnabled === 1;
        }
        return true;
      });
      return [...(props.defaultOptions || []), ...(enumList || [])].map(item => ({
        value: item[props.valueKey],
        label: item[props.labelKey],
      }));
    });

    return {
      currentValue,
      currentOptions,
      apiOptions,
      props,
    };
  },
};
</script>

<style lang="scss" scoped>
// .panel-select {
// }
</style>
