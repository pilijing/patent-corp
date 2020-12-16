import { ref } from '@vue/composition-api';

export default function useVisible() {
  const visible = ref<boolean>(false);

  function setVisible(value: boolean) {
    visible.value = value;
  }

  return {
    visible,
    setVisible,
  };
}
