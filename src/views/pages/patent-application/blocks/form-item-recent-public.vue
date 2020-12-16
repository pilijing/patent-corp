<template>
  <div class="form-item-recent-public">
    <el-form-item label="公开时间" prop="publishOn" :rules="rules.publishOn">
      <el-date-picker
        v-model="formData.publishOn"
        type="date"
        placeholder="选择日期"
        style="width: 100%;"
      />
    </el-form-item>
    <el-form-item label="以论文的方式公开" prop="isPublishedAsPaper" :rules="rules.isPublishedAsPaper">
      <el-radio-group v-model="formData.isPublishedAsPaper" size="medium">
        <el-radio border :label="true">是</el-radio>
        <el-radio border :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <div v-if="formData.isPublishedAsPaper">
      <el-form-item label="发表机构" prop="publishOrg" :rules="rules.publishOrg">
        <el-input v-model="formData.publishOrg" placeholder="请输入发表机构" />
      </el-form-item>
      <el-form-item label="上传论文全文" prop="paperAttachments" :rules="rules.paperAttachments">
        <upload-attachment drag v-model="formData.paperAttachments" />
      </el-form-item>
    </div>
  </div>
</template>

<script>
/*
  方案近期公开
*/
import {
  reactive,
  defineComponent,
  toRefs,
  computed,
} from '@vue/composition-api';
import utils from '@/utils';
import UploadAttachment from '@/components/upload-attachment.vue';

export default defineComponent({
  name: 'FormItemRecentPublic',
  props: {
    value: Object,
  },
  components: { UploadAttachment },
  setup(props, context) {
    const validateEmpty = (rule, value, callback) => {
      if (utils.isEmpty(value)) {
        if (rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const { emit } = context;
    const state = reactive({
      rules: {
        publishOn: [{
          required: true, message: '请选择公开时间', trigger: 'change',
        }],
        isPublishedAsPaper: [{
          required: true, message: '请选择论文公开方式', trigger: 'change',
        }],
        publishOrg: [{
          required: true, message: '请输入发表机构', validator: validateEmpty, trigger: 'change',
        }],
        paperAttachments: [{
          required: true, message: '请上传论文全文', trigger: 'change',
        }],
      },
    });

    const formData = computed({
      get() {
        return props.value;
      },
      set(val) {
        emit('input', val);
      },
    });

    return {
      ...toRefs(state),
      formData,
    };
  },
});
</script>

<style lang="scss" scoped>
.form-item-recent-public {}
</style>
