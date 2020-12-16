<template>
  <div class="example">
    <p>这是一个element ui组件</p>
    <el-radio v-model="radio" label="1">甲</el-radio>
    <el-radio v-model="radio" label="2">乙</el-radio>
  </div>
</template>

<script>
</script>
<script lang="ts">
import {
  defineComponent, reactive,
} from '@vue/composition-api';

interface State {
  radio: string;
}

export default defineComponent({
  name: 'Sample01',
  setup() {
    const state = reactive<State>({
      radio: '2',
    });
    return {
      ...state,
    };
  },
});
</script>
<style lang="scss">
  .example {
    padding: 0 50px;
    .table {
      margin-top: 30px;
    }
  }
</style>
