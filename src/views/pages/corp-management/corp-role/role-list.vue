<template>
  <div>
    <div class="role-list" style="text-align:left;" >
      <page-card>
        <el-button
          type="primary"
          class="add-btn"
          size="medium"
          icon="el-icon-plus"
          style="min-width:63px;"
          @click="handleAddOrEditRole()"
          >新增
        </el-button>
        <div style="margin: 12px">
          <el-table
            v-loading="tableLoading"
            :data="innerTableData"
            :header-cell-style="{ 'background-color': '#fafafa' }"
          >
            <el-table-column
              prop="roleCode"
              label="角色代码"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="roleName"
              label="角色名称"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="description"
              label="描述"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <i
                @click="handleAddOrEditRole(row)"
                class="el-icon-edit-outline icon-btn"
              />
              <i
                @click="handleDeleteRole(row)"
                title="删除"
                class="el-icon-delete icon-btn onhand-show"
              />
              <i
                @click="handleSettingAuth(row)"
                title="权限设置"
                class="el-icon-setting icon-btn onhand-show"
              />
            </template>
            </el-table-column>
          </el-table>
        </div>
      </page-card>
      <dialog-role
        :visible.sync="dialogRole"
        :role-info="roleInfo"
        :edit-role="editRole"
        @success="handleSuccess"
      />
      <dialog-setting-auth
        :visible.sync="dialogSettingAuth"
        :role-id="roleId"
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
import { useHttp } from '@/hooks/http';
import DialogRole from './dialog-role.vue';
import DialogSettingAuth from './dialog-setting-auth.vue';

export default defineComponent({
  name: 'RoleList',
  props: {
    isFromDetail: Boolean,
  },
  components: {
    PageCard,
    DialogRole,
    DialogSettingAuth,
  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const state = reactive({
      roleInfo: null,
      editRole: false,
      dialogRole: false,
      roleId: null,
      dialogSettingAuth: false,
    });

    const {
      loading: tableLoading,
      data: innerTableData,
      fetchData: fetchList,
    } = useHttp('/patent-corp_api/roles');

    const submitForm = async () => {
      await fetchList();
    };

    const handleSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        await fetchList();
      }
    };

    const handleAddOrEditRole = (row) => {
      if (row) {
        state.roleInfo = row;
        state.editRole = true;
      } else {
        state.roleInfo = null;
        state.editRole = false;
      }
      state.dialogRole = true;
    };

    const handleDeleteRole = (row) => {
      const {
        deleteData,
      } = useHttp(`/patent-corp_api/roles/${row.roleId}`);
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await deleteData();
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
    const handleSettingAuth = (row) => {
      state.roleId = row.roleId;
      state.dialogSettingAuth = true;
    };

    onMounted(async () => {
      await fetchList();
    });

    return {
      ...toRefs(state),
      tableLoading,
      innerTableData,
      fetchList,
      submitForm,
      handleSuccess,
      handleAddOrEditRole,
      handleDeleteRole,
      handleSettingAuth,
    };
  },
});
</script>
<style lang="scss" scoped>
.role-list {
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
