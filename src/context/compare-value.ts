import {
  provide, inject, ref, Ref,
} from '@vue/composition-api';

export type CompareValueContext = {
  compareValue: Ref<[]>;
  setCompareValue: (val: any) => void;
};

export const compareValueSymbol = Symbol('Symbol for compare value');

export function useCompareValueProvider() {
  const compareValue = ref();

  function setCompareValue(val: any) {
    compareValue.value = val;
  }

  provide<CompareValueContext>(compareValueSymbol, {
    setCompareValue,
    compareValue,
  });
}

export function useCompareValueInject() {
  const CompareValueStore = inject<CompareValueContext>(compareValueSymbol);
  if (!CompareValueStore) {
    throw new Error('Please useCompareValueProvider before useCompareValueInject!');
  }
  return CompareValueStore;
}
