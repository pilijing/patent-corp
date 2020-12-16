<template>
  <div
    id="selection"
    class="defense-flow-step-selection"
    v-loading="
      getDefenseFlowStepListState.loading || reorderDefenseFLowStepState.loading
    "
  >
    <div class="selection-aside">
      <p class="font_title claims-title">选择步骤</p>
      <draggable
        type="transition"
        v-model="currentDefenseFlowStepListState.stageClaimsFlows"
        @end="dragEnd"
        v-bind="dragOptions"
        v-loading="getDefenseFlowStepListState.loading"
      >
        <div
          class="menu-list"
          :class="activeMenu === item.id ? 'active' : ''"
          v-for="item in (currentDefenseFlowStepListState.stageClaimsFlows || [])"
          :key="item.id"
        >
          <i class="el-icon-delete" @click="handleDelete(item)" />
          <span
            class="name"
            @click="(activeMenu = item.id), $emit('update:switch', activeMenu)"
            :title="item.name"
          >
            {{ item.name }}
          </span>
          <i class="el-icon-edit-outline" @click="handleEdit(item)" />
        </div>
      </draggable>
    </div>

    <div
      class="add_button"
      @click="(visibleAddPlat = true), (selectedStep = null)"
    >
      + 添加步骤
    </div>

    <add-step
      :visible.sync="visibleAddPlat"
      :selectedStep="selectedStep"
      @success="handleSuccess"
      :processStageId="stageId"
    />
  </div>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  computed,
  defineComponent,
  watch,
  inject,
} from '@vue/composition-api';

import Draggable from 'vuedraggable';
import { useDefenseFlowInject, useOfficialClaimDetailInject } from '@/context';
import { DefenseFlowStep, ReorderDefenseFlowStep } from '@/types/defense-flow';
import { NullableData } from '@/types/common';
import { Message } from 'element-ui';
import AddStep from './add-step.vue';

export default defineComponent({
  name: 'EventSelection',
  props: {
    stageId: Number,
  },

  components: {
    AddStep,
    Draggable,
  },
  setup(props, context) {
    const { emit } = context;
    const { $confirm, $message } = context.root;
    const claimTaskId = inject('claimTaskId'); // 来文/请求任务类型

    const state = reactive({
      activeMenu: 1,
      visibleAddPlat: false,
      filter: {},
      multipleSelection: [],
      selectedStep: null,
    });
    const dragOptions = computed(() => ({
      animation: 200,
      disabled: false,
      ghostClass: 'ghost',
    }));

    const { getOfficialClaimDetailState } = useOfficialClaimDetailInject();
    const claimId = computed(() => getOfficialClaimDetailState.data.id);
    const {
      getDefenseFlowStepList,
      getDefenseFlowStepListState,
      deleteDefenseFlowStep,
      deleteDefenseFlowStepState,
      reorderDefenseFlowStep,
      reorderDefenseFLowStepState,
    } = useDefenseFlowInject();

    const updateProcessData = inject('updateProcessData') as any;

    const currentDefenseFlowStepListState = computed(() => {
      const current = (getDefenseFlowStepListState.data || []).find(item => item.id === updateProcessData?.value.id);
      return current || {};
    });
    console.info(currentDefenseFlowStepListState.value);

    function handleSuccess() {
      if (claimId.value) {
        getDefenseFlowStepList(claimId.value, claimTaskId as number);
      }
    }

    const handleDelete = (defenseFlowStep: NullableData<DefenseFlowStep>) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { id: stageStepId, stageClaimsFlowId } = defenseFlowStep;
        if (stageStepId && stageClaimsFlowId) {
          await deleteDefenseFlowStep(stageStepId, stageClaimsFlowId);
        }
        if (deleteDefenseFlowStepState.error !== null) {
          $message.success(deleteDefenseFlowStepState.error?.response?.data);
          return;
        }
        if (claimId.value) {
          getDefenseFlowStepList(claimId.value, claimTaskId as number);
        }
        $message.success('删除成功!');
        emit('update:switch', null);
      });
    };

    const dragEnd = async () => {
      if (
        getDefenseFlowStepListState.data.some(item => item.stageClaimsFlowId === null)
      ) {
        Message.error('Some stageClaimsFlowIds are null');
        return;
      }
      const current: any = (getDefenseFlowStepListState.data || []).find(item => item.id
      === updateProcessData?.value.id);
      if (current === undefined) {
        return;
      }
      const ids = current.stageClaimsFlows.map((p: any) => p.id) as number[];
      const stageClaimsFlowIds = getDefenseFlowStepListState.data.map(p => p.stageClaimsFlowId) as number[];
      if (claimId.value && stageClaimsFlowIds) {
        const reorderData: ReorderDefenseFlowStep = {
          stageClaimsId: current.id,
          stageClaimsFlowIds: ids,
        };
        await reorderDefenseFlowStep(reorderData);
        if (reorderDefenseFLowStepState.error !== null) {
          $message.error('排序失败');
          return;
        }
        if (claimId.value) {
          getDefenseFlowStepList(claimId.value, claimTaskId as number);
        }
      }
      // TODO
    };

    // 编辑
    const handleEdit = (item: any) => {
      state.selectedStep = item;
      state.visibleAddPlat = true;
    };

    watch(claimId, (curId) => {
      if (curId) {
        getDefenseFlowStepList(curId, claimTaskId as number);
      }
    });

    return {
      ...toRefs(state),

      handleDelete,

      handleEdit,

      dragEnd,
      dragOptions,
      handleSuccess,
      getDefenseFlowStepListState,
      reorderDefenseFLowStepState,
      updateProcessData,
      currentDefenseFlowStepListState,
    };
  },
});
</script>

<style lang="scss" scoped>
.defense-flow-step-selection {
  width: 134px;
}

.selection-aside {
  width: 100%;
}
.claims-title {
  text-align: center;
  height: 50px;
  line-height: 50px;
}

.menu-list {
  text-align: center;
  cursor: pointer;
  text-align: left;
  display: flex;
  padding: 0 10px;
  color: black;
  .name {
    flex-grow: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: center;
    height: 36px;
    line-height: 36px;
    padding: 0 5px;
  }
  i {
    opacity: 0;
    height: 36px;
    line-height: 36px;
  }
  &:hover i {
    opacity: 1;
  }
}
.active {
  background: #fff;
  color: #016eff;
  // border-right: 3px solid blue;
  background-color: #edf8ff;
}
.add_button {
  cursor: pointer;
  margin-top: 20px;
  border: 1px solid #abdbf6;
  background-color: #f4fbff;
  width: 100px;
  height: 30px;
  line-height: 30px;
  margin: auto;
  padding: initial;
  margin-top: 20px;
  text-align: center;
}
</style>
