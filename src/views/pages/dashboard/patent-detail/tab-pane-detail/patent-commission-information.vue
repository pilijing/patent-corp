<template>
  <div v-if="patentData">
    <descriptions :column="4" :label-width="120" class="descriptions-value">
      <descriptions-item label="递交法限" :value="utils.dateFormat(patentData.legalLimitDate)" />
      <descriptions-item label="官方绝限" :value="patentData.actualLastUpdated" />
      <descriptions-item label="专利工程师" :value="patentData.currentIprName" style="width: 40%;" />
    </descriptions>
    <div class="title">当前委托</div>
    <panel-info-list
      label-width="120px"
      :col="4"
      v-model="agentInfoData"
      :columns="patentAgentColums" />
    <panel-info-list
      label-width="120px"
      :col="4"
      v-model="patentAssignmentData"
      :columns="patentAssignmentColums" />
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';
import cloneDeep from 'lodash/cloneDeep';

export default {
  name: 'PatentCommissionInformation',
  components: {
    PanelInfoList,
  },
  setup(_, context) {
    const { $route } = context.root;
    const { getTypeName } = useLookupsInject();
    const state = reactive({
      toggle: false,
      patentAgentColums: [
        { dataIndex: 'lawFirmName', label: '代理所' },
        { dataIndex: 'projectDepartment', label: '委托节点', width: '70%' },
        { dataIndex: 'name', label: '代理人' },
        { dataIndex: 'email', label: '邮箱' },
        { dataIndex: 'telephone', label: '电话' },
        { dataIndex: 'agentGradeName', label: '级别' },
      ],
      patentAssignmentColums: [
        { dataIndex: 'entrustingDate', label: '委托日期' },
        { dataIndex: 'requireFirstDraftDate', label: '要求返初稿日期' },
        { dataIndex: 'requireLastUpdated', label: '要求定稿日期' },
        { dataIndex: 'requireSubmissionDate', label: '要求递交日期' },
        { dataIndex: 'entrustGradeName', label: '委托等级' },
        { dataIndex: 'firstDraftDate', label: '实际返初稿日期' },
        { dataIndex: 'actualLastUpdated', label: '实际定稿日期' },
        { dataIndex: 'actualSubmissionDate', label: '实际递交日期' },
      ],
    });

    const {
      url: patentUrl,
      data: patentData,
      fetchData: fetchPatentData,
    } = useHttp();

    onMounted(async () => {
      patentUrl.value = `/patent-corp_api/patents/${$route.query.id}/assignment-info`;
      await fetchPatentData();
    });

    const agentInfoData = computed(() => {
      const data = patentData.value || {};
      const agentInfo = cloneDeep(data.agentInfo) || {};
      agentInfo.agentGradeName = getTypeName(agentInfo.agentGrade);
      return agentInfo;
    });
    const patentAssignmentData = computed(() => {
      const data = patentData.value || {};
      const patentAssignment = cloneDeep(data.patentAssignment) || {};
      patentAssignment.entrustingDate = utils.dateFormat(patentAssignment.entrustingDate);
      patentAssignment.requireFirstDraftDate = utils.dateFormat(patentAssignment.requireFirstDraftDate);
      patentAssignment.requireLastUpdated = utils.dateFormat(patentAssignment.requireLastUpdated);
      patentAssignment.requireSubmissionDate = utils.dateFormat(patentAssignment.requireSubmissionDate);
      patentAssignment.firstDraftDate = utils.dateFormat(patentAssignment.firstDraftDate);
      patentAssignment.actualLastUpdated = utils.dateFormat(patentAssignment.actualLastUpdated);
      patentAssignment.actualSubmissionDate = utils.dateFormat(patentAssignment.actualSubmissionDate);
      patentAssignment.entrustGradeName = getTypeName(patentAssignment.entrustGrade);
      return patentAssignment;
    });

    return {
      ...toRefs(state),
      patentData,
      utils,
      agentInfoData,
      patentAssignmentData,
    };
  },
};
</script>

<style lang="scss" scoped>
.descriptions-value {
  margin-top: 4px;
  ::v-deep {
    .value {
      font-weight: 700;
      font-size: 14px;
      color: #333333;
    }
  }
}
.title {
  font-size: 15px;
  color: #333333;
  margin-top: 12px;
}
</style>
