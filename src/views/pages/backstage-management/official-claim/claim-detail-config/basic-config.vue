<template>
  <div class="basic-config">
    <page-title :title="textState.pageTitle">
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

    <basic-config-view
      v-if="!isEditing"
      :textState="textState"
    ></basic-config-view>
    <basic-config-edit
      v-else
      :textState="textState"
      @success="isEditing = false"
      @cancel="isEditing = false"
    ></basic-config-edit>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  watch,
} from '@vue/composition-api';

import {
  useClaimTypeInject,
  useLookupsInject,
  useOfficialClaimDetailInject,
  useOfficialClaimsInject,
  useProcessStageInject,
} from '@/context';

import BasicConfigView from './basic-config-view.vue';
import BasicConfigEdit from './basic-config-edit.vue';

export default defineComponent({
  name: 'BasicConfig',
  components: { BasicConfigView, BasicConfigEdit },
  setup() {
    const {
      getOfficialClaimDetailState,
      getDependencyClaimList,
      getDependencyClaimListState,
      updateBasicConfigState,
    } = useOfficialClaimDetailInject();

    const { curClaimsTypeId } = useClaimTypeInject();

    const { officialClaimTypeId } = useLookupsInject();
    const isOfficialClaim = computed(() => curClaimsTypeId.value === officialClaimTypeId.value);

    const textState = reactive({
      pageTitle: isOfficialClaim.value ? '来文基本设置' : '请求基本设置',
      isRequireLabel: isOfficialClaim.value ? '是否必要来文' : '是否必要请求', // '是否必要来文',
      dependencyLabel: isOfficialClaim.value ? '依赖来文' : '依赖请求', // '依赖来文',
      tooltips: isOfficialClaim.value
        ? '检测该来文之前一定有XX来文'
        : '检测该请求之前一定有XX请求', // '检测该来文之前一定有XX来文',
      dependencyErrMsg: isOfficialClaim.value
        ? '请选择来文依赖'
        : '请选择请求依赖', // '请选择来文依赖',
    });

    const { loading: loadingLookups, feeNameList } = useLookupsInject();
    const isEditing = ref(false);

    const { processId } = useOfficialClaimsInject();

    // 切换官方来文时，关闭编辑模式
    watch(
      () => getOfficialClaimDetailState.data,
      (curDetail, preDetail) => {
        if (curDetail.processId && curDetail.id !== preDetail.id) {
          isEditing.value = false;
        }
      },
    );

    // 来文列表更新时，更新依赖来文列表
    watch(
      () => getOfficialClaimDetailState.data,
      async () => {
        if (processId.value && curClaimsTypeId.value) {
          await getDependencyClaimList(processId.value, curClaimsTypeId.value);
        }
      },
    );
    // 阶段列表更新时，更新依赖来文列表
    const { processStage } = useProcessStageInject();
    watch(
      processStage,
      async () => {
        if (processId.value && curClaimsTypeId.value) {
          await getDependencyClaimList(processId.value, curClaimsTypeId.value);
        }
      },
      { deep: true },
    );

    // 来文类型更新时，更新依赖来文列表
    watch(curClaimsTypeId, async (id) => {
      if (id !== null && processId.value && curClaimsTypeId.value) {
        await getDependencyClaimList(processId.value, curClaimsTypeId.value);
      }
    });

    return {
      getOfficialClaimDetailState,
      feeNameList,
      loadingLookups,
      getDependencyClaimListState,
      updateBasicConfigState,
      isEditing,
      textState,
    };
  },
});
</script>

<style lang="scss" scoped></style>
