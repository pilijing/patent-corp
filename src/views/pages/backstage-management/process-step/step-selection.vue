<template>
  <div id="selection" class="stage-step-selection">
    <div class="selection-aside">
      <p class="font_title claims-title">选择步骤</p>
      <draggable
        type="transition"
        v-model="stageStepList"
        @end="dragEnd"
        v-bind="dragOptions"
      >
        <div
          class="menu-list"
          :class="activeMenu === item.id ? 'active' : ''"
          v-for="item in stageStepList"
          :key="item.id"
        >
          <i class="el-icon-delete" @click="handleDelete(item.id)" />
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
      <div
        class="add_button"
        @click="(visibleAddPlat = true), (platformData = null)"
      >
        + 添加步骤
      </div>
    </div>
    <add-step
      :visible.sync="visibleAddPlat"
      :data="platformData"
      @success="GetList"
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
  onMounted,
} from '@vue/composition-api';

import { useStageStep } from '@/context/stage-step';
import Draggable from 'vuedraggable';
import { useLookupsInject } from '@/context';
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
    const {
      $store, $confirm, $message, $route,
    } = context.root;
    const { getEnumsInfo } = useLookupsInject();
    // 阶段步骤的ID
    const stepType = computed(() => getEnumsInfo('STEP_TYPE'));

    const getConstant = computed(() => $store.getters.getConstant);
    const state = reactive({
      activeMenu: 1,
      visibleAddPlat: false,
      filter: {},
      multipleSelection: [],
      platformData: null,
    });
    const dragOptions = computed(() => ({
      animation: 200,
      disabled: false,
      ghostClass: 'ghost',
    }));

    const {
      getStageStepList,
      stageStepList,
      deleteProcessStageStep,
      updateStageStepPriority,
    } = useStageStep();
    const GetList = () => {
      getStageStepList(
        Number($route.query.id),
        Number(props.stageId),
        stepType.value.STEPPROCESS,
      );
    };
    const handleDelete = (id: number) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteProcessStageStep(`/patent-corp_api/stage-steps/${id}`);
        GetList();
        $message.success('删除成功!');
      });
    };

    const dragEnd = () => {
      const ids = stageStepList.value.map(p => p.id);
      const processStageOrder = {
        processStageId: Number(props.stageId),
        stageStepIds: ids,
      };
      updateStageStepPriority(
        '/patent-corp_api/stage-steps/priority',
        processStageOrder,
      );
    };
    // 编辑
    const handleEdit = (item: any) => {
      state.platformData = item;
      state.visibleAddPlat = true;
    };
    onMounted(async () => {
      await getStageStepList(
        Number($route.query.id),
        Number(props.stageId),
        stepType.value.STEPPROCESS,
      );
    });

    return {
      ...toRefs(state),
      stageStepList,
      handleDelete,
      getConstant,
      handleEdit,
      GetList,
      dragEnd,
      dragOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
 .stage-step-selection {
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
