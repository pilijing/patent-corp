<template>
  <div class="patent-view">
    <div style="margin-left: 20px;width: 98%;">
      <el-card class="table">
        <table-paging
          v-loading="tableLoading"
          :data="decorateCardData"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column
            prop="patentCaseNumber"
            label="专利案号"
            show-overflow-tooltip
            width="130"
          >
            <template #default="{ row }">
              <template v-if="row.applicationType && row.applicationType !== applyTypeList.DIRECTPCTINTL">
                <router-link :to="{ path: '/first-application/detail', query: {id: row.id}}">
                  {{ row.patentCaseNumber || '暂无' }}
                </router-link>
              </template>
              <router-link
                v-else
                :to="{ path: '/first-application/detail',
                query: {id: row.id}}"
              >{{ row.patentCaseNumber || '暂无' }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            prop="patentName"
            label="专利名称"
            min-width="200"
          />
          <el-table-column
            show-overflow-tooltip
            prop="patentTypeName"
            label="专利类型"
          />
          <el-table-column
            show-overflow-tooltip
            prop="applicationTypeName"
            label="申请类型"
          />
          <el-table-column
            show-overflow-tooltip
            prop="regionName"
            label="申请国家"
          />
          <el-table-column
            show-overflow-tooltip
            prop="currentStagesName"
            label="当前阶段"
          >
            <template #default="{ row }">
              {{ (row.currentStagesName || []).join(';') }}
            </template>
          </el-table-column>
        </table-paging>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import TableFilter from '@/components/table-filter.vue';
import TableFilterItem from '@/components/table-filter-item.vue';
import TablePaging from '@/components/table-paging.vue';
import { usePagingData } from '@/hooks/pagination';

export default defineComponent({
  name: 'ListTable',
  components: {
    TableFilter,
    TableFilterItem,
    TablePaging,
  },
  setup() {
    const state = reactive({
      input: '',
      select: '',
      options: [],
      dateRange: [],
      pagination: {
        limit: 20,
        offset: 0,
        total: 0,
      },
    });
    const { getTypeName, getEnumsInfo } = useLookupsInject();
    const { getRegionName } = useRegionsInject();
    const applyTypeList = computed(() => getEnumsInfo('APPLY_TYPE'));
    const {
      loading: tableLoading,
      data: cardData,
      pagination,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent-corp_api/patents');
    fetchList();
    const decorateCardData = computed(() => {
      const cardValue = cardData.value;
      const innerCardData = (cardValue || []).map((item) => {
        if (item.applicationType) {
          item.applicationTypeName = getTypeName(item.applicationType);
        }
        if (item.patentType) {
          item.patentTypeName = getTypeName(item.patentType);
        }
        if (item.regionCode) {
          item.regionName = getRegionName(item.regionCode);
        }
        return {
          ...item,
        };
      });
      return [...innerCardData];
    });

    return {
      ...toRefs(state),
      handlePageChange,
      tableLoading,
      pagination,
      decorateCardData,
      applyTypeList,
    };
  },
});
</script>

<style lang="scss" scoped>
.patent-view {
  .query-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .drag {
    border: 1px solid #eee;
    padding: 15px;
  }
}
</style>
