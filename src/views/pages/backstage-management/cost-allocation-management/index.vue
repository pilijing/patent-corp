<template>
  <div class="index">
    <page-card>
      <el-tabs v-model="activeName">
        <el-tab-pane
          label="官费"
          name="officialFee"
        >
          <official-fee-list v-if="activeName=== 'officialFee'" />
        </el-tab-pane>

        <el-tab-pane
          label="代理费"
          name="agencyFees"
        >
          <agency-fee v-if="activeName=== 'agencyFees'"></agency-fee>
        </el-tab-pane>
      </el-tabs>
    </page-card>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import PageCard from '@/components/page-card.vue';
import OfficialFeeList from './official-fee-list.vue';
import AgencyFee from './agency-fee.vue';

export default defineComponent({
  name: 'index',
  components: { PageCard, AgencyFee, OfficialFeeList },
  setup() {
    const state = reactive({
      activeName: 'officialFee',
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
::v-deep {
  .el-tabs__item {
    font-size: 20px;
    color: #999999;
  }
  .el-tabs__item.is-active {
    color: rgb(0, 121, 254);
  }
}
</style>
