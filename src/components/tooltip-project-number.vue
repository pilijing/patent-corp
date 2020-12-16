<template>
  <el-tooltip placement="bottom" effect="light" popper-class="popper-tooltip">
    <div slot="content">
      <!--PCT进国家-->
      <div v-if="applyType === applyTypeList.PCTINCOUNTRY" class="img-wrapper">
        <img src="~@/assets/lx_pct_in_country.png" alt="" width="100%">
        <img src="~@/assets/tooltip_arrow.png" alt="" class="arrow">
      </div>
      <!--PCT国际-->
      <div v-if="applyType === applyTypeList.PCTINTL || applyType === applyTypeList.PCTINCOUNTRY" class="img-wrapper">
        <img src="~@/assets/lx_pct_international.png"
             alt=""
             width="94%"
             >
        <img src="~@/assets/tooltip_arrow.png"
            alt=""
            class="arrow"
            :class="{'arrow1': applyType === applyTypeList.PCTINCOUNTRY}"
            >
      </div>
      <!--巴黎公约-->
      <div v-if="applyType === applyTypeList.PACTPARIS" class="img-wrapper">
        <img src="~@/assets/lx_pact_paris.png" alt="" width="94%">
        <img src="~@/assets/tooltip_arrow.png" alt="" class="arrow">
      </div>
      <!--首次申请-->
      <div class="img-wrapper">
        <img src="~@/assets/lx_first_application.png"
           alt=""
           width="90%">
      </div>
    </div>
    <i class="el-icon-question" />
    <!-- <slot /> -->
  </el-tooltip>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api';
import { useLookupsInject } from '@/context';

export default defineComponent({
  name: 'TooltipProjectNumber',
  props: {
    applyType: Number,
  },
  setup() {
    const { getEnumsInfo } = useLookupsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    return {
      applyTypeList,
    };
  },
});
</script>

<style lang="scss">
.popper-tooltip {
  width: 352px;
  display: flex;
  justify-content: center;
  padding-left: 32px;
  padding-right: 20px;
  box-shadow: 0px 0px 20px rgba(200, 200, 200, 0.4);
}
.popper-tooltip.is-light {
  border: 0px solid transparent;
}
.img-wrapper {
  padding-top: 12px;
  padding-bottom: 20px;
  border-bottom: 2px solid #D9D9D9;
}
.img-wrapper:first-child {
  padding-top: 0;
}
.img-wrapper:last-child {
  border-bottom: 0px solid #D9D9D9;
  padding-bottom: 0px;
}
.arrow {
  width: 24px;
  position: absolute;
  left: 9px;
  top: 50px;
  height: 98px;
  padding: 0px;
}
.arrow1 {
  top: 180px;
  height: 100px;
}
.el-icon-question {
  margin-left: 12px;
  font-size: 18px;
  color: #B9B9B9;
  line-height: 25px;
}
</style>
