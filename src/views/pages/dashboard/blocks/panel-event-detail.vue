<template>
  <div class="panel-event-detail">
    <el-collapse class="collapse-event" v-model="activeIndexList">
      <el-collapse-item
        class="collapse-event-item"
        v-for="(item, index) in (data || [])"
        :key="index"
        :name="item.progressId"
        v-loading="item.loading"
        element-loading-spinner="el-icon-loading"
        :id="`event-${item.progressId}`"
      >
        <template slot="title">
          <div class="title-name">{{item.name}}</div>
          <div>结果：{{ item.result }}</div>
          <div>当前处理人：{{ item.operator }}</div>
          <div>工作时限：{{ utils.dateFormat(item.workingDueDate) }}</div>
          <div>法定时限：{{ utils.dateFormat(item.officialDueDate) }}</div>
          <div class="arrow-detail">展开详情<i class="el-icon-arrow-down"></i></div>
        </template>
      <div style="padding: 10px 20px" v-if="eventDetails[item.progressId]">
        <!-- 来文事件流程 -->
        <descriptions :column="3" :label-width="120" style="padding: 0 10px">
          <descriptions-item
            v-for="(field, index) in showFields(item.progressId)"
            :key="`${field.id}-${index}`"
            :label="field.fieldName"
            >
            <template v-if="field.displayType === 'file'">
              <display-attachment v-if="(field.value || []).length > 0" :file-list="field.value" />
            </template>
              <template v-else>
                <span :title="field.value">{{ field.value }}</span>
              </template>
          </descriptions-item>
        </descriptions>
      </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
/**
 * 来文事件流程
 */
import {
  defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';
import DisplayAttachment from '@/components/display-attachment.vue';

export default defineComponent({
  name: 'PanelEventDetail',
  props: {
    data: Array,
    nodeArr: {
      type: Array,
      default: () => [],
    },
  },
  components: { DisplayAttachment },
  setup(props, context) {
    const { emit } = context;
    const { $set } = context.root;
    const state = reactive({
      activeIndexList: [],
      eventDetails: {},
    });

    const {
      url: progressEventUrl,
      data: progressEventDetail,
      fetchData: fetchEventDetail,
    } = useHttp();

    const handleEventDetail = async (id) => {
      progressEventUrl.value = `/patent-corp_api/progress-property/${id}`;
      const satge = (props.data || []).find(item => item.progressId === id);
      if (satge) {
        $set(satge, 'loading', true);
        try {
          await fetchEventDetail();
          $set(state.eventDetails, id, progressEventDetail.value);
        } catch (error) {
          console.error(error.response.data);
        }
        $set(satge, 'loading', false);
      }
    };

    watch(() => state.activeIndexList, async (newVal, oldVal) => {
      // 旧的值不包含新的（说明是打开）
      const newDetail = newVal.filter(item => !oldVal.includes(item));
      if (props.nodeArr.length > 1 && newDetail.length > 0) {
        emit('expanded-keys-change', [props.nodeArr[0], props.nodeArr[1], newDetail[0]]);
      }
      if (newDetail.length > 0) {
        const allNewDetail = newDetail.map(async (item) => {
          if (!state.eventDetails[item]) {
            await handleEventDetail(item);
          }
        });
        await Promise.all(allNewDetail);
      }
    });

    watch(() => props.nodeArr, (val) => {
      const arr = [val[2]];
      if (!state.activeIndexList.includes(arr[0])) {
        state.activeIndexList = [...state.activeIndexList, ...arr];
      }
    }, { immediate: true, deep: true });

    // 字段显示处理
    const showFields = (id) => {
      const fields = (state.eventDetails[id].propertyVo || []).map((item) => {
        if (item.displayType === 'file' && item.value) {
          const val = JSON.parse(item.value);
          return {
            ...item,
            value: val,
          };
        }
        return { ...item };
      });
      return fields || [];
    };

    return {
      ...toRefs(state),
      utils,
      showFields,
    };
  },
});
</script>

<style lang="scss">
.collapse-event-item > div > .el-collapse-item__header {
  & {
    padding: 0 30px;
    height: 38px;
    justify-content: space-between;
    background-color: #fff;
    box-sizing: border-box;
    border: 1px solid rgba(220, 230, 229, 1);
    border-left: 5px solid #016EFF;
  }
  &.is-active {
    .el-icon-arrow-down {
      transform: rotate(-180deg);
    }
  }
  .el-collapse-item__arrow {
    display: none;
  }
}
.collapse-event-item > .el-collapse-item__wrap{
  border: 1px solid rgba(220, 230, 229, 1);
  border-top: 0;
}
</style>

<style lang="scss" scoped>
.panel-event-detail {
  .arrow-detail{
    color: rgb(0, 118, 255);
  }
  .collapse-event{
    border: 0;
    ::v-deep {
      .display-list-item {
        line-height: 23px;
      }
    }
    .collapse-event-item {
      margin-top: 15px;
      .title-name {
        font-size: 15px;
      }
    }
  }
}
</style>
