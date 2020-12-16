<template>
  <div>
    <div class="back-tool">
      <el-button @click="$router.back()" size="mini">
        <i class="el-icon-arrow-left" />
        返回
      </el-button>
    </div>
    <div class="detail-main" v-loading="loading">
      <div class="agency-detail">
        <page-card>
          <div class="agency-detail-top">
            <div class="info-top">
              <span class="title">{{agencyDetailData.name}}</span>
              <span class="type" v-if="agencyDetailData.type">{{agencyDetailData.type}}</span>
            </div>
            <descriptions
              :column="5"
            >
              <descriptions-item label="代理人数量" class="agent-total">{{agentListTotal}}</descriptions-item>
              <descriptions-item label="合作时间" :value="agencyDetailData.cooperationTime" />
              <descriptions-item label="合作类型" :value="agencyDetailData.cooperationType" />
              <descriptions-item label="接口人" :value="agencyDetailData.dockingPeople" />
              <descriptions-item label="联系电话" :value="agencyDetailData.tel" />
            </descriptions>
            <div class="domain">
              <span style="color: #757575;">擅长领域: </span>
              <span class="domain-item" v-for="(item, index) in agencyDetailData.experiencedDomainList" :key="index">
                {{item}}
              </span>
            </div>
          </div>
          <panel-info-list
            label-width="150px"
            v-model="agencyDetailData"
            :columns="agencyDetailColums"
            col="3"
          />
        </page-card>
      </div>
      <page-card class="quota-detail">
        <div class="subtitle">份额设置</div>
        <div class="quota-table">
          <el-table
            :data="quotaDetailList"
            max-height="240px"
            :header-cell-style="{ 'background-color': '#fafafa', }">
            <el-table-column prop="applicationType" label="申请类型">
              <template #default="{ row }">
                <span>{{getTypeName(row.applicationType)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="regionCode" label="国家/地区">
              <template #default="{ row }">
                <span>{{getRegionName(row.regionCode)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="entrustGrade" label="委托等级">
              <template #default="{ row }">
                <span>{{getTypeName(row.entrustGrade)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="caseTotal" label="案件量"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <i @click="handleOperateQuota(row)" class="el-icon-edit-outline icon-btn" />
                <i @click="handleDeleteQuota(row.id)" class="el-icon-delete icon-btn"/>
              </template>
            </el-table-column>
          </el-table>
          <div class="add-quota-btn" @click="dialogQuotaVisible = true; quotaData={}"> + 添加份额</div>
        </div>
      </page-card>
      <page-card class="agent-detail">
        <div class="subtitle">代理人列表</div>
        <div class="agent-serch">
          <el-button type="primary"
            size="mini"
            icon="el-icon-plus"
            class="add-agent"
            @click="handleAddOrEditAgent()"
          >新增</el-button>
          <panel-table-filter
            v-model="filter"
            :columns="filterColumns"
            @submit="submitForm"
            btnSize="small"
            :cols="6"
            label-width="20px"
          />
        </div>
        <div class="agent-table">
          <table-paging
            v-loading="tableLoading"
            :data="agentTableData"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa', }">
            <el-table-column prop="name" label="姓名" show-overflow-tooltip>
              <template #default="{ row }">
                 <router-link
                :to="{ path: '/proxy-management/agent-detail',
                query: {id: row.id}}">{{ row.name}}</router-link>
              </template>
            </el-table-column>
            <el-table-column prop="agentRoleName"
              label="代理人角色"
              show-overflow-tooltip
              min-width="120"
            />
            <el-table-column
              prop="telephone"
              label="联系电话"
              show-overflow-tooltip
            />
            <el-table-column
              prop="email"
              label="邮箱地址"
              show-overflow-tooltip
            />
            <el-table-column
              prop="adeptDomainName"
              label="擅长领域"
              show-overflow-tooltip
              min-width="120"
            />
            <el-table-column
              prop="agentGradeName"
              label="代理人级别"
              show-overflow-tooltip
              min-width="80"
            />
            <el-table-column
              prop="loginName"
              label="用户名"
              show-overflow-tooltip
            />
            <el-table-column
              prop="isWorking"
              label="在职状态"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{row.isWorking ? '在职' : '离职'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="132" align="center">
              <template #default="{ row }">
                <el-switch
                  class="switch-style"
                  v-model="row.isEnabled"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="changeIsEnable(row)"
                >
                </el-switch>
                <i
                  @click="handleAddOrEditAgent(row)"
                  class="el-icon-edit-outline icon-btn"
                />
                <i @click="handleDelete(row)" class="el-icon-delete icon-btn" />
                <i
                  @click="handleAccountSetting(row)"
                  class="el-icon-setting icon-btn"
                />
              </template>
            </el-table-column>
          </table-paging>
        </div>
      </page-card>
    </div>
    <dialog-add-quota
      :visible.sync="dialogQuotaVisible"
      :quota-data="quotaData"
      @success="handleSuccessQuota"
    />
    <dialog-agent
      :visible.sync="dialogEditAgent"
      :edit-agent="editAgent"
      :agent-info="agentInfo"
      :is-agency="true"
      :agency-option="agencyOptions"
      @success="handleSuccessAgent"
    />
    <dialog-account
    :visible.sync="dialogSettingAccount"
    :agent-info="agentInfo"
    @success="handleSuccessAgent"
    />
  </div>
</template>
<script>
import {
  defineComponent, reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject, useDomainsInject } from '@/context';
import { useHttp } from '@/hooks/http';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import PanelInfoList from '@/components/panel-info-list.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import cloneDeep from 'lodash/cloneDeep';
import DialogAddQuota from './dialog-add-quota.vue';
import DialogAgent from '../agency/dialog-agent.vue';
import DialogAccount from '../agency/dialog-account.vue';

export default defineComponent({
  name: 'AgencyDetail',
  components: {
    PanelInfoList,
    TablePaging,
    DialogAddQuota,
    DialogAgent,
    DialogAccount,
    PanelTableFilter,
  },
  setup(_, context) {
    const { $route, $message, $confirm } = context.root;
    const { getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const { getDomains, getDomainName } = useDomainsInject();

    const state = reactive({
      agencyDetailColums: [
        { dataIndex: 'shortName', label: '代理所简称' },
        { dataIndex: 'address', label: '地址' },
        { dataIndex: 'email', label: '邮箱地址' },
        { dataIndex: 'spareEmail', label: '备用邮箱' },
        { dataIndex: 'regionCode', label: '所属国家/地区' },
        { dataIndex: 'businessRegionList', label: '业务覆盖国家/地区' },
        { dataIndex: 'isOverseas', label: '是否海外所' },
        { dataIndex: 'isPerformanceReview', label: '是否纳录考核' },
        { dataIndex: 'isCcDockingPeople', label: '返稿邮件抄送给接口人' },
        {
          dataIndex: 'remark', label: '备注', type: 'textarea', width: '100%',
        },
        {
          dataIndex: 'attachments', label: '资质文件', type: 'file', width: '100%',
        },
      ],
      dialogQuotaVisible: false,
      quotaData: {},
      agentListTotal: null,
      filter: {
        name: '',
        agentRole: null,
        loginName: null,
        agentGrade: [],
        isWorking: null,
      },
      filterColumns: [
        {
          dataIndex: 'name',
          type: 'input',
          label: '',
          clearable: true,
          placeholder: '姓名',
        },
        {
          dataIndex: 'agentRole',
          type: 'select|AGENT_ROLE',
          label: '',
          placeholder: '角色',
        },
        {
          dataIndex: 'loginName',
          type: 'input',
          clearable: true,
          label: '',
          placeholder: '用户名',
        },
        {
          dataIndex: 'agentGrade',
          type: 'select|AGENT_GRADE',
          label: '',
          placeholder: '级别',
        },
        {
          dataIndex: 'isWorking',
          type: 'select',
          label: '',
          placeholder: '状态',
          clearable: true,
          options: [
            { name: '在职', id: 1 },
            { name: '离职', id: 2 },
          ],
        },
      ],
      dialogEditAgent: false,
      agentInfo: null,
      editAgent: false,
      dialogSettingAccount: false,
      agencyOptions: [],
    });
    // 代理所详情
    const {
      loading,
      data: agencyDetail,
      fetchData: fetchAgencyDetail,
    } = useHttp(`/patent-corp_api/law-firms/detail/${$route.query.id}`);

    const agencyDetailData = computed(() => {
      const data = cloneDeep(agencyDetail.value) || {};
      const { dateFormat } = utils;
      data.type = getTypeName(data.type);
      data.cooperationTime = `${dateFormat(data.cooperationStartAt, 'yyyy-MM-DD')}
      ~ ${data.cooperationEndAt ? dateFormat(data.cooperationEndAt, 'yyyy-MM-DD') : '至今'}`;
      data.cooperationType = getTypeName(data.cooperationType);
      data.experiencedDomainList = (data.experiencedDomain || []).map(item => getDomainName(item.domainId));
      data.regionCode = getRegionName(data.regionCode);
      data.businessRegionList = (data.businessRegion || []).map(item => getRegionName(item.regionCode)).join('，');
      data.isOverseas = data.isOverseas ? '是' : '否';
      data.isPerformanceReview = data.isPerformanceReview ? '是' : '否';
      data.isCcDockingPeople = data.isCcDockingPeople ? '是' : '否';
      return data;
    });
    // 份额列表
    const {
      data: quotaDetailList,
      fetchData: fetchQuotaList,
    } = useHttp(`/patent-corp_api/law-firms/quota/search?lawFirmId=${$route.query.id}`);
    // 代理人列表
    const {
      options,
      loading: tableLoading,
      data: agentData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/agent-list');
    options.query = computed(() => ({
      ...state.filter,
      lawFirmID: $route.query.id,
      isList: true,
    }));

    onMounted(async () => {
      getDomains();
      await fetchAgencyDetail();
      await fetchQuotaList();
      const agentList = await fetchList();
      state.agentListTotal = agentList.total || 0;
    });
    const agentTableData = computed(() => {
      const data = cloneDeep(agentData.value) || [];
      data.forEach((item) => {
        item.agentRoleName = (item.agentRole || []).map(ele => getTypeName(ele)).join(',');
        item.agentGradeName = getTypeName(item.agentGrade);
      });
      return data;
    });
    // 编辑所属份额
    const handleOperateQuota = (row) => {
      state.quotaData = row;
      state.dialogQuotaVisible = true;
    };
    const handleSuccessQuota = () => {
      fetchQuotaList();
    };
    const {
      url: deleteQuotaUrl,
      deleteData: deleteQuotaData,
    } = useHttp(`/patent-corp_api/law-firms/detail/${$route.query.id}`);
    // 删除所属份额
    const handleDeleteQuota = async (id) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        deleteQuotaUrl.value = `/patent-corp_api/law-firms/${$route.query.id}/quota/${id}`;
        try {
          await deleteQuotaData();
          $message.success('删除成功!');
          await fetchQuotaList();
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('删除失败');
          }
        }
      });
    };
    // 代理人
    const handleSuccessAgent = async (val) => {
      if (val) {
        await fetchList();
      }
    };
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const { url: enableUrl, putData: putIsEnableData } = useHttp();
    // 代理人启用/禁用
    const changeIsEnable = async (row) => {
      try {
        enableUrl.value = `/patent-corp_api/agents/set-agent-enabled?agentId=${row.id}&isEnabled=${row.isEnabled}`;
        await putIsEnableData();
        $message.success('操作成功!');
      } catch (error) {
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };

    const handleAddOrEditAgent = (row) => {
      if (row) {
        state.agentInfo = row;
        state.editAgent = true;
      } else {
        state.agentInfo = null;
        state.editAgent = false;
      }
      state.agencyOptions = [
        { id: Number($route.query.id), lawFirmName: agencyDetailData.value.name },
      ];
      state.dialogEditAgent = true;
    };

    const handleDelete = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/agents/delete-agent/${row.id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteData();
        $message.success('删除成功!');
        await fetchList();
      })
        .catch((err) => {
          console.log(err);
        });
    };
    const handleAccountSetting = (row) => {
      state.agentInfo = row;
      state.dialogSettingAccount = true;
    };

    return {
      ...toRefs(state),
      getTypeName,
      getRegionName,
      loading,
      agencyDetailData,
      quotaDetailList,
      handleOperateQuota,
      handleDeleteQuota,
      options,
      tableLoading,
      agentTableData,
      pagination,
      handlePageChange,
      changeIsEnable,
      handleDelete,
      handleSuccessQuota,
      handleAddOrEditAgent,
      handleAccountSetting,
      handleSuccessAgent,
      submitForm,
    };
  },
});
</script>
<style lang="scss" scoped>
.back-tool {
  margin-bottom: 10px;
}
.detail-main{
  width: calc(100% - 6px);
  .agency-detail-top {
    background-color: rgba(239, 249, 255, 1);
    padding: 20px 40px 2px 40px;
  }
  .info-top {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .title {
      font-size: 24px;
      font-weight: 600;
    }
    .type {
      color: #FFFFFF;
      background-color: rgba(255, 126, 1, 1);
      padding: 4px 5px;
      margin-left: 8px;
      border-radius: 3px;
      font-size: 13px;
    }
  }
  .domain {
    margin-left: 18px;
    margin-bottom: 12px;
    .domain-item{
      display: inline-block;
      font-size: 12px;
      color: #FF7E01;
      border: 1px solid rgba(255, 171, 93, 1);
      margin-right: 8px;
      text-align: center;
      border-radius: 3px;
      padding: 0 6px;
      height: 24px;
      line-height: 24px;
    }
  }
  .quota-detail {
    .el-card {
      padding: 20px;
    }
    .quota-table {
      margin: 0 44px 20px 44px;
    }
    .add-quota-btn{
      padding: 10px 0;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      color: #016eff;
    }
  }
  .subtitle {
    padding: 24px 2px 12px 23px;
    font-weight: 650;
    font-size: 16px;
    color:#333333;
    text-align: left;
    line-height: 24px;
  }
  .agent-detail {
    .agent-table {
      margin: 12px 30px 20px 30px;
    }
    .agent-serch {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 20px;
      margin-right: 30px;
    }
    .add-agent {
      width: 67px;
      height: 32px;
      border-radius: 3px;
      padding: 9px;
    }
  }

  .icon-btn{
    color: #016EFF;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: middle;
    cursor: pointer;
  }
  ::v-deep {
    .el-card {
      margin-bottom: 16px;
      color: #333333;
    }
    .el-card__body {
      padding: 0;
    }
    .field-wrapper {
      display: flex;
      justify-content: space-between;
    }
    .panel-info-list {
      padding: 12px;
    }
    .el-switch__label * {
      font-size: 10px;
    }
    .el-switch__label {
      position: absolute;
      display: none;
      color: #fff;
    }
    .el-switch__label--left {
      z-index: 9;
      left: 6px;
    }
    .el-switch__label--right {
      z-index: 9;
      left: -14px;
    }
    .el-switch__label.is-active {
      display: block;
    }
    .el-switch .el-switch__core,
    .el-switch .el-switch__label {
      width: 50px !important;
    }
    .agent-total {
      .value {
        color: #016EFF;
      }
    }
    .agent-serch {
      .reset  {
        display: none;
      }
      .filter-wrapper {
        justify-content: flex-end;
      }
      .form-btn-group {
        flex: 0 !important;
        margin-left: 20px;
      }
    }
  }
}
</style>
