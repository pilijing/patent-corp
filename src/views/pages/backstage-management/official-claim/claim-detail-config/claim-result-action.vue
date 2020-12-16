<template>
  <div class="claim-result-action">
    <page-title style="margin-top: 10px" :title="isOfficialClaim ? '来文结果动作' : '请求结果动作'">
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
    <claim-result-action-view v-if="!isEditing"></claim-result-action-view>
    <claim-result-action-edit
      v-else
      @success="isEditing = false"
      @cancel="isEditing = false"
    ></claim-result-action-edit>
  </div>
</template>

<script lang="ts">
import {
  useLookupsInject,
  useOfficialClaimDetailInject,
  useRolesInject,
} from '@/context';
import {
  defineComponent, onMounted, ref, watch,
} from '@vue/composition-api';

import PanelSelectSearch from '@/components/panel-select-search.vue';
import useCheckClaimType from '@/hooks/check-claim-type';
import ClaimResultActionView from './claim-result-action-view.vue';
import ClaimResultActionEdit from './claim-result-action-edit.vue';

export default defineComponent({
  name: 'ClaimResultAction',
  components: {
    PanelSelectSearch,
    ClaimResultActionView,
    ClaimResultActionEdit,
  },
  setup() {
    const {
      lookups,
      loading: loadingLookups,
      todoOwners,
      notifiers,
      todoStaffId,
      notifyToStaffId,
      notifyToRoleId,
    } = useLookupsInject();

    const { getRolesState, getRoles } = useRolesInject();

    onMounted(() => {
      if (getRolesState.data.length === 0) {
        getRoles();
      }
    });
    const { getOfficialClaimDetailState } = useOfficialClaimDetailInject();

    const isEditing = ref(false);

    watch(
      () => getOfficialClaimDetailState.data,
      () => {
        // 关闭编辑
        isEditing.value = false;
      },
    );

    const { isOfficialClaim } = useCheckClaimType();

    return {
      lookups,
      todoOwners,
      getOfficialClaimDetailState,
      notifiers,
      loadingLookups,
      isEditing,
      isOfficialClaim,
      todoStaffId,
      notifyToStaffId,
      notifyToRoleId,
      getRolesState,
    };
  },
});
</script>

<style lang="scss" scoped></style>
