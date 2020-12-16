<template>
  <div class="claim-result-action-view">
    <descriptions
      style="padding-left: 20px;"
      :label-width="150"
      :column="3"
    >
      <el-row>
        <descriptions-item label="进入阶段">{{
            claimResultAction.isInCurrentStage === null
              ? "--"
              : claimResultAction.isInCurrentStage
              ? "保留在当前"
              : "进入新阶段"
        }}</descriptions-item>
        <descriptions-item
          label="新阶段"
          v-if="claimResultAction.isInCurrentStage === false"
        >{{ newStageText }}</descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="是否更新专利状态">{{
          claimResultAction.isChangePatentState !== null
            ? claimResultAction.isChangePatentState
              ? "是"
              : "否"
            : "--"
        }}</descriptions-item>
        <template v-if="claimResultAction.isChangePatentState">
          <descriptions-item
            style="width: 50%;"
            label="更新专利状态至"
            :value="getTypeName(claimResultAction.changePatentState)"
          ></descriptions-item>
        </template>
      </el-row>
      <el-row>
        <descriptions-item label="是否有待办">{{
          claimResultAction.hasTodo !== null
            ? claimResultAction.hasTodo
              ? "是"
              : "否"
            : "--"
        }}</descriptions-item>
        <template v-if="claimResultAction.hasTodo">
          <descriptions-item
            style="width: 50%;"
            label="待办所属人"
            :value="todoBelongText"
          ></descriptions-item>
        </template>
      </el-row>
      <el-row v-if="claimResultAction.hasTodo && claimResultAction.notificationConfig">
        <descriptions-item
          label="邮件收件人"
          :value="mailReceiverText"
        ></descriptions-item>
        <descriptions-item
          label="邮件抄送人"
          :value="mailCCText"
        ></descriptions-item>
        <descriptions-item
          label="邮件内容模板"
          :value="mailTemplateName"
        ></descriptions-item>
      </el-row>
    </descriptions>
  </div>
</template>

<script lang="ts">
import {
  useLookupsInject,
  useOfficialClaimDetailInject,
  useProcessStageInject,
  useRolesInject,
} from '@/context';
import { computed, defineComponent } from '@vue/composition-api';
import PanelSelectSearch from '@/components/panel-select-search.vue';

export default defineComponent({
  name: 'ClaimResultActionView',
  components: {
    PanelSelectSearch,
  },
  setup() {
    const {
      loading: loadingLookups,
      getEnumsInfo,
      getTypeName,
    } = useLookupsInject();

    const { getOfficialClaimDetailState } = useOfficialClaimDetailInject();
    const processManager = computed(() => getEnumsInfo('PROCESS_MANAGER'));
    const { getRolesState } = useRolesInject();

    const initResultAction = {
      isInCurrentStage: null as boolean | null,
      newStageId: null as number | null,
      hasTodo: null as boolean | null,
      todoBelongType: [] as number[] | null,
      todoBelongStaffIds: [] as string[] | null,
      todoBelongRoleIds: [] as number[] | null,
      notificationConfig: null as any | null,
      todoBelongStaff: null as object[] | null,
    };

    const claimResultAction = computed(() => getOfficialClaimDetailState.data.stageClaimsResults?.[0]
        ?? initResultAction);

    const todoBelongText = computed(() => handlePeopleText(
      claimResultAction.value.todoBelongType,
      claimResultAction.value.todoBelongRoleIds,
      claimResultAction.value.todoBelongStaff,
    ));

    const { getStageName } = useProcessStageInject();
    const newStageText = computed(() => getText(claimResultAction.value.newStageId, getStageName));
    const mailTemplateName = computed(() => claimResultAction.value.notificationConfig?.messageTemplate?.name);

    const mailReceiverText = computed(() => handlePeopleText(
      claimResultAction.value.notificationConfig.recipientPeopleIds,
      claimResultAction.value.notificationConfig.recipientRoleIds,
      claimResultAction.value.notificationConfig.recipientStaff,
    ));

    const mailCCText = computed(() => handlePeopleText(
      claimResultAction.value.notificationConfig.copyPeopleIds,
      claimResultAction.value.notificationConfig.copyRoleIds,
      claimResultAction.value.notificationConfig.copyStaff,
    ));

    function handlePeopleText(
      typeList: number[] | null | undefined,
      roleIdList: number[] | null | undefined,
      staffOptionsnumber: object[] | null | undefined,
    ) {
      if (typeList && typeList.length > 0) {
        const todoBelong = (typeList || []).map((item: number) => {
          if (
            item !== processManager.value.ROLENAME
            && item !== processManager.value.DESIGNATEDSTAFF
          ) {
            return getTypeName(item);
          }
          return false;
        });
        if (typeList.includes(processManager.value.ROLENAME)) {
          const roleNmame = getRolesState.data
            .map((p: any) => ((roleIdList || []).includes(p.roleId) ? p.roleName : false))
            .filter(Boolean)
            .join(',');
          todoBelong.push(`${getTypeName(processManager.value.ROLENAME)}(${roleNmame})`);
        }
        if (typeList.includes(processManager.value.DESIGNATEDSTAFF)) {
          const name = (staffOptionsnumber || [])
            .map((item: any) => item.staffFullName)
            .join(',');
          todoBelong.push(name);
        }
        const textView = todoBelong.filter(Boolean).join(',');
        return textView;
      }
      return null;
    }
    return {
      getOfficialClaimDetailState,
      loadingLookups,
      claimResultAction,
      newStageText,
      todoBelongText,
      mailReceiverText,
      mailCCText,
      getTypeName,
      mailTemplateName,
    };
  },
});

function getText(
  id: number | null,
  getName: (id: number) => string | undefined,
) {
  if (id) {
    return getName(id) || '--';
  }
  return '--';
}
</script>

<style lang="scss" scoped></style>
