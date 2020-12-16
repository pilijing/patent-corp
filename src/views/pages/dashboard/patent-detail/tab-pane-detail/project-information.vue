<template>
  <div>
    <panel-info-list label-width="120px" v-model="applicationDetail.patentProgram" :columns="patentInfoColum" />
    <div class="co-info">
      <span class="title">联系人信息</span>
      <span class="toggle" @click="toggle = !toggle">{{toggle ? '收起' : '展开'}}详情
        <i :class="toggle ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </span>
    </div>
    <div v-if="toggle">
      <panel-info-list label-width="120px" v-model="applicationDetail.patentContact" :columns="patentPersonInfoColum" />
    </div>
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';

export default {
  name: 'ProjectInformation',
  components: {
    PanelInfoList,
  },
  setup(_, context) {
    const { $route } = context.root;
    const { getTypeName, getEnumsInfo } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const yesNo = computed(() => getEnumsInfo('YES_NO'));
    const state = reactive({
      toggle: false,
      patentInfoColum: [
        { dataIndex: 'applicationPurposeName', label: '申请目的' },
        { dataIndex: 'applicationPurposeDetail', label: '申请目的详情' },
        { dataIndex: 'applicationReason', label: '申请理由' },
        { dataIndex: 'isPublishedAsPaperName', label: '方案是否公开' },
        { dataIndex: 'publishOn', label: '公开日期' },
        { dataIndex: 'publishModName', label: '公开方式' },
        {
          dataIndex: 'publishOrg', label: '发表机构', width: '100%',
        },
        {
          dataIndex: 'fullPaper', label: '论文摘要', width: '100%',
        },
        {
          dataIndex: 'patentAttachments', label: '论文附件', type: 'file', width: '100%',
        },
        {
          dataIndex: 'publishChannels', label: '公开途径', width: '100%',
        },
        { dataIndex: 'hasProductPerformanceName', label: '有无产品表现' },
        { dataIndex: 'hasProductName', label: '有无相关产品' },
        { dataIndex: 'productName', label: '产品名称' },
        {
          dataIndex: 'productVersion', label: '产品版本', width: '100%',
        },
        { dataIndex: 'overseasSituationName', label: '产品海外布局计划' },
        { dataIndex: 'overseasRegionName', label: '产品海外国家' },
      ],
      patentPersonInfoColum: [
        { dataIndex: 'projectSponsorName', label: '立项人' },
        { dataIndex: 'applicationOrgName', label: '申请部门' },
        { dataIndex: 'departmentReviewer', label: '部门审核人' },
        { dataIndex: 'writerName', label: '撰写人' },
        { dataIndex: 'writerMail', label: '撰写人邮箱' },
        { dataIndex: 'writerPhone', label: '撰写人电话' },
        { dataIndex: 'contactName', label: '联系人名称' },
        { dataIndex: 'contactMail', label: '联系人邮箱' },
        { dataIndex: 'contactPhone', label: '联系人电话' },
      ],
    });
    const {
      url: applicationUrl,
      data: applicationData,
      fetchData: fetchApplicationData,
    } = useHttp();

    onMounted(async () => {
      applicationUrl.value = `/patent-corp_api/patents/${$route.query.id}/application-info`;
      await fetchApplicationData();
    });
    const applicationDetail = computed(() => {
      const data = applicationData.value || {};
      const patentProgram = data.patentProgram || {};
      patentProgram.applicationPurposeName = getTypeName(patentProgram.applicationPurpose);
      patentProgram.isPublishedAsPaperName = patentProgram.isPublishedAsPaper === yesNo.value.YES ? '是' : '否';
      patentProgram.publishOn = utils.dateFormat(patentProgram.publishOn, 'YYYY-MM-DD');
      patentProgram.hasProductPerformanceName = patentProgram.hasProductPerformance === null
      ? '' : (patentProgram.hasProductPerformance ? '是' : '否');
      patentProgram.hasProductName = getTypeName(patentProgram.hasProduct);
      patentProgram.publishModName = getTypeName(patentProgram.publishMod);
      patentProgram.overseasSituationName = getTypeName(patentProgram.overseasSituation);
      patentProgram.overseasRegionName = getRegionName(patentProgram.overseasRegionCode);
      patentProgram.patentAttachments = data?.patentAttachments;
      return data;
    });
    return {
      ...toRefs(state),
      applicationDetail,
    };
  },
};
</script>

<style lang="scss" scoped>
.co-info {
  margin: 22px 0 12px 0;
  display: flex;
  align-items: center;
  .title {
    font-size: 16px;
    color:#333;
    font-weight: 600;
    display: flex;
    align-items: center;
    &::before {
      content: ' ';
      display: inline-block;
      width: 4px;
      height: 18px;
      background: #0079FE;
      margin-right: 10px;
    }
  }
  .toggle {
    font-size: 12px;
    color: #016EFF;
    margin-left: 16px;
    cursor: pointer;
  }
}
</style>
