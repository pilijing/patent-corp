<template>
  <div>
    <el-dialog
      :title="`上传凭证 ${batchInfo.number}`"
      :visible.sync="dialogVisible"
      width="36%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item prop="attachments">
            <upload-attachment
              v-model="formData.attachments"
              drag
            />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  toRefs,
  computed,
  reactive,
  ref,
  onMounted,
  defineComponent,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import UploadAttachment from '@/components/upload-attachment.vue';

export default defineComponent({
  name: 'DialogBillVoucherUpload',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    batchInfo: Object,
  },
  components: {
    UploadAttachment,
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();
    const state = reactive({
      formData: {
        attachments: [],
      },
      validateRules: {
        attachments: [
          {
            required: true,
            message: '请上传凭证',
            trigger: 'change',
          },
        ],
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
    const submitLoading = ref(false);
    const initDetail = async () => {
      const { fetchData: detailProcess } = useHttp(`/patent-corp_api/batch-voucher/${props.batchInfo.id}`);
      const attachments = await detailProcess();
      state.formData.attachments = attachments || [];
    };
    const handleSubmit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        const params = {
          batchId: props.batchInfo.id,
          attachments: state.formData.attachments,
        };
        submitLoading.value = true;
        try {
          const { postData } = useHttp('/patent-corp_api/batch-voucher');
          await postData(params);
          $message.success('上传凭证成功');
          emit('success', true);
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
        submitLoading.value = false;
        props.visible = false;
      });
    };
    const handleClose = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };
    onMounted(async () => {
      if (props.batchInfo) {
        initDetail();
      }
    });
    return {
      ...toRefs(state),
      dialogVisible,
      formRef,
      handleSubmit,
      handleClose,
      submitLoading,
      initDetail,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
