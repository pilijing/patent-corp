<template>
  <div class="first-application-detail" v-loading="loading">
    <page-card>
      <panel-info-list
        label-width="120px"
        v-model="applicationDetail"
        :columns="applicationInfoColums"
        class="info-list"
      />
      <div v-if="isCurrentOperator"
       class="application-confirmation"
      >
        <el-form
          :model="formData"
          ref="viewForm"
        >
          <dynamic-fields
            :fields="fields"
            v-model="formData"
            :tag-data.sync="tagList"
          />
          <el-form-item label-width="130px">
            <el-button
              type="primary"
              style="width: 120px"
              :loading="submitLoading"
              @click="submitForm">确认提交
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </page-card>
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed, ref,
} from '@vue/composition-api';
import PanelInfoList from '@/components/panel-info-list.vue';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import { useLookupsInject, useRegionsInject, useUserInfo } from '@/context';
import DynamicFields from '@/components/dynamic-fields.vue';

export default {
  name: 'FirstApplicationDetail',
  components: {
    DynamicFields,
    PanelInfoList,
  },
  setup(_, context) {
    const { $router, $route, $message } = context.root;
    const {
      getEnumsInfo,
      getTypeName,
    } = useLookupsInject();
    const {
      getRegionName,
    } = useRegionsInject();
    const { userInfo } = useUserInfo();
    const viewForm = ref(null);
    const inventorType = computed(() => getEnumsInfo('INVENTOR_TYPE'));
    const patentType = computed(() => getEnumsInfo('PATENT_TYPE'));
    const applyType = computed(() => getEnumsInfo('APPLY_TYPE'));
    const stepTypeList = computed(() => getEnumsInfo('STEP_RESULT'));
    const yesNo = computed(() => getEnumsInfo('YES_NO'));

    const state = reactive({
      submitLoading: false,
      applicationInfoColums: [
        { dataIndex: 'projectSponsorName', label: '立项人' },
        { dataIndex: 'applicationOrgName', label: '申请部门' },
        { dataIndex: 'regionName', label: '申请国家' },
        { dataIndex: 'firstInventorName', label: '第一发明人' },
        { dataIndex: 'otherInventorName', label: '其他发明人' },
        { dataIndex: 'writerName', label: '撰写人' },
        { dataIndex: 'contactPhone', label: '联系电话' },
        { dataIndex: 'isPublishedAsPaper', label: '方案近期公开' },
        { dataIndex: 'productName', label: '产品名称' },
        { dataIndex: 'productVersion', label: '产品版本' },
        { dataIndex: 'overseasSituationName', label: '产品海外情况' },
        { dataIndex: 'hasThirdPartyPartners', label: '是否第三方合作' },
        {
          dataIndex: 'patentAttachments', label: '交底书附件', type: 'file', width: '100%',
        },
        {
          dataIndex: 'disclosurePaperName', label: '交底书名称', width: '100%',
        },
        {
          dataIndex: 'remark', label: '备注说明', width: '100%',
        },
      ],
      formData: {},
      fields: [],
      tagList: [],
    });

    const {
      loading,
      url: applicationUrl,
      data: applicationData,
      fetchData: fetchApplicationData,
    } = useHttp();
    const {
      url: applicationFormUrl,
      data: applicationForm,
      fetchData: fetchApplicationForm,
    } = useHttp();

    const applicationDetail = computed(() => {
      const data = applicationData.value || {};
      data.isPublishedAsPaper = data.isPublishedAsPaper === yesNo.value.YES ? '是' : '否';
      data.hasThirdPartyPartners = data.hasThirdPartyPartners === yesNo.value.YES ? '是' : '否';
      data.regionName = getRegionName(data.regionCode);
      data.overseasSituationName = getTypeName(data.overseasSituation);
      const otherInventorName = [];
      (data.inventors || []).forEach((item) => {
        const interval = item.isInternal ? '内部' : '外部';
        const lastNamePY = item.lastNamePinyin.toUpperCase();
        const firstNamePY = item.firstNamePinyin.toUpperCase();
        const hasNamePinYin = item.lastNamePinyin && item.firstNamePinyin;
        const fullName = `${lastNamePY},${firstNamePY}-${item.lastName}${item.firstName}(${interval})`;
        const name = `${item.lastName}${item.firstName}(${interval})`;
        if (item.inventorType === inventorType.value.FIRSTINVENTOR) {
          data.firstInventorName = hasNamePinYin ? fullName : name;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const arr = hasNamePinYin ? otherInventorName.push(fullName) : otherInventorName.push(name);
        }
      });
      data.otherInventorName = otherInventorName.join('；');
      return data;
    });

    const {
      putData: postAuditData,
    } = useHttp(`/patent-corp_api/patents/${$route.query.id}/update-patent-process-step`);
    const submitForm = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const progressProperties = utils.handleFieldsSubmitVal(state.fields, state.formData, state.tagList);
          const params = {
            stageStepOrder: 2,
            progressId: applicationForm.value.progressId,
            stageStepId: applicationForm.value.stageStepId,
            progressProperties,
            patentId: Number($route.query.id),
          };
          await postAuditData(params);
          $message.success('提交成功!');
          $router.push(`/dashboard/patent-detail?id=${$route.query.id}`);
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    const isCurrentOperator = computed(() => {
      if (applicationDetail.value) {
        const current = ((applicationDetail.value.currentProgresses || [])[0]
          ?.currentOperatorStaffIds || []).includes(userInfo.value.staffId);
        return current;
      }
      return false;
    });

    onMounted(async () => {
      applicationUrl.value = `/patent-corp_api/patents/${$route.query.id}/first-application-info`;
      await fetchApplicationData();
      if (isCurrentOperator.value) {
        const progressId = applicationData.value.currentProgressId;
        applicationFormUrl.value = `/patent-corp_api/progresses/${progressId}/current-step-fields`;
        await fetchApplicationForm();
        const { currentStepFields } = applicationForm.value;
        state.fields = currentStepFields;
      }
    });

    return {
      ...toRefs(state),
      loading,
      patentType,
      applyType,
      stepTypeList,
      applicationDetail,
      submitForm,
      userInfo,
      viewForm,
      isCurrentOperator,
    };
  },
};
</script>

<style lang="scss" scoped>
.first-application-detail {
  .info-list {
    padding-top: 20px;
    background-color: rgba(240, 248, 250, 0);
    border: 1px solid rgba(220, 230, 229, 1);
    margin-bottom: 20px;
  }
  .application-confirmation {
    padding: 20px 80px;
    background-color: rgba(250, 250, 250, 1);
  }
  .el-button--primary{
    width: 137px;
    background-color: rgba(1, 110, 255, 1);
    border-radius: 3px;
  }
  ::v-deep{
    .el-card__body {
      padding-left: 60px;
      padding-right: 60px;
    }
  }
}
</style>
