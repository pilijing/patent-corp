import { shallowMount, mount } from '@vue/test-utils';

import Sample01 from '@/components/Sample01.vue';

import '@/plugins/element';
import Vue from 'vue';

// https://vue-test-utils.vuejs.org/zh/guides/#%E5%B8%B8%E7%94%A8%E6%8A%80%E5%B7%A7
import CompositionApi, { ref } from '@vue/composition-api';

Vue.use(CompositionApi);

// most api can be found at here https://vue-test-utils.vuejs.org/guides/
// https://lmiller1990.github.io/vue-testing-handbook/zh-CN/

describe('Sample01.vue', () => {
  // shallow mount
  const shallowWrapper = shallowMount(Sample01);
  console.log(shallowWrapper.html());
  // mount
  const wrapper = mount(Sample01, {
    setup() {
      const radio = ref<string>('2');
      return {
        radio,
      };
    },
  });
  it('should not select the first radio', () => {
    expect(wrapper.find('label').classes('is-checked')).toBe(false);
  });
  it('should select the first radio when set radio value to "1"', async () => {
    await wrapper.setData({ radio: '1' });
    expect(wrapper.find('.is-checked').exists()).toBe(true);

    expect(wrapper.findAll('label[role="radio"').at(0)
      .classes('is-checked')).toBe(true);
    expect(wrapper.findAll('label[role="radio"').at(1)
      .classes('is-checked')).toBe(false);
  });
  it('should select the second radio when clicking the second radio', async () => {
    const seconedRadioInput = wrapper.findAll('input[type="radio"]').at(1);
    await seconedRadioInput.setChecked();
    expect(wrapper.findAll('label[role="radio"').at(0)
      .classes('is-checked')).toBe(false);
    expect(wrapper.findAll('label[role="radio"').at(1)
      .classes('is-checked')).toBe(true);
  });
  it('should select the first radio when setting radio value to "1"', async () => {
    wrapper.setData({
      radio: '1',
    });
    await Vue.nextTick();
    expect(wrapper.findAll('label[role="radio"').at(0)
      .classes('is-checked')).toBe(true);
    expect(wrapper.findAll('label[role="radio"').at(1)
      .classes('is-checked')).toBe(false);
  });
});
