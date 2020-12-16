<template>
  <div class="panel-select-group">
    <el-select
      v-bind="$attrs"
      v-on="$listeners"
      v-model="innerValue"
      placeholder="请选择"
      :clearable="clearable"
      :multiple="multiple"
    >
      <el-option-group
        v-for="child in innerOptions"
        :key="child[labelKey]"
        :label="child[labelKey]">
        <el-option
          v-for="item in child.children"
          :key="item[valueKey]"
          :label="item[labelKey]"
          :value="item[valueKey]">
        </el-option>
      </el-option-group>
      <div
        v-if="isMore && isShow"
        class="more-btn"
        v-loading="moreLoading"
        @click="fetchMoreData"
      >
        {{ moreBtnText }}
        <i class="el-icon-arrow-down" />
      </div>
  </el-select>
  </div>
</template>

<script>
import {
  reactive, toRefs, computed,
} from '@vue/composition-api';
import { useHttp } from '../hooks/http';

export default {
  name: 'PanelSelectGroup',
  props: {
    value: [Array, String, Number],
    api: String, // 传入API，在组件内部发起请求获取数据
    data: Array, // 直接传入数据，如果已传入api，该值无效
    // el-option-group和el-option的value和label key一定要保持一致
    valueKey: {
      type: String,
      default: 'value',
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    query: Object,
    isMore: { // 是否可以加载更多
      type: Boolean,
      default: false,
    },
    loadMoreApi: String,
    moreBtnText: {
      type: String,
      default: '展开其他阶段来文',
    },
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      isShow: true,
    });

    const innerValue = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
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
      state.agencyList = fetchData(props.query);
    }

    const {
      url: moreApi,
      data: moreData,
      loading: moreLoading,
      fetchData: moreFetchData,
    } = useHttp();
    const innerOptions = computed(() => {
      if (props.api) {
        emit('current-stageid', data.value.currentStageId);
        return [...data.value?.data || [], ...moreData.value?.data || []];
      }
      return props.data;
    });
    const fetchMoreData = async () => {
      moreApi.value = props.loadMoreApi;
      await moreFetchData(props.query);
      state.isShow = false;
    };
    return {
      ...toRefs(state),
      innerValue,
      innerOptions,
      moreLoading,
      fetchMoreData,
    };
  },
};
</script>

<style lang="scss" scoped>
.more-btn {
  background: #F6F6F6;
  color: #999;
  margin: 5px 20px;
  padding: 5px 0;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
}
</style>
