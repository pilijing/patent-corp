<template>
  <div>
    <div :class="(!isFromCorp ? 'staff-list' : '')" style="text-align:left;" >
      <page-card>
        <div class="list-title" v-if="isFromCorp">员工列表</div>
        <el-button
          type="primary"
          class="add-btn"
          size="medium"
          icon="el-icon-plus"
          @click="handleAddOrEditStaff()"
          >新增
        </el-button>
        <div style="margin: 12px">
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
            >
              <template #default="{ row }">
                <router-link
                  :to="{ path: '/corp-management/staff-detail',
                  query: {id: row.id}}">{{ row.name}}</router-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="staffName"
              label="员工账号"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="email"
              label="邮箱"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="mobile"
              label="手机号"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="loginName"
              label="用户名"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <el-switch class="switchStyle"
                v-model="row.isEnable"
                active-text="启用"
                inactive-text="禁用"
                @change="changeIsEnable(row)">
              </el-switch>
              <i
                @click="handleAddOrEditStaff(row)"
                class="el-icon-edit-outline icon-btn"
              />
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
      <dialog-staff
        :visible.sync="dialogStaff"
        :staff-info="staffInfo"
        :edit-staff="editStaff"
        :isFromCorp="isFromCorp"
        @success="handleSuccess"
        />
      <dialog-account
        :visible.sync="dialogSettingAccount"
        :staff-info="staffInfo"
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
  onMounted, computed,
} from '@vue/composition-api';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import { useHttp } from '@/hooks/http';
import DialogStaff from './dialog-staff.vue';
import DialogAccount from './dialog-account.vue';

export default defineComponent({
  name: 'CorpStaffList',
  props: {
    isFromCorp: Boolean,
  },
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    DialogStaff,
    DialogAccount,
  },
  setup(_, context) {
    const { $route, $message } = context.root;
    const state = reactive({
      filter: {
      },
      filterColumns: [
      ],
      staffInfo: null,
      editStaff: false,
      dialogStaff: false,
      dialogSettingAccount: false,
      corpInfo: {
        clientId: null,
        name: null,
        englishName: null,
        licenseCode: null,
        contactName: null,
        contactEmail: null,
        contactMobile: null,
        remark: null,
      },
    });

    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/corp-staffs');
    options.query = computed(() => ({
      ...state.filter,
      corpId: $route.query.id,
    }));

    const changeIsEnable = async (row) => {
      const { url: enableUrl, putData: putIsEnableData } = useHttp();
      try {
        enableUrl.value = `/patent-corp_api/corp-staffs/${row.id}/status?enable=${row.isEnable}`;
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

    const submitForm = async () => {
      pagination.value.offset = 0;
      await fetchList();
    };

    const handleSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        await fetchList();
      }
    };

    const handleAddOrEditStaff = (row) => {
      if (row) {
        state.staffInfo = row;
        state.editStaff = true;
      } else {
        state.staffInfo = null;
        state.editStaff = false;
      }
      state.dialogStaff = true;
    };

    const handleAccountSetting = (row) => {
      state.staffInfo = row;
      state.dialogSettingAccount = true;
    };

    const resetForm = async () => {
      pagination.value.offset = 0;
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
      handleSuccess,
      changeIsEnable,
      handleAddOrEditStaff,
      handleAccountSetting,
    };
  },
});
</script>
<style lang="scss" scoped>
.staff-list {
  margin-left: 20px;
  width: 98%;
}
.list-title {
  padding-bottom: 20px;
  font-weight: 650;
  font-size: 16px;
}
::v-deep {
  .icon-btn{
    color: #016EFF;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: middle;
    cursor:pointer;
  }
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
