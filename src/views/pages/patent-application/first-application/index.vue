<template>
  <div class="first-application">
    <page-card>
      <el-form
        ref="formPatent"
        class="form"
        :model="formData"
        label-width="150px"
      >
        <dynamic-fields
          :fields="fields"
          v-model="formData"
          :tag-data.sync="tagList"
        />
      </el-form>
      <div class="footer-submit">
        <el-button type="primary" style="width: 120px" @click="submitPatent">确认提交</el-button>
      </div>
    </page-card>
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, ref,
} from '@vue/composition-api';
import utils from '@/utils';
import DynamicFields from '@/components/dynamic-fields.vue';
import { useFirstApplicationInject } from '@/context';

export default defineComponent({
  name: 'FirstApplication',
  components: { DynamicFields },
  setup(_, context) {
    const { $message, $router } = context.root;
    const formPatent = ref(null);
    const state = reactive({
      formData: {},
      tagList: [],
    });

    const {
      fields,
      getFields,
      error: submitError,
      postPatent,
      addId,
    } = useFirstApplicationInject();

    getFields('/patent-corp_api/stage-step-fields?stageStepOrder=1');
    // ?stageStepOrder=1

    // 提交专利申请
    const submitPatent = () => {
      formPatent.value.validate(async (valid) => {
        if (!valid) return;
        const progressProperties = utils.handleFieldsSubmitVal(fields.value, state.formData, state.tagList);
        const params = {
          stageStepOrder: 1,
          progressProperties,
        };
        await postPatent(params);
        if (!submitError.value) {
          $message.success('提交成功!');
          $router.push(`/first-application/detail?id=${addId.value}`);
        } else {
          $message.error('提交失败!');
        }
      });
    };

    return {
      ...toRefs(state),
      fields,
      formPatent,
      submitPatent,
    };
  },
});
</script>

<style lang="scss" scoped>
.first-application {
  .form {
    width: 70%;
    margin: 0 auto;
    padding-right: 90px;
  }
  .footer-submit {
    text-align: center;
  }
}
</style>
