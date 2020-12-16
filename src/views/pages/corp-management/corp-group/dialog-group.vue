<template>
  <div class="dialog-add-corp-group">
    <el-dialog
      :title="editGroup ? '编辑组织' : '新增组织'"
      :visible.sync="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetForm"
    >
      <el-form
        style="margin-top: 20px;"
        :model="formData"
        ref="viewForm"
        label-width="120px"
        :rules="validateRules"
      >
        <div class="info-box">
          <el-form-item label="名称" prop="name">
            <el-input placeholder="请输入组织名称" v-model="formData.name" />
          </el-form-item>
          <el-form-item
            label="上级组织"
            prop="parentId"
          >
            <panel-select-search
              v-model="formData.parentId"
              placeholder="请输入上级组织"
              maxlength="50"
              :api="`/patent-corp_api/corp-group-search?corpId=${userInfo.corpId}`"
              query-key="name"
              label-key="orgPath"
              value-key="id"
              :default-options="groupOptions"
            />
          </el-form-item>
          <!-- <el-form-item
            label="组织负责人"
            prop="leaderId"
          >
            <el-select v-model="formData.leaderId" filterable placeholder="请选择组织负责人">
              <el-option
                v-for="item in corpStaffs"
                :key="item.staffId"
                :label="item.staffFullName"
                filter-method
                :value="item.staffId">
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item
            label="组织负责人"
            prop="leaderId"
          >
            <panel-select-search
              v-model="formData.leaderId"
              placeholder="请选择组织负责人"
              maxlength="50"
              api="/patent-corp_api/staffs/names/like"
              query-key="name"
              label-key="staffFullName"
              value-key="staffId"
              :default-options="staffOptions"
            />
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
          >确 定</el-button
        >
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
  watch,
  defineComponent,
  onMounted,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import { useUserInfo } from '@/context';

export default defineComponent({
  name: 'DialogCorpGroup',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    groupInfo: Object || null,
    editGroup: Boolean,
  },
  components: { PanelSelectSearch },
  setup(props, context) {
    const { $route, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const state = reactive({
      groupOptions: [],
      staffOptions: [],
      formData: {
        corpId: null,
        id: '',
        leaderId: '',
        name: null,
        parentId: '',
      },
      validateRules: {
        name: [{ required: true, message: '请输入名称' }],
      },
      editMore: false,
    });
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const resetForm = () => {
      viewForm.value.resetFields();
    };
    const {
      userInfo,
    } = useUserInfo();
    const {
      data: corpStaffs,
      fetchData,
    } = useHttp(`/patent-corp_api/corp-staff-select?corpId=${userInfo.value.corpId}`);

    onMounted(async () => {
      await fetchData();
    });
    const {
      loading: submitLoading,
      url: submitUrl,
      postData: postCorpGroup,
      putData: putCorpGroup,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          formData.corpId = userInfo.value.corpId;
          const params = {
            ...formData,
          };
          if (props.editGroup) {
            submitUrl.value = `/patent-corp_api/corp-groups/${props.groupInfo.id}`;
            await putCorpGroup(params);
          } else {
            params.id = '';
            submitUrl.value = '/patent-corp_api/corp-groups';
            await postCorpGroup(params);
          }
          emit('success', true);
          resetForm();
          dialogVisible.value = false;
        } catch (error) {
          console.log('error', error);
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          if (props.groupInfo?.parentId) {
            state.groupOptions = [
              {
                id: props.groupInfo.parentId,
                orgPath: props.groupInfo.parentName,
              },
            ];
          }
          if (props.groupInfo?.leaderId) {
            state.staffOptions = [
              {
                staffId: props.groupInfo.leaderId,
                staffFullName: props.groupInfo.leaderName,
              },
            ];
          }
          state.formData.corpId = Number($route.query.id) || 0;
          if (props.groupInfo) {
            state.formData = { ...props.groupInfo };
          }
        } else {
          state.formData.id = 0;
          state.formData.corpId = 0;
          state.editMore = false;
        }
      },
    );
    return {
      ...toRefs(state),
      dialogVisible,
      submitLoading,
      corpStaffs,
      viewForm,
      handleSubmit,
      resetForm,
      userInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.info-box {
  margin-bottom: 20px;
}
.edit-more {
  font-size: 14px;
  color: #0079FE;
  margin-left: 120px;
  cursor: pointer;
}
::v-deep {
  .el-dialog__body {
    overflow-y: auto;
    max-height: 550px;
  }
}
</style>
