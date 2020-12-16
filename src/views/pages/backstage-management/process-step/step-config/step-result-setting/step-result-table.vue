<template>
  <div class="step-result-table">
    <el-button
      v-if="finishType === 3921"
      @click="handleAddStepResult"
      type="primary"
      style="margin-bottom: 10px"
      size="small"
    >添加步骤结果</el-button>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        v-if="finishType === 3921"
        label="操作"
        align="center"
        width="100"
      >
        <template #default="{ $index }">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete($index)"
          >删除</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="finishType === 3920"
        label="步骤结果"
        prop="stepResultId"
        align="center"
        width="100"
        :formatter="formatterText"
      >
      </el-table-column>
      <el-table-column
        v-if="finishType === 3921"
        label="是否正常通过"
        align="center"
        width="180"
      >
        <template #default="{ row, $index }">
          <panel-radio
            v-model="row.stepResultId"
            type="STEP_RESULT_YESORNO"
            size="small"
            button
            @click.native.prevent="handleAdoptChange($index)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="finishType === 3921"
        label="对应字段值选项"
        align="center"
        width="200"
      >
        <template #default="{ row }">
          <panel-select
            v-if="showSelect"
            :type="row.dynamicField[0].dictionaryType"
            multiple
            collapse-tags
            v-model="row.selectedOptions"
            size="small"
          />
          <dynamic-fields
            v-else-if="fieldType"
            :fields="row.dynamicField"
            v-model="row.selectedDynamicFieldMap"
            :hideLabel="true"
            :clickToCancelForPanelRadio="true"
          />
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column
        label="进入其他步骤"
        align="center"
        min-width="650"
      >
        <template #default="{ row }">
          <el-row
            type="flex"
            justify="start"
            align="middle"
          >
            <el-form-item
              class="is-end_form-item"
              label-width="100"
              label="是否保留当前不变"
              required
              prop="isInCurrent"
              style="width: 240px"
            >
              <el-radio-group
                size="small"
                v-model="row.isInCurrent"
              >
                <el-radio-button :label="true">是</el-radio-button>
                <el-radio-button :label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="row.isInCurrent === false"
              class="is-end_form-item"
              label-width="100"
              label="是否结项"
              required
              prop="isEnd"
              style="width: 200px"
            >
              <el-radio-group
                size="small"
                v-model="row.isEnd"
                @change="handleIsEndChange"
              >
                <el-radio-button :label="true">是</el-radio-button>
                <el-radio-button :label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label-width="0"
              v-if="row.isInCurrent === false && row.isEnd === false"
              required
            >
              <el-cascader
                v-model="row.selectedNextStageStep"
                placeholder="请选择下一步进入的步骤"
                clearable
                :options="getStageStepTreeState.data"
                @change="handleNextStepChange(row)"
                size="small"
                v-loading="getStageStepTreeState.loading"
              >
              </el-cascader>
            </el-form-item>
          </el-row>
        </template>
      </el-table-column>
      <!-- 更新专利状态至 -->
      <el-table-column
        label="更新专利状态至"
        align="center"
        width="450"
      >
        <template #default="{ row }">
          <el-row
            type="flex"
            justify="start"
            align="middle"
          >
            <el-form-item
              class="is-end_form-item"
              label-width="100"
              label="是否更新专利状态"
              required
              prop="isChangePatentState"
              style="width: 240px"
            >
              <el-radio-group
                size="small"
                v-model="row.isChangePatentState"
              >
                <el-radio-button :label="true">是</el-radio-button>
                <el-radio-button :label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label-width="0"
              v-if="row.isChangePatentState"
              required
            >
              <panel-select
                type="CHANGE_PATENT_STATE"
                collapse-tags
                v-model="row.changePatentState"
                size="small"
              />
            </el-form-item>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        label="邮件模版"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            type="text"
            @click="
              dialogMailVisible = true;
              mailTemplate = {
                ...row.notificationConfig,
                stepResultId: row.stepResultId,
              };
            "
          >配置</el-button>
          <!-- 配置邮件模板 -->
          <dialog-mail-template
            :visible.sync="dialogMailVisible"
            :roles-state="getRolesState"
            :mail-template="mailTemplate"
            @message-template="handleNotificationChange"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import {
  useBasicSourceInject,
  useLookupsInject,
  useRolesInject,
  useStageStep,
  useStepResultSettingInject,
} from '@/context';
import { StepResult } from '@/types/step-result-setting';
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  watch,
} from '@vue/composition-api';
import { TableColumn } from 'element-ui/types/element-ui';
import { cloneDeep } from 'lodash';
import DialogMailTemplate from '@/views/pages/backstage-management/blocks/dialog-mail-template.vue';
import DynamicFields from '@/components/dynamic-fields.vue';
import { BasicSource } from '@/context/basic-source';
import { CurrentStepField } from '@/types/current-stage-fields';
import { NullableData } from '@/types/common';
import { StepPropertyField } from '@/types/stage-step';
import utils from '@/utils';
import { getMainType } from '@/utils/property-field';
import PanelSelect from '@/components/panel-select.vue';
import PanelRadio from '@/components/panel-radio.vue';

interface Props {
  finishType?: number;
  stepResults: StepResult[];
  fieldType?: number;
}
type TableRow = StepResult & {
  selectedNextStageStep: number[] | null;
  selectedDynamicFieldMap: SelectedDynamicFieldMap;
  dynamicField?: NullableData<CurrentStepField>[];
  selectedOptions?: boolean[];
};
type TableData = TableRow[];
const initTableRow = {
  fieldValue: null,
  selectedDynamicFieldMap: {},
  isEnd: null,
  nextStageId: null,
  nextStepId: null,
  stepResultId: null,
  notificationConfig: null,
  selectedNextStageStep: null,
  isInCurrent: null,
  changePatentState: null,
  isChangePatentState: null,
};

export default defineComponent({
  name: 'StepResultTable',
  props: {
    finishType: Number,
    stepResults: {
      type: Array,
      default: () => [],
    },
    fieldType: Number,
  },
  components: {
    DialogMailTemplate, DynamicFields, PanelSelect, PanelRadio,
  },
  setup(props: Props, context) {
    const { emit } = context;
    const { getStepDetailState } = useStageStep();
    const { getRolesState } = useRolesInject();
    const { getStageStepTreeState } = useStepResultSettingInject();
    const { getFieldTypesState } = useBasicSourceInject();
    // getFieldTypesState 数据来源 /patent-corp_api/basic-resource?group=FIELD_TYPE
    const fieldInBasicResource = computed(() => getFieldTypesState.data.find(item => item.id === props.fieldType));
    const stepFieldInDetail = computed(() => getStepDetailState.data.stageStepFields?.find(
        item => item.inputType === props.fieldType
      ));
    const showSelect = computed(() => {
      const type = getMainType(fieldInBasicResource.value?.type || '');
      return ['Enum', 'Radio', 'Checkbox'].includes(type);
    });
    const state = reactive({
      dialogMailVisible: false,
      mailTemplate: {},
      fields: [] as NullableData<CurrentStepField>[],
      tableData: initTableData(
        props.finishType,
        props.stepResults,
        props.fieldType,
      ) as TableData,
    });
    //  切换“完成方式”时，此组件并没有被实时卸载。所以需要手动更新一下tableData
    watch(
      () => props.finishType,
      () => {
        state.tableData = initTableData(
          props.finishType,
          props.stepResults,
          props.fieldType,
        );
      },
    );

    watch(
      () => props.fieldType,
      () => {
        state.tableData = initTableData(
          props.finishType,
          props.stepResults,
          props.fieldType,
        );
      },
    );
    watch(
      () => state.tableData,
      () => {
        emit(
          'change',
          getUpdatedStepResultList(state.tableData, showSelect.value),
        );
      },
      { deep: true },
    );
    function handleIsEndChange(updatedRow: TableRow) {
      const updatedTableData = state.tableData.map((item) => {
        if (item.stepResultId !== updatedRow.stepResultId) {
          return item;
        }
        item.isEnd = updatedRow.isEnd;
        return item;
      });

      emit('change', getUpdatedStepResultList(updatedTableData));
    }
    function handleNextStepChange(updatedRow: StepResult & { selectedNextStageStep: number[]; id: number | null }) {
      const updatedTableData = state.tableData.map((item: any) => {
        if (updatedRow.selectedNextStageStep?.length === 2 && item.id === updatedRow.id) {
          [
            item.nextStageId,
            item.nextStepId,
          ] = updatedRow.selectedNextStageStep;
          return item;
        }
        // 用户清除选择
        if (updatedRow.selectedNextStageStep?.length === 0) {
          item.nextStageId = null;
          item.nextStepId = null;
          return item;
        }
        return item;
      });
      emit('change', getUpdatedStepResultList(updatedTableData));
    }
    function handleNotificationChange(val: any) {
      const { stepResultId, ...notificationConfig } = val;
      state.mailTemplate = cloneDeep(notificationConfig);
      const updatedTableData = state.tableData.map((item) => {
        if (item.stepResultId !== stepResultId) {
          return item;
        }
        item.notificationConfig = notificationConfig;
        return item;
      });

      emit('change', getUpdatedStepResultList(updatedTableData));
    }

    const { getTypeName } = useLookupsInject();
    const formatterText = formatterTextCreator(getTypeName);

    function initTableData(
      finishType?: number,
      stepResult?: StepResult[],
      fieldId?: number,
    ) {
      if (finishType === 3920) {
        if (stepResult?.length === 1) {
          return stepResult.map(item => ({
            ...item,
            selectedDynamicFieldMap: {},
            selectedNextStageStep: getSelectedNextStageStep(item),
          }));
        }
        return [
          {
            ...initTableRow,
            stepResultId: 8401,
          },
        ];
      }

      if (finishType === 3921) {
        let tableDataFromRemote: TableData = [];
        if (Array.isArray(stepResult) && stepResult?.length > 0) {
          tableDataFromRemote = stepResult.map((item) => {
            const selectedNextStageStep = getSelectedNextStageStep(item);
            const selectedDynamicFieldMap = fieldId && item.fieldValue
              ? { [`${fieldId}`]: String(item.fieldValue) } // TODO 数据反显
              : {};
            return {
              ...item,
              selectedDynamicFieldMap,
              selectedNextStageStep,
              dynamicField: getFields(
                stepFieldInDetail?.value,
                fieldInBasicResource?.value,
                item,
              ),
              selectedOptions:
                showSelect.value && item.fieldValue
                  ? JSON.parse(String(item.fieldValue))
                  : null,
            };
          });
        }
        // 待确定(目前测试没问题)
        // const initData = (stepResult || []).map(item => ({
        //   ...initTableRow,
        //   stepResultId: item.stepResultId,
        //   dynamicField: getFields(
        //       stepFieldInDetail?.value,
        //       fieldInBasicResource?.value,
        //       {
        //         ...initTableRow,
        //         stepResultId: item.stepResultId,
        //       },
        //   ),
        // }));
        // return initData.map((item) => {
        //   const matchedData = tableDataFromRemote.find(item1 => item1.stepResultId === item.stepResultId);
        //   return matchedData || item;
        // });
        return tableDataFromRemote;
      }
      return [];
    }

    const handleAddStepResult = () => {
      console.info(state.tableData);
      state.tableData.push({
        ...initTableRow,
        stepResultId: null,
        dynamicField: getFields(
              stepFieldInDetail?.value,
              fieldInBasicResource?.value,
              {
                ...initTableRow,
                stepResultId: null,
              },
        ),
      });
    };

    const handleDelete = (index: number) => {
      state.tableData.splice(index, 1);
    };

    // 步骤结果只能有一个通过 通过按钮互斥
    const handleAdoptChange = (index: any) => {
      const current = (state.tableData || []).filter(item => item.stepResultId === 8401);
      if (current.length > 1) {
        (state.tableData || []).forEach((item, tableIndex) => {
          if (tableIndex !== index && item.stepResultId === 8401) {
            item.stepResultId = null;
          }
        });
      }
    };

    return {
      handleIsEndChange,
      handleNextStepChange,
      getStageStepTreeState,
      formatterText,
      getFieldTypesState,
      getRolesState,
      ...toRefs(state),
      handleNotificationChange,
      showSelect,
      stepFieldInDetail,
      handleAddStepResult,
      handleDelete,
      handleAdoptChange,
    };
  },
});

// dynamic-fields.vue 组件的 model 类型
interface SelectedDynamicFieldMap {
  // key 为 fieldId，单条字段数据的id
  // 这里设置为 fieldType,即 字段里的 inputType, basic-source里的 id。与 state.fields 里的数据对应
  // 值为 大多数选择器的number类型id，员工选择器string类型id， 是否选择器的是number
  [key: string]: string | number;
}
function getSelectedNextStageStep(stepResult: StepResult) {
  return !stepResult.isEnd && stepResult.nextStageId && stepResult.nextStepId
    ? [stepResult.nextStageId, stepResult.nextStepId]
    : null;
}

function getFields(
  stepFieldInDetail?: StepPropertyField,
  fieldInBasicResource?: NullableData<BasicSource>,
  stepResult?: StepResult,
): NullableData<CurrentStepField>[] {
  //  props.stepResult;
  if (stepFieldInDetail && fieldInBasicResource && stepResult) {
    return [
      {
        ...fieldInBasicResource,
        ...stepFieldInDetail,
        inputTypeName: fieldInBasicResource?.type || '',
        syncToParentField: null,
        // value: stepFieldInDetail.defaultValueCriteria, //  字段默认值
        // dynamic field 组件会使用 field 初始化值
        value: stepResult.fieldValue
          ? String(stepResult.fieldValue) // 字段当前值
          : stepFieldInDetail.defaultValueCriteria, //  字段默认值
        displayName: '', // staffName等显示值 TODO
        id: stepResult.stepResultId,
      },
    ];
  }
  return [];
}
function formatterTextCreator(getTypeName: (id: number) => string | undefined) {
  return (row: StepResult, column: TableColumn) => {
    switch (column.label) {
      case '步骤结果':
        return row.stepResultId !== null ? getTypeName(row.stepResultId) : '无';

      default:
        return '';
    }
  };
}
function getUpdatedStepResultList(
  updatedTableData: TableData,
  showSelect?: boolean,
) {
  return updatedTableData.map((item) => {
    // 去除  selectedNextStageStep, selectedDynamicFieldMap,
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      selectedNextStageStep,
      selectedDynamicFieldMap,
      dynamicField,
      ...rest
    } = item;
    // {..., value: 1} => { ..., value: '[1]'}
    const progressProperties = utils.handleFieldsSubmitVal(
      dynamicField,
      selectedDynamicFieldMap,
      [],
    );

    const selectedOptions = item.selectedOptions && item.selectedOptions.length > 0
      ? JSON.stringify(item.selectedOptions)
      : null;

    const selectedFieldValue = showSelect
      ? selectedOptions
      : progressProperties[0]?.value;
    return {
      ...rest,
      fieldValue: selectedFieldValue ?? null,
    };
  });
}
</script>

<style lang='scss' scoped>
</style>
