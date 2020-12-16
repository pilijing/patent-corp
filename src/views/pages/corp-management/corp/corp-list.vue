<template>
  <div>
    <div class="corp-list" style="text-align:left;" >
      <page-card>
        <el-button
          type="primary"
          class="add-btn"
          size="medium"
          icon="el-icon-plus"
          @click="handleAddOrEditCorp()"
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
              label="名称"
              :show-overflow-tooltip="true"
            >
              <template #default="{ row }">
                <router-link
                  :to="{ path: '/corp-management/corp-detail',
                  query: {id: row.id}}">{{ row.name}}</router-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="englishName"
              label="英文名称"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="licenseCode"
              label="机构代码"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="clientId"
              label="企业ID"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="contactName"
              label="联系人"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="contactEmail"
              label="联系人邮箱"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="contactMobile"
              label="联系人电话"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-switch class="switchStyle"
                v-model="row.isEnable"
                active-text="启用"
                inactive-text="禁用"
                @change="changeIsEnable(row)">
              </el-switch>
              <i
                @click="handleAddOrEditCorp(row)"
                class="el-icon-edit-outline icon-btn"
              />
              <i
                @click="handleSettingAuth(row)"
                title="权限设置"
                class="el-icon-setting icon-btn onhand-show"
              />
            </template>
            </el-table-column>
          </table-paging>
        </div>
      </page-card>
      <dialog-corp
        :visible.sync="dialogCorp"
        :corp-info="corpInfo"
        :edit-corp="editCorp"
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
  onMounted,
} from '@vue/composition-api';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import { useHttp } from '@/hooks/http';
import DialogCorp from './dialog-corp.vue';

export default defineComponent({
  name: 'CorpList',
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    TooltipPatentNumber,
    DialogCorp,
  },
  setup(_, context) {
    const { $router, $message } = context.root;
    const state = reactive({
      filter: {
      },
      filterColumns: [
      ],
      corpInfo: null,
      editCorp: false,
      dialogCorp: false,
    });
    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/corps');

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

    const changeIsEnable = async (row) => {
      const { url: changeEnableUrl, putData: putIsEnableData } = useHttp();
      try {
        const isEnabled = row.isEnable ?? false;
        changeEnableUrl.value = `/patent-corp_api/corps/${row.id}/status?corpId=${row.id}&isEnable=${isEnabled}`;
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

    const handleAddOrEditCorp = (row) => {
      if (row) {
        state.corpInfo = row;
        state.editCorp = true;
      } else {
        state.corpInfo = null;
        state.editCorp = false;
      }
      state.dialogCorp = true;
    };

    const resetForm = async () => {
      pagination.value.offset = 0;
      await fetchList();
    };
    onMounted(async () => {
      await fetchList();
    });

    const handleSettingAuth = (row) => {
      $router.push(`/corp-management/auth-add?objectId=${row.id}`);
    };
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
      handleAddOrEditCorp,
      handleSettingAuth,
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
.corp-list {
  margin-left: 20px;
  width: 98%;
  .icon-btn{
    color: #016EFF;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: middle;
    cursor:pointer;
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
