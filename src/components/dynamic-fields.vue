<template>
  <div class="dynamic-fields">
    <template
      v-for="field in fields || []"
    >
      <el-form-item
        :label-width="`${!hideLabel?'150px':'0'}`"
        :key="`dynamic-${field.id}`"
        :prop="String(field.id)"
        :rules="getFormItemRules(field)"
        v-if="cascaderShow(field) && field.isVisible"
      >
        <template slot="label" v-if="!hideLabel">
          <span :title="field.name">{{ field.name }}</span>
        </template>
        <!-- 只读 -->
        <div v-if="field.isReadonly">
          <span v-if="isFileUpload(field.inputTypeName)">
            <display-attachment v-if="(getAttachment(field) || []).length > 0" :file-list="getAttachment(field)" />
          </span>
          <span v-else>{{ getDisplayName(field) }}</span>
        </div>
        <!-- 可编辑 -->
        <el-input
          v-else-if="isInput(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isMail(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isPhone(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :placeholder="`请输入${field.name}`"
        />
        <el-input
          v-else-if="isTextArea(field.inputTypeName)"
          v-model="formData[field.id]"
          :disabled="field.isReadonly"
          :rows="4"
          type="textarea"
          clearable
          :placeholder="`请输入${field.name}`"
        />
        <el-input-number
          v-else-if="isNumber(field.inputTypeName)"
          v-model="formData[field.id]"
          :min="0"
          :max="99999999"
          :step="1"
          step-strictly
          style="width: 200px"
        />
        <el-input-number
          v-else-if="isMoney(field.inputTypeName)"
          v-model="formData[field.id]"
          :min="0"
          :max="99999999"
          style="width: 200px"
        />
        <panel-select
          v-else-if="isEnumSelector(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :type="field.dictionaryType"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
        />
        <panel-select
          v-else-if="isAgent(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :type="field.dictionaryType"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          :default-options="defaultAgentOption"
        />
        <panel-select
          v-else-if="isDepartment(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :type="field.dictionaryType"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          :default-options="defaultDeptOption"
        />
        <panel-select-search
          v-else-if="isProjectSponsor(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :default-options="optionValueObj[field.id]"
          :query-key="field.queryKey"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          @changeitem="handleProjectSponsorChange"
        />
        <panel-select-search
          v-else-if="isSearchSelector(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :default-options="optionValueObj[field.id]"
          :query-key="field.queryKey"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
          @changeitem="handleSearchChange"
          :type="dealKey(field.inputTypeName)"
        />
        <panel-select-inventor
          v-else-if="isInventor(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :default-options="optionValueObj[field.id]"
          :query-key="field.queryKey"
          :placeholder="`请选择${field.name}`"
          :label-key="field.labelKey"
          :value-key="field.valueKey"
          :multiple="field.multiple"
        />
        <select-review-experts
          v-else-if="isExpert(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          :multiple="field.multiple"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :prop-opts="{ value: field.valueKey, label: field.labelKey }"
          :placeholder="`请选择${field.name}`"
        />
        <select-tags
          v-else-if="isTag(field.inputTypeName)"
          :disabled="field.isReadonly"
          v-model="formData[field.id]"
          @update-tag-data="tagDataList"
          :multiple="field.multiple"
          :api="`/patent-corp_api${field.dynamicSourceApi}`"
          :default-list="optionValueObj[field.id]"
          :prop-opts="{ value: field.valueKey, label: field.labelKey }"
          :placeholder="`请选择${field.name}`"
        />
        <el-date-picker
          v-else-if="isDateTime(field.inputTypeName)"
          v-model="formData[field.id]"
          style="width: 100%"
          value-format="yyyy-MM-dd"
          :disabled="field.isReadonly"
          :placeholder="`请选择${field.name}`"
        />
        <el-date-picker
          v-else-if="isDateTimeRange(field.inputTypeName)"
          type="daterange"
          v-model="formData[field.id]"
          value-format="yyyy-MM-dd"
          style="width: 100%"
          :disabled="field.isReadonly"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <panel-radio
          v-else-if="isRadioSelector(field.inputTypeName)"
          v-model="formData[field.id]"
          :placeholder="`请选择${field.name}`"
          :type="field.dictionaryType"
          :clickToCancel="clickToCancelForPanelRadio"
        />
        <panel-checkbox
          v-if="isCheckboxSelector(field.inputTypeName)"
          v-model="formData[field.id]"
          :placeholder="`请选择${field.name}`"
          :type="field.dictionaryType"
        />
        <selector-country
          v-else-if="isRegion(field.inputTypeName)"
          autocomplete="new-password"
          v-model="formData[field.id]"
          :multiple="field.multiple"
          :placeholder="`请选择${field.name}`"
        />
        <upload-attachment
          v-else-if="isFileUpload(field.inputTypeName)"
          v-model="formData[field.id]"
          drag
        />
        <upload-attachment
          v-else-if="isDisclosure(field.inputTypeName)"
          v-model="formData[field.id]"
          @change="handleDisclosureChange"
          drag
        />
      </el-form-item>
    </template>
  </div>
</template>

<script>
import {
  defineComponent, computed, reactive, toRefs, watch,
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
import DisplayAttachment from '@/components/display-attachment.vue';
import SelectTags from '@/components/select-tags.vue';
import { useHttp } from '@/hooks/http';
import { useUserInfo, useLookupsInject } from '@/context';

export default defineComponent({
  name: 'DynamicFields',
  props: {
    value: Object, // 表单model
    fields: Array, // 动态字段
    hideLabel: Boolean, // 是否隐藏表单Label
    clickToCancelForPanelRadio: Boolean, // 是否支持 Radio 点击取消
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
    SelectTags,
    DisplayAttachment,
  },
  setup(props, context) {
    const { emit } = context;
    const {
      userInfo,
    } = useUserInfo();

    const userInfoData = computed(() => userInfo.value);

    const state = reactive({
      optionValueObj: {},
    });

    const formData = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });

    const { getTypeName } = useLookupsInject();

    const validateEmpty = (rule, value, callback) => {
      if (utils.isEmpty(value) && rule.required) {
        if (rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
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
    const isProjectSponsor = type => fieldTpyeDeal(type, 'ProjectSponsor'); // 立项人组件
    const isDepartment = type => fieldTpyeDeal(type, 'Department'); // 部门组件
    const isAgent = type => fieldTpyeDeal(type, 'Agent'); // 代理人组件
    const isExpert = type => fieldTpyeDeal(type, 'Expert'); // Expert组件
    const isTag = type => fieldTpyeDeal(type, 'Tags'); // Expert组件
    const isInventor = type => fieldTpyeDeal(type, 'Inventor'); // 发明人组件
    const isRegion = type => fieldTpyeDeal(type, 'Region'); // Region组件
    const isDateTime = type => fieldTpyeDeal(type, 'DateTime'); // DateTime组件
    const isDateTimeRange = type => fieldTpyeDeal(type, 'DateTimeRange'); // DateTimeRange组件
    const isRadioSelector = type => fieldTpyeDeal(type, 'Radio'); // radio组件
    const isCheckboxSelector = type => fieldTpyeDeal(type, 'Checkbox'); // Checkbox组件
    const isFileUpload = type => fieldTpyeDeal(type, 'File'); // 附件
    const isDisclosure = type => fieldTpyeDeal(type, 'Disclosure'); // 交底书附件

    // 级联显示隐藏控制
    const cascaderShow = (field) => {
      if (!field.cascadedById) return true;
      const currentVal = formData.value[field.cascadedById];
      const { cascadedValues } = field;
      const compareVal = String(JSON.parse(cascadedValues)).includes(String(currentVal));
      if (!compareVal) { // 清空子集值（场景：第一级控制第二三级的时候，当关闭第一级，第三级也隐藏）
        if (
          isRadioSelector(field.inputTypeName)
          || isCheckboxSelector(field.inputTypeName)
        ) {
          formData.value[field.id] = undefined;
        }
        return false;
      }
      return compareVal;
    };

    const getFormItemRules = (field) => {
      const ruleObj = {
        required: field.isRequired,
        trigger: 'change',
        message: `${field.name}不能为空`,
      };
      if (isMail(field.inputTypeName)) { // 邮箱检验
        return [
          { ...ruleObj },
          { ...ruleObj, type: 'email', message: `${field.name}格式不正确` },
        ];
      }
      // if (isPhone(field.inputTypeName)) { // 手机号校验
      //   return [
      //     { ...ruleObj },
      //     { ...ruleObj, pattern: /^1(3|4|5|6|7|8)\d{9}$/, message: `${field.name}格式不正确` },
      //   ];
      // }
      if (isFileUpload(field.inputTypeName)) { // 附件校验信息
        return { ...ruleObj };
      }
      return { ...ruleObj, validator: validateEmpty };
    };
    const dealKey = (type) => {
      if (type.indexOf('|') === -1) return '';
      const typeArr = type.split('|');
      return typeArr[1];
    };
    const {
      data: agentData,
      fetchData,
    } = useHttp('/patent-corp_api/agents');
    const {
      url: groupUrl,
      data: groupsData,
      fetchData: fetchGroups,
    } = useHttp();

    // 特殊处理代理所代理人联动
    async function handleSearchChange(val) {
      if (val?.lawFirmName) {
        agentData.value = [];
        await fetchData({ lawFirmId: val.id });
      }
    }
    // 立项人和申请部门联动
    async function handleProjectSponsorChange(val) {
      if (val?.staffId) {
        groupsData.value = [];
        groupUrl.value = `/patent-corp_api/staffs/groups/${val.staffId}`;
        await fetchGroups();
        const currentGroups = (props.fields || []).find(item => item.inputTypeName === 'Department');
        // 默认选中第一个
        formData.value[currentGroups.id] = groupsData.value[0]?.groupId;
      }
    }
    const defaultAgentOption = computed(() => agentData.value || []);
    const defaultDeptOption = computed(() => groupsData.value || []);

    const handleDisclosureChange = (val) => {
      console.info('交底书名称默认赋值==>', val);
      // 取交底书名称
      // const disclosureName = (props.fields || []).find(item => dealKey(item.inputTypeName) === 'DisclosureName');
      // formData.value[disclosureName.id] = val[0]?.fileName;
    };

    const initField = () => {
      // 动态组件赋默认值
      let interFormData = {};
      (props.fields || []).forEach((item) => {
        let val;
        // 立项人和申请部门单独处理
        if (item.inputTypeName === 'ProjectSponsor') {
          state.optionValueObj = {
            ...state.optionValueObj,
            [item.id]: [{
              staffFullName: userInfoData.value.staffFullName,
              staffId: userInfoData.value.staffId,
            }],
          };
          val = userInfoData.value.staffId;
          handleProjectSponsorChange(userInfoData.value);
        } else if (['File', 'Tags'].includes(item.inputTypeName) || item.multiple) {
          if (item.value) {
            val = JSON.parse(item.value);
          } else {
            val = [];
          }
          if (item.inputTypeName === 'File' && item.optionValue) {
            val = JSON.parse(item.optionValue);
          }
          if (item.inputTypeName === 'Tags' && item.optionValue) {
            state.optionValueObj = {
              ...state.optionValueObj,
              [item.id]: JSON.parse(item.optionValue),
            };
            (state.optionValueObj[item.id] || []).forEach((opt) => {
              val.push([opt.firstId, opt.secondId, opt.thirdId]);
            });
          }
        } else if (item.value) {
          // eslint-disable-next-line prefer-destructuring
          val = JSON.parse(item.value)[0];
        } else {
          val = undefined;
        }
        // 代理人默认option
        if (
          dealKey(item.inputTypeName) === 'LawFirm'
          && item.optionValue
        ) {
          const optionValue = JSON.parse(item.optionValue);
          handleSearchChange({ ...optionValue[0] });
        }
        if (item.optionValue) { // 处理默认值option
          state.optionValueObj = {
            ...state.optionValueObj,
            [item.id]: JSON.parse(item.optionValue),
          };
        }
        interFormData = {
          ...interFormData,
          ...{ [item.id]: val },
        };
      });
      formData.value = interFormData;
    };

    const getDisplayName = (field) => {
      if ( // search类型
        isSearchSelector(field.inputTypeName)
        || isProjectSponsor(field.inputTypeName)
        || isDepartment(field.inputTypeName)
        || isAgent(field.inputTypeName)
        || isInventor(field.inputTypeName)
      ) {
        if (field.optionValue) {
          const optionValue = JSON.parse(field.optionValue);
          const displayName = (optionValue || []).map(item => item[field.labelKey]);
          return displayName.join(';');
        }
      }
      if ( // 枚举类型
        isRadioSelector(field.inputTypeName)
        || isCheckboxSelector(field.inputTypeName)
        || isEnumSelector(field.inputTypeName)
      ) {
        if (field.value) {
          const displayName = (JSON.parse(field.value) || []).map(item => getTypeName(Number(item)));
          return displayName.join(';');
        }
      }
      if (field.value) {
        return JSON.parse(field.value)[0];
      }
      return field.value;
    };

    const getAttachment = (field) => {
      if (field.optionValue) {
        return JSON.parse(field.optionValue);
      }
      return [];
    };

    const tagDataList = (list) => {
      emit('update:tag-data', list);
    };

    watch(() => props.fields, () => {
      initField();
    }, { deep: true, immediate: true });

    return {
      ...toRefs(state),
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
      isProjectSponsor,
      isDepartment,
      isAgent,
      isExpert,
      isTag,
      isInventor,
      isRegion,
      isDateTime,
      isDateTimeRange,
      isRadioSelector,
      isCheckboxSelector,
      isFileUpload,
      isDisclosure,
      cascaderShow,
      handleSearchChange,
      handleProjectSponsorChange,
      tagDataList,
      defaultAgentOption,
      defaultDeptOption,
      handleDisclosureChange,
      getDisplayName,
      getAttachment,
      dealKey,
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
