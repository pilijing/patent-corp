<template>
  <div class="basic-config-view">
    <descriptions
      style="padding-left: 20px;"
      :label-width="130"
      :column="2"
    >
    <el-row>
      <descriptions-item
        label="受理时专利状态"
        :title="getPatentStateName(getOfficialClaimDetailState.data.allowModifyPatentState)"
      >
        {{ getPatentStateName(getOfficialClaimDetailState.data.allowModifyPatentState) }}
      </descriptions-item>
    </el-row>
      <el-row>
        <descriptions-item :label="textState.isRequireLabel">{{
          getOfficialClaimDetailState.data.isRequired !== null
            ? getOfficialClaimDetailState.data.isRequired
              ? "是"
              : "否"
            : "--"
        }}</descriptions-item>

        <descriptions-item
          :label="textState.dependencyLabel"
          v-if="getOfficialClaimDetailState.data.stageDocumentDependencies"
        >{{
            getOfficialClaimDetailState.data.stageDocumentDependencies.length >
            0
              ? "有"
              : "无"
          }}
          <el-popover
            placement="right-start"
            trigger="hover"
          >
            <el-table
              :data="tableData"
              style="width: 100%"
            >
              <el-table-column
                prop="stageName"
                label="阶段"
                width="180"
              >
              </el-table-column>
              <el-table-column
                prop="claimName"
                label="来文"
                width="180"
              >
              </el-table-column>
            </el-table>
            <i
              class="el-icon-info"
              slot="reference"
            ></i>
          </el-popover>
        </descriptions-item>

        <descriptions-item
          v-else
          :label="textState.dependencyLabel"
        >{{
          "--"
        }}</descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="是否有账单">{{
          getOfficialClaimDetailState.data.hasBill !== null
            ? getOfficialClaimDetailState.data.hasBill
              ? "是"
              : "否"
            : "--"
        }}</descriptions-item>
        <descriptions-item
          v-if="getOfficialClaimDetailState.data.hasBill"
          label="费用名称"
        >{{ feeNameText }}</descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="是否重复性">{{
          getOfficialClaimDetailState.data.isRepeat !== null
            ? getOfficialClaimDetailState.data.isRepeat
              ? "是"
              : "否"
            : "--"
        }}</descriptions-item>
      </el-row>
    </descriptions>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { useLookupsInject, useOfficialClaimDetailInject } from '@/context';
import { StageDocumentDependency } from '@/types/claim-detail';
import { CascadeType } from '@/types/common';
import { getNameFromCascadeList } from '@/utils';

export default defineComponent({
  name: 'BasicConfigView',
  props: {
    textState: Object,
  },
  setup() {
    const {
      getOfficialClaimDetailState,
      getDependencyClaimListState,
    } = useOfficialClaimDetailInject();

    const { loading: loadingLookups, feeNameList, getTypeName } = useLookupsInject();

    const feeNameText = computed(() => {
      const curFee = feeNameList.value.find(item => item.id === getOfficialClaimDetailState.data.feeNameId);
      return curFee?.name ?? '';
    });

    const tableData = computed(() => getTableData(
      getOfficialClaimDetailState.data.stageDocumentDependencies,
      getDependencyClaimListState.data,
    ));

    // 受理时专利状态
    const getPatentStateName = (ids: number[]) => {
      const typeNames = (ids || []).map(item => getTypeName(Number(item)));
      return typeNames.join(';');
    };
    return {
      getOfficialClaimDetailState,
      feeNameList,
      loadingLookups,
      feeNameText,
      tableData,
      getPatentStateName,
    };
  },
});

type TableData = { stageName: string; claimName: string };
function getTableData(
  dependencyListInDetail: StageDocumentDependency[] | null,
  dependencyList: CascadeType[],
): TableData[] {
  if (dependencyListInDetail === null) return [];
  const tableData: TableData[] = [];
  dependencyListInDetail.forEach((dependency) => {
    tableData.push({
      stageName: getNameFromCascadeList(
        dependencyList,
        dependency.dependencyStageId,
      ),
      claimName: getNameFromCascadeList(
        dependencyList,
        dependency.dependencyDocumentId,
      ),
    });
  });
  return tableData;
}
</script>

<style lang="scss" scoped></style>
