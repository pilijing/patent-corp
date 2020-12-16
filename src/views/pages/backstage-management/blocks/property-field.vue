<template>
  <div class="property-field">
    <page-title :title="pageTitle || '属性字段'">
      <template #left>
        <div
          class="slot-field"
          @click="isCanDragTable = true"
        >
          <icon-slot />
          <span style="margin-left: 2px">排序</span>
        </div>
      </template>
    </page-title>
    <drag-table
      v-model="fieldTableData"
      :is-can-drag="isCanDragTable"
      style="width: 100%"
    >
      <el-table-column
        prop="name"
        label="名称"
        align="center"
      />
      <el-table-column
        prop="englishName"
        label="英文名"
        align="center"
      />
      <el-table-column
        align="center"
        prop="inputType"
        label="类型"
        :formatter="formatterText"
      />
      <!-- <el-table-column
        prop="cascadedById"
        label="级联关系"
        :formatter="formatterText"
      /> -->
      <el-table-column
        align="center"
        prop="isRequired'"
        label="必填"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="isVisible"
        label="显示"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="isReadonly"
        label="只读"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="valueDisplayName"
        label="默认值"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="cascadedById"
        label="级联关系"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="cascadedValueDisplayName"
        label="级联关系值"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="syncToPatentField"
        label="更新对应的专利值"
        :formatter="formatterText"
      />
      <el-table-column
        align="center"
        prop="syncToStageField"
        label="更新阶段字段值"
        :formatter="formatterText"
      />

      <el-table-column
        prop="syncToStageBodyField"
        label="更新阶段主体字段"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ getStageDefinitionName(row.syncToStageBodyField) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="syncToStepBodyField"
        label="更新步骤主体字段"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ getStepDefinitionName(row.syncToStepBodyField) }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="syncToParentField"
        label="更新步骤主体字段"
        :formatter="formatterText"
      /> -->
      <el-table-column
        align="center"
        :label="isCanDragTable ? '拖拽' : '操作'"
        width="120"
      >
        <template #default="{ row }">
          <i
            v-if="isCanDragTable"
            class="el-icon-rank icon-btn"
          />
          <div v-else>
            <i
              @click="handleEditField(row)"
              class="el-icon-edit-outline icon-btn"
            />
            <i
              @click="handleDeleteField(row)"
              class="el-icon-delete icon-btn"
            />
          </div>
        </template>
      </el-table-column>

      <el-button
        type="primary"
        size="medium"
      >保存</el-button>
    </drag-table>

    <div
      class="add-field-btn"
      @click="handleAddFieldClick"
    >+ 添加字段</div>
    <div
      class="submit-slot"
      v-if="isCanDragTable"
    >
      <el-button
        size="small"
        @click="handleDragCancel"
      >取消</el-button>
      <el-button
        size="small"
        type="primary"
        @click="submitReorder"
      >保存</el-button>
    </div>

    <property-field-dialog
      @confirm="handleFieldDialogConfirm"
      :loading="curPropertyField ? updateLoading : addLoading"
      :defaultPropertyField="curPropertyField"
      :fieldTableData="fieldTableData"
    ></property-field-dialog>

    <!-- <el-dialog
      title="提示"
      :visible.sync="deleteDialogVisible"
      width="30%"
      append-to-body
    >
      <span>确定要删除当前属性字段吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleDeleteConfirm"
          :loading="deleteLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog> -->
  </div>
</template>

<script lang="ts">
import { TableColumn } from 'element-ui/types/element-ui';
import { Message } from 'element-ui';
import {
  computed,
  defineComponent,
  ref,
  reactive,
  toRefs,
  onMounted,
} from '@vue/composition-api';
import {
  useBasicSourceInject,
  useOfficialClaimDetailInject,
  useStageFieldsInject,
  useLookupsInject,
} from '@/context';
import { StageClaimsField } from '@/types/claim-detail';

import PageTitle from '@/components/page-title.vue';
import DragTable from '@/components/drag-table.vue';
import IconSlot from '@/assets/svg/slot.svg';
import useCheckClaimType from '@/hooks/check-claim-type';
import PropertyFieldDialog from './property-field-dialog.vue';

interface Props {
  fieldTableData: any[];
  addLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pageTitle: string;
}
const state = reactive({
  fixedValue: null,
  copyStepField: null,
  copyPatentField: null,
});
export default defineComponent({
  name: 'PropertyField',
  components: {
    PropertyFieldDialog,
    PageTitle,
    DragTable,
    IconSlot,
  },
  props: {
    fieldTableData: Array,
    addLoading: Boolean,
    updateLoading: Boolean,
    deleteLoading: Boolean,
    pageTitle: String,
  },
  setup(props: Props, { emit, root }) {
    const {
      addClaimFieldState,
      updateClaimFieldState,
      getOfficialClaimDetail,
      getOfficialClaimDetailState: getDetailState,
      // deleteClaimField,
      deleteClaimFieldState,
    } = useOfficialClaimDetailInject();
    const curPropertyField = ref<StageClaimsField | null>(null);
    const { getEnumsInfo } = useLookupsInject();
    const { stageFields } = useStageFieldsInject();
    const { getSyncToPatentsState } = useBasicSourceInject();
    // const stageClaimsId = computed(() => getDetailState.data.id);
    const defaultValue = computed(() => getEnumsInfo('DEFAULT_VALUE'));
    const {
      isPropertyFieldDialogVisible,
      setIsPropertyFieldDialogVisible,
    } = useOfficialClaimDetailInject();
    const isCanDragTable = ref(false);

    function handleAddFieldClick() {
      curPropertyField.value = null;
      setIsPropertyFieldDialogVisible(true);
    }

    function handleEditField(row: any) {
      curPropertyField.value = row;
      setIsPropertyFieldDialogVisible(true);
    }

    // TODO: rowData 并不完全是 StageClaimsField
    async function handleFieldDialogConfirm(rowData: StageClaimsField) {
      // emit('dialog-confirm', rowData);
      if (curPropertyField.value === null) {
        emit('dialog-add-confirm', rowData);
      } else {
        emit('dialog-update-confirm', rowData);
      }
      // setIsPropertyFieldDialogVisible(false);
    }

    /** delete claim property field */
    const deleteDialogVisible = ref(false);

    const { $confirm } = root;
    function handleDeleteField(row: any) {
      curPropertyField.value = row;
      const curPropertyFieldId = curPropertyField.value?.id;
      if (curPropertyFieldId === null || curPropertyFieldId === undefined) {
        Message.error('未找到属性字段ID');
        return;
      }
      $confirm('确定要删除当前属性字段吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        emit('delete-confirm', curPropertyFieldId);
      });
      // deleteDialogVisible.value = true;
    }
    // async function handleDeleteConfirm() {
    //   const curPropertyFieldId = curPropertyField.value?.id;
    //   if (curPropertyFieldId === null || curPropertyFieldId === undefined) {
    //     Message.error('未找到属性字段ID');
    //     return;
    //   }

    //   deleteDialogVisible.value = false;
    // }

    const initData = () => {
      state.fixedValue = defaultValue.value.FIXEDVALUE;
      state.copyStepField = defaultValue.value.COPYSTEPFIELD;
      state.copyPatentField = defaultValue.value.COPYPATENTFIELD;
    };
    onMounted(async () => {
      initData();
    });
    function getCascadedValuesName(row: any) {
      let returnValue = '';
      if (row.cascadedValueDisplayName) {
        returnValue = row.cascadedValueDisplayName;
      } else if (row.cascadedValues) {
        returnValue = row.cascadedValues;
      } else {
        returnValue = '无';
      }
      return returnValue;
    }
    function getCascadedValueNameById(cascadedById: number) {
      let name = '';
      name = props.fieldTableData.find((p: any) => p.id === cascadedById)?.name
        ?? '';
      return name;
    }
    const {
      getSyncToPatentName,
      getFieldTypeName,
      getStageDefinitionName,
      getStepDefinitionName,
    } = useBasicSourceInject();
    function getDefaultName(row: any) {
      let name = '无';
      // 默认类型等于固定值
      if (row.defaultValueType === state.fixedValue) {
        if (
          getFieldTypeName(row.inputType) === '附件'
          && row.defaultValueCriteria !== null
          && row.defaultValueCriteria !== ''
        ) {
          const jsonValue = JSON.parse(row.defaultValueCriteria);
          name = jsonValue.map((p: any) => p.fileName).join(',');
        } else {
          name = row.valueDisplayName ? row.valueDisplayName : '无';
        }
      } else if (row.defaultValueType === state.copyStepField) {
        name = stageFields.value.find((p: any) => p.id === row.copyStepField)
            ?.name ?? '无';
      } else if (row.defaultValueType === state.copyPatentField) {
        name = getSyncToPatentsState.data.find((p: any) => p.id === row.copyPatentField)?.name ?? '无';
      }
      return name;
    }

    const { getStageFieldName } = useStageFieldsInject();

    function formatterText(row: StageClaimsField, column: TableColumn) {
      switch (column.label) {
        case '类型':
          return row.inputType !== null
            ? getFieldTypeName(row.inputType)
            : '无';
        case '级联关系':
          return row.cascadedById
            ? getCascadedValueNameById(row.cascadedById)
            : '无';
        case '必填':
          return row.isRequired ? '是' : '否';
        case '只读':
          return row.isReadonly ? '是' : '否';
        case '显示':
          return row.isVisible ? '是' : '否';
        case '默认值':
          return getDefaultName(row);
        // return row.defaultValueName ? row.defaultValueName
        //   : (row.defaultValueCriteria ? row.defaultValueCriteria : '无');
        case '级联关系值': {
          return row.cascadedValues ? getCascadedValuesName(row) : '无';
        }
        case '更新对应的专利值':
          return row.syncToPatentField
            ? getSyncToPatentName(row.syncToPatentField)
            : '无';
        case '更新阶段字段值':
          return row.syncToStageField
            ? getStageFieldName(row.syncToStageField)
            : '无';
        // case '更新阶段主体字段':
        //   return row.syncToStageBodyField
        //     ? getStageDefinitionName(row.syncToStageBodyField)
        //     : '无';
        // case '更新步骤主体字段':
        //   return row.syncToStageBodyField
        //     ? getStageDefinitionName(row.syncToStageBodyField)
        //     : '无';
        default:
          return '';
      }
    }

    async function submitReorder() {
      emit('reorder-submit');
      isCanDragTable.value = false;
    }
    function handleDragCancel() {
      emit('reorder-cancel');
      isCanDragTable.value = false;
    }
    const { isOfficialClaim } = useCheckClaimType();
    return {
      ...toRefs(state),
      getOfficialClaimDetail,
      getDetailState,
      handleEditField,
      handleDeleteField,
      formatterText,
      handleAddFieldClick,
      isPropertyFieldDialogVisible,
      addClaimFieldState,
      handleFieldDialogConfirm,
      curPropertyField,
      updateClaimFieldState,
      deleteDialogVisible,
      deleteClaimFieldState,
      submitReorder,
      isCanDragTable,
      handleDragCancel,
      isOfficialClaim,
      getCascadedValueNameById,
      getCascadedValuesName,
      getStageDefinitionName,
      getStepDefinitionName,
    };
  },
});
</script>
<style lang="scss" scoped>
.list-table {
  .table {
    margin-top: 20px;
  }
}
.property-field {
  .add-field-btn {
    padding: 10px 0;
    text-align: center;
    background: #fafafa;
    cursor: pointer;
    color: #016eff;
    // &:hover {
    //   background: #edf8ff;
    //   color: #016eff;
    // }
  }
  .submit-slot {
    margin-top: 20px;
    text-align: center;
  }
  .slot-field {
    color: #016eff;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .icon-btn {
    color: #016eff;
    margin-right: 10px;
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
