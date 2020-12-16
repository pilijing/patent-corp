<template>
  <div>
    <div class="back-tool">
    <el-button @click="$router.back()" size="mini">
      <i class="el-icon-arrow-left" />
      返回
    </el-button>
  </div>
  <div class="staff-detail" v-loading="loading">
    <page-card>
      <panel-info-list
        label-width="120px"
        v-model="staffDetail"
        :columns="staffDetailColums"
        class="info-list"
      />
    </page-card>
  </div>
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useHttp } from '@/hooks/http';

export default {
  name: 'StaffDetail',
  components: {
    PanelInfoList,
  },
  setup(_, context) {
    const { $route } = context.root;
    const state = reactive({
      submitLoading: false,
      staffDetailColums: [
        { dataIndex: 'staffName', label: '员工账号' },
        // { dataIndex: 'staffLoginName', label: '帐号别名' },
        { dataIndex: 'name', label: '员工姓名' },
        { dataIndex: 'gender', label: '性别' },
        { dataIndex: 'mobile', label: '手机号' },
        { dataIndex: 'loginName', label: '用户名' },
        { dataIndex: 'email', label: '邮箱' },
        { dataIndex: 'phone', label: '座机号' },
        { dataIndex: 'fax', label: '邮编' },
        {
          dataIndex: 'address', label: '地址', width: '100%',
        },
      ],
    });

    const {
      loading,
      data: staffData,
      fetchData,
    } = useHttp(`/patent-corp_api/corp-staffs/${$route.query.id}`);

    const staffDetail = computed(() => {
      const data = staffData.value || {};
      data.gender = data.gender === 0 ? '男' : '女';
      return data;
    });

    onMounted(async () => {
      await fetchData();
    });

    return {
      ...toRefs(state),
      loading,
      staffDetail,
    };
  },
};
</script>

<style lang="scss" scoped>
.back-tool {
  // position: absolute;
  top: 10px;
  right: 20px;
  z-index: 999;
  margin-bottom: 10px;
}
</style>
