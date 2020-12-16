<template>
  <div class="process-step">
    <el-container>
      <el-aside width="135px">
        <step-selection
          :stage-id="stageId"
          :switch.sync="activeMenu"
        ></step-selection>
      </el-aside>
      <el-main>
        <step-config
          :selectedStepId="activeMenu"
          :processStageId="stageId"
          v-if="activeMenu !== null"
        ></step-config>
      </el-main>
    </el-container>
  </div>
</template>

<script lang='ts'>
import {
  defineComponent, reactive, ref, toRefs,
} from '@vue/composition-api';
import stepSelection from './step-selection.vue';
import StepConfig from './step-config';

export default defineComponent({
  name: 'ProcessStep',
  props: {
    stageId: Number,
  },

  components: {
    stepSelection,
    StepConfig,
  },
  setup() {
    const selectedStepId = ref<number | null>(null);
    const state = reactive({
      activeMenu: null,
    });
    return {
      ...toRefs(state),
      selectedStepId,
    };
  },
});
</script>

<style lang="scss" scoped>
.el-container {
  border: 1px solid #dcdfe6;
  min-height: 600px;
}
.el-aside {
  border-right: 1px solid #dcdfe6;
}
</style>
