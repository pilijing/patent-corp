<template>
  <div class="event-config" v-loading="getStepDetailState.loading">
    <basic-config
      :detail-data="basicConfigData"
      :selected-step-id="selectedStepId"
      :process-stage-id="processStageId"
      :key="selectedStepId"
    ></basic-config>
    <step-property-field></step-property-field>
    <step-result-setting
      :detailDataList="stageStepFlowsDetail"
      :selectedStepId="selectedStepId"
      :isDefenseFlow="isDefenseFlow"
    ></step-result-setting>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  reactive,
  toRefs,
  computed,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context/lookup';
import { useStageStep } from '@/context';
import BasicConfig from './basic-config.vue';

import StepResultSetting from './step-result-setting';
import StepPropertyField from './step-property-field.vue';

export default defineComponent({
  name: 'stepDeatilConfig',
  props: {
    selectedStepId: Number,
    processStageId: Number,
    isDefenseFlow: Boolean,
  },
  components: {
    BasicConfig,
    StepResultSetting,
    StepPropertyField,
  },
  setup(props) {
    const eventConfig = ref({});
    const {
      lookups, loading, error, getLookups,
    } = useLookupsInject();
    const state = reactive({
      stageStepFlowsDetail: [],
    });
    const { getStepDetail, getStepDetailState } = useStageStep();
    const basicConfigData = computed(() => getStepDetailState.data);
    onMounted(async () => {
      if (lookups.value.length === 0) {
        await getLookups();
      }
      if (props.selectedStepId) {
        await getStepDetail(props.selectedStepId);
      }
    });
    // get detail of the official claim when the id changes
    watch(
      () => props.selectedStepId,
      async (selectedStepId) => {
        await getStepDetail(selectedStepId);
      },
    );
    return {
      ...toRefs(state),
      getStepDetailState,
      basicConfigData,
      eventConfig,
      loading,
      error,
      lookups,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
