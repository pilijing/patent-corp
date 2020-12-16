<template>
  <div>
    <div class="back-tool">
    <el-button @click="$router.back()" size="mini">
      <i class="el-icon-arrow-left" />
      返回
    </el-button>
  </div>
  <div class="corp-detail" v-loading="loading">
    <page-card>
      <panel-info-list
        label-width="120px"
        v-model="corpDetail"
        :columns="corpDetailColums"
        class="info-list"
      />
    </page-card>
    <staff-list :isFromCorp="true"/>
  </div>
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useHttp } from '@/hooks/http';
import StaffList from '../corp-staff/staff-list.vue';

export default {
  name: 'CorpDetail',
  components: {
    PanelInfoList,
    StaffList,
  },
  setup(_, context) {
    const { $route } = context.root;
    const state = reactive({
      submitLoading: false,
      corpDetailColums: [
        { dataIndex: 'name', label: '企业名称' },
        { dataIndex: 'englishName', label: '英文名称' },
        { dataIndex: 'licenseCode', label: '机构代码' },
        { dataIndex: 'clientId', label: '企业ID' },
        { dataIndex: 'contactName', label: '联系人' },
        { dataIndex: 'contactEmail', label: '联系人邮箱' },
        { dataIndex: 'contactMobile', label: '联系人电话' },
        {
          dataIndex: 'remark', label: '备注说明', width: '100%',
        },
      ],
      filter: {
        name: '',
      },
      filterColumns: [
        {
          dataIndex: 'name',
          type: 'input',
          label: '',
          clearable: true,
          placeholder: '登录名',
        },
      ],
      staffInfo: null,
      editStaff: false,
      dialogStaff: false,
    });

    const {
      loading,
      data: corpData,
      fetchData,
    } = useHttp(`/patent-corp_api/corps/${$route.query.id}`);

    const corpDetail = computed(() => corpData.value || {});

    onMounted(async () => {
      await fetchData();
    });

    return {
      ...toRefs(state),
      loading,
      corpDetail,
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
