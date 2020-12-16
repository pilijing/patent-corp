<template>
  <div class="dialog-add-stage">
    <el-dialog
      :title="isEdit ? '编辑阶段' : '添加阶段'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
      <el-alert
        title="阶段用于对一次或多次步骤流程进行分组。如果符合特定阶段的标准，才可以进入下一阶段完成申请"
        type="warning"
        :closable="false"
        show-icon
      />
    <el-form
      style="margin-top: 20px"
      :model="formData"
      ref="viewForm"
      label-width="90px"
      :rules="validateRules"
    >
      <el-form-item label="阶段名称" prop="name">
        <el-input placeholder="请输入阶段名称" v-model="formData.name" />
      </el-form-item>
      <el-form-item label="英文名称" prop="englishName">
        <el-input placeholder="请输入英文名称" v-model="formData.englishName" />
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
import { useProcessStageInject } from '@/context';

export default defineComponent({
  name: 'DialogNewProcess',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: Object,
  },
  setup(props, context) {
    const validateEmpty = (rule: any, value: string, callback: Function) => {
      if (utils.isEmpty(value)) {
        if (rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const { $route, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      formData: {
        name: '',
        englishName: '',
      },
      validateRules: {
        name: [{
          required: true, message: '请输入阶段名称', validator: validateEmpty, trigger: 'blur',
        }],
        englishName: [{
          required: true, message: '请输入英文名称', validator: validateEmpty, trigger: 'blur',
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
    const processId = computed(() => Number($route.query.id) || 1);
    const isEdit = computed(() => !!props.data?.id);

    watch(() => props.visible, (val) => {
      if (val) {
        state.formData = { ...state.formData, ...props.data };
      } else { // 重置
        viewForm.value.resetFields();
      }
    });

    const {
      loading,
      addProcessStage,
      addProcessStageState,
    } = useProcessStageInject();
    const {
      error: editError,
      editProcessStage,
    } = useProcessStageInject();

    const submitAddStage = () => {
      viewForm.value.validate(async (valid: boolean) => {
        if (!valid) return;
        const { name, englishName } = state.formData;
        try {
          if (isEdit.value) { // 编辑
            const editParams = {
              name,
              englishName,
              id: props.data?.id,
            };
            await editProcessStage(`/patent-corp_api/process-stages/${props.data?.id}`, editParams);
          } else { // 添加
            const addParams = {
              name,
              englishName,
              processId: processId.value,
            };
            await addProcessStage('/patent-corp_api/process-stages', addParams);
          }
          if (editError.value) {
            $message.error(editError.value.response?.data);
            return;
          }
          if (addProcessStageState.error !== null) {
            $message.error(addProcessStageState.error.response?.data);
            return;
          }
          emit('success');
          $message.success('操作成功!');
          dialogVisible.value = false;
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
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
    };
  },
});
</script>

<style lang="scss" scoped>
.dialog-add-stage {
  // ::v-deep {
  //   .el-dialog__body .tips {
  //     color: #666666;
  //     border: 1px solid rgb(255, 229, 143);
  //     i {
  //       color: #FFBF00;
  //     }
  //   }
  // }
}
</style>
