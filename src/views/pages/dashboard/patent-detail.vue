<template>
<div v-loading="loading">
    <div class="preliminary-review-button">
      <el-button class="left-back" @click="$router.back()" size="mini">
        <i class="el-icon-arrow-left" />
        返回
      </el-button>
      <el-button class="dialog-btn" @click="handleEditRequest">发起请求</el-button>
      <el-button class="dialog-btn" @click="handleEditClaim">录入来文</el-button>
      <!-- <el-button class="dialog-btn">步骤补录</el-button> -->
    </div>
    <div class="patent-detail">
      <div class="detail-left">
        <el-tabs type="border-card">
          <el-tab-pane label="基本信息">
            <patent-information :patent-data="patentData" @change-progressid="changeProgressId" />
          </el-tab-pane>
          <el-tab-pane label="委托信息">
            <patent-commission-information />
          </el-tab-pane>
          <el-tab-pane label="项目信息">
            <project-information />
          </el-tab-pane>
          <el-tab-pane label="法律信息">
            <legal-information />
          </el-tab-pane>
          <el-tab-pane label="费用">费用</el-tab-pane>
          <el-tab-pane label="关系图">关系图</el-tab-pane>
          <el-tab-pane label="附件">附件</el-tab-pane>
        </el-tabs>
      <page-card style="margin-top: 20px" v-if="Object.keys(stepDetail).length > 0" id="dynamic-main">
        <div class="dynamic-header">
          <div class="title-name">{{stepDetail.progressName}}</div>
          <div>当前处理人：{{ stepDetail.staffInCharge }}</div>
          <div>工作时限：{{ utils.dateFormat(stepDetail.workingDueDate) }}</div>
          <div>法定时限：{{ utils.dateFormat(stepDetail.officialDueDate) }}</div>
        </div>
        <div class="dynamic-context">
          <el-form
            :model="formData"
            ref="dynamicForm"
            class="dynamic-form"
            size="medium"
          >
            <dynamic-fields
              v-if="(fields || []).length > 0"
              :fields="fields"
              v-model="formData"
              :tag-data.sync="tagList"
            />
            <el-form-item label-width="150px">
              <el-button type="primary"
                style="width: 120px"
                :loading="processStepLoading"
                @click="submitStep">确认提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </page-card>
      <page-card style="margin-top: 20px">
        <panel-stage-detail :node-arr="nodeArr" :expanded-keys.sync="nodeArr"/>
      </page-card>
      <!-- <panel-select-group
        v-if="patentData"
        v-model="groupVal"
        :query="{ processId: patentData.processId, currentStageID: patentData.currentStageId, claimsType: 701 }"
        api="/patent-corp_api/process-claims-current-combo"
        :is-more="true"
        loadMoreApi="/patent-corp_api/process-claims-other-combo"
      /> -->
      </div>
      <div class="detail-right">
        <directory-tree class="menu-tree" :checked-node-tree.sync="nodeArr" :expanded-keys="nodeArr" />
      </div>
    </div>
    <dialog-input-communication
       v-if="visibleAddPlat"
       :visible.sync="visibleAddPlat"
       :patentData="patentData"
       :isClaim="isClaim"
       @success="handleSuccess"
    />
</div>

</template>

<script>
import {
  defineComponent, onMounted, reactive, toRefs, ref,
} from '@vue/composition-api';
import utils from '@/utils';
import { useUserInfo } from '@/context';
import PanelSelectGroup from '@/components/panel-select-group.vue';
import { useHttp } from '@/hooks/http';
import DynamicFields from '@/components/dynamic-fields.vue';
import PatentInformation from './patent-detail/tab-pane-detail/patent-information.vue';
import PatentCommissionInformation from './patent-detail/tab-pane-detail/patent-commission-information.vue';
import ProjectInformation from './patent-detail/tab-pane-detail/project-information.vue';
import LegalInformation from './patent-detail/tab-pane-detail/legal-information.vue';
import PanelStageDetail from './blocks/panel-stage-detail.vue';
import DirectoryTree from './patent-detail/directory-tree.vue';
import DialogInputCommunication from './dialog-input-communication.vue';

export default defineComponent({
  name: 'PatentDetail',
  components: {
    PatentInformation,
    PatentCommissionInformation,
    ProjectInformation,
    LegalInformation,
    DynamicFields,
    PanelStageDetail,
    PanelSelectGroup,
    DirectoryTree,
    DialogInputCommunication,
  },
  setup(_, context) {
    const { $nextTick, $route, $message } = context.root;
    const { userInfo } = useUserInfo();
    const dynamicForm = ref(null);
    const state = reactive({
      nodeArr: [],
      stepDetail: {},
      fields: [],
      formData: {},
      experts: null,
      visibleAddPlat: false,
      isClaim: null,
      tagList: [],
    });

    const {
      url: currentStepDetailUrl,
      data: currentStepDetail,
      fetchData,
    } = useHttp();

    const {
      loading: processStepLoading,
      putData: submitProcessStep,
    } = useHttp(`/patent-corp_api/patents/${$route.query.id}/update-patent-process-step`);

    const submitStep = async () => {
      dynamicForm.value.validate(async (valid) => {
        if (!valid) return;
        if (state.tagList.length > 0) {
          const tagValid = state.tagList.some(item => item.isPriorityTag === 1);
          if (!tagValid) {
            $message.error('请选择优先标签');
            return;
          }
        }
        const progressProperties = utils.handleFieldsSubmitVal(state.fields, state.formData, state.tagList);
        const params = {
          progressId: state.stepDetail.progressId,
          stageStepId: state.stepDetail.stageStepId,
          progressProperties,
        };
        try {
          await submitProcessStep(params);
          $message.success('操作成功!');
          window.location.reload();
        } catch (error) {
          $message.error(error.response.data);
        }
      });
    };
    const fetchCurrentStep = async (id) => {
      currentStepDetailUrl.value = `/patent-corp_api/progresses/${id}/current-step-fields`;
      await fetchData();
      const { currentStepFields, ...stepDetail } = currentStepDetail.value;
      state.stepDetail = stepDetail;
      state.fields = currentStepFields;
    };
    const {
      loading,
      data: patentData,
      fetchData: fetchPatentData,
    } = useHttp(`/patent-corp_api/patents/${$route.query.id}/basic-info`);

    onMounted(async () => {
      const data = await fetchPatentData();
      if (data.currentProgresses && data.currentProgresses.length > 0) {
        const current = (data.currentProgresses || [])
          .find(item => (item.currentOperatorStaffIds || []).includes(userInfo.value.staffId));
        if (current) {
          fetchCurrentStep(current.progressId);
        }
      }
    });
    const handleEditClaim = () => {
      state.isClaim = 1;
      state.visibleAddPlat = true;
    };
    const handleEditRequest = () => {
      state.isClaim = 2;
      state.visibleAddPlat = true;
    };
    const changeProgressId = async (val) => {
      await fetchCurrentStep(val);
      const toElement = document.getElementById('dynamic-main');
      if (toElement) {
        $nextTick(() => {
          window.scrollTo(0, toElement.offsetTop - 120);
        });
      }
    };
    const handleSuccess = () => {
      window.location.reload();
    };
    return {
      ...toRefs(state),
      loading,
      patentData,
      utils,
      dynamicForm,
      submitStep,
      handleEditRequest,
      handleEditClaim,
      changeProgressId,
      handleSuccess,
      processStepLoading,
    };
  },

});
</script>

<style lang="scss" scoped>
.preliminary-review-button{
  margin-bottom: 10px;
  .left-back{
    margin-left: 20px;;
  }
  .dialog-btn{
    float: right;
    height: 25px;
    width: 74px;
    line-height: 0;
    color: #016EFF;
    border-color: #016EFF;
    padding: 0;
  }
}
.patent-detail {
  display: flex;
  margin-left: 20px;
  .detail-left {
    flex: 1;
  }
  .detail-right {
    flex-shrink: 0;
    padding-bottom: 16px;
    width: 260px;
    .menu-tree {
      position: sticky;
      top: 60px;
      right: 47px;
    }
  }
  ::v-deep {
    .panel-info-list {
      padding-top: 8px;
    }
    .el-tabs--border-card {
      border: 1px solid rgba(0, 100, 217, 0.298);
      box-shadow: rgba(1, 55, 119, 0.24) 0px 0px 13px;
    }
    .el-tabs--border-card > .el-tabs__header .el-tabs__item {
      font-weight: 600;
    }
    .el-tabs--border-card > .el-tabs__header {
      background-color:rgb(239, 249, 255);
      border-color: rgb(179, 209, 244);
    }
    .el-tabs__content {
      padding: 16px 36px;
    }
  }
  .dynamic-form {
    padding: 0 150px 0 0px;
  }
  .dynamic-header {
    display: flex;
    justify-content: space-between;
    background-color: #F0F8FA;
    padding: 10px 30px;
    border: 1px solid #DCE6E5;
    .title-name {
      font-size: 15px;
    }
  }
  .dynamic-context {
    padding: 20px;
    border: 1px solid #DCE6E5;
    border-top: none;
  }
}
</style>
