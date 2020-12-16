import { reactive, toRefs } from '@vue/composition-api';
import { useHttp } from './http';

export function usePagingData(defaultUrl: string) {
  const options = reactive({
    defaultUrl,
    query: {},
  });
  const state = reactive({
    data: [],
    pagination: {
      limit: 20,
      offset: 0,
      total: 0,
    },
  });

  const {
    url,
    loading,
    fetchData,
  } = useHttp(defaultUrl);

  // 设置列表数据请求URL，支持更换URL
  url.value = options.defaultUrl;

  const fetchList = async () => {
    const data = await fetchData({
      limit: state.pagination.limit,
      offset: state.pagination.offset,
      ...options.query,
    });
    state.data = data.results;
    state.pagination.total = data.total;
    return data;
  };

  const handlePageChange = async (offset: number, limit: number) => {
    state.pagination.offset = offset;
    state.pagination.limit = limit;
    await fetchList();
  };

  return {
    options,
    loading,
    ...toRefs(state),
    fetchList,
    handlePageChange,
  };
}
