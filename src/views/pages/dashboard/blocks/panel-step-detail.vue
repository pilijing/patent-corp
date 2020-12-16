<template>
  <div class="panel-step-detail">
    <el-collapse class="collapse-step" v-model="activeIndexList">
      <el-collapse-item
        class="collapse-step-item"
        v-for="(item, index) in data || []"
        :key="index"
        :name="item.progressId"
        v-loading="item.loading"
        element-loading-spinner="el-icon-loading"
        :id="`step-${item.progressId}`"
      >
        <template slot="title">
          <div class="title-name">{{ item.name }}</div>
          <div>结果：{{ item.result }}</div>
          <div>当前处理人：{{ item.operator }}</div>
          <div>工作时限：{{ utils.dateFormat(item.workingDueDate) }}</div>
          <div>法定时限：{{ utils.dateFormat(item.officialDueDate) }}</div>
          <div class="arrow-detail">
            展开详情<i class="el-icon-arrow-down"></i>
          </div>
        </template>
        <div style="padding: 10px 20px" v-if="propertyDetails[item.progressId]">
          <!-- 步骤详情 -->
          <descriptions :column="3" :label-width="120" style="padding: 0 10px">
            <descriptions-item
              v-for="(field, index) in showFields(item.progressId)"
              :key="`${field.id}-${index}`"
              :label="field.fieldName"
            >
              <template v-if="field.displayType === 'file'">
                <display-attachment
                  v-if="(field.value || []).length > 0"
                  :file-list="field.value"
                />
              </template>
              <template v-else-if="field.displayType === 'tag'">
                <template v-if="field.value">
                  <description-tags :data="JSON.parse(field.value)" />
                </template>
              </template>
              <template v-else>
                <span :title="field.value">{{ field.value }}</span>
              </template>
            </descriptions-item>
          </descriptions>
          <panel-event-detail
            :nodeArr="nodeArr"
            :data="propertyDetails[item.progressId].progressVo"
            @expanded-keys-change="handleEventExpandedKeysChange"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
/**
 * 步骤详情
 */
import {
  defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import DisplayAttachment from '@/components/display-attachment.vue';
import PanelEventDetail from './panel-event-detail.vue';
import DescriptionTags from '../patent-detail/tab-pane-detail/description-tags.vue';

export default defineComponent({
  name: 'PanelStepDetail',
  components: { PanelEventDetail, DisplayAttachment, DescriptionTags },
  props: {
    data: Array,
    nodeArr: Array,
  },
  setup(props, context) {
    const { emit } = context;
    const { $set, $nextTick } = context.root;
    const state = reactive({
      activeIndexList: [],
      propertyDetails: {},
    });

    const {
      url: progressPropertyUrl,
      data: progressPropertyDetail,
      fetchData: fetchPropertyDetail,
    } = useHttp();

    const handleStepDetail = async (id) => {
      progressPropertyUrl.value = `/patent-corp_api/progress-property/${id}`;
      const satge = (props.data || []).find(item => item.progressId === id);
      if (satge) {
        $set(satge, 'loading', true);
        try {
          await fetchPropertyDetail();
          $set(state.propertyDetails, id, progressPropertyDetail.value);
        } catch (error) {
          console.error(error.response.data);
        }
        $set(satge, 'loading', false);
      }
    };

    const scrollToStepId = (stepId) => {
      const dom = document.getElementById(`step-${stepId}`);
      if (dom) {
        $nextTick(() => {
          window.scrollTo(0, dom.offsetTop - 120);
        });
      }
    };

    watch(
      () => state.activeIndexList,
      async (newVal, oldVal) => {
        // 旧的值不包含新的（说明是打开）

        const newDetail = newVal.filter(item => !oldVal.includes(item));
        if (props.nodeArr.length > 0 && newDetail.length > 0) {
          emit('expanded-keys-change', [props.nodeArr[0], newDetail[0]]);
        }
        if (newDetail.length > 0) {
          const allNewDetail = newDetail.map(async (item) => {
            if (!state.propertyDetails[item]) {
              await handleStepDetail(item);
              scrollToStepId(item);
            }
          });
          await Promise.all(allNewDetail);
        }
      },
    );

    watch(
      () => props.nodeArr,
      (val) => {
        const arr = val && val.length > 1 ? [val[1]] : [];
        if (arr.length > 0 && !state.activeIndexList.includes(arr[0])) {
          state.activeIndexList = [...state.activeIndexList, ...arr];
        }
        setTimeout(() => {
          if (arr.length > 0) {
            scrollToStepId(arr[0]);
          }
        }, 500);
      },
      { immediate: true, deep: true },
    );

    // 字段显示处理
    const showFields = (id) => {
      const fields = (state.propertyDetails[id].propertyVo || []).map((item) => {
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
    function handleEventExpandedKeysChange(val) {
      emit('expanded-keys-change', val);
    }
    return {
      ...toRefs(state),
      utils,
      showFields,
      handleEventExpandedKeysChange,
    };
  },
});
</script>

<style lang="scss">
.collapse-step-item > div > .el-collapse-item__header {
  & {
    padding: 0 30px;
    height: 38px;
    justify-content: space-between;
    background-color: rgba(240, 248, 250, 1);
    box-sizing: border-box;
    border: 1px solid rgba(220, 230, 229, 1);
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
.collapse-step-item > .el-collapse-item__wrap {
  border: 1px solid rgba(220, 230, 229, 1);
  border-top: 0;
}
</style>

<style lang="scss" scoped>
.panel-step-detail {
  .arrow-detail {
    color: rgb(0, 118, 255);
  }
  .collapse-step {
    border: 0;
    ::v-deep {
      .display-list-item {
        line-height: 23px;
      }
    }
    .collapse-step-item {
      margin-top: 15px;
      .title-name {
        font-size: 15px;
        font-weight: 700;
      }
    }
  }
}
</style>
