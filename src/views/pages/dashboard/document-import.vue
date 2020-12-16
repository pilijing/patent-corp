<template>
  <div class="document-import">
    <page-card title="文档上传" class="document-update">
      <el-upload
        class="upload-demo"
        drag
        multiple
        accept="application/x-zip-compressed,application/zip"
        :action="action"
        :headers="headers"
        :http-request="sendRequest"
        :before-upload="handleBeforeUpload"
        :auto-upload="false"
        :on-error="onError"
        :on-success="onSuccess"
        :before-remove="beforeRemove"
        ref="elUpload"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">点击或将文件拖拽到这里</div>
        <div>支持扩展名：.zip</div>
      </el-upload>
      <el-button
        style="margin-top: 30px"
        size="small"
        type="primary"
        @click="submitUpload"
      >开始文档上传</el-button>
    </page-card>
    <page-card title="文档解析结果" class="update-result">
      <div v-if="processing">处理中...</div>
      <div v-for="(item, index) in parsingResult" :key="`${item.id}-${index}`">
        <div class="file-name">
          <div class="name">{{ item.fileName }}</div>
          <div
            :style="{ color: parsingResultObj[item.processingStatus].color }"
          >
            <i :class="parsingResultObj[item.processingStatus].icon" />
            {{ getTypeName(item.processingStatus) }}
          </div>
        </div>
        <div class="content">
          <template v-for="recordsItem in (item.records || [])">
            <div
              :key="recordsItem.id"
              class="records-item"
              :style="{
                'background': levelObj[recordsItem.level].bgColor,
                'color': levelObj[recordsItem.level].color,
              }"
            >{{ recordsItem.content }}</div>
          </template>
        </div>
      </div>
    </page-card>
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import nanoid from 'nanoid';
import http from '@/utils/wrap-axios';
import { useLookupsInject } from '@/context';
import { useCosUpload } from '@/hooks/cos-upload';

export default defineComponent({
  name: 'DocumentImport',
  setup(_, context) {
    // const { $set } = context.root;
    const elUpload = ref(null);
    const { $message } = context.root;
    const state = reactive({
      fileList: [],
      action: '',
      headers: {},
      parsingResult: [],
      processing: false,
      batchNumber: null,
    });
    const { getTypeName } = useLookupsInject();

    // 管理解析结果状态
    const parsingResultObj = computed(() => ({
      8201: { color: '#303133', icon: 'el-icon-info' },
      8202: { color: '#00CB7A', icon: 'el-icon-success' },
      8203: { color: '#FF3F3B', icon: 'el-icon-error' },
    }));
    // 管理解析结果level
    const levelObj = computed(() => ({
      1: { bgColor: '#fff', color: '#303133' },
      2: { bgColor: '#e6a23c', color: '#fff' },
      3: { bgColor: '#f56c6c', color: '#fff' },
    }));

    const setParams = async () => {
      const uri = nanoid(32); // 每次上传的文件都算是一个新文件
      const { data } = await http.get('/patent-corp_api/cos-token', {
        params: {
          uri,
          method: 'put',
        },
      });
      state.action = data.requestUrl || '';
      state.headers = {
        Authorization: data.authorization,
      };
    };
    const handleBeforeUpload = async (file) => {
      const type = ['application/x-zip-compressed', 'application/zip'];
      const isSatisfy = type.indexOf(file.type) !== -1;
      if (!isSatisfy) {
        $message.error('只支持.zip类型的文件');
        return false;
      }
      await setParams();
      return isSatisfy;
    };
    const { cosSendRequest } = useCosUpload();

    const sendRequest = (option) => {
      cosSendRequest(option);
    };

    const packageParsingResult = () => {
      const interval = setInterval(async () => {
        const { data } = await http.get(`/patent-corp_api/cpc-package/records?batchNumber=${state.batchNumber}`);
        state.parsingResult = data;
        const processingStatus = (data || []).some(item => item.processingStatus === 8201); // 处理中
        if (!processingStatus) {
          clearTime();
          state.processing = false;
        }
      }, 1000);
      function clearTime() {
        clearInterval(interval);
      }
    };

    // 解析
    const packageParsing = (file) => {
      state.processing = true;
      const { response: responseData, raw } = file;
      const params = {
        fileId: responseData.key,
        fileName: raw.name,
        fileLength: raw.size,
        batchNumber: state.batchNumber,
      };
      http.post('/patent-corp_api/cpc-package/analyze', params);
      packageParsingResult();
    };

    const beforeRemove = (file) => {
      const isUploaded = file.status === 'success';
      if (isUploaded) {
        $message.error('已上传,不能删除!');
      }
      return !isUploaded;
    };

    const onError = () => {
      $message.error('上传失败，请重新上传！');
    };

    // 获取批次号
    const fetchBatchNumber = async () => {
      const { data } = await http.get('/patent-corp_api/cpc-package/batch-number');
      return data;
    };

    const onSuccess = async (response, file) => {
      packageParsing(file);
    };

    const submitUpload = async () => {
      elUpload.value.submit();
      const { uploadFiles } = elUpload.value;
      const isAllUploaded = uploadFiles.every(item => item.status === 'success');
      if (uploadFiles.length === 0 || isAllUploaded) {
        $message.error('请选取文件');
        return;
      }
      state.batchNumber = await fetchBatchNumber();
    };

    return {
      ...toRefs(state),
      elUpload,
      handleBeforeUpload,
      sendRequest,
      submitUpload,
      beforeRemove,
      onError,
      onSuccess,
      getTypeName,
      parsingResultObj,
      levelObj,
    };
  },
});

</script>

<style lang="scss" scoped>
.document-import {
  display: flex;
  justify-content: space-between;
  .document-update,
  .update-result {
    width: 50%;
    margin-right: 20px;
    .file-name {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      .name {
        font-weight: 600;
      }
    }
    .content {
      margin-top: 10px;
      margin-left: 20px;
      .records-item {
        margin: 2px 0 10px;
        padding: 2px 10px;
        border-radius: 5px;
        font-size: 13px;
      }
    }
  }
  .el-upload__text{
    margin-bottom: 10px;
  }
  ::v-deep {
    .el-upload,
    .el-upload-dragger {
      width: 100%;
    }
  }
}
</style>
