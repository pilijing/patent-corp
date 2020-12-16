<template>
  <center>
    大海的测试小天地
    {{loading}}
  </center>
</template>
<script>
import { useHttp } from '@/hooks/http';
import { ref } from '@vue/composition-api';

export default {
  setup() {
    const loading = ref(true);
    const main = async () => {
      loading.value = true;
      const { data, fetchData } = useHttp('/patent-corp_api/progress-list');
      await fetchData({ limit: 20, offset: 20 });
      console.log('🌊', data);
    };
    main();
    return {
      loading,
    };
  },
};
</script>
<style lang="scss">
</style>
