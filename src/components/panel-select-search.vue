<template>
  <div class="panel-search">
    <el-select
      v-on="$listeners"
      v-bind="$attrs"
      clearable
      v-model="innerValue"
      filterable
      remote
      :remote-method="searchOptions"
      @focus="handleFocusSelect"
      @visible-change="handleVisibleChange"
      :loading="searchLoading"
      :size="size"
      :style="selectStyle"
      :multiple="multiple"
    >
      <el-option
        v-for="item in innerOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import {
  defineComponent,
  computed, reactive, toRefs,
  watch, onMounted,
} from '@vue/composition-api';
import { useHttp } from '../hooks/http';

export default defineComponent({
  name: 'PanelSelectSearch',
  props: {
    value: [String, Array, Number],
    api: String,
    type: String,
    labelKey: {
      type: String,
      default: 'name',
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    queryKey: {
      type: String,
      default: 'keyword',
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
    size: String,
    selectStyle: String,
    // 是带出发明人详细信息
    inventorInfo: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      cacheOptions: [],
      keyword: '',
    });

    const {
      url: searchApi,
      loading: searchLoading,
      data: innerData,
      fetchData,
    } = useHttp();

    watch(() => props.defaultOptions, (cur) => {
      // 默认 option 有变更，赋值到 cacheOptions
      state.cacheOptions = [...cur];
      // 重置上次搜索
      innerData.value = [];
    });

    onMounted(() => {
      state.cacheOptions = [...props.defaultOptions || []];
      innerData.value = [];
    });
    const innerOptions = computed(() => {
      const optionValueList = [];
      const useCacheValue = state.cacheOptions.some((item) => {
        const innerItemValue = item[props.valueKey];
        if (props.value instanceof Array) {
          return props.value.includes(innerItemValue);
        }
        return innerItemValue === props.value;
      });
      const allOptions = [
        ...(useCacheValue ? state.cacheOptions : []),
        ...(innerData.value || []),
      ].map(item => ({
        value: item[props.valueKey],
        label: item[props.labelKey],
        // 原始值
        origin: item,
      })).filter((item) => {
        // 过滤重复值
        if (optionValueList.includes(item.value)) {
          return false;
        }
        optionValueList.push(item.value);
        return true;
      });
      return allOptions;
    });

    const innerValue = computed({
      set(val) {
        emit('input', val);
        let chooseItem;
        if (val instanceof Array) {
          chooseItem = innerOptions.value.filter(item => val.includes(item.value));
          const chooseArr = (chooseItem || []).map(item => item.origin);
          emit('changeitem', chooseArr);
        } else {
          chooseItem = innerOptions.value.filter(item => item.value === val);
          // 抛出选中的所有值
          if (chooseItem.length > 0) {
            emit('changeitem', chooseItem[0].origin);
          }
        }
        if (!val) {
          emit('changeitem', null);
        }
      },
      get() {
        return props.value;
      },
    });

    const searchOptions = async (keyword = '') => {
      state.keyword = keyword.trim();
      let query;
      if (props.inventorInfo) {
        query = {
          info: true,
          [props.queryKey]: state.keyword,
          limit: 10,
          offset: 0,
        };
      } else {
        query = {
          [props.queryKey]: state.keyword,
          limit: 10,
          offset: 0,
        };
      }
      searchApi.value = props.api;
      await fetchData(query);
    };

    const handleFocusSelect = () => {
      const needFocus = ['LawFirm'];
      if (state.keyword === '' && needFocus.includes(props.type)) {
        searchOptions();
      }
    };

    const handleVisibleChange = (visible) => {
      if (!visible) {
        state.keyword = '';
      }
    };

    return {
      ...toRefs(state),
      innerValue,
      searchLoading,
      innerOptions,
      searchOptions,
      handleFocusSelect,
      handleVisibleChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.panel-search {}
</style>
