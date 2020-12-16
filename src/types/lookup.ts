import { ComputedRef, Ref } from '@vue/composition-api';
import { AxiosError } from 'axios';
import { RemoteData } from './common';

export type Lookup = {
  id: number | null; // 101;
  code: string; // 'FIRST';
  group: string; // null;
  isEnabled: number | null; // 1;
  name: string; // '首次申请';
  order: number | null; // 1;
  type: string; // 'APPLY_TYPE';
};

export type EnumsKeyInfo = {
  [key: string]: any;
};

export type LookupContext = {
  lookups: Ref<Lookup[]>;
  setLookups: (lookups: Lookup[]) => void;
  getLookups: (type?: string) => Promise<void>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
  getEnumsInfo: (type: string) => any;
  getCodeInfo: (type: string) => any;
  sortLookups: Ref<EnumsKeyInfo>;
  getTypeName: (id: number) => string | undefined;
  managers: ComputedRef<Lookup[]>;
  notifiers: ComputedRef<Lookup[]>;
  todoOwners: ComputedRef<Lookup[]>;
  feeNameList: ComputedRef<Lookup[]>;
  workingTimeTypeList: ComputedRef<Lookup[]>;
  officialClaimTypeId: ComputedRef<number | null>;
  appealedClaimTypeId: ComputedRef<number | null>;
  officialClaimTaskId: ComputedRef<number | null>;
  appealedClaimTaskId: ComputedRef<number | null>;
  todoStaffId: ComputedRef<number | null>;
  todoRoleId: ComputedRef<number | null>;
  notifyToStaffId: ComputedRef<number | null>;
  notifyToRoleId: ComputedRef<number | null>;
  defaultValues: ComputedRef<Lookup[]>;
  feeStages: ComputedRef<Lookup[]>;
};

export type RemoteLookup = RemoteData<Lookup>;
