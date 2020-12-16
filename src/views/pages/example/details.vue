<template>
  <div class="form-subject-details">
    <page-card>
      <page-title :title="`详情信息`">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="visibleAddPlat = true"
        >
          新增来文
        </el-button>
        <el-button size="mini">返回</el-button>
      </page-title>
      <descriptions
        style="padding-left: 20px;"
        :label-width="100"
      >
        <!-- <descriptions-item label="主体名称" :value="1" />
        <descriptions-item label="主体营业执照" :value="2" /> -->
        <descriptions-item label="信息类型">拜访类</descriptions-item>
        <descriptions-item label="报备编号">20200001</descriptions-item>
        <descriptions-item label="信息级别">重要信息</descriptions-item>
        <descriptions-item label="经办人">kanezhou(周鹏)</descriptions-item>
        <descriptions-item label="经办人所在部门"
          >职能线办公室</descriptions-item
        >
        <descriptions-item label="拜访单位"
          >厦门大学深圳研究院</descriptions-item
        >
        <descriptions-item label="拜访主宾姓名">王凯</descriptions-item>
        <descriptions-item label="拜访主宾职务">大学教授</descriptions-item>
        <descriptions-item label="拜访主宾级别">科院级</descriptions-item>
        <descriptions-item label="我方主宾姓名">郑毅</descriptions-item>
        <descriptions-item label="我方主宾职务">SVP级</descriptions-item>
        <descriptions-item label="拟拜访时间">2020-05-01</descriptions-item>
        <descriptions-item label="拜访事由"
              :span="3"
          >学习交流学习交流学习交流学习交流学习交流学习交流</descriptions-item
        >
        <descriptions-item label="附件上传" :span="3">
          <template #default
            ><i class="el-icon-tickets" />adria7W4Ow7g5A-unsplash.jpg</template
          >
        </descriptions-item>
      </descriptions>
    </page-card>
  </div>
</template>
<script>
import { reactive, toRefs } from '@vue/composition-api';
// import AddClaims from './add-claims.vue';
export default {
  // name: 'exampleDetails',
  components: {},
  setup() {
    // const { $store, $confirm, $message } = context.root;
    const state = reactive({
      visibleAddPlat: false,
      filter: {},
      multipleSelection: [],
      platformData: null,
    });
    return {
      ...toRefs(state),
    };
  },
};
</script>
<style lang="scss" scoped>
// .form-subject-details {}
</style>
