<template>
  <div class="defense-flow">
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
          isDefenseFlow
        ></step-config>
      </el-main>
    </el-container>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  reactive,
  ref,
  toRefs,
} from '@vue/composition-api';
import StepConfig from '@/views/pages/backstage-management/process-step/step-config';
import { useOfficialClaimDetailInject } from '@/context';
import StepSelection from './step-selection.vue';

export default defineComponent({
  name: 'DefenseFlow',
  components: {
    StepSelection,
    StepConfig,
  },
  setup() {
    const { getOfficialClaimDetailState } = useOfficialClaimDetailInject();
    const stageId = computed(() => getOfficialClaimDetailState.data.processStageId);
    const selectedStepId = ref<number | null>(null);
    const state = reactive({
      activeMenu: null,
    });
    return {
      ...toRefs(state),
      selectedStepId,
      stageId,
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
