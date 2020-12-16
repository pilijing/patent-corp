<template>
  <div class="dialog-add-field">
    <el-dialog
      :title="isEdit ? '编辑字段' : '添加字段'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
    <el-form
      style="margin-top: 20px"
      :model="formData"
      ref="viewForm"
      label-width="90px"
      :rules="validateRules"
    >
      <el-form-item label="字段名称" prop="name">
        <el-input placeholder="请输入字段名称" v-model="formData.name" />
      </el-form-item>
      <el-form-item label="英文名称" prop="englishName">
        <el-input placeholder="请输入英文名称" v-model="formData.englishName" />
      </el-form-item>
      <el-form-item
        label="字段类型"
        prop="inputType"
      >
        <el-select
          filterable
          v-model="formData.inputType"
           @change="handlerInputTypeChange"
          placeholder="请选择字段类型"
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
          v-if="isFileType==true"
        >
        <panel-select
            v-model="formData.attachmentType"
            type="FILE_TYPE"
            placeholder="请选择附件类型"
          />
        </el-form-item>
      <el-form-item label="是否显示" prop="isVisible">
        <el-radio-group v-model="formData.isVisible" :size="size">
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否只读" prop="isReadOnly">
        <el-radio-group v-model="formData.isReadOnly" :size="size">
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="submitAddStage">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang='ts'>
import {
  toRefs,
  computed,
  reactive,
  ref,
  watch,
  defineComponent,
} from '@vue/composition-api';
import utils from '@/utils';
import { useBasicSourceInject, useStageFieldsInject } from '@/context';
import PanelSelect from '@/components/panel-select.vue';

export default defineComponent({
  name: 'DialogAddField',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: Object,
    stageId: Number,
  },
  components: { PanelSelect },
  setup(props, context) {
    const validateEmpty = (rule: any, value: string, callback: Function) => {
      if (utils.isEmpty(value)) {
        if (rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const { $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      size: 'medium',
      formData: {
        name: '',
        englishName: '',
        inputType: null,
        isReadOnly: true,
        isVisible: true,
        attachmentType: null,
      },
      isFileType: false,
      validateRules: {
        name: [{
          required: true, message: '请输入字段名称', validator: validateEmpty, trigger: 'blur',
        }],
        englishName: [{
          required: true, message: '请输入英文名称', validator: validateEmpty, trigger: 'blur',
        }],
        inputType: [{
          required: true, message: '请选择字段类型', validator: validateEmpty, trigger: 'change',
        }],
        isReadOnly: [{
          required: true, message: '请选择是否只读', trigger: 'blur',
        }],
        isVisible: [{
          required: true, message: '请选择是否可见', trigger: 'blur',
        }],
        attachmentType: [{
          required: true, message: '请选择附件类型', validator: validateEmpty, trigger: 'change',
        }],
      },
    });
    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    // const processId = computed(() => Number($route.query.id) || 1);
    const isEdit = computed(() => !!props.data?.id);
    const { getFieldTypesState } = useBasicSourceInject();
    const handlerInputTypeChange = (inputType: number) => {
      const fieldItem = getFieldTypesState.data.find(item => item.id === inputType);
      if (fieldItem) {
        if (fieldItem.type !== null && fieldItem.type.indexOf('File') > -1) {
          state.isFileType = true;
        } else {
          state.isFileType = false;
        }
      }
    };
    watch(() => props.visible, (val) => {
      if (val) {
        state.formData = { ...state.formData, ...props.data };
        const fieldItem = getFieldTypesState.data.find((item: any) => item.id === state.formData.inputType);
        if (!fieldItem) {
          return;
        }
        if (fieldItem.type !== null && fieldItem.type.indexOf('File') > -1) {
          state.isFileType = true;
        } else {
          state.isFileType = false;
        }
        if (state.formData.attachmentType === 0) {
          state.formData.attachmentType = null;
        }
      } else { // 重置
        viewForm.value.resetFields();
      }
    });

    const {
      loading,
      addStageField,
      addStageFieldState,
    } = useStageFieldsInject();
    const {
      editStageField,
      error: editError,
    } = useStageFieldsInject();

    const submitAddStage = () => {
      viewForm.value.validate(async (valid: boolean) => {
        if (!valid) return;
        const params = {
          ...state.formData,
          processStageId: props.stageId,
        };
        if (isEdit.value) { // 编辑
          const editParams = {
            ...params,
            id: props.data?.id,
          };
          await editStageField(`/patent-corp_api/stage-fields/${props.data?.id}`, editParams);
        } else { // 添加
          const addParams = {
            ...params,
            id: 0,
          };
          await addStageField('/patent-corp_api/stage-fields', addParams);
        }
        if (editError.value) {
          $message.error(editError.value.response?.data);
          return;
        }
        if (addStageFieldState.error !== null) {
          $message.error(addStageFieldState.error.response?.data);
          return;
        }
        emit('success');
        $message.success('操作成功!');
        dialogVisible.value = false;
      });
    };

    return {
      ...toRefs(state),
      dialogVisible,
      validateEmpty,
      viewForm,
      submitAddStage,
      isEdit,
      loading,
      getFieldTypesState,
      handlerInputTypeChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.dialog-add-field {}
</style>
