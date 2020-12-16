<template>
  <div class="dialog-input-communication">
    <el-dialog
      :title="isClaim == 1 ?'录入来文' : '发送请求'"
      :visible.sync="innerVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
      <div class="el-dialog-div">
        <el-form
          ref="dynamicForm"
          class="form"
          label-width="140px"
          :model="dialogFormData"
          :rules="rules"
            v-show="visibleNext"
        >
          <el-form-item
            class="labelName"
            :label="isClaim == 1 ?'来文' : '请求'"
            prop="stageClaimsId"
          >
            <panel-select-group
              v-if="patentData"
              @current-stageid="currentId"
              v-model="dialogFormData.stageClaimsId"
              :query="{
                  processId: patentData.processId,
                  patentId: patentData.id,
                  claimsType: claimsType
              }"
              api="/patent-corp_api/process-claims-current-combo"
              :is-more="true"
              loadMoreApi="/patent-corp_api/process-claims-other-combo"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            label="上传附件"
            prop="attachments"
          >
            <upload-attachment v-model="dialogFormData.attachments" drag />
          </el-form-item>
          <div class="footer-next">
            <el-button type="primary" @click="handleEdit">下一步</el-button>
          </div>
        </el-form>
        <el-form v-show="!visibleNext"
          class="form"
          ref="dynamicNextForm"
          :rules="rules"
          :model="dialogNextFormData"
        >
          <dynamic-fields :fields="fields" v-model="dialogNextFormData" />
          <div class="footer-next">
            <el-button
              @click="
              (visibleNext = true)"
              type="primary">上一步</el-button>
            <el-button @click="submitForm" type="primary">确认</el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  defineComponent, reactive, toRefs, computed, ref, onMounted,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import PanelSelectGroup from '@/components/panel-select-group.vue';
import UploadAttachment from '@/components/upload-attachment.vue';
import DynamicFields from '@/components/dynamic-fields.vue';

export default defineComponent({
  name: 'DialogInputCommunication',
  props: {
    visible: Boolean,
    patentData: null,
    isClaim: Number,
  },
  components: {
    PanelSelectGroup,
    UploadAttachment,
    DynamicFields,
  },
  setup(props, context) {
    const dynamicForm = ref(null);
    const dynamicNextForm = ref(null);
    const { emit } = context;
    const { $message, $route } = context.root;
    const patentId = Number($route.query.id);
    const state = reactive({
      visibleNext: true,
      fields: [],
      claimsType: 701,
      progressProperties: [],
      currentStageId: 0,
      dialogFormData: {},
      dialogNextFormData: null,
      rules: {
        stageClaimsId: [{
          required: true, message: '请选择来文', trigger: 'change',
        }],
        attachments: [{
          required: true, message: '请上传附件', trigger: 'change',
        }],
      },
    });
    const innerVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const { fetchData: stageClaimsField, url: dataUrl } = useHttp();
    const { postData: postNewProcess } = useHttp('/patent-corp_api/progress');
    const { postData: postNewRequestProcess } = useHttp('/patent-corp_api/initiate-request');
    const handleEdit = async () => {
      dynamicForm.value.validate(async (valid) => {
        if (!valid) return;
        state.visibleNext = false;
        if (state.dialogFormData.stageClaimsId) {
          dataUrl.value = `/patent-corp_api/stage-claims-field/${state.dialogFormData.stageClaimsId}`;
          state.fields = await stageClaimsField();
        }
      });
    };
    const currentId = (val) => {
      state.currentStageId = val;
    };
    const submitForm = async () => {
      dynamicNextForm.value.validate(async (valid) => {
        if (!valid) return;
        const progressProperties = [];
        if (state.fields) {
          state.fields.forEach((p) => {
            const progressPropert = {};
            const arrayValue = [];
            progressPropert.stageClaimFieldId = p.id;
            progressPropert.stageId = state.currentStageId;
            progressPropert.stageStepFieldId = p.id;
            const formData = state.dialogNextFormData[p.id];
            if (formData) {
              if (Array.isArray(formData) && formData.lenght !== 0) {
                arrayValue.value = JSON.stringify(formData);
              } else {
                arrayValue.push(typeof (formData) !== 'string' ? String(formData) : formData);
                arrayValue.value = JSON.stringify(arrayValue);
              }
            } else {
              arrayValue.value = undefined;
            }

            progressPropert.value = arrayValue.value || '';
            progressProperties.push(progressPropert);
          });
        }
        const {
          attachments, stageClaimsId,
        } = state.dialogFormData;
        const params = {
          patentId,
          attachments,
          stageClaimsId,
          stageId: state.currentStageId,
          progressProperties,
        };
        try {
          if (props.isClaim === 1) {
            await postNewProcess(params);
            $message.success('提交成功!');
          } else {
            await postNewRequestProcess(params);
            $message.success('提交成功!');
          }
          emit('success');
          innerVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    onMounted(() => {
      state.dialogFormData = {};
      state.dialogFormData = {
        attachments: [],
        stageId: state.currentStageId,
        patentId, // 专利id
        stageClaimsId: null, // 阶段权力要求配置
        progressProperties: state.progressProperties,
      };
      if (props.isClaim === 1) {
        state.claimsType = 701;
      } else {
        state.claimsType = 702;
      }
    });
    return {
      ...toRefs(state),
      handleEdit,
      innerVisible,
      dynamicForm,
      dynamicNextForm,
      submitForm,
      currentId,
    };
  },
});
</script>
<style lang="scss" scoped>
  .footer-next{
    width: 100%;
    text-align: center;
    margin: 5% auto;
  }
  .el-dialog-div{
    max-height: 700px;
    overflow: auto;
  }

</style>
