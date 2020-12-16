<template>
  <div class="dynamic-fields">
    <template v-for="(field, index) in fields || []" v-show="!field.isVisible">
      <el-form-item
        :label-width="labelWidth"
        :key="field.id + index"
        :prop="String(field.id)"
        :rules="getFormItemRules(field)"
        v-if="cascaderShow(field)"
      >
        <template slot="label" v-if="labelWidth !== '0'">
          <span :title="field.name">{{ field.name }}</span>
        </template>
        <!-- <div v-if="field.isReadonly">{{ field.value }}</div> -->
        <el-input
          v-if="isInput(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isMail(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isPhone(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isTextArea(field.inputType)"
          v-model="formData[field.id]"
          :disabled="field.isReadonly"
          :rows="4"
          type="textarea"
          clearable
          :placeholder="`请输入${field.name}`"
        />
        <el-input-number
          v-else-if="isNumber(field.inputType)"
          v-model="formData[field.id]"
          :max="99999999"
          :step="1"
          step-strictly
          style="width: 200px"
        />
        <el-input-number
          v-else-if="isMoney(field.inputType)"
          v-model="formData[field.id]"
          :min="0"
          :max="99999999"
          style="width: 200px"
        />
        <panel-select
          v-else-if="isEnumSelector(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :type="field.dictionaryType"
          :placeholder="`请选择${field.name}`"
          :multiple="field.multiple"
          :default-options="field.options"
        />
        <panel-select-search
          v-else-if="isSearchSelector(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :query-key="field.queryKey"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          :default-options="field.options"
        />
        <panel-select-inventor
          v-else-if="isInventor(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :query-key="field.queryKey"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          :default-options="field.options"
        />
        <select-review-experts
          v-else-if="isExpert(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :prop-opts="{ value: field.valueKey, label: field.labelKey }"
          :placeholder="`请选择${field.name}`"
          :default-options="field.options"
        />
         <select-tags
          v-else-if="isTag(field.inputType)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          @update-tag-data="tagDataList"
          :multiple="field.multiple"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :prop-opts="{ value: field.valueKey, label: field.labelKey }"
          :placeholder="`请选择${field.name}`"
        />
        <el-date-picker
          v-else-if="isDateTime(field.inputType)"
          v-model="formData[field.id]"
          style="width: 100%"
          value-format="yyyy-MM-dd"
          :disabled="field.isReadonly"
          :placeholder="`请选择${field.name}`"
        />
        <el-date-picker
          v-else-if="isDateTimeRange(field.inputType)"
          type="daterange"
          v-model="formData[field.id]"
          value-format="yyyy-MM-dd"
          style="width: 100%"
          :disabled="field.isReadonly"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <panel-radio
          v-else-if="isRadioSelector(field.inputType)"
          v-model="formData[field.id]"
          :placeholder="`请选择${field.name}`"
          :type="field.dictionaryType"
        />
        <!-- formData.defaultValueCriteria -->
        <panel-checkbox
          v-if="isCheckboxSelector(field.inputType)"
          v-model="formData[field.id]"
          :placeholder="`请选择${field.name}`"
          :type="field.dictionaryType"
        />
        <selector-country
          v-else-if="isRegion(field.inputType)"
          autocomplete="new-password"
          v-model="formData[field.id]"
          :placeholder="`请选择${field.name}`"
          style="width: 100%"
        />
        <upload-attachment
          v-else-if="isFileUpload(field.inputType)"
          v-model="formData[field.id]"
          drag
        />
      </el-form-item>
    </template>
  </div>
</template>

<script>
import {
  defineComponent, computed, watch,
} from '@vue/composition-api';
import utils from '@/utils';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelectInventor from '@/components/panel-select-inventor.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelRadio from '@/components/panel-radio.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import SelectorCountry from '@/components/selector-country.vue';
import UploadAttachment from '@/components/upload-attachment.vue';
import SelectReviewExperts from '@/components/select-review-experts.vue';

export default defineComponent({
  name: 'ControlType',
  props: {
    value: Object, // 表单model
    fields: Array, // 动态字段
    labelWidth: {
      type: String,
      default: '150px',
    },
  },
  components: {
    PanelSelectSearch,
    PanelSelectInventor,
    PanelSelect,
    PanelRadio,
    PanelCheckbox,
    SelectorCountry,
    UploadAttachment,
    SelectReviewExperts,
  },
  setup(props, context) {
    const { emit } = context;
    const formData = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });
    const initField = () => {
      // 动态组件赋默认值
      let interFormData = {};
      (props.fields || []).forEach((item) => {
        // (item.options || []).forEach((o) => {
        //   debugger;
        //   state.optionValueObj.push = {
        //    ...state.optionValueObj,
        //     [item.valueKey]: o.defaultValueCriteria,
        //   };
        // });
        // state.optionValueObj.push = [{ id: 506, staffFullName: 'sean(吴佳伟)' }];
        let val;
        if (['File', 'Tags'].includes(item.inputType) || item.multiple) {
          if (item.value) {
            val = JSON.parse(item.value);
          } else {
            val = [];
          }
        } else if (item.value) {
          // eslint-disable-next-line prefer-destructuring
          val = JSON.parse(item.value)[0];
        } else {
          val = undefined;
        }
        interFormData = {
          ...interFormData,
          ...{ [item.id]: val },
        };
      });
      formData.value = interFormData;
    };
    watch(
      () => props.fields,
      (cur) => {
        // initField();
        console.log('fields', cur);
      },
    );

    const cascaderShow = (field) => {
      if (!field.cascadedById) return true;
      const currentVal = formData.value[field.cascadedById];
      return String(currentVal) === String(field.cascadedValues);
    };

    const validateEmpty = (rule, value, callback) =>
      // if (utils.isEmpty(value)) {
      //   if (rule.message) {
      //     return callback(new Error(rule.message));
      //   }
      // }
      // eslint-disable-next-line implicit-arrow-linebreak
      callback();
    const fieldTpyeDeal = (type, str) => {
      if (type.indexOf('|') === -1) return type === str;
      const typeArr = type.split('|');
      return typeArr[0] === str;
    };
    /**
     * 像Input, TextArea, Number等写成统一的方法处理为了后面的扩展
     * 这么多相同的方法没合并的原因是：每个方法方便单独扩展
     */
    const isInput = type => fieldTpyeDeal(type, 'Input'); // Input
    const isMail = type => fieldTpyeDeal(type, 'Mail'); // Mail
    const isPhone = type => fieldTpyeDeal(type, 'Phone'); // Phone
    const isTextArea = type => fieldTpyeDeal(type, 'TextArea'); // TextArea
    const isNumber = type => fieldTpyeDeal(type, 'Number'); // Number
    const isMoney = type => fieldTpyeDeal(type, 'Money'); // Money
    const isEnumSelector = type => fieldTpyeDeal(type, 'Enum'); // Enum组件
    const isSearchSelector = type => fieldTpyeDeal(type, 'Select'); // select组件
    const isExpert = type => fieldTpyeDeal(type, 'Expert'); // Expert组件
    const isTag = type => fieldTpyeDeal(type, 'Tags'); // Expert组件
    const isInventor = type => fieldTpyeDeal(type, 'Inventor'); // 发明人组件
    const isRegion = type => fieldTpyeDeal(type, 'Region'); // Region组件
    const isDateTime = type => fieldTpyeDeal(type, 'DateTime'); // DateTime组件
    const isDateTimeRange = type => fieldTpyeDeal(type, 'DateTimeRange'); // DateTimeRange组件
    const isRadioSelector = type => fieldTpyeDeal(type, 'Radio'); // radio组件
    const isCheckboxSelector = type => fieldTpyeDeal(type, 'Checkbox'); // Checkbox组件
    const isFileUpload = type => fieldTpyeDeal(type, 'File'); // 附件

    const getFormItemRules = (field) => {
      console.info('11111', field);
      const ruleObj = {
        required: false,
        trigger: 'change',
        message: `${field.name}格式不正确`,
      };
      if (isMail(field.inputType)) {
        // 邮箱检验
        return { ...ruleObj, type: 'email' };
      }
      if (isPhone(field.inputType)) {
        // 手机号校验
        return { ...ruleObj, pattern: /^1(3|4|5|6|7|8)\d{9}$/ };
      }
      if (isFileUpload(field.inputType)) {
        // 附件校验信息
        return { ...ruleObj };
      }
      return { ...ruleObj, validator: validateEmpty };
    };

    return {
      formData,
      utils,
      getFormItemRules,
      isInput,
      isMail,
      isPhone,
      isTextArea,
      isNumber,
      isMoney,
      isEnumSelector,
      isSearchSelector,
      isExpert,
      isTag,
      isInventor,
      isRegion,
      isDateTime,
      isDateTimeRange,
      isRadioSelector,
      isCheckboxSelector,
      isFileUpload,
      cascaderShow,
      initField,
    };
  },
});
</script>

<style lang="scss" scoped>
.dynamic-fields {
  ::v-deep .el-form-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
