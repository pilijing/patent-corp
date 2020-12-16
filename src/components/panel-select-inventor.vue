<template>
  <div class="panel-select-inventor">
    <panel-select-search
      v-on="$listeners"
      v-bind="$attrs"
      v-model="innerValue"
      :default-options="defaultOptions"
      :multiple="multiple"
      :api="api"
      :query-key="queryKey"
      :label-key="labelKey"
      :value-key="valueKey"
      inventorInfo
      @changeitem="changeInventor"
    />
    <div class="add-inventor-btn">
      <el-button type="text" icon="el-icon-plus" @click="handleAddInventor()">新增发明人</el-button>
    </div>
    <detail-inventor-info class="inventor-info" v-if="!multiple && firstInventorOpts" :data="firstInventorOpts">
      <el-button type="text" icon="el-icon-edit-outline" @click="handleEditInventor(firstInventorOpts.id)" />
    </detail-inventor-info>
    <div class="inventor-info"
      v-else
      v-for="(item, index) in otherInventorOpts"
      :key="index"
    >
      <detail-inventor-info :data="item">
        <el-button type="text" icon="el-icon-edit-outline" @click="handleEditInventor(item.id)" />
      </detail-inventor-info>
    </div>
    <dialog-new-inventor
      :visible.sync="dialogNewInventor"
      :is-add-inventor="isAddInventor"
      :inventor-id="inventorId"
    />
  </div>
</template>

<script>
import {
  defineComponent, computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import DialogNewInventor from '@/components/dialog-new-inventor.vue';
import DetailInventorInfo from '@/components/detail-inventor-info.vue';

export default defineComponent({
  name: 'PanelSelectInventor',
  components: {
    PanelSelectSearch,
    DialogNewInventor,
    DetailInventorInfo,
  },
  props: {
    value: [String, Array, Number],
    api: String,
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
    multiple: Boolean,
    defaultOptions: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({
      firstInventorOpts: null,
      otherInventorOpts: [],
      dialogNewInventor: false,
      inventorId: undefined,
      isAddInventor: false,
    });
    const innerValue = computed({
      set(val) {
        emit('input', val);
      },
      get() {
        return props.value;
      },
    });
    // 默认赋值
    if (!props.multiple) {
      // eslint-disable-next-line prefer-destructuring
      state.firstInventorOpts = props.defaultOptions[0]; // 单选
    } else { // 多选
      state.otherInventorOpts = [...props.defaultOptions];
    }
    // 发明人变更
    const changeInventor = (options) => {
      if (!props.multiple) {
        state.firstInventorOpts = options; // 单选
      } else { // 多选
        state.otherInventorOpts = [...options];
      }
    };

    const handleAddInventor = () => {
      state.dialogNewInventor = true;
      state.isAddInventor = true;
      state.inventorId = undefined;
    };
    const handleEditInventor = (id) => {
      state.dialogNewInventor = true;
      state.inventorId = id;
      state.isAddInventor = false;
      state.inventorType = undefined;
    };

    watch(() => innerValue.value, (val) => {
      if (props.multiple) {
        state.otherInventorOpts = state.otherInventorOpts.filter(item => val.includes(item.id));
      }
    });

    return {
      ...toRefs(state),
      innerValue,
      changeInventor,
      handleAddInventor,
      handleEditInventor,
    };
  },
});
</script>

<style lang="scss" scoped>
.panel-select-inventor {
  position: relative;
  .inventor-info {
    background: #EFF9FF;
    margin: 10px 0;
  }
  .add-inventor-btn {
    position: absolute;
    right: -100px;
    top: 0;
  }
}
</style>
