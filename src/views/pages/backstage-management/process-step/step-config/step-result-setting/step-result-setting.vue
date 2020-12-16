<template>
  <div class="step-result-setting">
    <page-title title="步骤结果设置">
      <template #left>
        <el-button
          type="text"
          size="medium"
          icon="el-icon-edit-outline"
          @click="isEditing = true"
          v-show="!isEditing"
        >编辑</el-button>
      </template>
    </page-title>
    <step-result-setting-view v-if="!isEditing"></step-result-setting-view>
    <step-result-setting-edit
      v-else
      @success="isEditing = false"
      @cancel="isEditing = false"
      :isDefenseFlow="isDefenseFlow"
    ></step-result-setting-edit>
  </div>
</template>

<script lang="ts">
import PanelSelectSearch from '@/components/panel-select-search.vue';

import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api';
import { useStageStep, useStepResultSettingInject } from '@/context';
import StepResultSettingView from './step-result-setting-view.vue';
import StepResultSettingEdit from './step-result-setting-edit.vue';

export default defineComponent({
  name: 'StepResultSetting',
  components: {
    PanelSelectSearch,
    StepResultSettingView,
    StepResultSettingEdit,
  },
  props: {
    selectedStepId: Number,
    isDefenseFlow: Boolean,
  },
  setup(props) {
    const isEditing = ref(false);
    const {
      getStageStepTree,
      getStageStepTreeState,
    } = useStepResultSettingInject();
    const { getStepDetailState } = useStageStep();
    const processId = computed(() => getStepDetailState.data.processId);
    onMounted(async () => {
      if (processId.value !== null && getStageStepTreeState.data.length === 0) {
        await getStageStepTree(processId.value);
      }
    });
    watch(processId, (id: number | null) => {
      if (id !== null) {
        getStageStepTree(id);
      }
    });
    watch(
      () => props.selectedStepId,
      () => {
        isEditing.value = false;
      },
    );
    watch(
      () => isEditing.value,
      () => {
        if (isEditing.value) {
          if (processId.value !== null) {
            getStageStepTree(processId.value);
          }
        }
      },
    );

    return {
      isEditing,
    };
  },
});
</script>

<style lang="scss" scoped></style>
