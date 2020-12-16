<template>
  <div class="menu-stage-list">
    <div class="stage-list">
      <div class="header">
        配置阶段
        <icon-slot class="icon-slot" @click="isCanDragMenu = true" />
      </div>
      <draggable
        type="transition"
        v-model="menuList"
        v-bind="dragOptions"
        draggable=".draggableItem"
      >
        <div v-for="item in menuList" :key="item.id" :class="isCanDragMenu? 'draggableItem' : ''">
          <div class="menu-list" :class="activeMenu === item.id ? 'active' : ''">
            <i v-if="!isCanDragMenu" class="el-icon-delete" @click="handleDelete(item.id)" />
            <span v-if="isCanDragMenu" class="el-icon-rank" />
            <span
              class="name"
              @click="handleClickMenu(item)"
              :title="item.name"
            >
              {{ item.name }}
            </span>
            <i v-if="!isCanDragMenu" class="el-icon-edit-outline" @click="handleEdit(item)" />
          </div>
        </div>
      </draggable>
      <div class="add-stage" v-if="!isCanDragMenu" @click="addStageVisible = true, stageData={}">
        <i class="el-icon-circle-plus" />
        <span>添加阶段</span>
      </div>
      <div v-else class="submit-slot">
        <el-button size="mini" @click="isCanDragMenu = false; $emit('success');">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitSlot">确 定</el-button>
      </div>
    </div>
    <dialog-add-stage
      :visible.sync="addStageVisible"
      :data="stageData"
      @success="$emit('success')"
    />
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import Draggable from 'vuedraggable';
import { useProcessStageInject } from '@/context';
import IconSlot from '@/assets/svg/slot.svg';
import DialogAddStage from './dialog-add-stage.vue';

interface Props{
  value: any[];
}

export default defineComponent({
  name: 'MenuStageList',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  components: { DialogAddStage, Draggable, IconSlot },
  setup(props: Props, context) {
    const { emit } = context;
    const { $confirm, $message, $route } = context.root;
    const state = reactive({
      isCanDragMenu: false,
      activeMenu: 1,
      addStageVisible: false,
      stageData: {},
    });

    const dragOptions = computed(() => ({
      animation: 200,
      disabled: false,
      ghostClass: 'ghost',
    }));

    const menuList = computed<any[]>({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });

    const {
      deleteProcessStage,
    } = useProcessStageInject();

    const handleDelete = (id: number) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteProcessStage(`/patent-corp_api/process-stages/${id}`);
        emit('success');
        $message.success('删除成功!');
      });
    };
    const handleEdit = (item: object) => {
      state.stageData = item;
      state.addStageVisible = true;
    };

    const {
      error,
      sortProcessStage,
    } = useProcessStageInject();

    const processId = computed(() => Number($route.query.id));

    const submitSlot = async () => {
      console.info(menuList.value);
      const stageIds = menuList.value.map((item: { id: any }) => item.id);
      const params = {
        stageIds,
      };
      await sortProcessStage(`/patent-corp_api/process-stages/${processId.value}/sort`, params);
      if (error.value) {
        $message.error('排序失败!');
        emit('success');
      } else {
        $message.success('排序成功!');
        state.isCanDragMenu = false;
      }
    };

    const handleClickMenu = (item: any) => {
      state.activeMenu = item.id;
      emit('update:switch', state.activeMenu);
      emit('update:officialid', item.officialStage);
    };

    return {
      ...toRefs(state),
      menuList,
      dragOptions,
      handleDelete,
      handleEdit,
      submitSlot,
      handleClickMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
.menu-stage-list {
  .stage-list {
    color: #fff;
    height: calc(100vh - 120px);
    background: linear-gradient(180deg, rgba(24, 68, 134, 1) 0%, rgba(142, 154, 176, 1) 100%);
    padding-left: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 0;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    &::-webkit-scrollbar {
      width: 0;
    }
   .header {
     padding: 20px 0 10px;
     font-size: 16px;
     display: flex;
     justify-content: center;
     align-items: center;
     .icon-slot {
       color: #fff;
       font-size: 12px;
       margin-left: 5px;
       cursor: pointer;
     }
   }
   .menu-list {
     cursor: pointer;
     padding: 15px 10px;
     display: flex;
     align-items: center;
     justify-content: center;
     .name {
       display: inline-block;
       text-overflow: ellipsis;
       overflow: hidden;
       white-space: nowrap;
       padding: 0 5px;
     }
     i {
       opacity: 0;
     }
     &:hover i {
       opacity: 1;
     }
   }
   .active {
     background: #fff;
     color: #016EFF;
     margin: 0 0 0 5px;
   }
   .add-stage {
     cursor: pointer;
     margin-top: 20px;
     text-align: center;
     color: #00FFED;
     i {
       font-size: 16px;
       margin-right: 5px;
     }
   }
   .submit-slot {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style>
