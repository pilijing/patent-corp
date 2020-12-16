import {
  Ref, ref, watch, watchEffect,
} from '@vue/composition-api';
import { AxiosError, AxiosRequestConfig } from 'axios';
import axios from '@/utils/wrap-axios';
import { Message } from 'element-ui';
import { CommonState } from '@/types/common';
import Vue from 'vue';

export function useAsyncCreator(
  loading: Ref<boolean>,
  error: Ref<AxiosError | null>,
  failureMessage?: Ref<string> | string,
  successMessage?: string,
) {
  return async function useAsync<T>(callback: () => Promise<T>) {
    const data = ref<T>();
    loading.value = true;
    error.value = null;
    try {
      data.value = await callback();
    } catch (e) {
      error.value = e;
    }
    loading.value = false;

    const stop = watchEffect(() => {
      if (error.value !== null && failureMessage !== undefined) {
        Message.error(typeof failureMessage === 'string' ? failureMessage : failureMessage.value);
      }
      if (error.value === null && successMessage !== undefined) {
        Message.success(successMessage);
      }
    });
    stop();

    return {
      loading,
      error,
      data,
    };
  };
}

export function watchCreator(
  loading: Ref<boolean>,
  error: Ref<AxiosError | null>,
  failureMessage?: string,
  successMessage?: string,
) {
  return watch(loading, (cur, pre) => {
    if (failureMessage && cur === false && pre === true && error.value === null) {
      Message.success(failureMessage);
    }
    if (successMessage && cur === false && pre === true && error.value) {
      Message.error(successMessage);
    }
  });
}
// example
// const someState1: UnwrapRef<CommonState> = reactive<CommonState>({
//   data: null,
//   loading: false,
//   error: null,
// });
export const initialState = () => ({ data: null, loading: false, error: null });

/**
 *
 * @param commonState 接口状态信息
 * @param callback 接口请求函数
 * @param options 可选; failureMessage: 失败信息; successMessage: 成功信息; useRemoteFirst: 是否优先使用远程错误信息
 */
export async function useAsyncV2<T>(
  commonState: CommonState<T>,
  callback: () => Promise<T>,
  options?: {
    failureMessage?: string;
    successMessage?: string;
    useRemoteFirst?: boolean;
  },
) {
  commonState.loading = true;
  commonState.error = null;
  try {
    const result = await callback();
    if (result !== null) {
      commonState.data = result;
    }
  } catch (e) {
    commonState.error = e;
  }
  commonState.loading = false;
  if (options) {
    const { failureMessage, successMessage, useRemoteFirst } = options;
    const stop = watchEffect(() => {
      if (commonState.error !== null && (failureMessage || useRemoteFirst)) {
        // useRemoteFirst 为 true 时，优先使用远程错误信息，如果远程无信息则回退到自定义错误信息
        // 如果都没有，则不显示错误信息
        const remoteErrMsg = commonState.error?.response?.data ?? failureMessage;
        const errorMessage = useRemoteFirst ? `${remoteErrMsg}` : failureMessage;
        if (errorMessage) {
          Message.error(errorMessage);
        }
      } else if (successMessage !== undefined) {
        Message.success(successMessage);
      }
    });
    stop();
  }

  return commonState;
}

/**
 *
 * @param commonState 接口状态信息
 * @param callback 接口请求函数
 * @param options 可选; failureMessage: 失败信息; successMessage: 成功信息; useRemoteFirst: 是否优先使用远程错误信息
 * useAsyncV3 与 useAsyncV2的区别在于不直接将api返回值赋值给commonState.data，方便做额外的处理。
 */
export async function useAsyncV3<T>(
  commonState: CommonState<T>,
  callback: () => Promise<T>,
  options: {
    failureMessage?: string;
    successMessage?: string;
    useRemoteFirst?: boolean;
  } = { useRemoteFirst: true },
) {
  commonState.loading = true;
  commonState.error = null;
  let result = null;
  try {
    result = await callback();
  } catch (e) {
    commonState.error = e;
  }
  commonState.loading = false;
  if (options) {
    const { failureMessage, successMessage, useRemoteFirst } = options;
    const stop = watchEffect(() => {
      if (commonState.error !== null && (failureMessage || useRemoteFirst)) {
        // useRemoteFirst 为 true 时，优先使用远程错误信息，如果远程无信息则回退到自定义错误信息
        // 如果都没有，则不显示错误信息
        const remoteErrMsg = commonState.error?.response?.data ?? failureMessage;
        const errorMessage = useRemoteFirst ? `${remoteErrMsg}` : failureMessage;
        if (errorMessage) {
          Message.error(errorMessage);
        }
      } else if (successMessage !== undefined) {
        Message.success(successMessage);
      }
    });
    stop();
  }

  return result;
}

/**
 *
 * @param commonState 接口状态信息
 * @param callback 接口请求函数
 * @param options 可选; failureMessage: 失败信息; successMessage: 成功信息; useRemoteFirst: 是否优先使用远程错误信息
 * useAsyncV4 与 useAsyncV3的区别在于直接集成了$message,不需要额外处理错误提示
 */

export async function useAsyncV4<T>(
  commonState: CommonState<T>,
  callback: () => Promise<T>,
  options?: {
    failureMessage?: string;
    successMessage?: string;
  },
) {
  commonState.loading = true;
  commonState.error = null;
  let result = null;
  try {
    result = await callback();
  } catch (e) {
    commonState.error = e;
  }
  commonState.loading = false;
  if (options) {
    const { failureMessage, successMessage } = options;
    const stop = watchEffect(() => {
      if (commonState.error !== null) {
        const customizedErrMsg = failureMessage ?? '未知错误';
        const remoteErrMsg = commonState.error?.response?.data;
        const errorMessage = remoteErrMsg ?? customizedErrMsg;
        if (errorMessage) {
          Vue.prototype.$message.error(errorMessage);
        }
      } else if (successMessage !== undefined) {
        Vue.prototype.$message.success(successMessage);
      }
    });
    stop();
  }

  return result;
}

const instance = axios;

export const GET = <T, U = {}>(url: string, params?: U, config?: AxiosRequestConfig) => instance
  .request<T>({
    method: 'GET',
    url,
    params,
    ...config,
  })
  .then(value => value.data)
  .catch((e: AxiosError) => {
    throw e;
  });

export const POST = <T, U = {}>(url: string, data?: U, config?: AxiosRequestConfig) => instance
  .request<T>({
    method: 'POST',
    url,
    data,
    ...config,
  })
  .then(value => value.data)
  .catch((e: AxiosError) => {
    throw e;
  });

export const DELETE = <T, U = {}>(url: string, params?: U, config?: AxiosRequestConfig) => instance
  .request<T>({
    method: 'DELETE',
    url,
    params,
    ...config,
  })
  .then(value => value.data)
  .catch((e: AxiosError) => {
    throw e;
  });

export const PUT = <T, U = {}>(url: string, data?: U, config?: AxiosRequestConfig) => instance
  .request<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  })
  .then(value => value.data)
  .catch((e: AxiosError) => {
    throw e;
  });
