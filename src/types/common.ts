import { Ref } from '@vue/composition-api';
import { AxiosError } from 'axios';

export type RemoteData<T> = {
  [P in keyof T]: T[P] | null;
}
export type NullableData<T> = {
  [P in keyof T]: T[P] | null;
}

// 基础字典
export type Lookup = {
  id: number; // 101;
  code: string; // 'FIRST';
  group: string; // null;
  isEnabled: number; // 1;
  name: string; // '首次申请';
  order: number; // 1;
  type: string; // 'APPLY_TYPE';
};

// 用户信息
export type UserInfo = {
  id: number;
  loginName: string;
  phone: string;
  email: string;
  corpId: number;
  clientId: string;
  corpName: string;
  mobile: string;
  operations: null;
  roles: null;
  staffFullName: string;
  staffId: string;
  workDeptId: string;
  workDeptName: string;
};

export type LookupContext = {
  lookups: Ref<Lookup[]>;
  setLookups: (lookups: Lookup[]) => void;
  getLookups: (type?: string) => Promise<void>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
};

export type UserInfoContext = {
  userInfo: Ref<UserInfo>;
  setUserInfo: (info: UserInfo) => void;
  getUserInfo: (type?: string) => Promise<void>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
};

export type RemoteLookup = RemoteData<Lookup>;
export type RemoteUserInfo = RemoteData<UserInfo>;

export type CommonState<T={}> = { data: T ; loading: boolean; error: AxiosError | null };

export interface CascadeType {
  value: number; // TODO：id: null | number;  //阶段，为什么有null？
  label: string;
  children: CascadeType[] | null;
}
