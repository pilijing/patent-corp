import { computed, SetupContext } from '@vue/composition-api';

export default function useUrlParams(context: SetupContext) {
  const { root } = context;
  const { $route } = root;
  const processId = computed(() => Number($route.query.id));
  return { processId };
}
