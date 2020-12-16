<template>
  <div class="form-item-third-party">
    <el-form-item label="合作单位名称" prop="cooperationName" :rules="rules.cooperationName">
      <el-input v-model="formData.cooperationName" placeholder="请输入合作单位名称" />
    </el-form-item>
    <el-form-item label="中文地址" prop="chineseAddress" :rules="rules.chineseAddress">
      <el-input v-model="formData.chineseAddress" placeholder="请输入中文地址" />
    </el-form-item>
    <el-form-item label="英文地址" prop="englishAddress" :rules="rules.englishAddress">
      <el-input v-model="formData.englishAddress" placeholder="请输入英文地址" />
    </el-form-item>
    <el-form-item label="组织机构代码" prop="cooperationId" :rules="rules.cooperationId">
      <el-input v-model="formData.cooperationId" placeholder="请输入组织机构代码" />
    </el-form-item>
    <el-form-item label="上传高校合作协议" prop="agreementAttachments" :rules="rules.agreementAttachments">
      <upload-attachment drag v-model="formData.agreementAttachments" />
    </el-form-item>
  </div>
</template>

<script>
/*
  第三方合作
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
  name: 'FormItemThirdParty',
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
        cooperationName: [{
          required: true, message: '请输入合作单位名称', validator: validateEmpty, trigger: 'change',
        }],
        chineseAddress: [{
          required: true, message: '请输入中文地址', validator: validateEmpty, trigger: 'change',
        }],
        englishAddress: [{
          required: true, message: '请输入英文地址', validator: validateEmpty, trigger: 'change',
        }],
        cooperationId: [{
          required: true, message: '请输入组织机构代码', validator: validateEmpty, trigger: 'change',
        }],
        agreementAttachments: [{
          required: true, message: '请上传高校合作协议', trigger: 'change',
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
.form-item-third-party {}
</style>
