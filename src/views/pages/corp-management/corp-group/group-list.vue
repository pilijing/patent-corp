<template>
  <div>
    <div :class="(!isFromDetail ? 'group-list' : '')" style="text-align:left;" >
      <page-card>
        <el-button
          type="primary"
          class="add-btn"
          size="medium"
          icon="el-icon-plus"
          @click="handleAddOrEditGroup()"
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
            />
            <el-table-column
              prop="orgPath"
              label="组织路径"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="leaderName"
              label="组织负责人"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <i
                @click="handleAddOrEditGroup(row)"
                class="el-icon-edit-outline icon-btn"
              />
              <i @click="handleDelete(row)" title="删除" class="el-icon-delete icon-btn onhand-show" />
            </template>
            </el-table-column>
          </table-paging>
        </div>
      </page-card>
      <dialog-group
        :visible.sync="dialogGroup"
        :group-info="groupInfo"
        :edit-group="editGroup"
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
// eslint-disable-next-line import/no-unresolved
import { useUserInfo } from '@/context';
import { useHttp } from '@/hooks/http';
import DialogGroup from './dialog-group.vue';

export default defineComponent({
  name: 'CorpGroupList',
  props: {
    isFromDetail: Boolean,
  },
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    DialogGroup,
  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const state = reactive({
      filter: {
      },
      filterColumns: [
      ],
      groupInfo: null,
      editGroup: false,
      dialogGroup: false,
      dialogSettingAccount: false,
    });
    const {
      userInfo,
    } = useUserInfo();

    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/corp-groups');
    options.query = computed(() => ({
      ...state.filter,
      corpId: userInfo.value.corpId,
      name: '',
    }));
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

    const handleDelete = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/corp-groups/${row.id}/${userInfo.value.corpId}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await deleteData(row.id);
          $message.success('删除成功!');
          await fetchList();
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };

    const handleAddOrEditGroup = (row) => {
      if (row) {
        state.groupInfo = row;
        state.editGroup = true;
      } else {
        state.groupInfo = null;
        state.editGroup = false;
      }
      state.dialogGroup = true;
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
      handleAddOrEditGroup,
      handleDelete,
    };
  },
});
</script>
<style lang="scss" scoped>
.group-list {
  margin-left: 20px;
  width: 98%;
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
