<template>
  <div>
    <div class="agent-detail" style="text-align:left;" >
      <page-card>
        <panel-table-filter
          v-model="filter"
          :columns="filterColumns"
          label-width="100px"
          @submit="submitForm"
          @reset="resetForm"
          btnSize="medium"
        />
      </page-card>

      <page-card>
        <el-button
          type="primary"
          class="add-btn"
          size="medium"
          icon="el-icon-plus"
          @click="handleAddOrEditAgent()"
          >新增
        </el-button>
        <div>
          <table-paging
            v-loading="tableLoading"
            :data="innerTableData"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa' }"
          >
            <el-table-column
              prop="name"
              label="姓名"
              :show-overflow-tooltip="true"
               min-width="75"
            >
              <template #default="{ row }">
              <router-link
                :to="{ path: '/proxy-management/agent-detail',
                query: {id: row.id}}">{{ row.name}}</router-link>
            </template>
            </el-table-column>
            <el-table-column
              prop="agentRoleName"
              label="代理人角色"
              :show-overflow-tooltip="true"
              min-width="100"
              :formatter="formatterText"
            />
            <el-table-column
              prop="telephone"
              label="联系电话"
              :show-overflow-tooltip="true"
               min-width="100"
            />
            <el-table-column
              prop="email"
              label="邮箱地址"
              :show-overflow-tooltip="true"
              min-width="100"
            />
            <el-table-column
              prop="adeptDomainName"
              label="擅长领域"
              :show-overflow-tooltip="true"
            />
             <el-table-column
              prop="lawFirmName"
              label="代理所"
               min-width="140"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="agentGradeName"
              label="代理人级别"
              :show-overflow-tooltip="true"
               min-width="85"
            >
               <template #default="{ row }">
            {{ getTypeName(row.agentGrade) }}
          </template>
          </el-table-column>
            <el-table-column
              prop="loginName"
              label="用户名"
                min-width="100"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="isWorking"
              label="在职状态"
              :show-overflow-tooltip="true"
              :formatter="formatterText"
              min-width="70"
            />
            <el-table-column label="操作" min-width="150" align="center">
              <template #default="{ row }">
                <el-switch
                  class="switchStyle"
                  v-model="row.isEnabled"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="changeIsEnable(row)"
                >
                </el-switch>
                <i
                  title="编辑"
                  @click="handleAddOrEditAgent(row)"
                  class="el-icon-edit-outline icon-btn onhand-show"
                />
                <i @click="handleDelete(row)" title="删除" class="el-icon-delete icon-btn onhand-show" />
                <i
                  @click="handleAccountSetting(row)"
                title="账号设置"
                  class="el-icon-setting icon-btn onhand-show"
                />
              </template>
            </el-table-column>
          </table-paging>
        </div>
      </page-card>
      <dialog-agent
        :visible.sync="dialogEditAgent"
        :edit-agent="editAgent"
        :agent-info="agentInfo"
        @success="handleSuccess"
      />
      <dialog-account
      :visible.sync="dialogSettingAccount"
      :agent-info="agentInfo"
      @success="handleSuccess"
      />
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import { useHttp } from '@/hooks/http';
import DialogAgent from './dialog-agent.vue';
import DialogAccount from './dialog-account.vue';

export default defineComponent({
  name: 'AgentList',
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    TooltipPatentNumber,
    DialogAgent,
    DialogAccount,

  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const { getEnumsInfo } = useLookupsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      filter: {
        name: '',
        agentRole: null,
        loginName: null,
        lawFirmID: null,
        agentGrade: null,
        isWorking: null,
      },
      filterColumns: [
        {
          dataIndex: 'name',
          type: 'input',
          label: '姓名',
          placeholder: '请输入姓名',
        },
        {
          dataIndex: 'agentRole',
          type: 'select|AGENT_ROLE',
          label: '角色',
          placeholder: '请选择角色',
        },
        {
          dataIndex: 'loginName',
          type: 'input',
          label: '用户名',
          placeholder: '请输入用户名',
        },
        {
          dataIndex: 'lawFirmID',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          queryKey: 'key',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          label: '代理所',
          placeholder: '请输入代理所',
        },
        {
          dataIndex: 'agentGrade',
          type: 'select|AGENT_GRADE',
          label: '级别',
          placeholder: '请选择级别',
        },
        {
          dataIndex: 'isWorking',
          type: 'select',
          label: '状态',
          placeholder: '请选择状态',
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
    });
    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/agent-list');

    options.query = computed(() => ({
      ...state.filter, isList: true,
    }));
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const handleSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        await fetchList();
      }
    };
    const getEnabledName = (isWorking) => {
      let returnValue = '';
      if (isWorking !== null) {
        if (isWorking) {
          returnValue = '在职';
        } else {
          returnValue = '离职';
        }
      }
      return returnValue;
    };
    const changeIsEnable = async (row) => {
      const { url: changeEnableUrl, putData: putIsEnableData } = useHttp();
      try {
        changeEnableUrl.value = `${'/patent-corp_api/agents/set-agent-enabled'
        + '?agentId='}${row.id}&isEnabled=${row.isEnabled}`;
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
      state.dialogEditAgent = true;
    };
    const { getTypeName } = useLookupsInject();
    const getName = (ids) => {
      const name = (ids || []).map(item => getTypeName(item)).join(';');
      return name;
    };
    function formatterText(row, column) {
      switch (column.label) {
        case '在职状态':
          return getEnabledName(row.isWorking);
        case '代理人角色':
          return getName(row.agentRole);
        default:
          return '';
      }
    }

    const handleDelete = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/agents/delete-agent/${row.id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteData(row.id);
        $message.success('删除成功!');
        await fetchList();
      });
    };

    const handleAccountSetting = (row) => {
      state.agentInfo = row;
      state.dialogSettingAccount = true;
    };

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      options,
      tableLoading,
      innerTableData,
      pagination,
      handlePageChange,
      fetchList,
      submitForm,
      resetForm,
      applyTypeList,
      formatterText,
      getEnabledName,
      handleAddOrEditAgent,
      handleSuccess,
      handleDelete,
      changeIsEnable,
      handleAccountSetting,
      getTypeName,
    };
  },
});
</script>
<style lang="scss" scoped>
.page-container .page {
    margin: 0;
}
.agent-top {

.panel-table-filter .filter-wrapper .filter-item.form-btn-group {
      text-align: left !important;
}

  margin-bottom: 20px;
  width: 100%;
  height: 40px;
  line-height: 40px;
  background-color: white;
  .preliminary-review-title{
    float: left;
    margin-left: 20px;
    font-size: 16px;
    .border-blue {
      display: inline-block;
      width: 4px;
      background-color: #0079fe;
      height: 16px;
      margin-right: 10px;
    }
  }
}
.form-left {
  flex: 1;
  display: flex;
  padding-right: 20px;
  .el-form-item {
    margin-right: 12px;
  }
}
.form-search {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
}
.agent-detail {
  margin-left: 20px;
  width: 98%;
  .icon-btn{
    color: #016EFF;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: middle;
  }
}
.search-btn {
  width: 63px;
  height: 36px;
  border-radius: 3px;
}
.application-confirmation {
  padding: 20px 20px;
  width:  100%;
}
</style>
<style lang="scss">
  .el-switch__label * {
    font-size: 10px;
  }
  .switchStyle .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}
.switchStyle .el-switch__label--left {
  z-index: 9;
  left: 6px;
}
.switchStyle .el-switch__label--right {
  z-index: 9;
  left: -17px;

}
.switchStyle .el-switch__label.is-active {
  display: block;
}
.switchStyle.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 50px !important;
}
.onhand-show{
  cursor:pointer;
}
</style>
