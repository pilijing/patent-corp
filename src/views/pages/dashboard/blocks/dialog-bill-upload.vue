<template>
  <div>
    <el-dialog
      title="列表导入"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
      custom-class="dialog-bill-upload"
    >
      <div
        class="upload-info"
        v-if="isSubmit"
      >

        <div class="info">
          <i class="el-icon-error error"></i>
          <div class="title">上传失败</div>
          <div class="tip">请核对并修改以下信息后，再重新提交。</div>

        </div>
        <div class="info-fail">
          <div class="title">解析失败：</div>
          <div
            class="line"
            v-for="(e, i) in errorList"
            :key="i"
          >
            <i class="el-icon-circle-close"></i>
            <span>{{e}}</span>
          </div>
        </div>
      </div>
      <el-form
        v-else
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        :rules="rules"
      >
        <center>
          <el-form-item prop="billFileList">
            <el-upload
              drag
              action="#"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              :auto-upload="false"
              :on-change="handleUploadChange"
              :on-exceed="handleUploadExceed"
              :limit="1"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
        </center>
      </el-form>
      <span
        v-if="isSubmit"
        slot="footer"
        class="dialog-footer is-submit"
      >
        <el-button
          type="primary"
          @click="dialogVisible = false"
        >确 定</el-button>
      </span>
      <span
        v-else
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
  defineComponent,
} from '@vue/composition-api';
import { useLookupsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import http from '@/utils/wrap-axios';
import SelectorCountry from '@/components/selector-country.vue';

export default defineComponent({
  name: 'DialogAgencyFee',
  props: {
    batchId: Number || String,
    visible: {
      type: Boolean,
      default: false,
    },
    agencyFeeInfo: Object,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    SelectorCountry,
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();

    const { feeStages } = useLookupsInject();
    const state = reactive({
      isSuccess: true,
      isSubmit: false,
      errorList: [],
      formData: {
        billFileList: [],
      },
      rules: {
        billFileList: [
          {
            required: true,
            message: '请上传账单',
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
    const handleSubmit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        submitLoading.value = true;
        const files = state.formData.billFileList;
        const formData = new FormData();
        if (files && files.length > 0) {
          formData.append('file', files[0].raw);
        }
        try {
          await http({
            method: 'post',
            url: '/patent-corp_api/bills-upload',
            params: {
              batchId: props.batchId,
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            data: formData,
          });
          $message.success('上传成功');
          dialogVisible.value = false;
        } catch (error) {
          const { data } = error.response;
          if (Array.isArray(data)) {
            state.errorList = data;
          } else {
            $message.error(data);
          }
          state.isSubmit = true;
        }
        submitLoading.value = false;
      });
    };

    const handleClose = () => {
      state.isSubmit = false;
      state.errorList = [];
      state.formData.billFileList = [];
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };
    return {
      ...toRefs(state),
      dialogVisible,
      formRef,
      handleClose,
      handleSubmit,
      submitLoading,
      feeStages,
      handleUploadChange(file, fileList) {
        state.formData.billFileList = fileList;
      },
      handleUploadExceed() {
        $message.warning('只能选择一个账单');
      },
    };
  },
});
</script>

<style lang="scss">
.dialog-bill-upload {
  $danger: rgb(245, 34, 45);
  .el-dialog__body {
    padding: 30px;
  }
  .upload-info {
    text-align: center;
    .info {
      i {
        font-size: 50px;
        color: $danger;
      }
      i.success {
        color: #36c626;
      }
      .title {
        margin-top: 10px;
        font-size: 24px;
        line-height: 32px;
        color: rgba(0, 0, 0, 0.8);
      }
      .tip {
        padding: 16px 0 20px;
        color: rgba(0, 0, 0, 0.44);
        font-weight: 400;
        line-height: 22px;
      }
    }
    .info-fail {
      display: inline-block;
      margin: 0 auto;
      text-align: left;
      width: 500px;
      .title {
        font-weight: bold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 12px;
      }
      .line {
        padding: 4px 0;
        display: flex;
        align-items: center;
        i {
          font-size: 16px;
          color: $danger;
          margin-right: 8px;
        }
      }
    }
  }
  .el-upload {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
    }
  }
}
</style>
