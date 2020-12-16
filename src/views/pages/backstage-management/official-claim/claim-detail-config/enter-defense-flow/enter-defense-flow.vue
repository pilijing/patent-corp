<template>
  <div class="enter-defense-flow">
    <page-title style="margin-top: 10px" title="进入任务流程"> </page-title>
    <div
      v-for="flowStepItem in getDefenseFlowStepListState.data"
      :key="flowStepItem.id"
      class="defense-flow-info"
    >
      <div style="margin-right: 20px">{{ flowStepItem.name }}</div>
      <div class="defense-flow-breadcrumb">
        <el-breadcrumb
          separator="-"
        >
          <el-breadcrumb-item
            v-for="item in (flowStepItem.stageClaimsFlows || [])"
            :key="item.id"
          >{{ item.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-button
            type="text"
            size="medium"
            icon="el-icon-edit-outline"
            @click="handleEditProcess(flowStepItem)"
          >编辑</el-button>
      </div>

      <div>
        <el-button
          type="text"
          size="medium"
          icon="el-icon-edit-outline"
          @click="dialogTaskVisible = true; taskData = flowStepItem"
        >编辑任务</el-button>
        <el-button
          type="text"
          size="medium"
          icon="el-icon-delete"
          @click="handleDeleteFlow(flowStepItem.id)"
        >
          删除</el-button>
      </div>
    </div>
    <div
      class="add-field-btn"
      @click="handleAddTask"
    >
      + 定义任务流程
    </div>
    <dialog-add-task
      :visible.sync="dialogTaskVisible"
      @add-task-success="handleAddSuccess"
      @edit-task-success="handleEditSuccess"
      :data="taskData"
    />
    <el-dialog
      title="定义事件流程步骤"
      width="70%"
      center
      :visible.sync="dialogProcessVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <defense-flow></defense-flow>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="dialogProcessVisible = false"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { useDefenseFlowInject, useOfficialClaimDetailInject } from '@/context';
import {
  defineComponent, onMounted, reactive, ref, toRefs, watch, inject, provide,
} from '@vue/composition-api';
import DefenseFlow from './defense-flow.vue';
import DialogAddTask from './dialog-add-task.vue';

export default defineComponent({
  name: 'EnterDefenseFlow',
  components: { DefenseFlow, DialogAddTask },
  setup(_, context) {
    const claimTaskId = inject('claimTaskId'); // 来文/请求任务类型
    const state = reactive({
      dialogTaskVisible: false,
      taskData: null,
      processData: null,
    });
    const dialogProcessVisible = ref(false);
    const {
      getDefenseFlowStepListState,
      getDefenseFlowStepList,
      deleteWholeDefenseFlow,
      deleteWholeDefenseFlowState,
    } = useDefenseFlowInject();

    const { $confirm, $message } = context.root;
    const { claimId } = useOfficialClaimDetailInject();
    const handleDeleteFlow = (id: number) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        if (claimId.value) {
          await deleteWholeDefenseFlow(id);
        }
        if (deleteWholeDefenseFlowState.error !== null) {
          return;
        }
        if (claimId.value) {
          getDefenseFlowStepList(claimId.value, claimTaskId as number);
        }
        $message.success('删除成功!');
      });
    };
    const handleEditSuccess = () => {
      if (claimId.value) {
        getDefenseFlowStepList(claimId.value, claimTaskId as number);
      }
    };
    const processData = ref(null);

    const updateProcessData = (val: any) => {
      processData.value = val;
    };
    provide('updateProcessData', processData);
    // 编辑流程
    const handleEditProcess = (data: any) => {
      dialogProcessVisible.value = true;
      updateProcessData(data);
    };
    // 新增流程
    const handleAddTask = () => {
      state.dialogTaskVisible = true;
      state.taskData = null;
    };
    const handleAddSuccess = (val: any) => {
      dialogProcessVisible.value = true;
      updateProcessData({ id: val });
      if (claimId.value) {
        getDefenseFlowStepList(claimId.value, claimTaskId as number);
      }
    };

    onMounted(async () => {
      if (claimId.value) {
        await getDefenseFlowStepList(claimId.value, claimTaskId as number);
      }
    });
    watch(claimId, async (curClaimId) => {
      if (curClaimId) {
        await getDefenseFlowStepList(curClaimId, claimTaskId as number);
      }
    });

    return {
      ...toRefs(state),
      dialogProcessVisible,
      handleDeleteFlow,
      getDefenseFlowStepListState,
      handleAddSuccess,
      handleEditSuccess,
      handleEditProcess,
      handleAddTask,
    };
  },
});
</script>

<style lang="scss" scoped>
.enter-defense-flow {
  .add-field-btn {
    padding: 10px 0;
    text-align: center;
    background: #fafafa;
    cursor: pointer;
    color: #016eff;
    // &:hover {
    //   background: #edf8ff;
    //   color: #016eff;
    // }
  }
  .defense-flow-info {
    margin-top: 10px;
    background-color: rgba(242, 245, 249, 1);
    display: -webkit-flex; /* Safari */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    .defense-flow-breadcrumb {
      display: flex;
      align-items: center;
      padding-top: 2px;
      flex-grow: 1;
    }
  }
}
</style>
