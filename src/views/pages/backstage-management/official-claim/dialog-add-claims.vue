<template>
  <div class="add-claims">
    <el-dialog
      :title="dialogTitle"
      width="720px"
      :visible.sync="innerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      @close="resetFormModel"
    >
      <el-form
        class="form"
        label-width="140px"
        ref="claimsForm"
        :model="formData"
        :rules="formRules"
      >
        <el-form-item
          v-if="isOfficialClaim"
          class="labelName"
          label="来文类型"
          v-model="formData.documentType"
          prop="documentType"
        >
          <el-radio
            v-for="item in claimsTypeList"
            :key="item.id"
            :label="item.id"
            v-model="formData.documentType"
            border
          >
            {{ item.name }}
          </el-radio>
        </el-form-item>
        <el-form-item
          class="labelName"
          :label="isOfficialClaim?'来文名称':'请求名称'"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            :placeholder="isOfficialClaim?'请输入来文名称':'请输入请求名称'"
          />
        </el-form-item>
        <el-form-item
          class="labelName"
          label="英文名称"
          prop="englishName"
        >
          <el-input
            type="text"
            v-model="formData.englishName"
            placeholder="请输入英文名称"
          />
        </el-form-item>
        <el-form-item
          v-if="isOfficialClaim"
          class="labelName"
          label="对应官方来文名称"
          prop="officialName"
        >
          <el-input
            v-model="formData.officialName"
            placeholder="请输入对应官方来文名称"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleAddPlat"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  reactive, toRefs, computed, ref, watch,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject, useClaimTypeInject } from '@/context';

export default {
  name: 'AddClaims',
  props: {
    visible: Boolean,
    data: Object,
    decorateProcessId: Number,
    processId: Number,
  },

  setup(props, context) {
    const { emit } = context;
    const { $message, $nextTick, $route } = context.root;

    // 来文类型
    const {
      sortLookups,
      officialClaimTypeId,
      appealedClaimTypeId,
    } = useLookupsInject();
    const claimsTypeList = computed(() => sortLookups.value.STAGE_EVENT_TYPE);
    const { curClaimsTypeId } = useClaimTypeInject();
    const isOfficialClaim = computed(() => curClaimsTypeId.value === officialClaimTypeId.value);

    const state = reactive({
      formData: {
        processId: Number($route.query.id),
        processStageId: props.processId,
        documentType: [],
        name: '',
        englishName: '',
        officialName: '',
      },
      inputVisible: false,
    });
    const claimsForm = ref();
    const formRules = ref({
      documentType: [
        { required: true, message: '请选择来文类型', trigger: 'blur' },
      ],
      name: [
        {
          required: true,
          message: isOfficialClaim.value ? '请输入来文名称' : '请输入请求名称',
          trigger: 'blur',
        },
      ],
      englishName: [
        { required: true, message: '请输入英文名称', trigger: 'blur' },
      ],
      officialName: [
        { required: true, message: '请输入对应官方来文名称', trigger: 'blur' },
      ],
      submitLoading: false,
    });

    // 是否是编辑
    const isEdit = computed(() => !!props.data.id);

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
    const resetFormModel = () => {
      // state.formData.termValidity = [];
    };
    const {
      loading: submitLoading,
      url: submitClaimsUrl,
      putData: putEditProcess,
    } = useHttp();
    const { postData: postNewProcess } = useHttp('/patent-corp_api/stage-claims');
    const submitForm = async () => {
      try {
        if (!isEdit.value) {
          await postNewProcess({
            ...state.formData,
            claimsType: curClaimsTypeId.value,
          });
          $message.success('提交成功!');
        } else {
          const claimsID = props.data.id;
          submitClaimsUrl.value = `/patent-corp_api/stage-claims/${claimsID}`;
          await putEditProcess(state.formData);
          $message.success('编辑成功!');
        }
        emit('success');
        resetFormModel();
        innerVisible.value = false;
      } catch (error) {
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    const handleAddPlat = () => {
      claimsForm.value.validate((valid) => {
        if (!valid) return;
        try {
          submitForm();
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          const editData = {
            processId: Number($route.query.id),
            processStageId: props.processId,
            documentType: props.data.documentType,
            name: props.data.name,
            englishName: props.data.englishName,
            officialName: props.data.officialName,
          };
          state.formData = { ...state.formData, ...editData };
        } else {
          claimsForm.value.resetFields();
        }
      },
    );

    const dialogTitle = computed(() => {
      if (curClaimsTypeId.value === officialClaimTypeId.value) {
        return isEdit.value ? '编辑来文' : '新增来文';
      }
      if (curClaimsTypeId.value === appealedClaimTypeId.value) {
        return isEdit.value ? '编辑请求' : '新增请求';
      }
      return '';
    });

    return {
      ...toRefs(state),
      submitLoading,
      innerVisible,
      formRules,
      handleAddPlat,
      isEdit,
      saveTagInput,
      showInput,
      handleInputConfirm,
      claimsTypeList,
      resetFormModel,
      claimsForm,
      officialClaimTypeId,
      appealedClaimTypeId,
      curClaimsTypeId,
      dialogTitle,
      isOfficialClaim,
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
  .delete-btn {
    float: left;
  }
}
</style>
