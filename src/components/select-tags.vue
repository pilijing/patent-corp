<template>
  <div class="select-tags">
    <panel-select-cascader
      v-bind="$attrs"
      v-on="$listeners"
      v-model="innerTag"
      :options="options"
      :prop-opts="innerPropOpts"
    >
      <template #default="{ data }">
        <span>{{ data.name }}</span>
      </template>
    </panel-select-cascader>
    <div style="margin-top: 10px" v-if="(tagList || []).length > 0">
      <el-table
        :data="tagList"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="firstName"
          label="一级标签"
        />
        <el-table-column
          prop="secondName"
          label="二级标签"
        />
        <el-table-column
          prop="thirdName"
          label="三级标签"
        />
        <el-table-column
          label="是否优先标签"
        >
          <template #default="{ row }">
            <el-radio
              v-model="row.isPriorityTag"
              :label="row.templateRadio"
              @change.native="getCurrentRow(row)"
            >
              <span style="color: transparent;">&nbsp;</span>
            </el-radio>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import PanelSelectCascader from '@/components/panel-select-cascader.vue';
import {
  computed, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useHttp } from '../hooks/http';

export default {
  name: 'SelectTags',
  components: { PanelSelectCascader },
  props: {
    value: [Array, String, Number],
    defaultList: {
      type: Array,
      default: () => [],
    },
    propOpts: Object,
    api: String,
    multiple: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    const { emit } = context;
    const state = reactive({});

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
    const tagList = computed(() => tagListData());

    const innerTag = computed({
      get() {
        return props.value || [];
      },
      set(val) {
        emit('input', val);
      },
    });

    // 三级联动数据扁平化---递归
    const flatFun = (list) => {
      let flatObj = {};
      (list || []).forEach((item) => {
        // id(key): name
        const obj = {
          [item[props.propOpts.value]]: item[props.propOpts.label],
        };
        if (!item.children) {
          flatObj = { ...flatObj, ...obj };
        } else {
          flatObj = { ...flatObj, ...obj };
        }
        if (item.children instanceof Array) {
          const res = flatFun(item.children);
          flatObj = { ...flatObj, ...res };
        }
      });
      return flatObj;
    };

    watch(() => innerTag.value, () => {
      emit('update-tag-data', tagListData());
    });

    // 处理级联id
    const getIdStr = row => `${row.firstId},${row.secondId},${row.thirdId}`;

    // 表格数据处理
    // 把级联数据转换成表格数据
    function tagListData() {
      const tagObjVal = flatFun(options.value);
      if (innerTag.value.length === 0) {
        return [];
      }
      // 优先标签
      const priorityTag = props.defaultList.find(item => item.isPriorityTag === 1);
      console.info(priorityTag);
      const table = (innerTag.value || []).map((item) => {
        const secondId = item.length > 1 ? item[1] : null;
        const thirdId = item.length > 2 ? item[2] : null;
        console.info(priorityTag, thirdId);
        return {
          firstId: item[0],
          firstName: tagObjVal[item[0]],
          secondId,
          secondName: tagObjVal[`${secondId}`],
          thirdId,
          thirdName: tagObjVal[`${thirdId}`],
          templateRadio: 1,
          isPriorityTag: priorityTag && priorityTag.thirdId === thirdId ? 1 : null,
        };
      });

      return table || [];
    }

    // 单选
    const getCurrentRow = (row) => {
      const currentId = getIdStr(row);
      tagList.value.forEach((item) => {
        const itemId = getIdStr(item);
        if (currentId === itemId) {
          item.isPriorityTag = row.templateRadio;
        } else {
          item.isPriorityTag = 0;
        }
      });
      emit('update-tag-data', tagList.value);
    };
    onMounted(() => {
      emit('update-tag-data', tagList.value);
    });

    return {
      ...toRefs(state),
      innerTag,
      innerPropOpts,
      options,
      tagList,
      getCurrentRow,
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
.select-tags {}
</style>
