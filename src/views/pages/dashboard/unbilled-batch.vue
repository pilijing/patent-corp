<template>
  <div class="unbilled-batch">
    <div class="unbilled-page-card">
      <panel-table-filter
        v-model="filter"
        :columns="filterColumns"
        label-width="100px"
        @submit="submitForm"
        @reset="resetForm"
      />
    </div>
    <div class="unbilled-page-card">
      <div style="margin:20px 0">
        <el-button
          type="primary"
          class="add-btn"
          size="small"
          @click="dialogNewBatch = true"
          style="width: auto;"
        >新建批次</el-button>
        <el-button
          type="primary"
          class="add-btn"
          size="small"
          style="width: auto;"
          @click="bindProcess"
          :disabled="multipleSelection.length === 0"
        >发起处理</el-button>
      </div>
      <div class="unbilled-table">
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
            :selectable="(row) => row.outAccountState ===  8301 || row.outAccountState ===  8303"
          >
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="lawFirmName"
            label="代理机构"
          >
            <template #default="{ row }">
              {{row.lawFirmName}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="region"
            label="国家/地区"
          >
            <template #default="{ row }">
              {{getRegionName(row.region)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="number"
            label="批次号"
          />
          <el-table-column
            show-overflow-tooltip
            prop="subPeriod"
            label="提交期间"
          />
          <el-table-column
            show-overflow-tooltip
            prop="outAccountState"
            label="批次状态"
          >
            <template #default="{ row }">
              {{getTypeName(row.outAccountState)}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="total"
            label="账单总数"
          >
            <template #default="{ row }">
              <el-button
                type="text"
                @click.native="bindBillTotal(row)"
                :disabled="row.total === 0"
              >
                {{row.total}}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button
                type="text"
                target="_blank"
                :disabled="row.total === 0"
                @click.native="bindBillDowinload(row)"
              >
                下载账单
              </el-button>
              <el-button
                type="text"
                :disabled="row.outAccountState === 8301"
                class="bill-upload"
                @click.native="bindBillUpload(row)"
              >
                上传账单
              </el-button>
            </template>
          </el-table-column>
        </table-paging>
      </div>
    </div>
    <dialog-new-batch
      :visible.sync="dialogNewBatch"
      @success="fetchList"
    />
    <dialog-bill-upload
      :visible.sync="dialogBillUpload"
      @success="fetchList"
      :batchId="batchId"
    />
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
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import { useLookupsInject, useRegionsInject } from '@/context';

export default defineComponent({
  name: 'unbilled-batch',
  components: {
    // 指定批次
    DialogNewBatch: () => import('./blocks/dialog-new-batch.vue'),
    // 上传账单
    DialogBillUpload: () => import('./blocks/dialog-bill-upload.vue'),
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
  },
  setup(props, context) {
    const { $message, $confirm } = context.root;
    const { getTypeName } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const state = reactive({
      batchId: null,
      dialogNewBatch: false,
      dialogBillUpload: false,
      filter: {
        lawFirmId: null, // 代理机构
        region: '', // 国家/地区
        state: '', // 批次状态
      },
      filterColumns: [
        {
          dataIndex: 'lawFirmId',
          type: 'search',
          api: '/patent-corp_api/law-firms',
          label: '代理机构',
          labelKey: 'lawFirmName',
          valueKey: 'id',
          queryKey: 'key',
          placeholder: '',
        },
        {
          dataIndex: 'region',
          type: 'region',
          label: '国家/地区',
          // placeholder: '',
        },
        {
          dataIndex: 'state',
          type: 'select|BILLING_STATE',
          label: '批次状态',
          placeholder: '',
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
    } = usePagingData('/patent-corp_api/bill-batch');
    options.query = computed(() => state.filter);
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };

    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      await fetchList();
    };
    const bindBillTotal = (row) => {
      context.emit('bill-total', row);
    };
    const bindBillUpload = (row) => {
      state.batchId = row.id;
      state.dialogBillUpload = true;
    };
    const bindBillDowinload = (row) => {
      const url = `/patent-corp_api/bills-download?batchId=${row.id}`;
      const date = utils.dateFormat(new Date());
      const fileName = `账单 ${date}`;
      utils
        .getBlob(url, true)
        .then((blob) => {
          utils.saveAs(blob, `${fileName}.xlsx`);
        })
        .catch((err) => {
          $message.error(err.response.data);
        });
    };
    const multipleSelection = ref([]);
    const handleSelectionChange = (val) => {
      multipleSelection.value = val;
    };
    // 发起处理
    const bindProcess = async () => {
      $confirm('是否要发起处理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const { putData } = useHttp('/patent-corp_api/batch/process');
            await putData({
              batchIds: multipleSelection.value.map(e => e.id),
            });
            $message.success('操作成功');
            fetchList();
          } catch (error) {
            if (error.response) {
              $message.error(error.response.data);
            } else {
              $message.error('操作失败');
            }
          }
        })
        .catch(() => {
          //
        });
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
      handleSelectionChange,
      multipleSelection,
      fetchList,
      submitForm,
      resetForm,
      utils,
      bindBillTotal,
      bindBillUpload,
      bindBillDowinload,
      bindProcess,
      // 字段转义
      getTypeName,
      getRegionName,
    };
  },
});
</script>
<style lang="scss">
// .unbilled-batch {
//   .bill-upload {
//     margin: 0 10px;
//   }
// }
</style>
