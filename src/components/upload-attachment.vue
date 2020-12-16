<template>
  <div class="upload-attachment"
       v-loading="loading"
       element-loading-text="文件上传中"
       element-loading-spinner="el-icon-loading"
  >
    <upload-cos
      :class="uploadClass"
      :drag="drag"
      v-bind="$attrs"
      v-on="$listeners"
      :show-file-list="listType === 'picture-card'"
      :on-success="onSuccess"
      :on-remove="onRemove"
      :limit="Number(limit)"
      :list-type="listType"
      :file-list="uploadList"
      :on-error="onError"
      ref="uploadCosFile"
    >
      <template v-if="canUpload">
        <i v-if="listType === 'picture-card'" class="el-icon-plus" />
        <slot v-else>
          <template v-if="drag">
            <div class="upload-title"><i class="el-icon-upload" />&nbsp;
              <span>
                {{ drag ? '添加附件(点击或将文件拖拽至此处)' : '点击添加' }}
              </span>
            </div>
            <div class="upload-btn upload-drag-text">点击或将文件拖拽至此处</div>
          </template>
          <span v-else class="upload-btn" style="line-height: initial;">点击上传</span>
        </slot>
      </template>
    </upload-cos>
    <display-attachment
      v-if="showList && !listType"
      :file-list="uploadList"
      @remove="removeFile"
      :style="canUpload ? 'margin-top: 7px;' : ''"
      :info-fields="['size', 'createUser', 'createTime', 'preview', 'download', 'delete']"
    />
  </div>
</template>

<script>
import {
  computed, reactive, toRefs, watch, ref,
} from '@vue/composition-api';
import { useUserInfo } from '@/context';

import utils from '@/utils';
import http from '@/utils/wrap-axios';
import DisplayAttachment from './display-attachment.vue';
import UploadCos from './upload-cos.vue';

export default {
  name: 'UploadAttachment',
  components: {
    UploadCos,
    DisplayAttachment,
  },
  props: {
    // 使用默认样式
    defaultStyle: {
      type: Boolean,
      default: false,
    },
    uploadList: {
      type: Array,
      default: () => [],
    },
    listType: {
      type: String,
      default: '',
    },
    drag: Boolean,
    showList: {
      type: Boolean,
      default: true,
    },
    limit: [String, Number],
    unit: {
      type: String,
      default: 'kb',
    },
  },
  model: {
    prop: 'uploadList',
    event: 'change',
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const uploadCosFile = ref(null);

    const { userInfo } = useUserInfo();

    const state = reactive({
      loading: false,
      innerFileList: [],
    });
    const canUpload = computed(() => {
      if (props.limit && props.limit <= (props.uploadList || []).length) {
        return false;
      }
      return true;
    });
    const uploadClass = computed(() => {
      if (props.defaultStyle) {
        return '';
      }
      let classStr = 'upload-wrapper';
      const uploadList = props.uploadList || [];
      if (props.limit > uploadList.length) {
        classStr += '';
      } else {
        classStr += ' not-show-add-box';
      }
      // 只有文件列表显示才会判断
      if (!canUpload.value && props.listType !== 'picture-card') {
        classStr += ' no-top';
      }
      return classStr;
    });
    // 根据 fileId 获取 fileUrl
    const fetchFileUrlByFileId = async (fileId) => {
      const { data: fileInfo } = await http.get('/patent-corp_api/cos-token', {
        params: { uri: fileId, method: 'get' },
      });
      const authorization = encodeURIComponent(fileInfo.authorization);
      const url = `${fileInfo.imageUrl}?sign=${authorization}`;
      return url;
    };
    const uploadListLenth = computed(() => props.uploadList.length || 0);
    watch(() => uploadListLenth.value, async (len) => {
      if (props.listType === 'picture-card') {
        const replaceList = await Promise.all(props.uploadList.map(async (item) => {
          const url = await fetchFileUrlByFileId(item.fileId);
          return {
            ...item,
            url,
          };
        }));
        props.uploadList.splice(0, len, ...replaceList);
      }
    });
    const onSuccess = async (response, file, fileList) => {
      // 有 response 的是新增的文件
      const list = fileList.filter(item => item.response);
      const uploadFileList = (list || []).map((item) => {
        const { response: responseData, raw, url } = item;
        const newItem = {
          fileId: responseData.key,
          fileType: raw.type,
          uploadedAtUtc: utils.dateFormat(new Date(), 'yyyy-MM-DD HH:mm:ss'),
          fileName: raw.name,
          fileLength: raw.size,
          uploadedByName: userInfo.value.staffFullName,
          uploadedBy: userInfo.value.staffId,
        };
        if (url) {
          newItem.url = url;
        }
        return newItem;
      });
      emit('change', [
        ...props.uploadList,
        ...uploadFileList,
      ]);
      state.loading = false;
    };
    const onRemove = (file, fileList) => {
      if (file && file.status === 'success') {
        const findIndex = props.uploadList.findIndex(item => item.fileId === file.fileId);
        if (findIndex > -1) {
          props.uploadList.splice(findIndex, 1);
        }
      }
      console.log('file, fileList, props.uploadList => ', file, fileList, props.uploadList);
    };
    const removeFile = (index) => {
      props.uploadList.splice(index, 1);
      state.innerFileList.splice(index, 1);
    };
    const onError = () => {
      $message.error('上传失败，请重新上传！');
      state.loading = false;
    };
    const handleAbort = () => {
      if (state.loading) {
        uploadCosFile.value.$refs.elUpload.abort();
        state.loading = false;
      }
    };
    return {
      ...toRefs(state),
      uploadClass,
      canUpload,
      onSuccess,
      onRemove,
      removeFile,
      onError,
      uploadCosFile,
      handleAbort,
    };
  },
};
</script>

<style lang="scss" scoped>
.upload-attachment {
  .upload-wrapper {
    display: flex;
    color: #1890FF;
    margin-top: 8px;
    &.no-top {
      margin-top: 3px;
    }
    .upload-btn {
      cursor: pointer;
      color: #2685E6;
    }
    ::v-deep .el-upload {
      .el-upload-dragger {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: initial;
        width: auto;
        height: auto;
        border: 0;
        background-color: transparent;
        &::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .upload-title {
          display: block;
        }
        .upload-drag-text {
          display: none;
        }
        &.is-dragover {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          border: 2px dashed #1890ff;
          .upload-title {
            display: none;
          }
          .upload-drag-text {
            display: block;
            margin: 0 71px;
          }
        }
        .upload-title {
          text-align: left;
          line-height: initial;
          .el-icon-upload {
            margin: 0;
            color: inherit;
            font-size: 14px;
            line-height: 1;
          }
        }
      }
    }
  }
  .not-show-add-box {
    & ::v-deep {
      .el-upload--picture-card {
        display: none;
      }
      .el-upload-list--picture-card {
        display: inline-flex;
      }
    }
  }
  ::v-deep {
    .el-loading-mask{
      .el-loading-text{
        font-size: 10px;
      }
    }
  }
}
</style>
