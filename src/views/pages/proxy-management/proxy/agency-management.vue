<template>
  <div>
    <div class="patent-detail">
      <page-card>
        <panel-table-filter
          v-model="searchData"
          :columns="filterColumns"
          label-width="140px"
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
          @click="addAgency"
        >新增</el-button>
        <table-paging
          v-loading="tableLoading"
          :data="agencyList"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column
            min-width="120"
            :show-overflow-tooltip="true"
            prop="lawFirmName"
            label="代理所名称"
          >
            <template #default="{ row }">
              <router-link :to="{ path: '/proxy-management/agency-detail',
                query: {id: row.id}}">{{ row.lawFirmName }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            width="140"
            :show-overflow-tooltip="true"
            prop="lawFirmShortName"
            label="简称"
          />
          <el-table-column
            min-width="110"
            :show-overflow-tooltip="true"
            label="合作时间"
          >
            <template #default="{ row }">
              <span> {{row.cooperationAtStart}} </span>
              <span> ~ </span>
              <span>{{row.cooperationAtEnd ? row.cooperationAtEnd: '至今'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="120"
            :show-overflow-tooltip="true"
            label="合作类型"
          >
            <template #default="{ row }">
              {{ getTypeName(row.cooperationType) }}
            </template>
          </el-table-column>
          <el-table-column
            width="100"
            :show-overflow-tooltip="true"
            prop="isOverseas"
            label="是否海外所"
          >
            <template #default="{ row }">
              <span>{{row.isOverseas ? '是': '否'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            min-width="90"
            :show-overflow-tooltip="true"
            prop="dockingPeople"
            label="接口人"
          />
          <el-table-column
            min-width="140"
            :show-overflow-tooltip="true"
            prop="domainName"
            label="擅长领域"
          />
          <el-table-column
            width="90"
            :show-overflow-tooltip="true"
            prop="agentNumber"
            label="代理人数量"
          />
          <el-table-column
            label="操作"
            min-width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-switch
                class="switchStyle"
                v-model="row.isEnable"
                active-text="启用"
                inactive-text="禁用"
                @change="changeIsEnable(row)"
              >
              </el-switch>
              <i
                @click="handleEditField(row)"
                class="el-icon-edit-outline icon-btn"
              />
              <i
                @click="handleDeleteField(row)"
                class="el-icon-delete icon-btn"
              />
            </template>
          </el-table-column>
        </table-paging>
      </page-card>
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  computed,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { usePagingData } from '@/hooks/pagination';
import { useLookupsInject } from '@/context';
import PanelSelect from '@/components/panel-select.vue';
import TablePaging from '@/components/table-paging.vue';
import SelectorCountry from '@/components/selector-country.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';

export default defineComponent({
  name: 'AgencyManagement',
  components: {
    useHttp,
    SelectorCountry,
    usePagingData,
    PanelSelect,
    TablePaging,
    PanelTableFilter,
  },
  setup(_, context) {
    const { $message, $router, $confirm } = context.root;
    const state = reactive({
      searchData: {
        name: '',
        regionCode: '',
        cooperationType: '',
        isOverseas: '',
        businessRegionCode: '',
      },
      filterColumns: [
        {
          dataIndex: 'name',
          type: 'input',
          label: '代理所名称',
          placeholder: '代理所名称',
        },
        {
          dataIndex: 'cooperationType',
          type: 'select|LAWFIRM_COOPERATION_AT',
          label: '合作类型',
          placeholder: '合作类型',
        },
        {
          dataIndex: 'isOverseas',
          type: 'select|YES_NO',
          label: '是否海外所',
          placeholder: '是否海外所',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '所属国家/地区',
          placeholder: '所属国家/地区',
        },
        {
          dataIndex: 'businessRegionCode',
          type: 'region',
          label: '业务覆盖国家/地区',
          placeholder: '业务覆盖国家/地区',
        },
      ],
    });
    const {
      options,
      loading: tableLoading,
      data: agencyList,
      pagination,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent-corp_api/law-firms/search');
    const { getTypeName } = useLookupsInject();
    options.query = computed(() => ({
      ...state.searchData,
    }));
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索条件请求
      await fetchList();
    };
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件
      await fetchList();
    };
    const addAgency = async () => {
      // 新增跳转页面页面
      $router.push('/proxy-management/add-agency-information');
    };
    const changeIsEnable = async (row) => {
      const { url: changeEnableUrl, putData: putIsEnableData } = useHttp();
      try {
        changeEnableUrl.value = `/patent-corp_api/law-firms/${row.id}/enable?isEnable=${row.isEnable}`;
        await putIsEnableData({
          lawFirmId: row.id,
          isEnable: row.isEnable,
        });
      } catch (error) {
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    const handleClickSearch = async () => {
      await fetchList();
    };
    const handleEditField = (row) => {
      $router.push(`/proxy-management/edit-agency?lawFirmId=${row.id}`);
    };
    const handleDeleteField = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/law-firms/${row.id}`;
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
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      submitForm,
      resetForm,
      handleClickSearch,
      addAgency,
      tableLoading,
      agencyList,
      pagination,
      fetchList,
      handlePageChange,
      options,
      changeIsEnable,
      handleDeleteField,
      handleEditField,
      getTypeName,
    };
  },
});
</script>
<style lang="scss" scoped>
.page-container .page {
  margin: 0;
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
}
.patent-detail {
  margin-left: 20px;
  width: 98%;
  .icon-btn {
    color: #016EFF;
    margin-left: 7px;
    font-size: 18px;
    vertical-align: middle;
    cursor: pointer;
  }
}
.application-confirmation {
  padding: 20px 20px;
  width: 100%;
}
::v-deep .el-tooltip__popper {
  min-width: 50px;
}
::v-deep .el-switch__label * {
  font-size: 10px;
}
::v-deep .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}
::v-deep .el-switch__label--left {
  z-index: 9;
  left: 6px;
}
::v-deep .el-switch__label--right {
  z-index: 9;
  left: -16px;
}
::v-deep .el-switch__label.is-active {
  display: block;
}
::v-deep .el-switch .el-switch__core,
::v-deep .el-switch .el-switch__label {
  width: 50px !important;
}
</style>
