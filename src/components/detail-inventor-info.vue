<template>
  <div class="detail-inventor-info">
    <div class="last-name">姓：{{ data.lastFullName }}</div>
    <div class="first-name">名：{{ data.firstFullName }}</div>
    <div class="nationality">国籍：{{ getRegionName(data.nationality) }}</div>
    <div class="certificates">证件号码：{{ data.certificateNumber }} ({{ certificateType }})</div>
    <slot />
  </div>
</template>

<script>
import { useRegionsInject, useLookupsInject } from '@/context';
import { computed } from '@vue/composition-api';

export default {
  name: 'DetailInventorInfo',
  props: {
    data: Object,
  },
  setup(props) {
    const {
      getRegionName,
    } = useRegionsInject();
    const {
      getTypeName,
    } = useLookupsInject();

    const certificateType = computed(() => getTypeName(props.data.certificateType));

    return {
      getRegionName,
      certificateType,
    };
  },
};
</script>

<style lang="scss" scoped>
.detail-inventor-info {
  padding: 3px 10px;
  display: flex;
  .last-name,
  .first-name,
  .nationality {
    width: 20%;
  }
  .certificates {
    width: 40%;
  }
}
</style>
