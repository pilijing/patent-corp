<template>
  <div>
    <div class="agency-detail">
      <page-card>
        <panel-table-filter
          v-model="filter"
          :columns="filterColumns"
          label-width="120px"
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
          @click="handleAddFee()"
        >新增
        </el-button>
        <table-paging
          v-loading="tableLoading"
          :data="agencyFeeList"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column
            :show-overflow-tooltip="true"
            prop="regionCode"
            label="国家/地区"
          >
            <template #default="{ row }">
              {{ getRegionName(row.regionCode) }}
            </template>
          </el-table-column>
          <el-table-column
            :show-overflow-tooltip="true"
            prop="lawFirmName"
            label="代理所"
          />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="applicationTypeIds"
            label="申请类型"
            :formatter="setTableData"
          />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="patentTypeIds"
            label="专利类型"
            :formatter="setTableData"
          />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="category"
            label="代理费类目"
          />
          <el-table-column
            :show-overflow-tooltip="true"
            prop="feeName"
            label="费用名称"
          />
          <el-table-column
            prop="conditionRule"
            label="收费规则"
            min-width="150"
          >
            <template #default="{row}">
              <span class="rulesText">{{row.conditionRule? row.conditionRule:'无'}}</span>
              <i
                v-if="row.conditionRule"
                title="编辑"
                class="el-icon-edit edit-icon"
                @click="handleEditFeeItem(row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template #default="{ row }">
              <i
                title="删除"
                class="el-icon-delete icon-btn"
                @click="handleDeleteFeeItem(row)"
              />
            </template>
          </el-table-column>
        </table-paging>
      </page-card>
      <dialog-agency-add-fee
        :visible.sync="dialogVisible"
        @success="handleSuccess"
      />
      <dialog-fee
        v-if="isFeeItemDialogVisible"
        :visible.sync="isFeeItemDialogVisible"
        :fee-item-info="feeItemInfo"
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
  ref,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import { useHttp } from '@/hooks/http';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import dialogAgencyAddFee from './dialog-agency-add-fee.vue';
import DialogFee from './blocks/dialog-fee.vue';

export default defineComponent({
  name: 'AgencyFeesList',
  components: {
    PageCard,
    PanelTableFilter,
    TablePaging,
    dialogAgencyAddFee,
    DialogFee,
  },
  setup(_, context) {
    const { $message, $confirm } = context.root;
    const { getEnumsInfo, getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const state = reactive({
      dialogVisible: false,
      isFeeItemDialogVisible: false,
      feeItemInfo: null,
      filter: {
        lawFirmId: null,
        category: '',
        feeItem: '',
        applicationType: null,
        patentType: null,
        regionCode: null,
      },
      filterColumns: [
        {
          dataIndex: 'lawFirmId',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          queryKey: 'key',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          label: '代理所',
          placeholder: '请输入代理所',
        },
        {
          dataIndex: 'category',
          type: 'input',
          label: '代理费类目',
          placeholder: '请输入',
        },
        {
          dataIndex: 'feeItem',
          type: 'input',
          label: '费用名称',
          placeholder: '请输入',
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
    });
    const tableData = ref([]);
    const {
      options,
      loading: tableLoading,
      data: agencyFeeList,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/agency-fee-list');
    options.query = computed(() => state.filter);
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
    const handleSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        state.feeItemData = {};
        await fetchList();
      }
    };
    const handleEditFeeItem = (row) => {
      // 编辑规则
      state.feeItemInfo = row;
      state.isFeeItemDialogVisible = true;
    };
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    function handleDeleteFeeItem(row) {
      const { url, deleteData } = useHttp();
      url.value = `/patent-corp_api/agency-fee/${row.id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteData();
        $message.success('删除成功!');
        state.feeItemData = {};
        await fetchList();
      });
    }
    const handleAddFee = () => {
      state.dialogVisible = true;
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      tableLoading,
      agencyFeeList,
      handlePageChange,
      submitForm,
      resetForm,
      pagination,
      tableData,
      getRegionName,
      applyTypeList,
      handleDeleteFeeItem,
      setTableData,
      getTypeName,
      handleAddFee,
      handleSuccess,
      handleEditFeeItem,
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
.edit-icon {
  cursor: pointer;
  display: inline-block;
  width: 10%;
  vertical-align: super;
}
.agency-detail {
  margin-left: 20px;
  width: 98%;
}
.el-icon-question {
  margin-left: 12px;
  font-size: 18px;
  color: #b9b9b9;
  line-height: 25px;
}
.rulesText {
  display: inline-block;
  width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.add-btn {
  margin-bottom: 10px;
}
</style>
