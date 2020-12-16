<template>
  <el-form
    :model="billForm"
    status-icon
    :rules="rules"
    ref="ruleForm"
    label-width="100px"
    class="demo-ruleForm"
  >
    <el-form-item label="有没有账单">
      <el-radio-group v-model="billForm.hasBill">
        <el-radio border :label="true"> YES</el-radio>
        <el-radio border :label="false"> NO </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="密码" prop="pass">
      <el-input type="text" v-model="billForm.pass"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from '@vue/composition-api';

import { ElForm } from 'element-ui/types/form';

export default defineComponent({
  name: 'CustomValidation',
  setup() {
    const ruleForm = ref<ElForm | null>(null);
    const billForm = reactive({
      hasBill: false,
      pass: '',
    });

    const validateBillFeeName = (rule: any, value: any, callback: Function) => {
      if (billForm.hasBill === true && value === '') {
        callback(new Error('请输入密码'));
      } else {
        callback();
      }
    };
    const rules = reactive({
      pass: [{ validator: validateBillFeeName, trigger: 'blur' }],
    });

    function submitForm() {
      if (ruleForm.value) {
        ruleForm.value.validate((valid: boolean) => {
          if (valid) {
            console.log('验证通过，请发请求');
            return true;
          }
          console.log('验证失败');
          return false;
        });
      }
    }

    return {
      billForm,
      rules,
      submitForm,
      ruleForm,
    };
  },
});
</script>

<style lang="scss" scoped></style>
