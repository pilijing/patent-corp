<template>
  <div class="table-stage-fields">
    <template>
      <page-title title="阶段基本设置">
        <template #left>
          <div class="slot-field"
            v-show="isEditing"
            @click="isEditing = false">
            <span class="edit-icon">
              <i class="el-icon-edit-outline" />编辑
            </span>
          </div>
        </template>
      </page-title>
      <descriptions
        :column="3"
        style="padding-left: 60px; margin-top: 20px"
        :label-width="100"
        v-show="isEditing"
      >
        <descriptions-item label="对应官方阶段">{{ getTypeName(officialStage) || '--' }}</descriptions-item>
      </descriptions>
      <div class="edit-official-stage" v-show="!isEditing">
         <el-form :model="fromData"
               ref="viewForm"
               label-width="120px"
               class="form-border"
               :rules="formRules">
            <el-form-item
              label="对应官方阶段"
              prop="officialStageId"
            >
              <panel-select
                type="OFFICIAL_STAGE"
                v-model="fromData.officialStageId"
                placeholder="请选择"
                size="small"
                style="width: 260px;"
              />
            </el-form-item>
            <el-row type="flex" justify="center">
              <el-col :span="6">
                <el-button size="small" @click="handleCancel">取消</el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleSave"
                  >保存</el-button>
              </el-col>
            </el-row>
         </el-form>
      </div>
    </template>
    <page-title title="阶段字段" style="margin-top: 10px">
      <template #left>
        <div class="slot-field" @click="isCanDragTable = true">
          <icon-slot class="icon-slot" />
          <span style="margin-left: 2px">排序</span>
        </div>
      </template>
    </page-title>
      <drag-table
        :is-can-drag="isCanDragTable"
        v-model="stageFields"
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="名称"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="englishName"
          label="英文"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="类型"
          align="center"
        >
          <template #default="{ row }">
            {{ getFieldTypeName(Number(row.inputType)) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="isVisible"
          label="显示"
          align="center"
        >
          <template #default="{ row }">
            {{ row.isVisible? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="isReadOnly"
          label="只读"
          align="center"
        >
          <template #default="{ row }">
            {{ row.isReadOnly? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column
          :label="isCanDragTable ?  '拖拽' : '操作'"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <i v-if="isCanDragTable" class="el-icon-rank icon-btn" />
            <div v-else>
              <i @click="handleEdit(row)" class="el-icon-edit-outline icon-btn" />
              <i @click="handleDelete(row.id)" class="el-icon-delete icon-btn" />
            </div>
          </template>
        </el-table-column>
      </drag-table>
      <div class="add-field-btn" v-if="!isCanDragTable" @click="addFieldVisible = true; stageFieldData={}">
        + 添加字段
    </div>
    <div class="submit-slot" v-else>
      <el-button size="small" @click="cancelSlot">取消</el-button>
      <el-button size="small" type="primary" @click="submitSlot">保存</el-button>
    </div>
    <dialog-add-field
      :stage-id="stageId"
      :visible.sync="addFieldVisible"
      :data="stageFieldData"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts">
import {
  reactive, toRefs, defineComponent, onMounted, ref,
} from '@vue/composition-api';
import { useStageFieldsInject, useLookupsInject, useBasicSourceInject } from '@/context';
import PageTitle from '@/components/page-title.vue';
import DragTable from '@/components/drag-table.vue';
import PanelSelect from '@/components/panel-select.vue';
import IconSlot from '@/assets/svg/slot.svg';
import DialogAddField from '../blocks/dialog-add-field.vue';

interface State {
  addFieldVisible: boolean;
  stageFieldData: object;
  isCanDragTable: boolean;
  isEditing: boolean;
  fromData: object | any;
  formRules: object;
}

export default defineComponent({
  name: 'table-stage-fields',
  props: {
    stageId: Number,
    officialStage: Number || null,
  },
  components: {
    DialogAddField,
    PageTitle,
    IconSlot,
    DragTable,
    PanelSelect,
  },
  setup(props, context) {
    const { $confirm, $message } = context.root;
    const { emit } = context;
    const state = reactive<State>({
      isCanDragTable: false,
      addFieldVisible: false,
      stageFieldData: {},
      isEditing: true,
      fromData: {
        officialStageId: null,
      },
      formRules: {
        officialStageId: [{ required: true, message: '对应官方阶段', trigger: 'change' }],
      },
    });
    const viewForm = ref();

    const { getTypeName } = useLookupsInject();
    const { getFieldTypeName } = useBasicSourceInject();

    const {
      stageFields, getStageField, deleteStageField, editOfficialStageField,
    } = useStageFieldsInject();

    const initData = async () => {
      await getStageField(`/patent-corp_api/stage-fields/${props.stageId}`);
    };

    const handleEdit = (row: any) => {
      state.addFieldVisible = true;
      console.info(row);
      state.stageFieldData = { ...row, inputType: Number(row.inputType) };
    };

    const handleDelete = (id: number) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteStageField(`/patent-corp_api/stage-fields/${id}`);
        initData();
        $message.success('删除成功!');
      });
    };

    const handleSuccess = () => {
      initData();
    };

    // 排序

    const { error, sortStageField } = useStageFieldsInject();

    const cancelSlot = () => {
      state.isCanDragTable = false;
      initData();
    };

    const submitSlot = async () => {
      const stageFieldIdsArr = stageFields.value.map((item: { id: any }) => item.id);
      const params = {
        stageFieldIds: stageFieldIdsArr,
      };
      await sortStageField(
        `/patent-corp_api/process-stages/${props.stageId}/stage-fields/sort`,
        params,
      );
      state.isCanDragTable = false;
      if (error.value) {
        $message.error('排序失败!');
        initData();
      } else {
        $message.success('排序成功!');
      }
    };

    const handleCancel = () => {
      viewForm.value.resetFields();
      state.isEditing = true;
    };

    const handleSave = async () => {
      viewForm.value.validate(async (valid: any) => {
        if (!valid) return;
        const params = {
          id: props.stageId,
          officialStage: state.fromData.officialStageId,
        };
        await editOfficialStageField(
          `/patent-corp_api/process-stages/${props.stageId}/official-stage`,
          params,
        );
        emit('success');
        emit('update:official-stage', state.fromData.officialStageId);
        state.isEditing = true;
      });
    };

    onMounted(() => {
      initData();
      if (props.officialStage) {
        state.fromData.officialStageId = props.officialStage;
      }
    });

    return {
      ...toRefs(state),
      stageFields,
      handleEdit,
      handleDelete,
      handleSuccess,
      getFieldTypeName,
      submitSlot,
      getTypeName,
      cancelSlot,
      viewForm,
      handleSave,
      handleCancel,
    };
  },
});
</script>

<style lang="scss" scoped>
.table-stage-fields {
  .slot-field {
    color: #016eff;
    display: flex;
    align-items: center;
    cursor: pointer;
    .icon-slot {
      font-size: 12px;
    }
  }
  .icon-btn {
    color: #016eff;
    margin-right: 10px;
    font-size: 18px;
    cursor: pointer;
  }
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
  .form-border {
    border: 1px solid #016eff;
    margin: 16px 0;
    padding: 16px 32px 16px 40px;
  }
}
</style>
