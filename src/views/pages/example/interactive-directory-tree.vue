<template>
  <div>
    <directory-tree :expanded-keys="expandedKeys"></directory-tree>
    <el-button @click="handleButton1Click">第一个</el-button>
    <el-button @click="handleButton2Click">第二个</el-button>
    <el-button @click="handleButton3Click">第三个</el-button>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import DirectoryTree from '@/views/pages/dashboard/patent-detail/directory-tree.vue';

export default defineComponent({
  name: 'InteractiveDirectoryTree',
  components: {
    DirectoryTree,
  },
  setup() {
    const state = reactive({
      expandedKeys: [304, 799],
    });
    function handleButton1Click() {
      state.expandedKeys = [305, 800];
    }
    function handleButton2Click() {
      state.expandedKeys = [305, 803];
    }
    function handleButton3Click() {
      state.expandedKeys = [305, 833];
    }

    return {
      ...toRefs(state),
      handleButton1Click,
      handleButton2Click,
      handleButton3Click,
    };
  },
});

</script>
