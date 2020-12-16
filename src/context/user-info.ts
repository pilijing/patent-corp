import { UserInfo, UserInfoContext, RemoteUserInfo } from '@/types/common';
import { ref, provide, inject } from '@vue/composition-api';
import { GET, useAsyncCreator } from './common';

export const userInfoSymbol = Symbol('Symbol for user-info');

async function getRemoteUserInfo() {
  const data = await GET<RemoteUserInfo | null>('/patent-corp_api/authentications/user-info');
  return data;
}

// 处理后台返回的字段类型不一样的情况
function processRemoteUser(remoteUserInfo: RemoteUserInfo): UserInfo {
  return {
    id: remoteUserInfo.id ?? NaN,
    loginName: remoteUserInfo.loginName ?? '',
    phone: remoteUserInfo.phone ?? '',
    email: remoteUserInfo.email ?? '',
    corpId: remoteUserInfo.corpId ?? NaN,
    clientId: remoteUserInfo.clientId ?? '',
    corpName: remoteUserInfo.corpName ?? '',
    mobile: remoteUserInfo.mobile ?? '',
    operations: remoteUserInfo.operations ?? null,
    roles: remoteUserInfo.roles ?? null,
    staffFullName: remoteUserInfo.staffFullName ?? '',
    staffId: remoteUserInfo.staffId ?? '',
    workDeptId: remoteUserInfo.workDeptId ?? '',
    workDeptName: remoteUserInfo.workDeptName ?? '',
  };
}

// 定义初始值
const initUserInfo = {
  id: NaN,
  loginName: '',
  phone: '',
  email: '',
  corpId: NaN,
  clientId: '',
  corpName: '',
  mobile: '',
  operations: null,
  roles: null,
  staffFullName: '',
  staffId: '',
  workDeptId: '',
  workDeptName: '',
};

export function useUserInfoProvider() {
  const userInfo = ref({ ...initUserInfo });
  const loading = ref(false);
  const error = ref(null);
  function setUserInfo(newUserInfo: UserInfo) {
    userInfo.value = newUserInfo;
  }

  async function getUserInfo() {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync(() => getRemoteUserInfo());
    if (data.value) {
      setUserInfo(processRemoteUser(data.value));
    }
  }

  provide<UserInfoContext>(userInfoSymbol, {
    userInfo,
    loading,
    error,
    setUserInfo,
    getUserInfo,
  });
}

export function useUserInfo() {
  const userInfoStore = inject<UserInfoContext>(userInfoSymbol);
  if (!userInfoStore) {
    throw new Error('Please useUserInfoProvider before useUserInfoInject!');
  }
  return userInfoStore;
}
