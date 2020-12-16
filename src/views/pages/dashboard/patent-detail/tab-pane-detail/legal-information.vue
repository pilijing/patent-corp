<template>
  <div>
    <panel-info-list label-width="120px" v-model="legalInfoDetail" :columns="legalInfoColum" />
  </div>
</template>

<script>
import {
  reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PanelInfoList from '@/components/panel-info-list.vue';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';

export default {
  name: 'Legalformation',
  components: {
    PanelInfoList,
  },
  setup(_, context) {
    const { $route } = context.root;
    const { getTypeName } = useLookupsInject();
    const state = reactive({
      toggle: false,
      legalInfoColum: [
        { dataIndex: 'legalStatusName', label: '法律状态', width: '100%' },
        { dataIndex: 'applicationNumber', label: '申请号' },
        { dataIndex: 'applicationDate', label: '申请日', width: '60%' },
        { dataIndex: 'publicNumber', label: '公开号' },
        { dataIndex: 'publicDate', label: '公开日', width: '60%' },
        { dataIndex: 'authorizationDate', label: '授权发文日' },
        { dataIndex: 'authAnnouncementNo', label: '授权公告号' },
        { dataIndex: 'authAnnouncementDate', label: '授权公告日' },
        { dataIndex: 'certificateDate', label: '发证书日' },
        { dataIndex: 'verificationDate', label: '实审发文日' },
        { dataIndex: 'certificateNo', label: '证书号' },
        {
          dataIndex: 'patentAttachments', label: '证书', type: 'file', width: '100%',
        },
      ],
    });
    const {
      url: fetchLegalUrl,
      data: legalInfoData,
      fetchData: fetchLegalData,
    } = useHttp();

    onMounted(async () => {
      fetchLegalUrl.value = `/patent-corp_api/patents/${$route.query.id}/law-info`;
      await fetchLegalData();
    });
    const legalInfoDetail = computed(() => {
      const data = legalInfoData.value || {};
      data.legalStatusName = getTypeName(data.legalStatus);
      data.applicationDate = utils.dateFormat(data.applicationDate, 'YYYY-MM-DD');
      data.publicDate = utils.dateFormat(data.publicDate, 'YYYY-MM-DD');
      data.authorizationDate = utils.dateFormat(data.authorizationDate, 'YYYY-MM-DD');
      data.authAnnouncementDate = utils.dateFormat(data.authAnnouncementDate, 'YYYY-MM-DD');
      data.certificateDate = utils.dateFormat(data.certificateDate, 'YYYY-MM-DD');
      data.verificationDate = utils.dateFormat(data.verificationDate, 'YYYY-MM-DD');
      return data;
    });
    return {
      ...toRefs(state),
      legalInfoDetail,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
