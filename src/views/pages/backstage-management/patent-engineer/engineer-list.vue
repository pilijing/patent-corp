<template>
  <div>
    <div class="list-table">
      <page-card>
        <panel-table-filter
          v-model="filter"
          :columns="filterColumns"
          @submit="submitForm"
          @reset="resetForm"
        />
      </page-card>
      <page-card>
        <el-button
          type="primary"
          icon="el-icon-plus"
          class="add-btn"
          size="medium"
          @click="handleEditEngineer()">新增
        </el-button>
        <table-paging
          v-loading="tableLoading"
          :data="tableDataList"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column prop="staffName" label="姓名" />
          <el-table-column
            prop="groupName"
            label="对接组织"
            show-overflow-tooltip
            min-width="160"
          />
          <!-- <el-table-column prop="email" label="邮箱" /> -->
          <!-- <el-table-column prop="statusName" label="服务状态"></el-table-column> -->
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <!-- <span class="edit-btn" @click="handleStatus(row)">{{row.status === 100 ? '停用' : '启用'}}</span> -->
              <i @click="handleEditEngineer(row)"
                 class="el-icon-edit-outline edit-btn"
              />
              <i @click="handleDeleteEngineer(row)"
                class="el-icon-delete edit-btn"
              />
            </template>
          </el-table-column>
        </table-paging>
      </page-card>
      <dialog-edit-engineer
        :visible.sync="dialogEditEngineer"
        :edit-engineer="editEngineer"
        :engineer-info="engineerInfo"
        @success="handleSuccess"
        />
    </div>
  </div>
</template>

<script>
import {
  computed, onMounted,
  defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import { usePagingData } from '@/hooks/pagination';
import { useHttp } from '@/hooks/http';
import DialogEditEngineer from './dialog-edit-engineer.vue';

export default defineComponent({
  name: 'ListTable',
  components: {
    PanelTableFilter,
    PageCard,
    TablePaging,
    DialogEditEngineer,
  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const state = reactive({
      filter: {
        staffName: '',
        groupId: '',
        // status: '',
      },
      filterColumns: [
        {
          dataIndex: 'staffName',
          type: 'input',
          label: '姓名',
          placeholder: '姓名',
          width: '30%',
        },
        {
          dataIndex: 'groupId',
          type: 'search',
          api: '/patent-corp_api/groups/search',
          queryKey: 'name',
          labelKey: 'orgPath',
          valueKey: 'id',
          label: '对接组织',
          placeholder: '对接组织',
          width: '30%',
        },
        // {
        //   dataIndex: 'status',
        //   type: 'select',
        //   label: '服务状态',
        //   placeholder: '服务状态',
        //   options: [
        //     { name: '在线', id: 100 },
        //     { name: '冻结停用', id: 101 },
        //   ],
        // },
      ],
      dialogEditEngineer: false,
      engineerInfo: null,
      editEngineer: false,
    });

    const {
      options,
      loading: tableLoading,
      data: tableData,
      pagination,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent-corp_api/patent-engineer');

    const tableDataList = computed({
      get() {
        const data = tableData.value || [];
        data.forEach((itemList) => {
          itemList.groupName = (itemList.groupEngineerList || []).map(item => item.groupName).join('；');
        // itemList.statusName = itemList.status === 100 ? '在线' : '冻结停用';
        });
        return data;
      },
      set(newVal) {
        tableData.value = newVal;
      },
    });
    options.query = computed(() => ({
      ...state.filter,
      isList: true,
    }));
    const handleEditEngineer = (row) => {
      if (row) {
        state.engineerInfo = row;
        state.editEngineer = true;
      } else {
        state.engineerInfo = null;
        state.editEngineer = false;
      }
      state.dialogEditEngineer = true;
    };
    const {
      url: deleteEngineerUrl,
      deleteData: deleteEngineer,
    } = useHttp();
    const handleDeleteEngineer = async (row) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          deleteEngineerUrl.value = `/patent-corp_api/patent-engineer/${row.id}`;
          await deleteEngineer();
          tableDataList.value = (tableData.value || []).filter(item => item.id !== row.id);
          $message.success('删除成功');
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

    // 启用/禁用
    // const {
    //   url: submitEngineerUrl,
    //   putData: putEengineer,
    // } = useHttp();
    // const handleStatus = async (row) => {
    //   try {
    //     submitEngineerUrl.value = `/patent-corp_api/patent-engineer/${row.id}/status`;
    //     await putEengineer({ status: row.status === 100 ? 101 : 100 });
    //     await fetchList();
    //   } catch (error) {
    //     console.log('error', error);
    //     if (error.response) {
    //       $message.error(error.response.data);
    //     } else {
    //       $message.error('操作失败');
    //     }
    //   }
    // };

    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    onMounted(async () => {
      await fetchList();
    });
    const handleSuccess = async (val) => {
      if (val) {
        await fetchList();
      }
    };
    return {
      ...toRefs(state),
      submitForm,
      resetForm,
      handlePageChange,
      handleEditEngineer,
      tableLoading,
      pagination,
      tableDataList,
      // handleStatus,
      handleSuccess,
      handleDeleteEngineer,
    };
  },
});
</script>

<style lang="scss" scoped>
.list-table{
  margin-left: 20px;
  width: 98%;
}
.edit-btn {
  color: #016EFF;
  cursor: pointer;
  padding: 0 8px;
  font-size: 18px;
}
</style>
