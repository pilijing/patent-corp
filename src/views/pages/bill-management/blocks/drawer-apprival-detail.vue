<template>
  <el-drawer
    title="账单详情"
    :visible.sync="dialogVisible"
    size="40%"
    :inner="true"
    :mask="false"
    class="drawer-padding"
    :before-close="handleClose"
  >
    <descriptions :label-width="120" :column="5">
      <descriptions-item label="年度预算总额">
        <span>暂无</span>
      </descriptions-item>
    </descriptions>
    <descriptions :label-width="120" :column="5">
      <descriptions-item label="账单期间">
        <span> 暂无 </span>
      </descriptions-item>
    </descriptions>
    <descriptions :label-width="120" :column="5">
      <descriptions-item label="账单总额">
        <span class="color-text"> {{detailData.sumFee? detailData.sumFee : '暂无'}} </span>
        <span v-if="detailData.sumFee" class="color-text">{{currencyList[detailData.currency]}}</span>
      </descriptions-item>
    </descriptions>
    <descriptions :label-width="120" :column="5">
      <descriptions-item label="本所代理费总额">
        <span> {{detailData.agencyFee? detailData.agencyFee : '暂无'}} </span>
        <span v-if="detailData.agencyFee">{{currencyList[detailData.agencyFeeUnit]}}</span>
      </descriptions-item>
    </descriptions>
    <descriptions :label-width="120" :column="5">
      <descriptions-item label="外所代理费总额">
        <span> {{detailData.foreignAgencyFee? detailData.foreignAgencyFee : '暂无'}} </span>
        <span v-if="detailData.foreignAgencyFee">{{currencyList[detailData.foreignAgencyFeeUnit]}}</span>
      </descriptions-item>
    </descriptions>
    <descriptions :label-width="120" :column="5">
      <descriptions-item
        label="代理机构"
      >
        <!-- <span> {{detailData.lawFirmName}} </span> -->
        <span class="domain-item" v-for="(item, index) in detailData.lawFirmName" :key="index">
          {{item}}
        </span>
        <!-- <span>{{currencyList[detailData.foreignAgencyFeeUnit]}}</span> -->
      </descriptions-item>
    </descriptions>
    <div class="co-info">
      <span class="title">费用详情</span>
      <span class="toggle" @click="toggle = !toggle">{{toggle ? '收起' : '展开'}}详情
        <i :class="toggle ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </span>
    </div>
    <div v-if="toggle">

    </div>
  </el-drawer>
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
// import { usePagingData } from '@/hooks/pagination';
// import utils from '@/utils';
// import { useHttp } from '@/hooks/http';
// import Descriptions from '@/components/descriptions.vue';
// import DialogTurnDown from './blocks/dialog-turn-down.vue';

export default defineComponent({
  name: 'DrawerApprivalDetail',
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    drawerDetail: Object,
  },
  components: {
    TablePaging: () => import('@/components/table-paging.vue'),
    PageCard: () => import('@/components/page-card.vue'),
    PanelTableFilter: () => import('@/components/panel-table-filter.vue'),
    TooltipPatentNumber: () => import('@/components/tooltip-patent-number.vue'),
    // Descriptions
    // DialogTurnDown,
  },
  setup(props, context) {
    const { emit } = context;
    // const { $message, $confirm } = context.root;
    const { getCodeInfo } = useLookupsInject();
    // const { getEnumsInfo } = useLookupsInject();
    const currencyList = computed(() => getCodeInfo('CURRENCY'));
    // const stateData = computed(() => getEnumsInfo('STATE'));
    // const statusList = computed(() => getEnumsInfo('BILL_PRIMARY_NUCLEAR_STATE'));
    const state = reactive({
      detailData: {},
      toggle: false,
    });
    // 传入的显示/隐藏状态
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    // const pass = async () => {
    //   if (state.billsDownloadList) {
    //     const billIds = state.billsDownloadList.map(item => item.id);
    //     const params = {
    //       billState: statusList.value.INITIAL_NUCLEAR_PASS,
    //       billIds,
    //       mainState: stateData.value.PRIMARY_NUCLEAR_STATE,
    //       rejectionReason: '',
    //     };
    //     const { putData: putCheck } = useHttp('/patent-corp_api/payment-packages/approval');
    //     $confirm('确认通过?', '提示', {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning',
    //     }).then(async () => {
    //       await putCheck(params);
    //       $message.success('通过成功!');
    //       // await fetchList();
    //     });
    //   }
    // };
    const handleClose = () => {
      dialogVisible.value = false;
    };
    onMounted(async () => {
      state.detailData = props.drawerDetail;
    });
    return {
      ...toRefs(state),
      handleClose,
      dialogVisible,
      currencyList,
    };
  },
});
</script>
<style lang="scss" scoped>
.color-text{
  color: #FF8004;
}
.domain-item{
  display: inline-block;
  font-size: 12px;
  background-color: rgba(242, 242, 242, 1);
  color: #4C4C4C;
  margin-right: 8px;
  text-align: center;
  border-radius: 3px;
  padding: 0 6px;
  height: 24px;
  line-height: 24px;
}
.co-info {
  margin: 22px 0 12px 0;
  display: flex;
  align-items: center;
  .title {
    font-size: 16px;
    color:#333;
    font-weight: 600;
    display: flex;
    align-items: center;
    &::before {
      content: ' ';
      display: inline-block;
      width: 4px;
      height: 18px;
      background: #0079FE;
      margin-right: 10px;
    }
  }
  .toggle {
    font-size: 12px;
    color: #016EFF;
    margin-left: 16px;
    cursor: pointer;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
   :focus{
        outline:0;
    }
    .el-drawer__open .el-drawer.rtl{
      padding: 0 20px;
      overflow: scroll
    }
</style>
