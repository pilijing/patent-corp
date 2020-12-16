import { Message } from 'element-ui';
import { reactive, toRefs } from '@vue/composition-api';
import http from '@/utils/wrap-axios';
import { Method } from 'axios';

export function useHttp(url?: string, quiet = false) {
  const state = reactive({
    url,
    loading: false,
    data: null,
  });
  const request = async (method: Method, params: any, data: any) => {
    state.loading = true;
    try {
      const res = await http.request({
        url: state.url, method, params, data,
      });
      state.loading = false;
      state.data = res.data;
      return res.data;
    } catch (err) {
      state.loading = false;
      if (!quiet) {
        if (err.message === 'Network Error') {
          Message.error('网络异常，请检查网络连接是否正常');
        }
      }

      return Promise.reject(err);
    }
  };
  const fetchData = async (params?: any) => {
    try {
      return await request('get', params, undefined);
    } catch (err) {
      if (!quiet) {
        if (err.response) {
          if (err.response.status === 500) {
            Message.error('获取数据失败，请联系系统管理员');
          } else if (err.response.status === 404) {
            if (process.env.NODE_ENV === 'production') {
              console.warn('请求的数据不存在，请检查API配置是否正确');
            } else {
              Message.error('请求的数据不存在，请检查API配置是否正确');
            }
          }
        }
      }
      return Promise.reject(err);
    }
  };

  const postData = async (data: any) => {
    try {
      return await request('post', undefined, data);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const putData = async (data?: any) => {
    try {
      return await request('put', undefined, data);
    } catch (err) {
      return Promise.reject(err);
    }
  };
  const deleteData = async (data: any) => {
    try {
      return await request('delete', undefined, data);
    } catch (err) {
      return Promise.reject(err);
    }
  };
  return {
    ...toRefs(state),
    fetchData,
    postData,
    putData,
    deleteData,
  };
}
