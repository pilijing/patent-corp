<template>
  <div class="process-definition">
    <el-container style="height: 100%">
      <el-aside width="140px">
        <menu-stage-list
          v-model="processStage"
          :switch.sync="activeMenu"
          :officialid.sync="officialStage"
          @success="addProcessSuccess"
        />
      </el-aside>
      <el-main>
        <div v-for="(item, index) in processStage" :key="index">
          <template v-if="item.id === activeMenu">
            <el-tabs type="border-card" @tab-click="handleTabChange">
              <el-tab-pane label="阶段信息">
                <table-stage-fields
                  :stage-id="activeMenu"
                  :official-stage.sync="officialStage"
                  @success="addProcessSuccess"
                />
              </el-tab-pane>
              <el-tab-pane label="流程步骤">
                <process-step :stage-id="activeMenu"></process-step>
              </el-tab-pane>
              <el-tab-pane label="官方来文">
                <official-claim
                  :process-id="activeMenu"
                  :claimTypeId="officialClaimTypeId"
                  :claimTaskId="officialClaimTaskId"
                ></official-claim>
              </el-tab-pane>
              <el-tab-pane label="发起请求">
                <official-claim
                  :process-id="activeMenu"
                  :claimTypeId="appealedClaimTypeId"
                  :claimTaskId="appealedClaimTaskId"
                ></official-claim>
              </el-tab-pane>
            </el-tabs>
          </template>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  provide,
  watch,
} from '@vue/composition-api';
import {
  useClaimTypeInject,
  useLookupsInject,
  useProcessStageInject,
  useBasicSourceInject,
} from '@/context';
import ProcessStep from '@/views/pages/backstage-management/process-step';
import OfficialClaim from '../official-claim/official-claim.vue';
import MenuStageList from '../blocks/menu-stage-list.vue';
import TableStageFields from './table-stage-fields.vue';

export default defineComponent({
  name: 'ProcessDefinition',
  components: {
    OfficialClaim,
    MenuStageList,
    ProcessStep,
    TableStageFields,
  },
  setup(_, context) {
    const { $route } = context.root;
    const state = reactive({
      activeMenu: 1,
      officialStage: null,
    });
    const processId = computed(() => Number($route.query.id) || 1);

    const { loading, processStage, getProcessStage } = useProcessStageInject();
    const {
      getFieldTypes, getSyncToPatents, getSyncStageDefinition, getSyncStepDefinition,
    } = useBasicSourceInject();

    const initData = async () => {
      await getProcessStage(`/patent-corp_api/process-stages/${processId.value}`);
      // 获取来文属性字段的字段类型列表
      await getFieldTypes();
      // 获取来文属性字段的“更新对应的专利值”
      await getSyncToPatents();
      // 获取阶段属性字段的“更新阶段主体字段”
      await getSyncStageDefinition();
      // 获取阶段属性字段的“更新步骤主体字段”
      await getSyncStepDefinition();
    };

    // 用provide来传递阶段Id
    const stageId = ref(null);
    const updateStageId = (id: any) => {
      stageId.value = id;
    };
    provide('provideStageId', stageId);

    watch(() => state.activeMenu, (val) => {
      updateStageId(val); // 注入阶段id
    });

    const addProcessSuccess = () => {
      initData();
    };

    onMounted(() => {
      initData();
    });
    const { setCurClaimsTypeId, setCurClaimsTaskId } = useClaimTypeInject();
    const {
      officialClaimTypeId, appealedClaimTypeId, officialClaimTaskId, appealedClaimTaskId,
    } = useLookupsInject();

    function handleTabChange(tab: any) {
      if (tab.index === '2') {
        setCurClaimsTypeId(officialClaimTypeId.value);
        setCurClaimsTaskId(officialClaimTaskId.value);
      } else if (tab.index === '3') {
        setCurClaimsTypeId(appealedClaimTypeId.value);
        setCurClaimsTaskId(appealedClaimTaskId.value);
      } else {
        setCurClaimsTypeId(null);
        setCurClaimsTaskId(null);
      }
    }
    return {
      ...toRefs(state),
      addProcessSuccess,
      processStage,
      loading,
      handleTabChange,
      officialClaimTypeId,
      appealedClaimTypeId,
      officialClaimTaskId,
      appealedClaimTaskId,
    };
  },
});
</script>

<style lang="scss" scoped></style>
