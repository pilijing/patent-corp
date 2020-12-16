<template>
  <div class="propertyFieldForm">
    <el-dialog
      :title="formData.id ? '编辑字段' : '添加字段'"
      :visible.sync="isPropertyFieldDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      width="850px"
      @open="submitButtonDisabled = false"
      @close="submitButtonDisabled = true"
    >
      <el-form
        :model="formData"
        :rules="rules"
        label-width="90px"
        id="propertyFieldForm"
        ref="propertyFieldForm"
      >
        <el-form-item
          label="字段名称"
          prop="name"
          required
          :label-width="formLabelWidth"
        >
          <el-input v-model="formData.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="英文名称"
          prop="englishName"
          required
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="formData.englishName"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="字段类型"
          prop="inputType"
          required
          :label-width="formLabelWidth"
        >
          <el-select
            filterable
            v-model="formData.inputType"
            @change="handlerInputTypeChange"
            placeholder="请选择"
          >
            <el-option
              v-for="item in getFieldTypesState.data"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

          <el-form-item
          label="附件类型"
          prop="attachmentType"
          :label-width="formLabelWidth"
          v-if="selectedFieldType=='File'"
        >
        <panel-select
            v-model="formData.attachmentType"
            type="FILE_TYPE"
            placeholder="请选择附件类型"
          />
        </el-form-item>

        <div style="display: flex">
          <el-form-item label="级联关系" :label-width="formLabelWidth">
            <el-select
              filterable
              v-model="formData.cascadedById"
              placeholder="请选择"
              clearable
              @change="handlerCascadedByIdChange"
            >
              <el-option
                v-for="item in fieldTableData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            style="flex-grow: 1;"
            label-width="100px"
            label="值"
            v-show="
              formData.cascadedById != null && formData.cascadedById != ''
            "
          >
            <!-- 级联右边的控件 -->
            <!-- <control-type
              :typeValue="rightInputType"
              v-model="formData.cascadedValues"
              :fieldTypeData="getFieldTypesState.data"
              @changeControlTypeItem="handleRightControlChange"
              :defaultOptions="cascadedStaffOptions"
            >
            </control-type> -->
            <panel-select
              v-if="isShowSelect"
              :type="cascadedFields[0].dictionaryType"
              multiple
              v-model="formData.cascadedValues"
            />
            <control-type label-width="0px"
              v-else
              :fields="cascadedFields"
              v-model="formData"
            />
          </el-form-item>
        </div>

        <el-form-item label="是否必填" :label-width="formLabelWidth" required>
          <el-radio-group v-model="formData.isRequired">
            <el-radio border :label="true">是</el-radio>
            <el-radio border :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否显示" :label-width="formLabelWidth" required>
          <el-radio-group v-model="formData.isVisible">
            <el-radio border :label="true">是</el-radio>
            <el-radio border :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否只读" :label-width="formLabelWidth" required>
          <el-radio-group v-model="formData.isReadonly">
            <el-radio border :label="true">是</el-radio>
            <el-radio border :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认值" :label-width="formLabelWidth">
          <el-radio-group
            v-model="formData.defaultValueType"
          >
            <el-radio
              @click.native.prevent="clickitem(item.id)"
              :key="item.id"
              v-for="item in defaultValues"
              :label="item.id"
               border
              >{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- <el-form-item
          label="固定值"
          prop="defaultValueCriteria"
          :label-width="formLabelWidth"
          :rules="[{ validator: validateControl }]"
          v-show="formData.defaultValueType == fixedValue"
        > -->

        <div style="display: flex; justify-content: space-between;">
          <el-form-item
            label="固定值"
            :label-width="formLabelWidth"
            v-show="formData.defaultValueType === defaultValue.FIXEDVALUE && isDateTime"
          >
            <panel-select
              type="DATE_TYPE"
              v-model="formData.dataType"
              :style="{ 'width': (isDateTime ? '130px' : '100%') }"
            />
          </el-form-item>
          <control-type
            :label-width="isDateTime ? '0' : '150px'"
            :fields="fields"
            v-if="isShowDynamicField"
            v-model="formData"
            :style="{ 'width': (isDateTime ? '150px' : '100%') }"
          />
          <!-- </el-form-item> -->

          <el-form-item
            label="阶段字段值"
            :label-width="formLabelWidth"
            v-show="formData.defaultValueType == copyStepField"
          >
            <el-select
              filterable
              clearable
              v-model="formData.copyStepField"
              placeholder="请选择"
            >
              <el-option
                v-for="item in inputChangeStageFieldsData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="专利字段值"
            :label-width="formLabelWidth"
            v-show="formData.defaultValueType == copyPatentField"
          >
            <el-select
              filterable
              clearable
              v-model="formData.copyPatentField"
              placeholder="请选择"
            >
              <el-option
                v-for="item in inputChangePatentsStateData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <template v-if="formData.defaultValueType">
            <el-form-item
              label-width="0"
              v-if="isDateTime"
            >
              <el-radio-group v-model="formData.dateOperator">
                <el-radio-button label="+"></el-radio-button>
                <el-radio-button label="-"></el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label-width="0"
              v-if="isDateTime"
            >
              <el-input-number
                :controls="false"
                v-model="formData.dateInteger"
                :min="0"
                :max="9999"
                label="输入天数"
              />
            </el-form-item>
          </template>
        </div>

        <el-form-item label="更新对应的专利值" :label-width="formLabelWidth">
          <el-select
            filterable
            clearable
            v-model="formData.syncToPatentField"
            placeholder="请选择"
          >
            <el-option
              v-for="item in inputChangePatentsStateData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="更新阶段字段值"
          prop="syncToStageField"
          :label-width="formLabelWidth"
        >
          <el-select
            filterable
            clearable
            v-model="formData.syncToStageField"
            placeholder="请选择"
          >
            <el-option
              v-for="item in inputChangeStageFieldsData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

         <el-form-item
          label="更新阶段主体字段"
          prop="syncToStageBodyField"
          :label-width="formLabelWidth"
        >
          <el-select
            filterable
            clearable
            v-model="formData.syncToStageBodyField"
            placeholder="请选择"
          >
            <el-option
              v-for="item in inputChangeStageStateData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="更新步骤主体字段"
          prop="syncToStepBodyField"
          :label-width="formLabelWidth"
        >
          <el-select
            filterable
            clearable
            v-model="formData.syncToStepBodyField"
            placeholder="请选择"
          >
            <el-option
              v-for="item in inputChangeStepStateData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="更新步骤主体字段" :label-width="formLabelWidth">
        <el-select
          filterable
          v-model="formData.syncToParentField"
          placeholder="请选择"
        >
          <el-option
            v-for="item in syncToParentFieldList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item> -->
      </el-form>
      <div class="submit-btn">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :loading="loading"
          :disabled="submitButtonDisabled"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script  lang="ts">
import {
  computed,
  defineComponent,
  onUpdated,
  reactive,
  ref,
  watch,
  toRefs,
  onMounted,
} from '@vue/composition-api';
import { StageClaimsField } from '@/types/claim-detail';
import {
  useLookupsInject,
  useOfficialClaimDetailInject,
  useStageFieldsInject,
} from '@/context';
import { ElForm } from 'element-ui/types/form';
import { Message } from 'element-ui';
import { getInputRules, getSelectRules } from '@/utils/form-rules';
import { BasicSource, useBasicSourceInject } from '@/context/basic-source';
import utils from '@/utils';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import ControlType from '@/views/pages/backstage-management/blocks/control-type.vue';
import { NullableData } from '@/types/common';
import cloneDeep from 'lodash/cloneDeep';
import { getMainType } from '@/utils/property-field';

interface Props {
  visible: boolean;
  defaultPropertyField?: StageClaimsField;
  loading?: boolean;
  fieldTableData: Array<StageClaimsField>;
}

const initialFormData: any = {
  id: 0, // id
  cascadedById: null, // 受级联控制的字段id
  // cascadedValues: '1;2;', // 级联控制的值(可多个，以;分隔)
  defaultValueCriteria: null, // 默认
  defaultValueName: '', // 'string';
  defaultValueType: null,
  cascadedValuesName: '', // 'string';
  englishName: '', // 英文名称
  inputType: null, // 类型
  attachmentType: null,
  isReadonly: false, // 是否只读
  isRequired: false, // 是否必填
  isVisible: false, // 是否显示
  name: '', // 名称
  priority: 0, // 排序
  syncToParentField: null, // 更新事件主体列 更新步骤主体字段 TODO
  syncToPatentField: null, // 更新对应的专利值 TODO
  syncToStageField: null, // 更新阶段字段值
  syncToStageBodyField: null, // 更新阶段主体字段
  syncToStepBodyField: null, // 更新步骤主体字段
  staffFullName: null,
  cascadedValues: null, // 关联字段的值
  // copyStepField: null, // 阶段字段值
  // copyPatentField: null, // 专利字段值
};
const state = reactive({
  selectedFieldType: 'Input' as string | null,
  cascadedType: null as number | null, // 级联下拉框右边的类型
  rightInputType: null as number | null,
  rightFieldType: 'Input' as string | null,
  newcreat: true,
  fixedValue: null,
  copyStepField: null,
  copyPatentField: null,
  inputChangeStageFieldsData: [] as any[],
  inputChangePatentsStateData: [] as any[],
  inputChangeStageStateData: [] as any[],
  inputChangeStepStateData: [] as any[],
  fields: [] as any[],
  cascadedFields: [] as any[],
  isFileType: false,
  isDateTime: false,
});

const propertyFieldRules = {
  name: getInputRules('请输入字段名称'),
  englishName: getInputRules('请输入英文名称'),
  inputType: getSelectRules('请选择字段类型'),
  attachmentType: getSelectRules('请选择附件类型'),
};

export default defineComponent({
  name: 'PropertyFieldDialog',
  components: {
    PanelSelectSearch,
    ControlType,
    PanelSelect,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    defaultPropertyField: Object,
    loading: Boolean,
    fieldTableData: Array,
  },
  setup(props: Props, { emit }) {
    const regexList = computed(() => ({
      phone: /^[1][3,4,5,6,7,8][0-9]{9}$/,
      email: /^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}$/,
    }));
    const { lookups, defaultValues, getEnumsInfo } = useLookupsInject();
    const defaultValue = computed(() => getEnumsInfo('DEFAULT_VALUE'));
    const submitButtonDisabled = ref(false);

    const formData = ref(props.defaultPropertyField
      ? { ...props.defaultPropertyField }
      : { ...initialFormData });
    const propertyFieldForm = ref<ElForm | null>(null);
    const formLabelWidth = ref('150px');
    // 更新阶段字段值
    const { stageFields } = useStageFieldsInject();
    const {
      isPropertyFieldDialogVisible,
      setIsPropertyFieldDialogVisible,
    } = useOfficialClaimDetailInject();

    const rules = reactive(propertyFieldRules);

    // TODO 暂时不做 更新步骤主体字段
    const syncToParentFieldList = computed(() => lookups.value.filter(lookup => lookup.type === 'STEP_BODY_FIELD'));
    // 字段类型   更新对应的专利值
    const {
      getFieldTypesState,
      getSyncToPatentsState,
      getStepDefinitionState,
      getStageDefinitionState,
    } = useBasicSourceInject();

    onUpdated(() => {
      if (
        props.defaultPropertyField === null
        && isPropertyFieldDialogVisible.value === true
      ) {
        clearValidationMsg();
      }
    });

    function clearValidationMsg() {
      if (!propertyFieldForm.value) {
        Message.error('表单DOM不存在');
        return;
      }
      propertyFieldForm.value.clearValidate();
    }

    function handleCancel() {
      setIsPropertyFieldDialogVisible(false);
    }
    function setValueWithCancel() {
      // 取消选择时，更新对应的专利值 变成''，需要改成 null
      if (!formData.value.syncToPatentField) {
        formData.value.syncToPatentField = null;
      }
      // 取消选择时，更新阶段字段值 变成''，需要改成 null
      if (!formData.value.syncToStageField) {
        formData.value.syncToStageField = null;
      }
      // 步骤主体字段
      if (!formData.value.syncToStepBodyField) {
        formData.value.syncToStepBodyField = null;
      }
      // 阶段主体字段
      if (!formData.value.syncToStageBodyField) {
        formData.value.syncToStageBodyField = null;
      }

      // 取消选择时，复制阶段字段值 变成''，需要改成 null
      if (!formData.value.copyStepField) {
        formData.value.copyStepField = null;
      }
      // 取消选择时，复制专利字段值 变成''，需要改成 null
      if (!formData.value.copyPatentField) {
        formData.value.copyPatentField = null;
      }
      // 取消选择时，级联关系变成''，需要改成 null
      if (!formData.value.cascadedById) {
        formData.value.cascadedById = null;
      }
      // 取消选择时，级联关系值 变成''，需要改成 null
      if (!formData.value.cascadedValues) {
        formData.value.cascadedValues = null;
      }
    }

    function handleConfirm() {
      if (!propertyFieldForm.value) {
        Message.error('表单DOM不存在');
        return;
      }
      propertyFieldForm.value.validate((valid) => {
        if (!valid) {
          return false;
        }
        setValueWithCancel();
        const submitData = cloneDeep(formData.value);
        if (formData.value.defaultValueCriteria !== null) {
          if (state.selectedFieldType === 'DateTimeRange') {
            // eslint-disable-next-line prefer-destructuring
            const startTime = formData.value.defaultValueCriteria[0];
            // eslint-disable-next-line prefer-destructuring
            const endTime = formData.value.defaultValueCriteria[1];
            const arrayValue = [];
            arrayValue.push(utils.dateFormat(startTime, 'YYYY-MM-DD'));
            arrayValue.push(utils.dateFormat(endTime, 'YYYY-MM-DD'));
            submitData.defaultValueCriteria = JSON.stringify(arrayValue);
          } else if (state.selectedFieldType === 'DateTime') {
            const datetime = submitData.defaultValueCriteria;
            const arrayValue = [];
            arrayValue.push(utils.dateFormat(datetime, 'YYYY-MM-DD'));
            submitData.defaultValueCriteria = JSON.stringify(arrayValue);
          } else if (state.selectedFieldType === 'File' || Array.isArray(submitData.defaultValueCriteria)) {
            submitData.defaultValueCriteria = JSON.stringify(submitData.defaultValueCriteria);
          } else if (submitData.defaultValueCriteria) {
            const arrayValue = [];
            arrayValue.push(submitData.defaultValueCriteria);
            submitData.defaultValueCriteria = JSON.stringify(arrayValue);
          }
        }
        if (formData.value.cascadedValues !== null) {
          if (state.rightFieldType === 'DateTimeRange') {
            // eslint-disable-next-line prefer-destructuring
            const startTime = submitData.cascadedValues[0];
            // eslint-disable-next-line prefer-destructuring
            const endTime = submitData.cascadedValues[1];
            const arrayValue = [];
            arrayValue.push(utils.dateFormat(startTime, 'YYYY-MM-DD'));
            arrayValue.push(utils.dateFormat(endTime, 'YYYY-MM-DD'));
            submitData.cascadedValues = JSON.stringify(arrayValue);
          } else if (state.rightFieldType === 'DateTime') {
            const datetime = submitData.cascadedValues;
            const arrayValue = [];
            arrayValue.push(utils.dateFormat(datetime, 'YYYY-MM-DD'));
            submitData.cascadedValues = JSON.stringify(arrayValue);
          } else if (state.rightFieldType === 'File' || Array.isArray(submitData.cascadedValues)) {
            submitData.cascadedValues = JSON.stringify(submitData.cascadedValues);
          } else if (submitData.cascadedValues) {
            const arrayValue = [];
            arrayValue.push(submitData.cascadedValues);
            submitData.cascadedValues = JSON.stringify(arrayValue);
          }
        }
        if (formData.value.defaultValueType !== defaultValue.value.FIXEDVALUE) {
          submitData.defaultValueCriteria = '';
        }
        emit('confirm', submitData);
        return true;
      });
    }

    const initData = () => {
      state.fixedValue = defaultValue.value.FIXEDVALUE;
      state.copyStepField = defaultValue.value.COPYSTEPFIELD;
      state.copyPatentField = defaultValue.value.COPYPATENTFIELD;

      stageFields.value = stageFields.value.map((data) => {
        data.type = getTypeName(Number(data.inputType));
        return data;
      });
    };

    onMounted(async () => {
      initData();
    });

    function getTypeName(id: number) {
      return (
        getFieldTypesState.data.find(item => item.id === id)?.type ?? null
      );
    }
    // 初始化赋值阶段字段值和专利字段值
    const initCopyData = () => {
      // 阶段字段值数据源与字段类型数据类型保持一致
      state.inputChangeStageFieldsData = stageFields.value.filter(p => p.type === state.selectedFieldType);
      state.inputChangePatentsStateData = getSyncToPatentsState.data.filter(p => p.type === state.selectedFieldType);

      state.inputChangeStepStateData = getStepDefinitionState.data.filter(p => p.type === state.selectedFieldType);
      state.inputChangeStageStateData = getStageDefinitionState.data.filter(p => p.type === state.selectedFieldType);
    };
    const initInputTypeChange = (val: any) => {
      const fieldItem = getFieldTypesState.data.find((item: any) => item.id === val);
      if (!fieldItem) {
        return;
      }

      if (fieldItem.type !== null && fieldItem.type.indexOf('File') > -1) {
        state.isFileType = true;
      } else {
        state.isFileType = false;
      }
      if (fieldItem.type !== null && fieldItem.type === 'DateTime') {
        state.isDateTime = true;
      } else {
        state.isDateTime = false;
      }
      if (formData.value.attachmentType === 0) {
        formData.value.attachmentType = null;
      }
      state.selectedFieldType = fieldItem.type;
      initCopyData();
      let defaultValueParse = null;
      let defaultValueOption = null;
      if (fieldItem.type !== null) {
        if (
          formData.value.defaultValueType === defaultValue.value.FIXEDVALUE
            && formData.value.defaultValueCriteria !== null
        ) {
          if (formData.value.defaultValueCriteria.toString().indexOf('[') > -1
          && formData.value.defaultValueCriteria.toString().indexOf(']') > -1) {
            defaultValueParse = JSON.parse(formData.value.defaultValueCriteria);
            if (defaultValueParse.length === 1 && fieldItem.type !== 'File') {
              // eslint-disable-next-line prefer-destructuring
              defaultValueParse = defaultValueParse[0];
            }
          } else {
            defaultValueParse = formData.value.defaultValueCriteria;
          }
        } else {
          defaultValueParse = null;
          formData.value.defaultValueCriteria = '';
        }

        // 给option赋值
        if (
          formData.value.defaultValueType === defaultValue.value.FIXEDVALUE
            && formData.value.defaultValueName !== null
        ) {
          if (formData.value.defaultValueName.indexOf('[') > -1
          && formData.value.defaultValueName.indexOf(']') > -1) {
            defaultValueOption = JSON.parse(formData.value.defaultValueName);

            // defaultValueNameParse.forEach((p: any) => {
            //   p.id = Number(p.id);
            //   p.staffId = Number(p.id);
            // });
          } else {
            defaultValueOption = formData.value.defaultValueName;
          }
        }
      }
      state.fields = [
        {
          defaultValueCriteria: defaultValueParse,
          dictionaryType: fieldItem.dictionaryType,
          displayName: '',
          displayType: '',
          dynamicSourceApi: fieldItem.dynamicSourceApi,
          hasDynamicSource: true,
          id: 'defaultValueCriteria',
          inputType: fieldItem.type,
          labelKey: fieldItem.labelKey,
          multiple: fieldItem.multiple,
          isRequired: false,
          name: '固定值',
          priority: 1,
          queryKey: fieldItem.queryKey,
          value: defaultValueParse,
          valueKey: fieldItem.valueKey,
          options:
           fieldItem.labelKey !== null && fieldItem.valueKey !== null
             ? defaultValueOption
             : [],
        },
      ];

      const fieldVal = state.fields.map(item => ({
        [item.id]: item.value,
      }));
      formData.value = { ...formData.value, ...fieldVal[0] };
      console.info(fieldVal);
    };
    function clickitem(val: any) {
      if (formData.value.defaultValueType === state.fixedValue) {
        formData.value.copyStepField = null;
        formData.value.copyPatentField = null;
        initInputTypeChange(formData.value.inputType);
      } else if (formData.value.defaultValueType === state.copyStepField) {
        formData.value.defaultValueCriteria = null;
        formData.value.copyPatentField = null;
      } else if (formData.value.defaultValueType === state.copyPatentField) {
        formData.value.defaultValueCriteria = null;
        formData.value.copyStepField = null;
      }

      if (val === formData.value.defaultValueType) {
        formData.value.defaultValueType = null;
      } else {
        formData.value.defaultValueType = val;
      }
    }
    const handlerInputTypeChange = (inputType: number) => {
      formData.value.defaultValueCriteria = null;
      const fieldItem = getFieldTypesState.data.find((item: NullableData<BasicSource>) => item.id === inputType);
      console.log('专利字段 in basic source ', fieldItem);
      if (!fieldItem) {
        return;
      }
      state.selectedFieldType = fieldItem.type;
      initCopyData();
      formData.value.defaultValueCriteria = null;
      formData.value.syncToPatentField = null;
      formData.value.syncToStageField = null;
      formData.value.copyStepField = null;
      formData.value.copyPatentField = null;
      formData.value.syncToStageBodyField = null;
      formData.value.syncToStepBodyField = null;

      state.fields = [];
      if (fieldItem.type !== null && fieldItem.type.indexOf('File') > -1) {
        formData.value.defaultValueCriteria = [];
        state.isFileType = true;
      } else {
        state.isFileType = false;
      }
      if (fieldItem.type !== null && fieldItem.type === 'DateTime') {
        state.isDateTime = true;
      } else {
        state.isDateTime = false;
      }
      state.fields = [
        {
          defaultValueCriteria: formData.value.defaultValueCriteria,
          dictionaryType: fieldItem.dictionaryType,
          displayName: '',
          displayType: '',
          dynamicSourceApi: fieldItem.dynamicSourceApi,
          hasDynamicSource: true,
          id: 'defaultValueCriteria',
          inputType: fieldItem.type,
          labelKey: fieldItem.labelKey,
          multiple: fieldItem.multiple,
          isRequired: false,
          name: '固定值',
          priority: 1,
          queryKey: fieldItem.queryKey,
          value: formData.value.defaultValueCriteria,
          valueKey: fieldItem.valueKey,
          // options: (fieldItem.labelKey !== null && fieldItem.valueKey !== null) ? [
          //   {
          //     [fieldItem.labelKey]: formData.value.defaultValueName,
          //     [fieldItem.valueKey]: formData.value.defaultValueCriteria,
          //   },
          // ] : [],
        },
      ];
      const fieldVal = state.fields.map(item => ({
        [item.id]: item.value,
      }));
      formData.value = { ...formData.value, ...fieldVal[0] };
      console.info(fieldVal);
    };
    // 级联关系下拉框change事件
    const initCascadedByIdChange = (val: any) => {
      // 级联下拉框的值
      const fItem = props.fieldTableData.find((item: any) => item.id === val);
      if (!fItem) {
        return;
      }
      state.rightInputType = fItem.inputType;

      const fieldItem = getFieldTypesState.data.find((item: any) => item.id === fItem.inputType);
      if (!fieldItem) {
        return;
      }
      state.rightFieldType = fieldItem.type;

      let cascadedValues = null;
      // let needSplit = false;
      // if (fieldItem.type !== null) {
      //   if (fieldItem.type.indexOf('Checkbox') > -1) {
      //     needSplit = true;
      //     if (formData.value.cascadedValues !== null) {
      //       cascadedValues = formData.value.cascadedValues
      //         .split(';')
      //         .map((p: any) => Number(p));
      //     }
      //   } else if (fieldItem.type.indexOf('DateTimeRange') > -1) {
      //     needSplit = true;
      //     cascadedValues = formData.value.cascadedValues.split(';');
      //   } else if (fieldItem.type.indexOf('Radio') > -1) {
      //     formData.value.cascadedValues = Number(formData.value.cascadedValues);
      //   } else {
      //     cascadedValues = formData.value.cascadedValues;
      //   }
      // }
      let cascadedValueOption = null;
      if (fieldItem.type !== null) {
        if (
          formData.value.cascadedValues !== null
        ) {
          if (formData.value.cascadedValues.indexOf('[') > -1
          && formData.value.cascadedValues.indexOf(']') > -1) {
            cascadedValues = JSON.parse(formData.value.cascadedValues);
            // if (cascadedValues.length === 1) {
            //   cascadedValues = cascadedValues[0];
            // }
          } else {
            // eslint-disable-next-line prefer-destructuring
            cascadedValues = formData.value.cascadedValues;
          }
        }

        // 给option赋值
        if (
          formData.value.cascadedValuesName !== null
        ) {
          if (formData.value.cascadedValuesName.indexOf('[') > -1
          && formData.value.cascadedValuesName.indexOf(']') > -1) {
            cascadedValueOption = JSON.parse(formData.value.cascadedValuesName);
          } else {
            cascadedValueOption = formData.value.cascadedValuesName;
          }
        }
      }
      state.cascadedFields = [
        {
          defaultValueCriteria: formData.value.cascadedValues,
          dictionaryType: fieldItem.dictionaryType,
          displayName: '',
          displayType: '',
          dynamicSourceApi: fieldItem.dynamicSourceApi,
          hasDynamicSource: true,
          id: 'cascadedValues',
          inputType: fieldItem.type,
          labelKey: fieldItem.labelKey,
          multiple: fieldItem.multiple,
          isRequired: false,
          name: '',
          priority: 1,
          queryKey: fieldItem.queryKey,
          value: cascadedValues,
          valueKey: fieldItem.valueKey,
          options:
              fieldItem.labelKey !== null && fieldItem.valueKey !== null
                ? cascadedValueOption
                : [],
        },
      ];
      const fieldVal = state.cascadedFields.map(item => ({
        [item.id]: item.value,
      }));
      formData.value = { ...formData.value, ...fieldVal[0] };
      console.info(fieldVal);
    };

    // 是否显示panel-select
    const isShowSelect = computed(() => {
      // if (condition) {
      const inputType = state.cascadedFields[0]?.inputType || '';
      const type = getMainType(inputType);
      return state.cascadedFields.length > 0
        && ['Enum', 'Radio', 'Checkbox'].includes(type);
      // }
    });
    // 级联关系下拉框change事件
    const handlerCascadedByIdChange = (val: any) => {
      formData.value.cascadedValues = null;
      // 级联下拉框的值
      initCascadedByIdChange(val);
    };
    // 默认控件赋值
    function handleControlChange(info: any) {
      formData.value.defaultValueCriteria = info.toString();
    }
    // 联动右边控件赋值
    function handleRightControlChange(info: any) {
      formData.value.cascadedValues = info.toString();
    }
    // function changeControlTypeItem(infoData: any) {
    //   console.log('infoData', infoData);
    // }
    // const { dateFormat } = utils;
    const validateStaff = (rule: any, value: any, callback: any) => {
      if (utils.isEmpty(value) && rule.message) {
        return callback(new Error(rule.message));
      }
      return callback();
    };
    const validateControl = (rule: any, value: any, callback: any) => {
      if (state.selectedFieldType === 'Input|Mail') {
        const { email } = regexList.value;
        if (!email.test(value)) {
          return callback(new Error('邮箱格式不合法'));
        }
      } else if (state.selectedFieldType === 'Input|Phone') {
        const { phone } = regexList.value;
        if (!phone.test(value)) {
          return callback(new Error('手机格式不合法'));
        }
      }
      return callback();
    };

    const dateType = computed(() => getEnumsInfo('DATE_TYPE'));
    const isShowDynamicField = computed(() => {
      // 不是日期类型
      const notDateTimeType = !state.isDateTime && formData.value.defaultValueType === state.fixedValue;
      // 是日期类型并且选择‘固定值’
      const dateTimeType = state.isDateTime
        && formData.value.defaultValueType === defaultValue.value.FIXEDVALUE
        && formData.value.dataType === dateType.value.DATE_TYPE_FIXED;
      return notDateTimeType || dateTimeType;
    });

    watch(isPropertyFieldDialogVisible, (curVisible: boolean) => {
      if (curVisible) {
        if (props.defaultPropertyField === null) {
          formData.value = { ...initialFormData };
          state.selectedFieldType = 'Input';
          // state.isFileType = false;
        } else {
          formData.value = {
            ...initialFormData,
            ...props.defaultPropertyField,
          };
          // 级联下拉框的change事件，影响级联右边的下拉框
          initCascadedByIdChange(formData.value.cascadedById);
          // 字段类型change事件后，给默认值的控件赋值
          initInputTypeChange(formData.value.inputType);
        }
      }
    });

    return {
      submitButtonDisabled,
      ...toRefs(state),
      formData,
      propertyFieldForm,
      rules,
      formLabelWidth,
      handleCancel,
      handleConfirm,
      syncToParentFieldList,
      isPropertyFieldDialogVisible,
      setIsPropertyFieldDialogVisible,
      stageFields,
      getFieldTypesState,
      getSyncToPatentsState,
      handlerInputTypeChange,
      validateStaff,
      handlerCascadedByIdChange,
      handleControlChange,
      handleRightControlChange,
      validateControl,
      initInputTypeChange,
      defaultValues,
      initData,
      clickitem,
      isShowSelect,
      isShowDynamicField,
      defaultValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.property-field_dialog {
  height: 531px;
  overflow: scroll;
}
.submit-btn {
  width: 100%;
  text-align: center;
  margin-top: 20px;
  .el-button {
    width: 90px;
    background-color: rgba(0, 121, 254, 1);
    border-radius: 3px;
    font-size: 12px;
    color: #ffffff;
  }
}

#propertyFieldForm {
  .el-dialog__body {
    padding-right: 0;
  }
  padding-right: 30px;
  overflow-y: auto;
}
::v-deep {
  .el-dialog__body {
    padding-right: 0;
  }
}
</style>
