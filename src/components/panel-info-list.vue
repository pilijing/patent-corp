<template>
  <div class="panel-info-list">
    <div
      v-for="(dataItem, dataItemI) in dataList"
      :key="`${dataItemI}-${dataItem.dataIndex}`"
      class="list-item"
      :style="dataItem.style"
    >
      <div
        class="item-label"
        :style="dataItem.label.style"
        :title="dataItem.label.name"
      >
        {{ dataItem.label.name }}
        <el-tooltip
          v-if="dataItem.label.tips"
          effect="dark"
          :content="dataItem.label.tips"
          placement="top-start"
          style="margin-left: 5px;"
        >
          <i class="el-icon-question" style="color: #c8c8c8; font-size: 16px; vertical-align: text-bottom;" />
        </el-tooltip>:
      </div>
      <div
        class="item-value"
        :class="dataItem.type === 'textarea' ? 'wrap' : ''"
        :style="dataItem.valueStyle"
      >
        <template v-if="['text', 'textarea'].includes(dataItem.type)">
          <span :title="dataItem.type === 'text' ? dataItem.value : ''">{{ dataItem.value }}</span>
        </template>
        <template
          v-if="dataItem.type === 'tags'"
        >
          <span
            v-for="(tag, tagI) in dataItem.value"
            :key="tagI"
            class="tag-item"
          >
            {{ tag }}
          </span>
        </template>
        <template v-if="dataItem.type === 'file'">
          <div class="file-wrapper">
            <display-attachment v-if="(dataItem.value || []).length > 0" :file-list="dataItem.value" />
          </div>
        </template>
        <template v-if="dataItem.type === 'link'">
          <!-- 当 link 值 为 inherit 时，link 取值为 dateItem 的值 -->
          <a :href="getTolink(dataItem)" target="_black">{{ dataItem.value }}</a>
        </template>
        <template v-if="dataItem.type === 'links'">
          <span
            v-for="(v, i) in dataItem.value"
            :key="i"
            class="link-item"
          >
            <a :href="getTolink(v)" target="_black">{{ v.value }}</a>
          </span>
        </template>
        <template v-if="dataItem.type === 'link-icon'">
          {{ dataItem.value }}
          <span @click="$router.push(dataItem.link)" :class="dataItem.icon" />
        </template>
        <template v-if="dataItem.type === 'event'">
          <span style="cursor: pointer;" @click="handleClick(dataItem)">{{ dataItem.value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
import DisplayAttachment from '@/components/display-attachment.vue';

export default {
  name: 'PanelInfoList',
  components: {
    DisplayAttachment,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    labelWidth: {
      type: String,
      default: '100px',
    },
    col: {
      type: [String, Number],
      default: '3',
    },
  },
  setup(props, context) {
    const { $route } = context.root;
    const state = reactive({
      isTodo: undefined,
    });
    if ($route.query.todo) {
      state.isTodo = true;
    }
    // 每行几列
    const colsForRow = Math.ceil(props.col);
    const itemWidth = `${1 / colsForRow * 100}%`;
    const dataList = computed(() => {
      const list = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < props.columns.length; i += 1) {
        const itemInfo = props.columns[i] || {};
        const {
          icon, dataIndex, type, append, width,
          // 当 type 为 link 时， link 才有用
          link, valueStyle,
        } = itemInfo;
        let value = props.value[dataIndex];
        if (value !== null && value !== undefined) {
          if (typeof value === 'string') {
            value = value.trim();
          }
          if (append) {
            value += append;
          }
        }
        const labelStyle = {
          width: props.labelWidth,
        };
        // 当 label 没宽度时，label 不显示
        const labelWidthUnit = props.labelWidth.substr(-2);
        const labelWidth = props.labelWidth.slice(0, -2);
        if (labelWidthUnit !== 'px' || Number.isNaN(Number(labelWidth))) {
          labelStyle.display = 'none';
        }
        const item = {
          dataIndex,
          type: type || 'text',
          link,
          label: {
            name: itemInfo.label || dataIndex,
            tips: itemInfo.tips || '',
            style: labelStyle,
          },
          value,
          valueStyle,
          style: {
            width: width || itemWidth,
          },
          icon,
        };
        list.push(item);
      }
      return list;
    });
    const getTolink = (item) => {
      let { link } = item;
      if (link === 'inherit') {
        link = item.value;
      }
      return link;
    };
    const handleClick = (item) => {
      const { link } = item;
      if (link) {
        link(props.value);
      }
    };
    return {
      ...toRefs(state),
      dataList,
      getTolink,
      handleClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-info-list {
  display: flex;
  flex-wrap: wrap;
  $marginBottom: 14px;
  .list-item {
    flex: none;
    display: flex;
    margin-bottom: 6px;
    box-sizing: border-box;
    padding-right: 15px;
    %ellipsis {
      line-height: 25px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-label {
      @extend %ellipsis;
      margin-right: 16px;
      flex: none;
      line-height: 25px;
      font-size: 14px;
      color: #757575;
      text-align: right;
    }
    .item-value {
      line-height: 25px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      &.wrap {
        white-space: pre-wrap;
        word-break: break-all;
      }
      font-size: 14px;
      color: #303133;
      flex: 1;
      .tag-item {
        display: inline-block;
        border: 1px solid #d8d9db;
        margin-right: 10px;
        // 多行时间隔会有问题
        // margin-bottom: 10px;
        font-size: 12px;
        height: 25px;
        line-height: 25px;
        box-sizing: border-box;
        padding: 0 5px;
        border-radius: 2px;
        &:last-child {
          margin-right: 0;
        }
      }
      .link-item {
        display: inline-block;
        margin-right: 5px;
        font-size: 12px;
        height: 25px;
        line-height: 25px;
        box-sizing: border-box;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .file-wrapper {
      display: flex;
      align-items: center;
      .el-icon-document, .text, .btn-preview {
        margin-right: 5px;
        &:last-child {
          margin-right: 0;
        }
      }
      .btn-preview {
        cursor: pointer;
        color: #409eff;
      }
    }
  }
}
</style>
