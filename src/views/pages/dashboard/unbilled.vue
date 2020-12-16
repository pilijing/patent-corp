<template>
  <div>
    <div class="unbilled">
      <page-card>
        <el-tabs
          v-model="activeTab"
          @tab-click="handleTabChange"
        >
          <el-tab-pane
            label="批次列表"
            name="batch"
          >
            <unbilled-batch v-if="activeTab==='batch'" @bill-total="handleBillTotal" />
          </el-tab-pane>
          <el-tab-pane
            label="账单列表"
            name="bill"
          >
            <unbilled-bill v-if="activeTab==='bill'" :batchId="batchId"/>
          </el-tab-pane>
        </el-tabs>
      </page-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api';

export default {
  // 未出账单
  name: 'Unbilled',
  components: {
    UnbilledBill: () => import('./unbilled-bill.vue'),
    UnbilledBatch: () => import('./unbilled-batch.vue'),
  },
  setup() {
    const activeTab = ref('batch');
    const handleTabChange = () => {
      window.location.hash = activeTab.value;
    };
    const batchId = ref(null);
    const handleBillTotal = (row) => {
      activeTab.value = 'bill';
      window.location.hash = 'bill';
      batchId.value = row.id;
    };
    watch(() => activeTab.value, async (val) => {
      if (val === 'batch') {
        batchId.value = null;
      }
    });
    onMounted(() => {
      const hash = window.location.hash.slice(1);
      if (hash && ['batch', 'bill'].includes(hash)) {
        activeTab.value = hash;
      }
    });
    return {
      activeTab,
      handleTabChange,
      handleBillTotal,
      batchId,
    };
  },
};
</script>
<style lang="scss" scoped>
.unbilled {
  margin-left: 20px;
  width: 98%;
  .el-tabs {
    .el-tabs__item.is-active {
      font-weight: 500;
    }
  }
  .unbilled-page-card {
    padding: 20px 0;
  }
}
::v-deep .is-top {
  font-size: 18px;
}
</style>
