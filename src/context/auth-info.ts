import {
  ref, provide, inject, Ref,
} from '@vue/composition-api';
import { AxiosError } from 'axios';
import { GET, useAsyncCreator } from './common';

const authDetail: AuthInfo = {
  corpId: null,
  authId: '',
  description: '',
  objectType: '',
  objectId: '',
  startTime: '',
  endTime: '',
  createBy: '',
  createByName: '',
  operations: null,
  roles: null,
};

type AuthInfo = {
  corpId: number | null; // 1;
  authId: string; //  'mCcEfDYg3oA2buymBFKhZbK5mntqLEbe';
  description: string; //  '超级管理员授权';
  objectType: string; //  'staff';
  objectId: string; //  '101013';
  startTime: string; // '2020-09-28T17:24:14+08:00',
  endTime: string; // '2025-10-29T17:24:14+08:00',
  createBy: string; // '101013',
  createByName: string;
  operations: null;
  roles: null;
};

interface AuthContext {
  authInfo: Ref<AuthInfo>;
  authInfoList: Ref<AuthInfo[]>;
  setAuthInfo: (auth: AuthInfo) => void;
  getAuthInfoList: () => void;
  getAuthInfoDetail: (id: string) => void;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
}

export const authSymbol = Symbol('Symbol for auth');

async function getRemoteAuthInfoList() {
  const data = await GET<AuthInfo[] | null>('/patent-corp_api/permissions');
  return data || [];
}

export function useAuthProvider() {
  const authInfo = ref({ ...authDetail });
  const authInfoList = ref<AuthInfo[]>([]);
  const loading = ref(false);
  const error = ref(null);
  function setAuthInfo(newAuthInfo: AuthInfo) {
    authInfo.value = newAuthInfo;
  }
  async function getAuthInfoList() {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync(() => getRemoteAuthInfoList());
    if (data.value) {
      authInfoList.value = data.value;
    }
  }
  function getAuthInfoDetail(id: string) {
    const data = authInfoList.value.find(item => item.authId === id || item.objectId === id);
    if (data) {
      setAuthInfo(data);
    }
  }

  provide<AuthContext>(authSymbol, {
    authInfo,
    authInfoList,
    loading,
    error,
    setAuthInfo,
    getAuthInfoList,
    getAuthInfoDetail,
  });
}

export function useAuthInject() {
  const auth = inject<AuthContext>(authSymbol);
  if (!auth) {
    throw new Error('Please useAuthInject before useAuthProvider!');
  }
  return auth;
}
