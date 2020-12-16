<template>
<div>
  <add-agency />
</div>
</template>
<script>
import {
  defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import addAgency from './add-agency.vue';

export default defineComponent({
  name: 'editAgency',
  components: {
    useLookupsInject,
    addAgency,
  },
  setup() {
    const state = reactive({});
    return {
      ...toRefs(state),
    };
  },
});
</script>
<style lang="scss" scoped>
</style>
