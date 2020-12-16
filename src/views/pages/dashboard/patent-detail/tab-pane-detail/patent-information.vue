<template>
  <div>
    <descriptions :column="3" :label-width="120">
      <el-row>
        <descriptions-item label="立项编号" :value="patentDetailData.projectNumber" type="icon">
          <template
            v-if="patentDetailData.applicationType && patentDetailData.applicationType !== applyTypeList.DIRECTPCTINTL">
            <tooltip-project-number :apply-type="patentDetailData.applicationType" />
          </template>
          <span class="patent-status" v-if="patentDetailData.status === 4">已结案</span>
        </descriptions-item>
        <descriptions-item label="专利案号" :value="patentDetailData.patentCaseNumber" type="icon">
          <template
            v-if="patentDetailData.applicationType && patentDetailData.applicationType !== applyTypeList.DIRECTPCTINTL">
            <tooltip-patent-number :apply-type="patentDetailData.applicationType">
              <i class="el-icon-question icon-question" />
            </tooltip-patent-number>
        </template>
        </descriptions-item>
        <descriptions-item label="专利类型" :value="patentDetailData.patentTypeName" />
        <descriptions-item label="申请类型" :value="getTypeName(patentDetailData.applicationType)" type="icon">
          <span class="subtitle" v-show="patentDetailData.patentTypeName">{{patentDetailData.patentTypeName}}</span>
        </descriptions-item>
        <descriptions-item label="申请国家/地区" :value="getRegionName(patentDetailData.regionCode)" />
        <descriptions-item label="专利名称" :value="patentDetailData.patentName" />
        <descriptions-item label="交底书名称" :value="patentDetailData.disclosurePaperName" />
        <descriptions-item label="发明名称"
          :value="patentDetailData.inventionName"
          v-if="patentDetailData.inventionName"
        />
        <descriptions-item label="关键词" v-if="patentDetailData.keywords" :value="patentDetailData.keywords" />
        <descriptions-item label="是否直接PCT国际">
          {{ patentDetailData.directPct !== null ? patentDetailData.directPct ? '是' : '否' : '--' }}
        </descriptions-item>
        <descriptions-item label="PCT国际递交语言"
          v-if="patentDetailData.directPct"
          :value="getTypeName(patentDetailData.pctInternationalLang)"
        />
        <template v-if="patentDetailData.enterHk !== null">
          <descriptions-item label="是否进香港">
            {{ patentDetailData.enterHk ? '是' : '否' }}
          </descriptions-item>
        <descriptions-item label="进香港理由"
          class="full-width"
          v-if="patentDetailData.enterHk"
        >
          <span :title="patentDetailData.enterHkReason">{{patentDetailData.enterHkReason}}</span>
        </descriptions-item>
        </template>
        <descriptions-item label="标签"
          class="full-width"
          style="margin-top: -4px;margin-bottom: 6px;"
          type="tags"
          v-if="patentDetailData.patentTags && patentDetailData.patentTags.length > 0">
          <description-tags :data="patentDetailData.patentTags" />
        </descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="第一发明人"
          v-if="patentDetailData.firstInventorName"
          :value="patentDetailData.firstInventorName"
          type="icon"
        >
          <description-inventor :data="patentDetailData.firstInventors" />
        </descriptions-item>
        <descriptions-item label="其他发明人"
          v-if="patentDetailData.otherInventorName"
          :value="patentDetailData.otherInventorName"
          type="icon"
          style="width: 60%;">
          <description-inventor
            :data="patentDetailData.otherInventors"
          />
        <!-- :popover-offset="-300" -->
        </descriptions-item>
      </el-row>
      <el-row>
        <descriptions-item label="第一申请人"
          v-if="patentDetailData.firstApplicantName"
          :value="patentDetailData.firstApplicantName"
          />
        <descriptions-item label="其他申请人"
          v-if="patentDetailData.otherApplicantName"
          :value="patentDetailData.otherApplicantName"
          style="width: 60%;"
        />
      </el-row>
      <descriptions-item label="立项人" :value="(patentDetailData.patentContact || {}).projectSponsorName" />
      <descriptions-item label="申请部门"
        :value="(patentDetailData.patentContact || {}).applicationOrgName"
        style="width: 60%;"
      />
    </descriptions>
    <el-table
      v-if="patentDetailData.currentProgresses"
      class="table-wrap"
      :data="patentDetailData.currentProgresses"
      border
      max-height="240px"
      :header-cell-style="{ 'background-color': '#fafafa', }"
    >
      <el-table-column
        label="当前处理步骤"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span
            :class="(row.currentOperatorStaffIds || []).includes(userInfo.staffId) ? 'click-class' : ''"
            @click="currentStage(row)">
            <span>{{row.currentStage}}</span>
            <span v-show="row.currentStage && row.currentStep">-</span>
            <span>{{row.currentStep}}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="当前处理人"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.currentOperator }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="工作时限"
      >
        <template #default="{ row }">
          <span>{{ utils.dateFormat(row.workingTimeLimit) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <descriptions :column="4" :label-width="120">
      <descriptions-item label="本国优先权"
        v-if="patentDetailData.domesticPriority"
      >
        <span :title="patentDetailData.domesticPriority">{{patentDetailData.domesticPriority}}</span>
      </descriptions-item>
      <descriptions-item label="全部权利项数"
        :value="patentDetailData.claimsAmount"
        v-if="patentDetailData.claimsAmount" />
      <descriptions-item label="独立权利项数"
        :value="patentDetailData.independenceAmount"
        v-if="patentDetailData.independenceAmount" />
      <descriptions-item label="说明书页数"
        :value="patentDetailData.instructionPages"
        v-if="patentDetailData.instructionPages" />
      <descriptions-item label="说明书摘要"
        class="full-width"
        v-if="patentDetailData.abstractOfInstruction"
      >
        <span :title="patentDetailData.abstractOfInstruction">{{patentDetailData.abstractOfInstruction}}</span>
      </descriptions-item>
    </descriptions>
    <descriptions
      v-if="patentDetailData.patentDetailDate.legalLimitDate"
      :column="4"
      :label-width="120"
      style="padding-top: 6px; height: 68px;background-color: rgba(239, 249, 255, 1);width: 99%;">
        <descriptions-item label="递交法限" :value="utils.dateFormat(patentDetailData.patentDetailDate.legalLimitDate)" />
        <descriptions-item label="定稿时间" :value="utils.dateFormat(patentDetailData.patentDetailDate.lastUpdated)" />
        <descriptions-item label="实际定稿时间"
          :value="utils.dateFormat(patentDetailData.patentDetailDate.actualLastUpdated)"
        />
        <descriptions-item label="实际提实审日期"
          :value="utils.dateFormat(patentDetailData.patentDetailDate.actualExaminationDate)"
        />
        <descriptions-item label="是否预审">{{
            patentDetailData.patentDetailDate.isExamination !== null
          ? patentDetailData.patentDetailDate.isExamination
            ? "是"
            : "否"
          : "--"
        }}</descriptions-item>
        <descriptions-item label="预审结果" :value="getTypeName(patentDetailData.patentDetailDate.examinationResultType)" />
        <descriptions-item label="保护中心" :value="patentDetailData.patentDetailDate.dataProtectionCenter" />
        <descriptions-item label="预审定稿时间"
          :value="utils.dateFormat(patentDetailData.patentDetailDate.preLastUpdated)"
        />
    </descriptions>
    <div class="co-info" v-if="patentDetailData.patentCooperationList.length > 0">
      <span class="title">合作单位</span>
      <span class="toggle" @click="toggle = !toggle">{{toggle ? '收起' : '展开'}}详情
        <i :class="toggle ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </span>
    </div>
    <div v-if="toggle">
      <el-table
        :data="patentDetailData.patentCooperationList"
        class="patent-table">
        <el-table-column show-overflow-tooltip property="cooperationName" label="合作单位名称"></el-table-column>
        <el-table-column show-overflow-tooltip property="chineseAddress" label="中文地址"></el-table-column>
        <el-table-column show-overflow-tooltip property="englishAddress" label="英文地址"></el-table-column>
        <el-table-column show-overflow-tooltip property="cooperationId" label="社会统一信用代码"></el-table-column>
        <el-table-column label="合作协议" align="center">
          <template #default="{ row }">
            <a
              v-if="row.cooperationAgreement"
              href="javascript:void(0)"
              @click="handleDownload(row.cooperationAgreement)"
            >下载</a>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, computed,
} from '@vue/composition-api';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useLookupsInject, useRegionsInject, useUserInfo } from '@/context';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import TooltipProjectNumber from '@/components/tooltip-project-number.vue';
import utils from '@/utils';
import axios from '@/utils/wrap-axios';
import DescriptionInventor from './description-inventor.vue';
import DescriptionTags from './description-tags.vue';

export default defineComponent({
  name: 'PatentInformation',
  components: {
    PanelInfoList,
    TooltipPatentNumber,
    TooltipProjectNumber,
    DescriptionInventor,
    DescriptionTags,
  },
  props: {
    patentData: Object,
  },
  setup(props, context) {
    const { emit } = context;
    const { userInfo } = useUserInfo();
    const { getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const { getEnumsInfo } = useLookupsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const applicantType = computed(() => getEnumsInfo('APPLICANT_TYPE'));
    const inventorType = computed(() => getEnumsInfo('INVENTOR_TYPE'));
    const patentTypeList = computed(() => getEnumsInfo('PATENT_TYPE'));

    const currentStage = (val) => {
      if (val.currentOperatorStaffIds.includes(userInfo.value.staffId)) {
        emit('change-progressid', val.progressId);
      }
    };
    const state = reactive({
      toggle: false,
    });

    const patentDetailData = computed(() => {
      const data = props.patentData || {};
      // 专利类型
      data.patentTypeName = getTypeName(data.patentType);
      if (data.patentType === patentTypeList.value.FACADE && data.appearanceDesign) {
        data.patentTypeName = `${getTypeName(data.patentType)}-${getTypeName(data.appearanceDesign)}`;
      }
      // 第一申请人&其他申请人
      const firstApplicantName = [];
      const otherApplicantName = [];
      (data.patentApplicants || []).forEach((item) => {
        if (item.applicantName) {
          if (item.applicantType === applicantType.value.FIRSTAPPLICANT) {
            firstApplicantName.push(item.applicantName);
          }
          if (item.applicantType === applicantType.value.OTHERAPPLICANT) {
            otherApplicantName.push(item.applicantName);
          }
        }
      });
      data.firstApplicantName = firstApplicantName.join('；');
      data.otherApplicantName = otherApplicantName.join('；');
      // 标签排序，设置优先放在第一排
      (data.patentTags || []).forEach((item, index) => {
        if (item.isPriorityTag === 1) {
          // eslint-disable-next-line prefer-destructuring
          const arr = data.patentTags.splice(index, 1)[0];
          data.patentTags.splice(0, 0, arr);
        }
      });
      // 第一发明人人&其他发明人
      const otherInventorName = [];
      const otherInventors = [];
      (data.inventors || []).forEach((item) => {
        const interval = item.isInternal ? '内部' : '外部';
        const lastNamePY = item.lastNamePinyin.toUpperCase();
        const firstNamePY = item.firstNamePinyin.toUpperCase();
        const hasNamePinYin = item.lastNamePinyin && item.firstNamePinyin;
        const fullName = `${lastNamePY},${firstNamePY}-${item.lastName}${item.firstName}(${interval})`;
        const name = `${item.lastName}${item.firstName}(${interval})`;
        const obj = {
          inventorName: '',
          lastName: lastNamePY ? `${item.lastName}(${lastNamePY})` : item.lastName,
          firstName: firstNamePY ? `${item.firstName}(${firstNamePY})` : item.firstName,
          nationality: getRegionName(item.nationality),
          certificateName: `${item.certificateNumber}(${getTypeName(item.certificateType)})`,
        };
        if (item.inventorType === inventorType.value.COINVENTOR) {
          if (hasNamePinYin) {
            otherInventorName.push(fullName);
            obj.inventorName = fullName;
          } else {
            otherInventorName.push(name);
            obj.inventorName = name;
          }
          otherInventors.push(obj);
        } else {
          data.firstInventorName = hasNamePinYin ? fullName : name;
          obj.inventorName = data.firstInventorName;
          data.firstInventors = [obj];
        }
      });
      data.otherInventorName = otherInventorName.join('；');
      data.otherInventors = otherInventors;
      data.patentDetailDate = data.patentDetailDate || {};
      data.patentCooperationList = data.patentCooperation?.cooperationName ? [data.patentCooperation] : [];
      return data;
    });

    // 根据 fileId 获取 fileUrl
    const fetchFileUrlByFileId = async (fileId) => {
      const { data: fileInfo } = await axios.get('/patent-corp_api/cos-token', {
        params: { uri: fileId, method: 'get' },
      });
      const authorization = encodeURIComponent(fileInfo.authorization);
      const url = `${fileInfo.imageUrl}?sign=${authorization}`;
      return url;
    };

    const handleDownload = (fileList) => {
      fileList.forEach(async (item) => {
        const { attachmentInfo } = item;
        const url = await fetchFileUrlByFileId(attachmentInfo.fileId);
        utils.getBlob(url).then((blob) => {
          utils.saveAs(blob, attachmentInfo.fileName);
        })
          .catch((err) => {
            console.log(err);
          });
      });
    };

    return {
      ...toRefs(state),
      patentDetailData,
      currentStage,
      utils,
      getTypeName,
      getRegionName,
      userInfo,
      applyTypeList,
      handleDownload,
    };
  },
});
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
.table-wrap {
  margin: 8px 0;
  width: 99%;
  & ::v-deep {
    .el-table__header tr,
    .el-table__header th {
      padding: 0;
      height: 40px;
      line-height: 40px;
    }
    .el-table__body tr,
    .el-table__body td {
      padding: 0;
      height: 40px;
      line-height: 40px;
    }
  }
}
.click-class {
  cursor: pointer;
  color: #016EFF;
}
.full-width {
  width: 100%;
}
.subtitle {
  display: inline-block;
  color: #FF5B01;
  height: 20px;
  line-height: 20px;
  background-color: rgba(255, 223, 200, 1);
  border-radius: 7px;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  padding: 1px 4px;
  margin-left: 6px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.patent-status {
  color: #ffffff;
  background-color: #00B363;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-left: 8px;
}
::v-deep {
  .descriptions-item {
    height: 25px;
  }
}
</style>
