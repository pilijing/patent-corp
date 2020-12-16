<template>
  <div class="display-attachment-list">
    <div class="display-list-item" v-for="(item, index) in fileListInfo" :key="item.fileId">
      <div class="file-info">
        <div class="file-info-wrapper">
          <i class="el-icon-tickets" />
          <span class="file-name ellip-txt">{{ item.fileName }}</span>
          <span class="file-size ellip-txt" v-if="item.size && infoFields.includes('size')">{{ item.size }}</span>
          <span class="file-create-time ellip-txt" v-if="item.uploadedAtUtc && infoFields.includes('createTime')">
            {{ item.uploadedAtUtc | formatCreateTime }}
          </span>
          <span class="file-create-user ellip-txt" v-if="item.uploadedByName && infoFields.includes('createUser')">
            {{ item.uploadedByName }}
          </span>
          <!-- <el-tooltip effect="dark" :content="item.fileName" placement="top-start">
            <span class="file-name ellip-txt">{{ item.fileName }}</span>
          </el-tooltip> -->
          <!-- <el-tooltip
            v-if="item.size && infoFields.includes('size')"
            effect="dark"
            :content="`${item.size}`"
            placement="top-start"
          >
            <span class="file-size ellip-txt" v-if="item.size && infoFields.includes('size')">{{ item.size }}</span>
          </el-tooltip> -->
          <!-- <el-tooltip
            v-if="item.uploadedAtUtc && infoFields.includes('createTime')"
            effect="dark"
            :content="item.uploadedAtUtc | formatCreateTime"
            placement="top-start"
          >
            <span class="file-create-time ellip-txt" v-if="item.uploadedAtUtc && infoFields.includes('createTime')">
              {{ item.uploadedAtUtc | formatCreateTime }}
            </span>
          </el-tooltip> -->
          <!-- <el-tooltip
            v-if="item.uploadedByName && infoFields.includes('createUser')"
            effect="dark"
            :content="item.uploadedByName"
            placement="top-start"
          >
            <span class="file-create-user ellip-txt" v-if="item.uploadedByName && infoFields.includes('createUser')">
              {{ item.uploadedByName }}
            </span>
          </el-tooltip> -->
        </div>
        <span class="file-info-operate">
          <a
            v-if="item.previewUrl && infoFields.includes('preview')"
            :href="item.previewUrl"
            target="_blank"
          >
            <i class="el-icon-view" />
          </a>
          <span
            class="cur-pointer color-blur"
            v-if="item.downloadUrl && infoFields.includes('download')"
            target="_blank"
            @click="handleDownload(item)"
          >
            <i class="el-icon-download" />
          </span>
          <i
            v-if="infoFields.includes('delete')"
            @click="toDelete(index)"
            class="el-icon-delete cur-pointer color-blur"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, watch, onMounted,
} from '@vue/composition-api';
import utils from '@/utils';
import http from '@/utils/wrap-axios';

export default defineComponent({
  name: 'DisplayAttachmentList',
  props: {
    fileList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 需要显示的信息
    infoFields: {
      type: Array,
      default() {
        return [
          'size',
          'createUser',
          'createTime',
          'preview',
          'download',
          // 'delete', // 默认展示不能删除
        ];
      },
    },
  },
  filters: {
    formatCreateTime(val) {
      return utils.dateFormat(val);
    },
  },
  setup(props, context) {
    const { $confirm } = context.root;
    const { emit } = context;
    const state = reactive({
      fileListInfo: [],
    });
    const getFileListInfo = async (list) => {
      const filePromiseList = (list || []).map(async (item) => {
        let downloadUrl = '';
        let previewUrl = '';
        try {
          const { data } = await http.get('/patent-corp_api/cos-token', {
            params: {
              uri: item.fileId,
              method: 'get',
            },
          });
          const authorization = encodeURIComponent(data.authorization);
          downloadUrl = `${data.requestUrl}?sign=${authorization}`;
          // type 带有 image/ 的文件才可以预览
          if (item.fileType.indexOf('image/') > -1) {
            previewUrl = `${data.imageUrl}?sign=${authorization}`;
          }
        } catch (error) {
          console.error('upload', error);
        }
        let { fileLength } = item;
        let unit = 'B';
        if (item.fileLength >= 1024) {
          fileLength = Number(item.fileLength / 1024).toFixed(2);
          unit = 'KB';
        }
        if (item.fileLength >= 1024 * 1024) {
          fileLength = Number(item.fileLength / 1024 / 1024).toFixed(2);
          unit = 'MB';
        }
        if (item.fileLength >= 1024 * 1024 * 1024) {
          fileLength = Number(item.fileLength / 1024 / 1024 / 1024).toFixed(2);
          unit = 'GB';
        }
        return {
          ...item,
          size: `${fileLength}${unit}`,
          downloadUrl,
          previewUrl,
        };
      });
      state.fileListInfo = await Promise.all(filePromiseList);
    };
    watch(() => props.fileList, async (list) => {
      await getFileListInfo(list);
    });
    const confirmDelete = (index) => {
      emit('remove', index);
    };
    const toDelete = (index) => {
      $confirm(
        '是否确认删除？',
        '删除',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
      ).then(() => {
        confirmDelete(index);
      });
    };
    const handleDownload = (file) => {
      utils.getBlob(file.downloadUrl).then((blob) => {
        utils.saveAs(blob, file.fileName);
      })
        .catch((err) => {
          console.log(err);
        });
    };
    onMounted(() => {
      getFileListInfo(props.fileList);
    });
    return {
      ...toRefs(state),
      handleDownload,
      toDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.display-attachment-list {
  margin-bottom: 0px;
  .display-list-item {
    // 与 uploader.vue 中的 upload-style 一致
    line-height: 28px;
    & + .display-list-item {
      margin-top: 5px;
    }
    .file-info {
      display: flex;
      align-items: center;
      .file-info-wrapper {
        display: flex;
        align-items: center;
        overflow: hidden;
        .el-icon-tickets {
          margin-right: 5px;
        }
        .ellip-txt {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        $MR: 15px;
        $COLOR2: #878787;
        .file-name {
          margin-right: $MR;
          color: #303133;
        }
        .file-size {
          margin-right: $MR;
          color: $COLOR2;
          min-width: 45px;
        }
        .file-create-user {
          margin-right: $MR;
          color: $COLOR2;
          min-width: 50px;
        }
        .file-create-time {
          margin-right: $MR;
          color: $COLOR2;
          min-width: 80px;
        }
      }
      .file-info-operate {
        margin-left: 10px;
        flex: none;
        & > a,
        i {
          margin-right: 5px;
        }
      }
    }
  }
  .cur-pointer {
    cursor: pointer;
  }
  .color-blur {
    color: #1890ff;
  }
}
</style>
