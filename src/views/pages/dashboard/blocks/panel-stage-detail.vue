<template>
  <div class="panel-stage-detail">
    <el-collapse class="collapse-stage" v-model="activeIndexList">
      <el-collapse-item
        class="collapse-stage-item"
        v-for="(item, index) in processStageList || []"
        :key="index"
        :name="item.stageId"
        v-loading="item.loading"
        element-loading-spinner="el-icon-loading"
        :id="`stage-${item.stageId}`"
      >
        <template slot="title">
          <div class="title-name">{{ item.processStageName }}</div>
          <!-- <div>当前步骤：{{ item.stepNameName }} <span class="label-tag-done">已完成</span></div> -->
          <!-- <div>当前处理人：{{ item.staffInCharge }}</div> -->
          <!-- <div>工作时限：{{ utils.dateFormat(item.workingDueDate) }}</div>
          <div>法定时限：{{ utils.dateFormat(item.officialDueDate) }}</div> -->
          <div class="arrow-detail">
            展开详情<i class="el-icon-arrow-down"></i>
          </div>
        </template>
        <div style="padding: 10px 20px" v-if="stageDetails[item.stageId]">
          <!-- 阶段详情 -->
          <descriptions :column="3" :label-width="120" style="padding: 0 10px">
            <descriptions-item
              v-for="(field, index) in showFields(item.stageId)"
              :key="`${field.id}-${index}`"
              :label="field.fieldName"
            >
              <template v-if="field.displayType === 'file'">
                <display-attachment
                  v-if="(field.value || []).length > 0"
                  :file-list="field.value"
                />
              </template>
              <template v-else>
                <span :title="field.value">{{ field.value }}</span>
              </template>
            </descriptions-item>
          </descriptions>
          <panel-step-detail
            :nodeArr="nodeArr"
            :data="stageDetails[item.stageId].progressList"
            @expanded-keys-change="handleStepExpandedKeysChange"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
/**
 * 阶段详情
 */
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
} from '@vue/composition-api';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import PanelStepDetail from './panel-step-detail.vue';

export default defineComponent({
  name: 'PanelStageDetail',
  components: { PanelStepDetail },
  props: {
    nodeArr: Array,
  },
  setup(props, context) {
    const { $route, $set, $nextTick } = context.root;
    const { emit } = context;
    const state = reactive({
      activeIndexList: [],
      stageDetails: {},
    });

    const {
      data: processStageList,
      fetchData,
    } = useHttp(`/patent-corp_api/patents-detail/process-stage-list/${$route.query.id}`);
    const {
      data: processStageDetail,
      fetchData: fetchStageDetail,
    } = useHttp('/patent-corp_api/patents-detail/process-stage-detail');

    const handleStageDetail = async (id) => {
      const satge = (processStageList.value || []).find(item => item.stageId === id);
      if (satge) {
        const params = { patentId: $route.query.id, stageId: id };
        $set(satge, 'loading', true);
        try {
          await fetchStageDetail(params);
          $set(state.stageDetails, id, processStageDetail.value);
        } catch (error) {
          console.error(error.response.data);
        }
        $set(satge, 'loading', false);
      }
    };

    // 字段显示处理
    const showFields = (id) => {
      const fields = (state.stageDetails[id].stagePropertyList || []).map((item) => {
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

    const scrollToStageId = (stageId) => {
      const dom = document.getElementById(`stage-${stageId}`);
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
        emit('update:expanded-keys', newDetail);
        if (newDetail.length > 0) {
          const allNewDetail = newDetail.map(async (item) => {
            if (!state.stageDetails[item]) {
              await handleStageDetail(item);
            }
          });
          await Promise.all(allNewDetail);
        }
      },
    );

    watch(
      () => props.nodeArr,
      (val) => {
        // const arr = [(val || [])[0]]; // 这样写会有这样的数据：[undefined]
        const arr = val && val.length > 0 ? [val[0]] : [];
        if (arr.length > 0 && !state.activeIndexList.includes(arr[0])) {
          state.activeIndexList = [...state.activeIndexList, ...arr];
        }
        setTimeout(() => {
          if (arr.length > 0) {
            scrollToStageId(arr[0]);
          }
        }, 500);
      },
      { immediate: true, deep: true },
    );

    onMounted(() => {
      fetchData();
    });

    function handleStepExpandedKeysChange(val) {
      emit('update:expanded-keys', val);
    }
    return {
      ...toRefs(state),
      utils,
      processStageList,
      showFields,

      handleStepExpandedKeysChange,
    };
  },
});
</script>

<style lang="scss">
.collapse-stage-item {
  margin-top: 15px;
}
.collapse-stage-item > div > .el-collapse-item__header {
  & {
    padding: 0 30px;
    height: 46px;
    justify-content: space-between;
    background-color: rgba(239, 249, 255, 1);
    box-sizing: border-box;
    border: 1px solid rgba(179, 209, 244, 1);
  }
  & .title-name {
    font-size: 16px;
    font-weight: 700;
  }
  & .label-tag-done {
    color: #139f39;
    border-radius: 30px;
    padding: 3px 6px;
    background-color: rgba(210, 246, 212, 1);
  }
  & .label-tag-todo {
    color: #ff5b01;
    border-radius: 30px;
    padding: 3px 6px;
    background-color: #ffdfc8;
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
.collapse-stage-item > .el-collapse-item__wrap {
  border: 1px solid rgba(179, 209, 244, 1);
  border-top: 0;
}
.el-collapse-item__content {
  padding-bottom: 0px;
}
</style>

<style lang="scss" scoped>
.panel-stage-detail {
  .arrow-detail {
    color: rgb(0, 118, 255);
  }
  .collapse-stage {
    border: 0;
    ::v-deep {
      .display-list-item {
        line-height: 23px;
      }
    }
  }
}
</style>
