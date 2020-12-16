<template>
<div>
  <el-dialog
    title="新增部门审核人"
    width="720px"
    :visible.sync="innerVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @close="shutDown"
  >
  <el-form
    class="form"
    label-width="140px"
    ref="claimsForm"
    :model="formData"
    :rules="formRules"
  >
    <el-form-item label="部门" prop="deptId">
      <panel-select-search
        v-model="formData.deptId"
        placeholder="请输入部门"
        maxlength="50"
        api="/patent-corp_api/groups/search"
        query-key="name"
        label-key="orgPath"
        value-key="id"
        :default-options="groupOptions"
        @changeitem="handleChangeEngineer"
      />
    </el-form-item>
    <el-form-item
      label="委托人"
      prop="clientFullName"
    >
      <panel-select-search
        v-model="formData.clientFullName"
        placeholder="委托人姓名"
        maxlength="50"
        :disabled="isEnable"
      />
    </el-form-item>
    <el-form-item
      label="审核人"
      prop="reviewerStaffId"
    >
      <panel-select-search
        v-model="formData.reviewerStaffId"
        placeholder="请输入审核人姓名"
        maxlength="50"
        api="/patent-corp_api/staffs/names/like"
        query-key="name"
        label-key="staffFullName"
        value-key="staffId"
        :default-options="staffOptions"
        @changeitem="handleChangeReviewerStaffId"
        @input="handleSearchReviewerInput"
      />
    </el-form-item>
  </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="(dialogVisible = false), (formData = {})">取 消</el-button>
      <el-button type="primary" v-loading="submitLoading" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import {
  defineComponent, reactive, toRefs, computed, ref,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';

export default defineComponent({
  name: 'DialogAddReviewer',
  components: {
    useLookupsInject,
    PanelSelectSearch,
  },
  props: {
    visible: Boolean,
  },
  setup(props, context) {
    const { emit } = context;
    const { $message } = context.root;
    const claimsForm = ref();
    const state = reactive({
      staffOptions: [],
      groupOptions: [],
      isEnable: true,
      formData: {
        clientFullName: '',
        deptId: '',
        reviewerStaffId: '',
      },
      formRules: {
        clientFullName: [
          { required: true, message: '请输入委托人姓名', trigger: 'blur' },
        ],
        deptId: [
          { required: true, message: '请输入部门', trigger: 'change' },
        ],
        reviewerStaffId: [
          { required: true, message: '请输入审核人姓名', trigger: 'change' },
        ],
      },
    });
    const innerVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
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
    const shutDown = () => {
      state.formData = {};
    };
    const handleChangeReviewerStaffId = async (val) => {
      if (val) {
        const { formData } = state;
        formData.reviewerFullName = val.staffFullName;
      }
    };
    const handleSearchReviewerInput = (val) => {
      if (!val) {
        const { formData } = state;
        formData.clientFullName = null;
      }
    };
    const handleChangeEngineer = (val) => {
      if (val) {
        const { formData } = state;
        formData.deptName = val.orgPath;
        formData.clientStaffId = val.leaderId.toString();
        formData.clientFullName = val.leaderName;
      }
    };
    const {
      loading: submitLoading,
      postData: postNewReviewer,
    } = useHttp('/patent-corp_api/dept-reviewer');
    const submitForm = () => {
      claimsForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          await postNewReviewer({
            ...state.formData,
          });
          $message.success('提交成功!');
          emit('success');
          shutDown();
          innerVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    return {
      ...toRefs(state),
      innerVisible,
      submitForm,
      shutDown,
      claimsForm,
      handleChangeReviewerStaffId,
      handleSearchReviewerInput,
      handleChangeEngineer,
      dialogVisible,
      submitLoading,
    };
  },
});
</script>
<style lang="scss" scoped>
</style>
