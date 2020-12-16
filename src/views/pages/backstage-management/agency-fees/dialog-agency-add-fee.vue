<template>
  <div class="dialog-add-fee">
    <el-dialog
      title="新增代理费配置"
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
        :model="formData"
        ref="viewForm"
        label-width="65px"
        :rules="validateRules"
      >
        <el-form-item label="代理所" prop="lawFirmId">
          <panel-select-search
            v-model="formData.lawFirmId"
            placeholder="请输入代理所"
            maxlength="50"
            api="/patent-corp_api/law-firms"
            query-key="key"
            label-key="lawFirmName"
            value-key="id"
            :default-options="agencyOptions"
            :disabled="isAgency"
            @change="handleChangelawFirm"
          />
        </el-form-item>
        <div class="agency-fee-serch">
          <span style="width:75px;" class="fee-cass">费用名称</span>
          <!-- <p class="rules-title">
            <span style="width:150px;" class="blue-border"></span>选择费用项目
          </p> -->
          <panel-table-filter
            v-model="filter"
            :columns="filterColumns"
            @submit="searchForm"
            btnSize="small"
            :cols="5"
            label-width="20px"
          />
        </div>

        <div class="fee-table">
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
                  @select="handleSelectChange"
                >
                  <el-table-column
                    type="selection"
                    :disabled="true"
                    :selectable="checkboxSelect"
                    width="55"
                  >
                  </el-table-column>
                  <el-table-column
                    :show-overflow-tooltip="true"
                    prop="name"
                    label="费用名称"
                    width="180"
                  >
                  </el-table-column>

                  <el-table-column prop="feeRules" label="收费规则">
                    <template #default="{row}">
                      {{ row.feeRules ? row.feeRules : "--" }}
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="国家/地区" :show-overflow-tooltip="true" min-width="100">
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
            <el-table-column prop="phase"
label="阶段"
:show-overflow-tooltip="true"
min-width="90">
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
              <template #default="{row}">
                {{ row.feeItemNum ? row.feeItemNum : "0" }}
              </template>
            </el-table-column>
          </table-paging>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" v-loading="submitLoading" @click="handleSubmit">确 定</el-button>
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
import { useLookupsInject, useRegionsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import TablePaging from '@/components/table-paging.vue';
import Vue from 'vue';

const initformData = {
  id: null,
  agencyOptions: [],
  lawFirmId: null,
};
const initfilter = {
  regionCode: '',
  applicationType: null,
  patentType: null,
};
export default defineComponent({
  name: 'DialogAgent',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    agentInfo: Object || null,
    editAgent: Boolean,
    isAgency: {
      type: Boolean,
      default: false,
    },
    agencyOption: Array,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    PanelTableFilter,
    TablePaging,
  },
  setup(props, context) {
    const { getRegionName } = useRegionsInject();
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const { getTypeName } = useLookupsInject();
    const state = reactive({
      feeItemData: {},
      multipleSelection: [],
      multipleSelected: [],
      formData: {
        agencyOptions: [],
        lawFirmId: null,
      },
      filter: {
        regionCode: '',
        applicationType: null,
        patentType: null,
      },
      filterColumns: [
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '',
          placeholder: '所属国家/地区',
        },
        {
          dataIndex: 'applicationType',
          type: 'select|APPLY_TYPE',
          label: '',
          placeholder: '申请类型',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '',
          placeholder: '专利类型',
        },
      ],
      domainLoading: false,

      validateRules: {
        lawFirmId: [{ required: true, message: '请选择代理所' }],
      },
      staffOptions: [],
      groupOptions: [],
      agencyOptions: [],
    });
    // 费用列表
    const {
      options,
      loading: tableLoading,
      data: agencyFeeList,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/agency-fee-category/list');
    pagination.value.limit = 10;
    options.query = computed(() => state.filter);
    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const searchForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const checkboxSelect = (row) => {
      if (row.isEnable === true) {
        return false; // 禁用
      }
      return true; // 不禁用
    };
    const { loading: submitLoading, url: submitUrl, postData: postAgencyFeee } = useHttp();
    const handleChangelawFirm = () => {
      fetchList();
    };
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
          };

          let postIds = [];
          state.multipleSelected.forEach((p) => {
            if (p !== null && p.length > 0) {
              postIds = postIds.concat(p);
            }
          });
          params.feeItemIds = postIds;
          submitUrl.value = '/patent-corp_api/agency-fee';
          await postAgencyFeee(params);
          emit('success', true);
          dialogVisible.value = false;
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
    const {
      fetchData: getFeeItemList,
      loading: loadingFeeItemList,
      url: feeItemListUrl,
    } = useHttp();
    const handleExpandChange = async (row) => {
      feeItemListUrl.value = `${'/patent-corp_api/agency-fee-category/fee-item-list?'
        + 'feeCategoryId='}${row.id}&lawFirmId=${state.formData.lawFirmId}`;
      const result = await getFeeItemList();
      Vue.set(state.feeItemData, `${row.id}`, result);
    };
    const handleSelectChange = (selection, row) => {
      const ids = [];
      selection.forEach((p) => {
        ids.push(p.id);
      });
      state.multipleSelected[row.feeCategoryId] = ids;
    };

    function getNameByIds(ids) {
      const name = (ids || []).map(item => getTypeName(item)).join('; ');
      return name;
    }
    function setTableData(row, column) {
      switch (column.label) {
        case '申请类型':
          return row.applicationTypeIds !== null ? getNameByIds(row.applicationTypeIds) : '无';
        case '专利类型':
          return row.patentTypeIds !== null ? getNameByIds(row.patentTypeIds) : '无';
        default:
          return '';
      }
    }
    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          state.formData = { ...state.formData, ...initformData };
          state.filter = { ...state.filter, ...initfilter };
          state.multipleSelection = [];
          state.multipleSelected = [];
          searchForm();
        }
      },
    );

    const handleSearchInput = (val) => {
      if (!val) {
        const { formData } = state;
        formData.email = null;
        formData.phone = null;
        formData.staffName = null;
      }
    };
    const handleClose = () => {
      if (viewForm.value) {
        viewForm.value.resetFields();
      }
      state.staffOptions = [];
      state.groupOptions = [];
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSearchInput,
      handleSubmit,
      handleClose,
      submitLoading,
      searchForm,
      tableLoading,
      agencyFeeList,
      pagination,
      handlePageChange,
      getRegionName,
      setTableData,
      handleExpandChange,
      loadingFeeItemList,
      getTypeName,
      handleSelectChange,
      checkboxSelect,
      handleChangelawFirm,
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
  .agency-fee-serch {
    .el-form-item__content {
      margin-left: 10px !important;
    }

    .panel-table-filter .filter-wrapper .filter-item.form-btn-group {
      margin-left: 5px !important;
    }
  }
}
.agency-fee-serch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-left: 20px;
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
.blue-border {
  display: inline-block;
  height: 10px;
  border: 2px solid #016eff;
  margin-right: 10px;
}
</style>
