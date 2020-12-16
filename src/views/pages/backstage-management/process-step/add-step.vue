<template>
  <div class="add-claims">
    <el-dialog
      :title="isEdit ? '编辑步骤' : '新增步骤'"
      width="720px"
      :visible.sync="innerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
      <el-form class="form"
      label-width="120px"
      ref="form"
      :model="formData"
      :rules="formRules">
        <el-form-item class="labelName" label="步骤名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入步骤名称" />
        </el-form-item>
        <el-form-item class="labelName" label="英文名称" prop="englishName">
          <el-input type="text" v-model="formData.englishName" placeholder="请输入英文名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlerSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  reactive,
  toRefs,
  computed,
  ref,
  watch,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import cloneDeep from 'lodash/cloneDeep';
import { useLookupsInject } from '@/context';

export default {
  name: 'AddStep',
  props: {
    visible: Boolean,
    data: Object,
    processStageId: Number,
  },

  setup(props, context) {
    const { emit } = context;
    const { $message, $nextTick, $route } = context.root;
    const {
      getEnumsInfo,
    } = useLookupsInject();
    const stepType = computed(() => getEnumsInfo('STEP_TYPE'));

    const selectedType = ref('');
    const state = reactive({
      formData: {
        name: '',
        englishName: '',
        processId: Number($route.query.id),
        processStageId: props.processStageId,
        workingTimeType: null,
        legalTimeType: null,
        eventResultType: 1,
        stepType: stepType.value.STEPPROCESS,
        // notifyToType: 0,
        hasBill: null,
      },
      inputVisible: false,
    });
    const form = ref();
    const formRules = ref({
      name: [{ required: true, message: '请输入步骤名称', trigger: 'blur' }],
      englishName: [
        { required: true, message: '请输入英文名称', trigger: 'blur' },
      ],
    });
    // 步骤新增
    const { loading: submitLoading, postData: addPlatforms } = useHttp('/patent-corp_api/stage-steps');
    const { url: editUrl, putData } = useHttp();
    // 是否是编辑
    const isEdit = computed(() => !!props.data);
    console.log('222', props.data);
    const innerVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const saveTagInput = ref(null);
    const showInput = () => {
      state.inputVisible = true;
      $nextTick(() => {
        saveTagInput.value.$refs.input.focus();
      });
    };

    const handleInputConfirm = () => {
      state.inputVisible = false;
    };
    const submitForm = async () => {
      try {
        // if (!isEdit.value) {
        if (!isEdit.value) {
          await addPlatforms({ ...state.formData, stepType: stepType.value.STEPPROCESS });
          $message.success('提交成功!');
        } else {
          editUrl.value = `/patent-corp_api/stage-step-update/${props.data.id}`;
          state.formData.processId = Number($route.query.id);
          state.formData.processStageId = props.processStageId;
          await putData({ ...state.formData, stepType: stepType.value.STEPPROCESS });
          $message.success('编辑成功!');
        }
        emit('success');
        innerVisible.value = false;
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    const handlerSubmit = () => {
      console.log('ProcessStageID', state.formData.ProcessStageID);
      form.value.validate((valid) => {
        if (!valid) return;
        try {
          submitForm();
        } catch (error) {
          console.log('error', error);
          innerVisible.value = false;
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    const {
      url: processStepDataUrl,
      fetchData: fetchPeocessData,
    } = useHttp('');
    watch(
      () => props.visible,
      async (newVal) => {
        if (newVal && props.data && props.data.id) {
          processStepDataUrl.value = `/patent-corp_api/stage-steps/${props.data.id}`;
          const peocessData = await fetchPeocessData();
          const maperProcess = cloneDeep(peocessData) || {};

          state.formData = {
            name: maperProcess.name,
            englishName: maperProcess.englishName,
          };
        } else {
          form.value.resetFields();
        }
      },
      { lazy: true },
    );
    return {
      ...toRefs(state),
      submitLoading,
      innerVisible,
      form,
      formRules,
      handlerSubmit,
      isEdit,
      saveTagInput,
      showInput,
      handleInputConfirm,
      selectedType,
      submitForm,
    };
  },
};
</script>

<style lang="scss" scoped>
.add-claims {
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
