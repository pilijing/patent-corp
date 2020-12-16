import { CommonState } from '@/types/common';
import { reactive, provide, inject } from '@vue/composition-api';
import { GET, initialState, useAsyncV3 } from './common';

const symbol = Symbol('Symbol for roles');

type RemoteRoles = {
  code: 0;
  data: Role[];
};
type Role = {
  roleId: number; // 1747;
  roleName: string; // '超级管理员';
};
type RolesContext = {
  getRolesState: CommonState<Role[]>;
  getRoles: () => void;
  getRoleName: (id: string | number | null) => string | null;
};
async function getRemoteRoles() {
  const result = await GET<RemoteRoles | null>('/patent-corp_api/rights/roles');
  return result?.data || [];
}

export function useRolesProvider() {
  const getRolesState = reactive({ ...initialState(), data: [] as Role[] });
  async function getRoles() {
    const result = await useAsyncV3(getRolesState, () => getRemoteRoles());
    getRolesState.data = result || [];
  }

  function getRoleName(id: number | string | null) {
    return getRolesState.data.find(role => role.roleId === Number(id))?.roleName || null;
  }

  provide<RolesContext>(symbol, {
    getRoles,
    getRolesState,
    getRoleName,
  });
}

export function useRolesInject() {
  const stroe = inject<RolesContext>(symbol);
  if (!stroe) {
    throw new Error('error in useRolesInject');
  }
  return stroe;
}
