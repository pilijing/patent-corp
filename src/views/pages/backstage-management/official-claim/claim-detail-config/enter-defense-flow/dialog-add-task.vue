<template>
  <div class="dialog-add-task">
    <el-dialog
      :title="isEdit ? '编辑任务流程' : '添加任务流程'"
      :visible.sync="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item
          label="任务名称"
          prop="name"
          required
        >
          <el-input
            placeholder="请输入任务名称"
            size="small"
            v-model="formData.name"
          />
        </el-form-item>
        <el-form-item
          label="英文名称"
          prop="englishName"
          required
        >
          <el-input
          placeholder="请输入英文名称"
          v-model="formData.englishName"
          size="small"
        />
        </el-form-item>

        <div style="display: flex;">
          <el-form-item label="工作时限" prop="workingTimeType">
            <panel-select
              type="WORKINGTIME_LIMIT"
              v-model="formData.workingTimeType"
              size="small"
            ></panel-select>
          </el-form-item>
          <el-form-item
            label-width="0"
            style="margin-left:20px;"
            v-if="formData.workingTimeType === workingLimit.STAGEDATEADDDAY"
            prop="workingFieldDate"
          >
            <el-select
              v-model="formData.workingFieldDate"
              placeholder="请选择阶段下日期字段"
              size="small"
            >
              <el-option
                v-for="item in dateOption"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label=""
            label-width="0"
            style="margin-left:20px; flex-shrink: 0;"
            prop="workingTimeOperate">
            <el-radio-group size="small" v-model="formData.workingTimeOperate">
              <el-radio-button label="+"></el-radio-button>
              <el-radio-button label="-"></el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label-width="0"
            style="margin-left:20px;margin-right:20px;"
            prop="workingTimeNum"
          >
            <el-input-number
              v-model="formData.workingTimeNum"
              :min="0"
              :step="1"
              step-strictly
              :controls="false"
              placeholder="请输入天数"
              size="small"
            />
          </el-form-item>
        </div>
        <div style="display:flex;">
          <el-form-item label="法定期限" prop="legalTimeType">
            <panel-select
              type="WORKINGTIME_LIMIT"
              v-model="formData.legalTimeType"
              size="small"
            ></panel-select>
          </el-form-item>

          <el-form-item
            label-width="0"
            style="margin-left:20px;"
            v-if="formData.legalTimeType === workingLimit.STAGEDATEADDDAY"
            prop="legalFieldDate"
          >
            <el-select
              filterable
              v-model="formData.legalFieldDate"
              placeholder="请选择阶段下日期字段"
              size="small"
            >
              <el-option
                v-for="item in dateOption"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label-width="0"
            style="margin-left:20px; flex-shrink: 0;"
            prop="legalTimeOperate">
            <el-radio-group size="small" v-model="formData.legalTimeOperate">
              <el-radio-button label="+"></el-radio-button>
              <el-radio-button label="-"></el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label-width="0"
            style="margin-left:20px;margin-right:20px;"
            prop="legalTimeNum"
            size="small"
          >
            <el-input-number
              v-model="formData.legalTimeNum"
              :min="0"
              :step="1"
              step-strictly
              :controls="false"
              placeholder="请输入天数"
              size="small"
            />
          </el-form-item>
        </div>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitLoading"
        >确 定</el-button>
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
  inject,
} from '@vue/composition-api';
import {
  useLookupsInject, useBasicSourceInject,
} from '@/context';
import PanelSelect from '@/components/panel-select.vue';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'DialogAddTask',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: Object,
  },
  components: {
    PanelSelect,
  },
  setup(props, context) {
    const { $message, $route } = context.root;
    const { emit } = context;
    const formRef = ref(null);
    const {
      getEnumsInfo,
      // getTypeName,
    } = useLookupsInject();

    const processStageId = inject('provideStageId');
    const claimTaskId = inject('claimTaskId'); // 来文/请求任务类型
    const parentStageClaimsId = inject('parentStageClaimsId'); // 来文/请求menu-id

    const state = reactive({
      currentFieldType: null,
      formData: {
        name: null,
        englishName: null,
        workingTimeType: null,
        workingFieldDate: null,
        workingTimeOperate: null,
        workingTimeNum: undefined,
        legalTimeType: null,
        legalFieldDate: null,
        legalTimeOperate: null,
        legalTimeNum: undefined,
      },
      validateRules: {
        name: [{ required: true, message: '请输入任务名称' }],
        englishName: [{ required: true, message: '请输入英文名称' }],
        workingTimeType: [{ required: true, message: '请选择工作时限' }],
        legalTimeType: [{ required: true, message: '请选择法定时限' }],
        workingTimeOperate: [{ required: true, message: '请选择加减操作符' }],
        legalTimeOperate: [{ required: true, message: '请选择加减操作符' }],
        legalFieldDate: [{ required: true, message: '请选择阶段下日期字段' }],
        workingFieldDate: [{ required: true, message: '请选择阶段下日期字段' }],
        workingTimeNum: [{ required: true, message: '请填写天数' }],
        legalTimeNum: [{ required: true, message: '请填写天数' }],
      },
    });

    const { getFieldTypesState } = useBasicSourceInject();
    state.currentFieldType = getFieldTypesState.data.find(item => item.type === 'DateTime');

    // 是否是编辑
    const isEdit = computed(() => !!props.data);
    const { url: stageFieldUrl, fetchData, data: fieldDate } = useHttp();
    const innerData = async () => {
      stageFieldUrl.value = `/patent-corp_api/stage-fields/${processStageId.value}`;
      await fetchData();
    };
    // 阶段某日期
    const dateOption = computed(() => {
      const option = (fieldDate.value || []).filter(item => item.inputType === state.currentFieldType.id);
      return option;
    });

    const workingLimit = computed(() => getEnumsInfo('WORKINGTIME_LIMIT'));

    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });

    watch(() => props.visible, (val) => {
      if (val) {
        console.info(props.data);
        state.formData = { ...state.formData, ...props.data };
      } else { // 重置
        formRef.value.resetFields();
      }
    });

    const {
      loading: submitLoading,
      url,
      postData,
      putData,
    } = useHttp();
    const handleSubmit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        if (!isEdit.value) { // 新增
          url.value = '/patent-corp_api/task-flow';
          const params = {
            ...state.formData,
            claimsType: claimTaskId,
            processId: Number($route.query.id),
            processStageId: processStageId.value,
            parentStageClaimsId: parentStageClaimsId.value,
          };
          try {
            const res = await postData(params);
            $message.success('操作成功');
            dialogVisible.value = false;
            emit('add-task-success', res);
          } catch (error) {
            $message.error('操作失败');
          }
        } else { // 编辑
          url.value = `/patent-corp_api/task-flow/${props.data.id}`;
          const params = {
            ...state.formData,
          };
          try {
            await putData(params);
            $message.success('操作成功');
            dialogVisible.value = false;
            emit('edit-task-success');
          } catch (error) {
            $message.error('操作失败');
          }
        }
      });
    };
    onMounted(() => {
      innerData();
    });

    return {
      ...toRefs(state),
      formRef,
      dialogVisible,
      handleSubmit,
      isEdit,
      workingLimit,
      processStageId,
      parentStageClaimsId,
      dateOption,
      submitLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
