<template>
  <div class="dialog-add-fee">
    <el-dialog
      title="选择费用项"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <el-form
        style="margin-top: 20px"
        ref="viewForm"
        label-width="120px"
        v-loading="tableLoading"
      >

        <div class="fee-item-search">
          <panel-table-filter
            v-model="filter"
            :columns="filterColumns"
            @submit="searchForm"
            btnSize="small"
            label-width="20px"
          />
        </div>

        <div class="fee-table">
          <table-paging
            :data="feeNameList"
            :pagination="pagination"
            @page-change="handlePageChange"
            :header-cell-style="{ 'background-color': '#fafafa' }"
            ref="tableRef"
            @select="handleSelect"
            row-key="id"
          >
            <el-table-column
              type="selection"
              width="55"
              :selectable="enableCheckbox"
            >
            </el-table-column>
            <el-table-column
              prop="category"
              label="费用类目"
              :show-overflow-tooltip="true"
              min-width="150"
            />
            <el-table-column
              prop="feeName"
              label="费用名称"
              :show-overflow-tooltip="true"
              min-width="150"
            />
            <el-table-column
              prop="feeType"
              label="费用类型"
              :show-overflow-tooltip="true"
              min-width="80"
              :formatter="setTableData"
            />
          </table-paging>
        </div>
      </el-form>
      <!-- selectedFeeItems -->
      <div>
        已选择：
        <el-tag
          v-for="feeItem in selectedTags"
          :key="feeItem.id"
          @close="handleTagClose(feeItem.id)"
          closable
        >
          {{feeItem.name}}
        </el-tag>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {
  toRefs,
  computed,
  reactive,
  ref,
  watch,
  defineComponent,
  onMounted,
} from '@vue/composition-api';
import {
  useConfigCostInject,
  useLookupsInject,
  useRegionsInject,
} from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TablePaging from '@/components/table-paging.vue';
import useUrlParams from '@/hooks/url-params';

const initfilter = {
  category: '',
  feeType: null,
  isList: true,
};

export default defineComponent({
  name: 'DialogSetFeeItem',
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    node: Object,
    card: Object,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    PanelTableFilter,
    TablePaging,
  },
  setup(props, context) {
    const { emit } = context;
    const { getRegionName } = useRegionsInject();
    const { processId } = useUrlParams(context);
    const { getTypeName } = useLookupsInject();
    const tableRef = ref(null);
    const viewForm = ref();
    const selectedTags = ref(props?.card?.feeItems || []);
    const state = reactive({
      multipleSelection: [],
      multipleSelected: [],
      filter: {
        // applicationType: null,
        // patentType: null,
        // regionCode: '',
        category: '',
        feeType: null,
        isList: true,
      },
      filterColumns: [
        {
          dataIndex: 'category',
          type: 'input',
          label: '',
          placeholder: '费用类目',
        },
        {
          dataIndex: 'feeType',
          type: 'select|FEE_TYPE',
          label: '',
          placeholder: '费用类型',
        },
        {
          dataIndex: 'isList',
          type: '',
          label: '',
          placeholder: '',
        },
      ],
      domainLoading: false,
      submitLoading: false,
      staffOptions: [],
      groupOptions: [],
      agencyOptions: [],
    });

    // 费用列表
    const {
      options,
      loading: tableLoading,
      data: feeNameList,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/fee-name-list');
    pagination.value.limit = 10;
    const { curProcess } = useConfigCostInject();

    options.query = computed(() => {
      let processInfo = {};
      if (curProcess.value !== null) {
        const {
          patentTypeIds,
          regionCodes,
          applicationType,
        } = curProcess.value;
        processInfo = {
          patentType: patentTypeIds ? patentTypeIds.join(',') : '',
          regionCode: regionCodes ? regionCodes.join(',') : '',
          applicationType: String(applicationType),
        };
      }
      return { ...state.filter, ...processInfo };
    });

    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });

    onMounted(async () => {
      await fetchList();
    });

    const searchForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };

    function getNameByIds(ids) {
      const name = (ids || []).map(item => getTypeName(item)).join('; ');
      return name;
    }
    const enableCheckbox = (row) => {
      if (row.isEnable === false) {
        return false;
      }
      return true;
    };

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
        case '费用类型':
          return row.feeType !== null ? getTypeName(row.feeType) : '无';
        default:
          return '';
      }
    }

    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          state.filter = { ...state.filter, ...initfilter };
          await searchForm();
        }
      },
    );
    // 当table数据或选择的tag变化时，重新设定已选 checkbox
    watch([feeNameList, selectedTags], ([curFeeItemList, curSelectedTags]) => {
      setCheckbox(curFeeItemList, curSelectedTags);
    });

    // 设定已选 checkbox
    function setCheckbox(feeItemList, selectedFeeItems) {
      if (tableRef.value) {
        const selectedRows = feeItemList.filter(row => selectedFeeItems?.some(feeItem => feeItem.id === row.id));
        tableRef.value.$refs.table.clearSelection();
        selectedRows.forEach((row) => {
          tableRef.value.$refs.table.toggleRowSelection(row, true);
        });
      }
    }
    // 删除当前选择tag
    function handleTagClose(feeItemId) {
      selectedTags.value = selectedTags.value.filter(tag => tag.id !== feeItemId);
    }

    const handleClose = () => {
      if (viewForm.value) {
        viewForm.value.resetFields();
      }
    };
    /**
     * 用户选择且已选中无，则加入。用户取消选择且已选中有，则移除。
     * selection 当前分页已选feeItem
     * row 用户点击行
     */
    function handleSelect(selection, row) {
      const isChecked = selection.some(item => item.id === row.id);
      const hasFeeItem = selectedTags.value.some(tag => tag.id === row.id);
      if (isChecked && !hasFeeItem) {
        selectedTags.value.push({ id: row.id, name: row.feeName });
      }
      if (!isChecked && hasFeeItem) {
        selectedTags.value = selectedTags.value.filter(tag => tag.id !== row.id);
      }
    }

    const { setFeeItemsState, setFeeItems } = useConfigCostInject();
    const handleSubmit = async () => {
      const { stepClaimsType, processStageId, id } = props.node;
      const { estimationType } = props.card;
      const updateData = {
        stepClaimsType,
        processId: processId.value,
        processStageId,
        nodeId: id,
        estimationType,
        feeItemIds: selectedTags.value.map(items => items.id),
      };
      await setFeeItems(updateData);
      if (setFeeItemsState.error !== null) {
        return;
      }
      emit('success');
      dialogVisible.value = false;
    };

    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSubmit,
      handleClose,
      searchForm,
      tableLoading,
      feeNameList,
      pagination,
      handlePageChange,
      getRegionName,
      setTableData,
      getTypeName,
      handleSelect,
      enableCheckbox,
      curProcess,
      tableRef,
      selectedTags,
      handleTagClose,
    };
  },
});
</script>

<style lang="scss" scoped>
::v-deep {
  .el-table__header-wrapper {
    .el-checkbox__inner {
      display: none;
    }
  }
  .filter-wrapper {
    display: flex;
    justify-content: flex-end;
  }
  .panel-table-filter .filter-wrapper .filter-item.form-btn-group {
    flex-grow: 0;
  }
}
.agency-fee-serch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 20px;
  margin-bottom: 10px;
}
.button-agency {
  width: 67px;
  height: 32px;
  border-radius: 3px;
  padding: 9px;
}
.fee-cass::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
.fee-item-search {
  margin-bottom: 10px;
}
</style>
