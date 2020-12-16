import {
  RemoteLookup, Lookup, LookupContext, EnumsKeyInfo,
} from '@/types/lookup';
import {
  ref, provide, inject, watch, computed,
} from '@vue/composition-api';
import { Message } from 'element-ui';
import { GET, useAsyncCreator } from './common';

export const lookupSymbol = Symbol('Symbol for lookups');

async function getRemoteLookups(type?: string) {
  const data = await GET<RemoteLookup[] | null>('/patent-corp_api/lookups', { type });
  return data || [];
}

// 只处理 string 和 [] 为 null 的情况，其他类型如果接收到 null 则原样返回
function processRemoteLookups(remoteLookups: RemoteLookup[]): Lookup[] {
  return remoteLookups.map(remoteLookup => ({
    id: remoteLookup.id ?? null,
    code: remoteLookup.code ?? '', // string; // 'FIRST';
    group: remoteLookup.group ?? '', // string; // null;
    isEnabled: remoteLookup.isEnabled ?? null, // number; // 1;
    name: remoteLookup.name ?? '', // string; // '首次申请';
    order: remoteLookup.order ?? null, // number; // 1;
    type: remoteLookup.type ?? '', // string; // 'APPLY_TYPE';
  }));
}

// 通过type分类lookups
function processSortLookups(remoteLookups: EnumsKeyInfo) {
  return remoteLookups.reduce((prev: any, next: any) => {
    if (next.group) {
      if (prev[next.group]) {
        prev[next.group].push(next);
      } else {
        prev[next.group] = [next];
      }
    }
    if (prev[next.type]) {
      prev[next.type].push(next);
    } else {
      prev[next.type] = [next];
    }
    return prev;
  }, {});
}

// 获取 keyValues 中的 key
const getEnumsKeyInfo = (keyValues: EnumsKeyInfo, key: string) => (keyValues[key] || []).reduce(
  (total: EnumsKeyInfo, item: { code: string | number; id: unknown }) => {
    if (!total[item.code]) {
      total[item.code] = item.id;
    }
    return total;
  },
  {},
);

export function useLookupProvider() {
  const lookups = ref<Lookup[]>([]);
  const loading = ref(false);
  const error = ref(null);
  const sortLookups = ref<EnumsKeyInfo>([]);
  function setLookups(newLookups: Lookup[]) {
    lookups.value = newLookups;
    sortLookups.value = processSortLookups(newLookups);
  }
  async function getLookups(type?: string) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<RemoteLookup[]>(() => getRemoteLookups(type));
    if (data.value) {
      setLookups(processRemoteLookups(data.value));
    }
  }

  watch(loading, (cur, pre) => {
    if (cur === false && pre === true && error.value) {
      Message.error('获取数据字典错误');
      // TODO 是否接入后段传入的错误信息 error.value.message
    }
  });

  // 取{ code: id }
  const getEnumsInfo = (type: string) => getEnumsKeyInfo(sortLookups.value, type);
  // 通过type获取 { id： code }
  const getEnumsCodeInfo = (type: string) => {
    const enumsKeyInfo = getEnumsInfo(type);
    const result: any = {};
    /* eslint-disable guard-for-in */
    /* eslint-disable no-restricted-syntax */
    for (const key in enumsKeyInfo) { // key和value调换
      const val = enumsKeyInfo[key];
      result[val] = key;
    }
    return result;
  };
  // 通过type取{ id: code }
  const getCodeInfo = (type: string) => getEnumsCodeInfo(type);
  // 取name
  const getTypeName = (id: number) => lookups.value.find(lookup => lookup.id === id)?.name;

  // 负责人
  const managers = computed(() => lookups.value.filter(lookup => lookup.type === 'PROCESS_MANAGER'));
  // 通知人
  const notifiers = computed(() => lookups.value.filter(lookup => lookup.type === 'NOTIFIER'));
  // 待办所属人
  const todoOwners = computed(() => lookups.value.filter(lookup => lookup.type === 'PROCESS_TODOOWNER'));
  // 费用名称
  const feeNameList = computed(() => lookups.value.filter(lookup => lookup.type === 'FEENAME'));
  // 工作时限
  const workingTimeTypeList = computed(() => lookups.value.filter(lookup => lookup.type === 'WORKINGTIME_LIMIT'));
  // 官方来文类型id
  const officialClaimTypeId = computed(() => lookups.value
    .find(lookup => lookup.type === 'STEP_TYPE' && lookup.code === 'OFFICIALACTION')?.id ?? null);
  // 官方来文任务流程id
  const officialClaimTaskId = computed(() => lookups.value
    .find(lookup => lookup.type === 'STEP_TYPE' && lookup.code === 'OFFICIALACTIONTASK')?.id ?? null);
  // 请求来文类型id
  const appealedClaimTypeId = computed(() => lookups.value
    .find(lookup => lookup.type === 'STEP_TYPE' && lookup.code === 'INITIATEREQUEST')?.id ?? null);
  // 发起请求任务流程id
  const appealedClaimTaskId = computed(() => lookups.value
    .find(lookup => lookup.type === 'STEP_TYPE' && lookup.code === 'INITIATEREQUESTTASK')?.id ?? null);
  // 待办所属人指定员工字典id
  const todoStaffId = computed(() => todoOwners.value
    .find(item => item.code === 'DESIGNATEDSTAFF')?.id || null);
    // 待办所属人角色名字典id
  const todoRoleId = computed(() => todoOwners.value
    .find(item => item.code === 'ROLENAME')
          ?.id || null);
  // 默认值类型
  const defaultValues = computed(() => lookups.value.filter(lookup => lookup.type === 'DEFAULT_VALUE'));

  /** 通知人指定员工字典id */
  const notifyToStaffId = computed(() => notifiers.value
    .find(notifier => notifier.code === 'DESIGNATEDSTAFF')
          ?.id || null);

  // 通知人角色名字典id
  const notifyToRoleId = computed(() => notifiers.value
    .find(notifier => notifier.code === 'ROLENAME')
          ?.id || null);

  const feeStages = computed(() => lookups.value.filter(lookup => lookup.type === 'FEE_STAGE'));

  provide<LookupContext>(lookupSymbol, {
    lookups,
    loading,
    error,
    setLookups,
    getLookups,
    sortLookups,
    getEnumsInfo,
    getCodeInfo,
    getTypeName,
    managers,
    notifiers,
    todoOwners,
    feeNameList,
    workingTimeTypeList,
    officialClaimTypeId,
    appealedClaimTypeId,
    officialClaimTaskId,
    appealedClaimTaskId,
    todoStaffId,
    todoRoleId,
    notifyToStaffId,
    notifyToRoleId,
    defaultValues,
    feeStages,
  });
}

export function useLookupsInject() {
  const lookupStore = inject<LookupContext>(lookupSymbol);
  if (!lookupStore) {
    throw new Error('Please useLookupProvider before useLookupsInject!');
  }
  return lookupStore;
}
