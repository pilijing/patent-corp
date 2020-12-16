<template>
  <div class="bill-check">
    <div style="margin: 20px 0;">
      <span style="margin-right:10px">审批状态</span>
      <el-radio-group
        size="small"
        v-model="approvalState"
      >
        <el-radio-button
          v-for="item in validList"
          :label="item.id"
          border
          :key="item.id"
          @click.native.prevent="handleClick(item.id)"
        >
          {{item.name}}
        </el-radio-button>
      </el-radio-group>
      <el-button
        type="primary"
        size="small"
        @click="submitForm"
        class="search-btn"
      >查询</el-button>
      <el-button
        size="small"
        @click="resetForm"
        class="search-btn"
      >重置</el-button>
    </div>
    <div class="btn-list">
      <el-button
        type="primary"
        size="small"
        style="width: auto;"
        :disabled="listData.length === 0"
        @click="pass"
      >通过</el-button>
      <el-button
        type="danger"
        size="small"
        :disabled="listData.length === 0"
        @click="dialogShow = true"
        style="width: auto;"
      >驳回</el-button>
    </div>
    <div class="batch-bill-table">
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
          :selectable="(row) => row.approvalState !==  9002"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="createdAtUtc"
          width="100"
          label="发起时间"
        >
          <template #default="{ row }">
            {{utils.dateFormat(row.createdAtUtc)}}
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="lawFirmNumber"
          label="代理所总数"
        />
        <el-table-column
          show-overflow-tooltip
          prop="sumFee"
          label="费用总额"
        >
          <template #default="{ row }">
            <span> {{row.sumFee}} </span>
            <span>{{currencyList[row.currency]}}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="officialFee"
          label="官费总额"
        >
          <template #default="{ row }">
            <span> {{row.officialFee}} </span>
            <span>{{currencyList[row.officialFeeUnit]}}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="agencyFee"
          label="本所代理费总额 "
        >
          <template #default="{ row }">
            <span> {{row.agencyFee}} </span>
            <span>{{currencyList[row.agencyFeeUnit]}}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="foreignAgencyFee"
          label="外所代理费总额"
        >
          <template #default="{ row }">
            <span> {{row.foreignAgencyFee}} </span>
            <span>{{currencyList[row.foreignAgencyFeeUnit]}}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="approvalState"
          label="审批状态"
        >
          <template #default="{ row }">
            <span>{{getTypeName(row.approvalState)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template #default="{ row  }">
            <el-button
              type="text"
              @click="seeDetails(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </table-paging>
    </div>
    <dialog-turn-down
      v-if="dialogShow"
      :visible.sync="dialogShow"
      :list-data="listData"
      @success="handleBatchBillSuccess"
    ></dialog-turn-down>
    <drawer-apprival-detail
      v-if="drawerShow"
      :visible.sync="drawerShow"
      :drawer-detail="drawerDetail"
      @success="handleBatchBillSuccess"
    ></drawer-apprival-detail>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import { usePagingData } from '@/hooks/pagination';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import TablePaging from '@/components/table-paging.vue';
import TooltipPatentNumber from '@/components/tooltip-patent-number.vue';
import DialogTurnDown from './blocks/dialog-turn-down.vue';
import DrawerApprivalDetail from './blocks/drawer-apprival-detail.vue';

export default defineComponent({
  name: 'ApprovalList',
  components: {
    TablePaging,
    TooltipPatentNumber,
    DialogTurnDown,
    DrawerApprivalDetail,
  },
  setup(_, context) {
    const {
      sortLookups,
      getTypeName,
      getCodeInfo,
      getEnumsInfo,
    } = useLookupsInject();
    const { $message, $confirm } = context.root;
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    const applyTypeList = computed(() => sortLookups.value.PAYMENT_APPROVAL_STATE);
    const statusList = computed(() => getEnumsInfo('PAYMENT_APPROVAL_STATE'));
    const state = reactive({
      listData: [],
      dialogShow: false,
      drawerShow: false,
      drawerDetail: null,
      approvalState: null,
      validList: applyTypeList,
    });
    const {
      options,
      loading: tableLoading,
      data: innerTableData,
      fetchList,
      pagination,
      handlePageChange,
    } = usePagingData('/patent-corp_api/payment-approvals');
    options.query = computed(() => ({
      approvalState: state.approvalState,
    }));
    const resetForm = async () => {
      pagination.value.offset = 0; // 重置查询条件需要重置页面
      state.approvalState = null;
      await fetchList();
    };
    const submitForm = async () => {
      pagination.value.offset = 0; // 搜索需要重置页面
      await fetchList();
    };
    const handleSelectionChange = (val) => {
      state.listData = val;
    };
    const handleClick = (val) => {
      state.approvalState = val;
    };
    const seeDetails = (val) => {
      state.drawerDetail = val;
      state.drawerShow = true;
    };
    const handleBatchBillSuccess = async (val) => {
      if (val) {
        $message.success('操作成功!');
        await fetchList();
      }
    };
    const pass = async () => {
      if (state.listData) {
        const paymentApprovalIds = state.listData.map(item => item.id);
        const params = {
          paymentApprovalIds,
          state: statusList.value.COMPLETE,
          // remark: '',
        };
        const { putData: putCheck } = useHttp('/patent-corp_api/payment-packages/approval');
        $confirm('确认通过?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          try {
            await putCheck(params);
            $message.success('通过成功!');
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
    };
    onMounted(async () => {
      await fetchList();
    });
    return {
      ...toRefs(state),
      resetForm,
      submitForm,
      pass,
      handlePageChange,
      innerTableData,
      handleSelectionChange,
      tableLoading,
      pagination,
      utils,
      currencyList,
      getTypeName,
      handleClick,
      seeDetails,
      handleBatchBillSuccess,
    };
  },
});
</script>
<style lang="scss" scoped>
.batch-bill-table {
  width: 98%;
  width: calc(100vw - 284px);
}
.search-btn {
  border-radius: 3px;
  margin-left: 20px;
}
.btn-list {
  margin: 20px 0 10px 0;
}
</style>
