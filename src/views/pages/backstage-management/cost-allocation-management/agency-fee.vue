<template>
  <div>
    <div style="text-align:left;margin-left: 20px;width: 98%;">
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
          size="small"
          icon="el-icon-plus"
          @click="handleAddOrEditAgencyFee()"
        >新增
        </el-button>
        <div>
          <table-paging
            v-loading="tableLoading"
            :data="agencyFeeList"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa' }"
            @expand-change="handleExpandChange"
            ref="tableRef"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-table
                  v-loading="loadingFeeItemList"
                  :data="feeItemData[`${row.id}`]"
                  style="width: 100%"
                >
                  <el-table-column
                    :show-overflow-tooltip="true"
                    prop="name"
                    label="费用名称"
                  >
                  </el-table-column>
                  <el-table-column
                    :show-overflow-tooltip="true"
                    prop="officialConditionRule"
                    label="官费"
                  />
                  <el-table-column
                    :show-overflow-tooltip="true"
                    prop="ourConditionRule"
                    label="本所代理费"
                  />
                  <el-table-column
                    :show-overflow-tooltip="true"
                    prop="agencyConditionRule"
                    label="外所代理费"
                  />
                  <el-table-column
                    label="操作"
                    width="200"
                    align="center"
                  >
                    <template #default="{ row  }">
                      <el-switch
                        class="switchStyle"
                        v-model="row.isEnable"
                        active-text="启用"
                        inactive-text="禁用"
                        @change="changeIsEnable(row)"
                      >
                      </el-switch>
                      <i
                        title="编辑"
                        class="el-icon-edit-outline icon-btn"
                        @click="handleEditFeeItem(row)"
                      />
                      <i
                        title="删除"
                        class="el-icon-delete icon-btn"
                        @click="handleDeleteFeeItem(row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column
              label="国家/地区"
              :show-overflow-tooltip="true"
              min-width="150"
            >
              <template #default="{ row }">
                {{ getRegionName(row.regionCode) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="applicationTypeIds"
              label="申请类型"
              :show-overflow-tooltip="true"
              min-width="150"
              :formatter="setTableData"
            />
            <el-table-column
              prop="patentTypeIds"
              label="专利类型"
              :show-overflow-tooltip="true"
              min-width="150"
              :formatter="setTableData"
            />
            <el-table-column
              prop="phase"
              label="费用阶段"
              :show-overflow-tooltip="true"
              min-width="130"
            >
              <template #default="{ row }">
                {{ getTypeName(row.phase) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="category"
              label="费用类目"
              :show-overflow-tooltip="true"
              min-width="150"
            />
            <el-table-column
              prop="feeItems"
              label="费用项目"
              :show-overflow-tooltip="true"
              min-width="80"
            >
              <template #default={row}>
                {{row.feeItemNum? row.feeItemNum:'0'}}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                <i
                  title="编辑"
                  @click="handleAddOrEditAgencyFee(row)"
                  class="el-icon-edit-outline icon-btn"
                />
                <i
                  @click="handleDelete(row)"
                  title="删除"
                  class="el-icon-delete icon-btn"
                />
                <i
                  @click="handleAddFeeItem(row)"
                  title="新增费用项目"
                  class="el-icon-circle-plus-outline icon-btn"
                />
              </template>
            </el-table-column>
          </table-paging>
        </div>
      </page-card>
      <dialog-agency-fee
        :visible.sync="isAgencyFeeDialogVisible"
        :is-editing="isEditingAgencyFee"
        :agency-fee-info="agencyFeeInfo"
        @success="handleSuccess"
      />
      <dialog-fee-item
        v-if="isFeeItemDialogVisible"
        :visible.sync="isFeeItemDialogVisible"
        :fee-item-info="feeItemInfo"
        :agency-fee-info="agencyFeeInfo"
        :is-editing="isEditingFeeItem"
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
  ref,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import { useHttp } from '@/hooks/http';
import DialogAgencyFee from './blocks/dialog-agency-fee.vue';
import DialogFeeItem from './blocks/dialog-fee-item.vue';

export default defineComponent({
  name: 'AgencyFee',
  components: {
    PageCard,
    TablePaging,
    PanelTableFilter,
    TooltipPatentNumber,
    DialogAgencyFee,
    DialogFeeItem,
  },
  setup(_, context) {
    const { $message, $confirm, $set } = context.root;
    const { getEnumsInfo, getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      feeItemData: {},
      filter: {
        category: '',
        feeItem: '',
        phase: null,
        applicationType: null,
        patentType: null,
        regionCode: null,
      },
      filterColumns: [
        {
          dataIndex: 'category',
          type: 'input',
          label: '费用类目',
          placeholder: '请输入',
        },
        {
          dataIndex: 'feeItem',
          type: 'input',
          label: '费用名称',
          placeholder: '请输入',
        },
        {
          dataIndex: 'phase',
          type: 'select|FEE_STAGE',
          label: '费用阶段',
          placeholder: '请选择',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '申请类型',
          placeholder: '请选择',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '专利类型',
          placeholder: '请选择',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '国家/地区',
          placeholder: '国家/地区',
        },
      ],
      isAgencyFeeDialogVisible: false,
      agencyFeeInfo: null,
      isEditingAgencyFee: false,
      isEditingFeeItem: false,
      isFeeItemDialogVisible: false,
      feeItemInfo: null,
    });
    const tableData = ref([]);
    const {
      options,
      loading: tableLoading,
      data: agencyFeeList,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/fee-category-list');
    options.query = computed(() => state.filter);
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const handleSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        state.feeItemData = {};
        await fetchList();
      }
    };
    const handleAddOrEditAgencyFee = (row) => {
      if (row) {
        state.agencyFeeInfo = row;
        state.isEditingAgencyFee = true;
      } else {
        state.agencyFeeInfo = null;
        state.isEditingAgencyFee = false;
      }
      state.isAgencyFeeDialogVisible = true;
    };
    const handleDelete = (row) => {
      const { url: deleteUrl, deleteData } = useHttp();
      deleteUrl.value = `/patent-corp_api/fee-category/${row.id}`;
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
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    const {
      fetchData: getFeeItemList,
      loading: loadingFeeItemList,
      url: feeItemListUrl,
    } = useHttp();
    const handleExpandChange = async (row, expandedRows) => {
      // 展开的id数组
      const expandedIds = expandedRows.map(item => item.id);
      if (expandedIds.includes(row.id)) {
        // 关闭不请求且每次展开都要请求
        feeItemListUrl.value = `/patent-corp_api/fee-name-list/${row.id}`;
        const result = await getFeeItemList();
        $set(state.feeItemData, `${row.id}`, result);
      }
    };
    const changeIsEnable = async (row) => {
      const { url: changeEnableUrl, putData: putIsEnableData } = useHttp();
      try {
        changeEnableUrl.value = `${'/patent-corp_api/fee-name-enable/'}${
          row.id
        }?isEnable=${row.isEnable}`;
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
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    function handleDeleteFeeItem(row) {
      const { url, deleteData } = useHttp();
      url.value = `/patent-corp_api/fee-name/${row.id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await deleteData();
          $message.success('删除成功!');
          state.feeItemData = {};
          await fetchList();
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    }
    function handleEditFeeItem(row) {
      state.feeItemInfo = row;
      state.isFeeItemDialogVisible = true;
      state.isEditingFeeItem = true;
    }
    function handleAddFeeItem(agencyFeeInfo) {
      state.agencyFeeInfo = agencyFeeInfo;
      state.feeItemInfo = null;
      state.isFeeItemDialogVisible = true;
      state.isEditingFeeItem = false;
    }
    const tableRef = ref(null);
    onMounted(async () => {
      await fetchList();
    });
    function getNameByIds(ids) {
      const name = (ids || []).map(item => getTypeName(item)).join('; ');
      return name;
    }
    function setTableData(row, column) {
      switch (column.label) {
        case '申请类型':
          return row.applicationTypeIds !== null
            ? getNameByIds(row.applicationTypeIds)
            : '无';
        case '专利类型':
          return row.patentTypeIds !== null
            ? getNameByIds(row.patentTypeIds)
            : '无';
        default:
          return '';
      }
    }
    return {
      ...toRefs(state),
      tableRef,
      loadingFeeItemList,
      handleExpandChange,
      tableData,
      options,
      tableLoading,
      pagination,
      handlePageChange,
      fetchList,
      submitForm,
      resetForm,
      applyTypeList,
      handleAddOrEditAgencyFee,
      handleSuccess,
      handleDelete,
      handleDeleteFeeItem,
      handleEditFeeItem,
      handleAddFeeItem,
      agencyFeeList,
      getRegionName,
      getTypeName,
      setTableData,
      changeIsEnable,
    };
  },
});
</script>
<style lang="scss" scoped>
.icon-btn {
  color: #016eff;
  margin-left: 7px;
  font-size: 18px;
  vertical-align: middle;
  cursor: pointer;
}
.el-icon-question {
  margin-left: 12px;
  font-size: 18px;
  color: #b9b9b9;
  line-height: 25px;
}
.add-btn {
  margin-bottom: 10px;
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
</style>
