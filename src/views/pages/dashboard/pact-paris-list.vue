<template>
  <div class="patent-list">
    <page-card>
      <panel-table-filter
        v-model="filter"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
    </page-card>
    <page-card>
        <div style="margin-bottom:20px">
            <el-button
            type="primary"
            size="small"
            :disabled="multipleSelection.length === 0"
            @click.native="dialogSetCountry = true;"
            >
            发起巴黎公约申请
            </el-button>
            </div>
      <div style="margin:12px;">
        <table-paging
          v-loading="tableLoading"
          :data="innerTableData"
          :pagination="pagination"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
          :header-cell-style="{ 'background-color': '#fafafa', }"
        >
        <el-table-column
          type="selection"
          width="55"
        />
          <el-table-column
            prop="patentCaseNumber"
            label="专利案号"
            :show-overflow-tooltip="true"
            width="130"
          >
            <template #default="{ row }">
              <tooltip-patent-number
                v-if="row.applicationType && row.applicationType !== applyType.DIRECTPCTINTL"
                :apply-type="row.applicationType">
                <router-link
                :to="{ path: '/dashboard/patent-detail',
                query: {id: row.id}}">{{ row.patentCaseNumber || '暂无' }}</router-link>
              </tooltip-patent-number>
              <router-link
                v-else
                :to="{ path: '/dashboard/patent-detail',
                query: {id: row.id}}">{{ row.patentCaseNumber || '暂无' }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="patentName"
            label="专利名称"
            :show-overflow-tooltip="true"
            min-width="200"
          />
          <el-table-column
            prop="patentTypeName"
            label="专利类型"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="regionName"
            label="申请国家"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="currentStageName"
            label="当前阶段"
            :show-overflow-tooltip="true"
          />
        </table-paging>
      </div>
    </page-card>
    <el-dialog
      title="发起巴黎公约申请"
      :visible.sync="dialogSetCountry"
      @close="resetFormModel"
    >
    <el-form :model="formData"
               ref="viewForm"
               :rules="validateRules"
               label-width="120px">
        <el-form-item
          label="国家"
          prop="regions"
        >
            <selector-country
            multiple
            autocomplete="new-password"
            v-model="formData.regions"
            style="width: 100%;"
          />
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogSetCountry = false">取 消</el-button>
        <el-button type="primary"
                   :loading="submitLoading"
                   @click="pactParisApplication">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  reactive, toRefs, computed, onMounted, ref,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PageCard from '@/components/page-card.vue';
import TablePaging from '@/components/table-paging.vue';
import PanelTableFilter from '@/components/panel-table-filter.vue';
import { usePagingData } from '@/hooks/pagination';
import { useHttp } from '@/hooks/http';
import SelectorCountry from '@/components/selector-country.vue';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';

export default {
  name: 'PactParisList',
  components: {
    PageCard, TablePaging, PanelTableFilter, SelectorCountry, TooltipPatentNumber,
  },
  setup(_, context) {
    const {
      getEnumsInfo,
    } = useLookupsInject();
    const applyType = computed(() => getEnumsInfo('APPLY_TYPE'));
    const { $confirm, $message } = context.root;
    const viewForm = ref(null);
    const state = reactive({
      dialogSetCountry: false,
      multipleSelection: [],
      formData: {
        regions: [],
      },
      validateRules: {
        regions: [{ required: true, message: '请输入国家' }],
      },
      filter: {
        patentCaseNumber: '',
        patentName: '',
        patentType: '',
        regionCode: '',
        ppeInCharge: null,
        currentStageName: '',
        currentStepName: '',
        applicationNumber: '',
        applicationDate: [],
        inventorId: null,
      },
      filterColumns: [
        {
          dataIndex: 'patentCaseNumber',
          type: 'input',
          label: '专利案号',
          placeholder: '专利案号',
        },
        {
          dataIndex: 'patentName',
          type: 'input',
          label: '专利名称',
          placeholder: '专利名称',
        },
        {
          dataIndex: 'patentType',
          type: 'select|PATENT_TYPE',
          label: '专利类型',
          placeholder: '专利类型',
        },
        {
          dataIndex: 'regionCode',
          type: 'region',
          label: '申请国家',
          placeholder: '申请国家',
        },
        {
          dataIndex: 'ppeInCharge',
          type: 'search',
          api: '/patent-corp_api/staffs/names/like',
          queryKey: 'name',
          labelKey: 'staffFullName',
          valueKey: 'staffId',
          label: '专利工程师',
          placeholder: '专利工程师',
        },
        {
          dataIndex: 'currentStageName',
          type: 'input',
          label: '当前阶段',
          placeholder: '当前阶段',
        },
        {
          dataIndex: 'currentStepName',
          type: 'input',
          label: '当前步骤',
          placeholder: '当前步骤',
        },
        {
          dataIndex: 'applicationNumber',
          type: 'input',
          label: '申请号',
          placeholder: '申请号',
        },
        {
          dataIndex: 'applicationDate',
          type: 'date',
          label: '申请日期',
          valueFormat: 'yyyy-MM-dd',
        },
        {
          dataIndex: 'inventorId',
          type: 'search',
          api: '/patent-corp_api/inventors',
          label: '第一发明人',
          labelKey: 'fullName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '第一发明人',
          inventorInfo: true,
        },
      ],
    });

    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      pagination,
      handlePageChange,
      fetchList,
    } = usePagingData('/patent-corp_api/application-list');

    options.query = computed(() => ({
      ...state.filter,
      applicationType: applyType.value.PACTPARIS,
    }));

    const {
      postData: pactParisApp,
      loading: submitLoading,
    } = useHttp('/patent-corp_api/patents/paris-convention');

    const resetFormModel = () => {
      viewForm.value.resetFields();
    };

    const handleSelectionChange = (val) => {
      state.multipleSelection = val.map(item => item.id);
    };
    // 发起PCT国际申请
    const pactParisApplication = () => {
      console.info(state.multipleSelection);
      $confirm('是否确认发起巴黎公约申请', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waring',
      }).then(async () => {
        await pactParisApp({
          patentGroups: [{ patentIds: [...state.multipleSelection] }],
          regions: [...state.formData.regions],
        });
        $message.success('发起巴黎公约申请成功！');
        state.dialogSetCountry = false;
        fetchList();
      });
    };

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
    return {
      options,
      tableLoading,
      submitLoading,
      innerTableData,
      pagination,
      handleSelectionChange,
      ...toRefs(state),
      handlePageChange,
      fetchList,
      pactParisApplication,
      submitForm,
      resetForm,
      resetFormModel,
      viewForm,
      applyType,
    };
  },
};
</script>

<style lang="scss" scoped>

</style>
