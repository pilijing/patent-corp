<template>
  <div>
    <el-collapse
      v-model="activeNames"
      @change="handleChange"
    >
      <el-collapse-item
        :name="item.id+item.name"
        class="stage-collapse-item_title"
        v-for="(item) in stageList"
        :key="item.id"
      >
        <template slot="title">
          {{item.name}}
          <el-tag
            v-for="tag in tags"
            :key="tag.name"
            closable
            :type="tag.type"
            @close="handleTagClose(tag)"
          >
            {{tag.name}}
          </el-tag>

          <el-button
            type="text"
            icon="el-icon-circle-plus-outline"
            circle
            @click.stop="handleAddFeeItemClick"
          ></el-button>

        </template>
        <div> 阶段的ID：{{item.id}}</div>
        <div> 阶段的名字： {{item.name}} </div>

        <el-collapse
          v-model="activeNames2"
          @change="handleChange"
          class="step-collapse"
        >
          <el-collapse-item
            :title="item.name"
            :name="item.id+item.name"
            class="step-collapse-item_title"
            v-for="(item) in stepClaimList"
            :key="item.id"
          >
            <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
            <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>

            <el-collapse
              v-model="activeNames2"
              @change="handleChange"
              class="event-collapse"
              v-if="item.type === 701"
            >
              <el-collapse-item
                class="event-collapse-item_title"
                v-for="(item) in eventList1"
                :key="item.id"
                :title="item.name"
                :name="item.id+item.name"
              >
                <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
                <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
              </el-collapse-item>

            </el-collapse>
            <el-collapse
              v-model="activeNames2"
              @change="handleChange"
              class="event-collapse"
              v-if="item.type === 702"
            >
              <el-collapse-item
                class="event-collapse-item_title"
                v-for="(item) in eventList2"
                :title="item.name"
                :name="item.id+item.name"
                :key="item.id"
              >
                <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
                <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
              </el-collapse-item>

            </el-collapse>
          </el-collapse-item>

        </el-collapse>
      </el-collapse-item>
    </el-collapse>
    <el-dialog
      title="提示"
      :visible.sync="isVisible"
      width="30%"
    >
      <span>这是一段信息</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="isVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="isVisible = false"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent, reactive, ref, toRefs,
} from '@vue/composition-api';

const typeInLookups = [
  {
    id: 700,
    code: 'STEPPROCESS',
    group: null,
    isEnabled: 1,
    name: '步骤流程',
    order: 1,
    type: 'STEP_TYPE',
  },
  {
    id: 701,
    code: 'OFFICIALACTION',
    group: null,
    isEnabled: 1,
    name: '官方来文',
    order: 2,
    type: 'STEP_TYPE',
  },
  {
    id: 702,
    code: 'INITIATEREQUEST',
    group: null,
    isEnabled: 1,
    name: '发起请求',
    order: 3,
    type: 'STEP_TYPE',
  },
  {
    id: 703,
    code: 'OFFICIALACTIONFLOW',
    group: null,
    isEnabled: 1,
    name: '来文答辩步骤',
    order: 4,
    type: 'STEP_TYPE',
  },
  {
    id: 704,
    code: 'INITIATEREQUESTFLOW',
    group: null,
    isEnabled: 1,
    name: '请求答辩步骤',
    order: 5,
    type: 'STEP_TYPE',
  },
];
export default defineComponent({
  name: 'hehe',
  setup() {
    const state = reactive({
      activeNames: ['1'],
      activeNames2: [],
      stageList: [
        { id: 1, name: '阶段1' },
        { id: 2, name: '阶段2' },
        { id: 3, name: '阶段3' },
      ],
      stepClaimList: [
        { id: 1, name: '步骤1', type: 700 },
        { id: 2, name: '步骤2', type: 700 },
        { id: 3, name: '步骤3', type: 700 },
        { id: 4, name: '官方来文1', type: 701 },
        { id: 5, name: '官方来文2', type: 701 },
        { id: 6, name: '请求来文1', type: 702 },
        { id: 7, name: '请求来文2', type: 702 },
      ],
      eventList1: [
        { id: 1, name: '来文答辩步骤1', type: 703 },
        { id: 2, name: '来文答辩步骤2', type: 703 },
      ],
      eventList2: [
        { id: 3, name: '请求答辩步骤3', type: 704 },
        { id: 4, name: '请求答辩步骤4', type: 704 },
      ],
    });
    function handleChange(val: any) {
      console.log(val);
    }
    const tags = ref([
      { name: '类目1/费项1', type: '', id: 1 },
      { name: '类目1/费项1', type: 'success', id: 2 },
      { name: '类目2/费项2', type: 'info', id: 3 },
      { name: '类目2/费项4', type: 'warning', id: 4 },
      { name: '类目3/费项1', type: 'danger', id: 5 },
    ]);
    function handleTagClose(tag: any) {
      tags.value.splice(tags.value.indexOf(tag), 1);
    }
    const isVisible = ref(false);
    function handleAddFeeItemClick(val: any) {
      isVisible.value = true;
    }
    return {
      ...toRefs(state),
      handleChange,
      tags,
      handleTagClose,
      handleAddFeeItemClick,
      isVisible,
    };
  },
});
</script>
<style lang="postcss" scoped>
.stage-collapse-item_title {
  /* padding: 20px; */
  color: red;
  background-color: red;
}
.step-collapse {
  /* border: 1px solid black; */
  margin: 10px;
}
</style>
