<template>
  <el-upload
    v-bind="$attrs"
    v-on="$listeners"
    :action="action"
    :http-request="sendRequest"
    :before-upload="beforeUpload"
    :headers="headers"
    ref="elUpload"
  >
    <slot />
  </el-upload>
</template>

<script>
import {
  reactive, toRefs,
} from '@vue/composition-api';

import nanoid from 'nanoid';
import http from '@/utils/wrap-axios';
import { useCosUpload } from '@/hooks/cos-upload';

export default {
  name: 'UploadCos',
  setup(_, context) {
    const { parent } = context;
    const state = reactive({
      uri: '',
      action: '',
      headers: {},
    });
    const beforeUpload = async () => {
      parent.loading = true;
      state.uri = nanoid(32); // 每次上传的文件都算是一个新文件
      const { data } = await http.get('/patent-corp_api/cos-token', {
        params: {
          uri: state.uri,
          method: 'put',
        },
      });
      state.action = data.requestUrl || '';
      state.headers = {
        Authorization: data.authorization,
      };
    };
    const { cosSendRequest } = useCosUpload();

    const sendRequest = (option) => {
      cosSendRequest(option);
    };
    return {
      ...toRefs(state),
      beforeUpload,
      sendRequest,
    };
  },
};
</script>
