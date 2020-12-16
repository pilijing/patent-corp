<template>
  <page-card style="margin-top: 20px">
    <div class="operation-buttons">
      <el-button
        type="primary"
        @click="handleSubmit"
        size="mini"
        style="margin-left: 10px"
      > 提交变更 </el-button>
      <el-button
        size="mini"
        icon="el-icon-arrow-up"
        @click="handleAllFold"
      >全部收起</el-button>
      <el-button
        size="mini"
        icon="el-icon-arrow-down"
        @click="handleAllOpen"
      >全部展开</el-button>
    </div>
    <panel-stage
      ref="stagePanelRef"
      :data="getFeeNodeState.data"
      v-loading="submitChangeState.loading"
    />
  </page-card>
</template>
<script lang="ts">
import {
  defineComponent, onMounted, provide, ref,
} from '@vue/composition-api';
import { useConfigCostInject } from '@/context';
import useUrlParams from '@/hooks/url-params';
import PanelStage from './panel-stage.vue';

export default defineComponent({
  name: 'ConfigCost',
  components: { PanelStage },
  setup(_, context) {
    const {
      getFeeNode,
      getFeeNodeState,
      submitChangeState,
      submitChange,
      curProcess,
    } = useConfigCostInject();
    const { processId } = useUrlParams(context);

    onMounted(() => {
      getFeeNode(processId.value);
    });

    function handleSubmit() {
      submitChange(processId.value);
    }

    const isAllOpen = ref(null);
    const updateIsAllOpen = (val: any) => { // 更新变量
      isAllOpen.value = val;
    };
    provide('is-all-open', isAllOpen); // 给后代组件注入变量

    const handleAllOpen = () => {
      const dateCount = new Date().toString();
      updateIsAllOpen({ isOpen: true, dateCount });
    };
    const handleAllFold = () => {
      const dateCount = new Date().toString();
      updateIsAllOpen({ isOpen: false, dateCount });
    };

    return {
      getFeeNodeState,
      handleSubmit,
      submitChangeState,
      curProcess,
      handleAllOpen,
      handleAllFold,
    };
  },
});
</script>

<style lang="scss" scoped>
.operation-buttons{
  display:flex;
  flex-direction: row-reverse;
}
</style>
