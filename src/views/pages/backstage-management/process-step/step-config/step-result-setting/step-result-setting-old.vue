<template>
  <div class="event-action">
    <p style="margin-top: 10px">
      <span class="border-blue"></span>
      步骤结果设置
      <span class="edit-icon"
v-show="editShow"
@click="resultEdit"
        ><i class="el-icon-edit-outline" />编辑</span
      >
    </p>
    <descriptions style="padding-left: 20px;" v-show="editShow" :label-width="180">
      <!-- <descriptions-item label="是否可选步骤">--</descriptions-item>
      <descriptions-item label="并行步骤">--</descriptions-item>
      <descriptions-item label="并行步骤进入下一步方式">--</descriptions-item> -->
      <descriptions-item label="步骤可能结果">
        {{ eventResultType == null ? "--" : getTypeName(eventResultType) }}
      </descriptions-item>
      <el-table :data="detailTableData" style="width: 100%">
        <el-table-column label="结果">
          <template #default="{ row }">
            {{ stepdata[row.stepResultId] }}
          </template>
        </el-table-column>
        <el-table-column prop="nextStageId" label="进入其他步骤">
          <template #default="{ row }">
            <span v-if="row.nextStageName">{{ row.nextStageName }}</span>
            <span v-if="row.nextStepName"> - {{ row.nextStepName }}</span>
            <span v-if="row.isEnd == true"> 结项</span>
          </template>
        </el-table-column>
      </el-table>
    </descriptions>
    <el-form
      label-position="right"
      label-width="180px"
      class="form-border"
      ref="stepResultForm"
      :model="stepFormData"
    >
      <!-- :rules="formRules" -->
      <!-- <el-form-item label="是否可选步骤" required>
      <el-radio-group  v-model="officialClaimDetail.isRequired" size="small">
        <el-radio-button :label="true">是</el-radio-button>
        <el-radio-button :label="false">否</el-radio-button>
      </el-radio-group>
    </el-form-item> -->
      <!-- <el-form-item label="是否可选步骤" required>
      <el-radio-group v-model="radio3" size="small">
        <el-radio-button :label="true">是</el-radio-button>
        <el-radio-button :label="false">否</el-radio-button>
      </el-radio-group>
    </el-form-item> -->
      <!-- <el-form-item label="并行步骤" prop="haha" required>
      <el-cascader
      v-model="haha"
      :options="stepListData"
      >
      </el-cascader>
      <template #default="{ row }">
        <el-cascader
          v-model="row.label"
          :options="row.address"
          >
          </el-cascader>
      </template> -->
      <!-- </el-form-item> -->
      <!-- <el-form-item class="labelName"
    prop="radio1"
          label="并行步骤进入下一步方式"
          >
          <el-radio-group v-model="radio1"   size="small">
            <el-radio label="1" border>全部通过才进入下一步</el-radio>
            <el-radio label="2" border>任一通过进入下一步</el-radio>
            <el-radio label="3" border>任一不通过结束</el-radio>
          </el-radio-group>
        </el-form-item> -->
      <el-form-item
        class="labelName"
        label="步骤可能结果"
        v-show="DoDditShow"
        prop="labelradioValue"
      >
        <el-radio-group
          @change="handleChangeradio(stepFormData.labelradioValue)"
          v-for="item in eventStepResult"
          v-model="stepFormData.labelradioValue"
          :key="item.value"
          size="small"
        >
          <el-radio :label="item.value" border>{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label-width="0"> -->
      <el-table
        :data="stepFormData.editDetailDataList"
        v-show="DoDditShow"
        style="width: 100%"
        border
      >
        <el-table-column label="结果" width="180" align="center">
          <template #default="{ row }">
            {{ row.result }}
          </template>
        </el-table-column>
        <el-table-column label="进入其他步骤" align="center">
          <template #default="{ row, $index }">
            <el-form-item
              class="final-selection"
              label="是否结项"
              required
              :prop="`editDetailDataList.${$index}.hasBelong`"
              :rules="[{ required: true, message: '是否结项', trigger: 'change' }]"
            >
              <el-radio-group size="small" v-model="row.hasBelong" @change="Changeradio(row)">
                <el-radio border :label="true">是</el-radio>
                <el-radio border :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label-width="0"
              v-if="!row.hasBelong"
              style="float: left"
              :prop="`editDetailDataList.${$index}.label`"
              :rules="[
                {
                  type: `${row.hasBelong}`,
                  message: '请选择下一步进入的步骤',
                  validator: validateEmpty
                }
              ]"
              required
            >
              <el-cascader
                v-model="row.label"
                clearable
                :options="row.options"
                @change="handleChange(row)"
              >
                <template slot-scope="{ data }" style="height= 32px;">
                  <span>{{ data.label }}</span>
                </template>
              </el-cascader>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>

      <p class="result-btn" v-show="DoDditShow">
        <el-button size="small" @click="cancel">取消</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="submitLoading"
          @click="resultFalse"
        >保存</el-button>
      </p>
    </el-form>
  </div>
</template>

<script>
import {
  toRefs,
  defineComponent,
  reactive,
  ref,
  watch,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject } from '@/context';
// import cloneDeep from 'lodash/cloneDeep';
import utils from '@/utils';

export default defineComponent({
  name: 'stepResultSetting',
  props: {
    selectedStepId: Number,
    detailDataList: Array,
    processStageId: Number,
  },
  setup(props, context) {
    const state = reactive({
      stepFormData: {
        labelradioValue: '',
        editDetailDataList: [],
      },
      editShow: true,
      DoDditShow: false,
      hasBelong: null,
      resultPassLableId: [],
      resultFailLableId: [],
      resultSupplementLableId: [],
      resultSupplementLableItem: [],
      resultPassLableItem: [],
      resultFailLableItem: [],
      detailTableData: [],
      eventResultType: null,
      stageStepFlowsData: {},
      textNextStageId: {},
      textNextStepId: {},
      textNextStepIsEnd: {},
      resultId: '',
      // hasId:
      haha: [],
      stepdata: {
        8401: '通过',
        8402: '不通过',
      },
      stepRadios: '',
      stepListData: null,
      eventStepResult: [],
      processStageStepList: [],
      stageStepFlowssupplementID: {},
    });
    const validateEmpty = (rule, value, callback) => {
      console.log(rule, value);
      if (rule.type === 'false') {
        if (!value[0] && !value[1]) {
          return callback(new Error(rule.message));
        }
      } else {
        return callback();
      }
      return callback();
    };
    const stepResultForm = ref(null);
    const { $route, $message } = context.root;
    const formRules = ref({
      label: [{ required: true, message: '请选择并行步骤', trigger: 'blur' }],
      radio1: [{ required: true, message: '并行步骤进入下一步方式', trigger: 'blur' }],
      labelradioValue: [{ required: true, message: '步骤可能结果', trigger: 'blur' }],
      sorts: [
        {
          required: true,
          message: '请选择分类',
          trigger: 'change',
          type: 'arary',
        },
      ],
      hasBelong: [{ required: false, message: '确认结项', trigger: 'change' }],
      submitLoading: false,
    });

    const steps = ref([{ value: 'haha', label: 'haha' }]);

    const { getTypeName } = useLookupsInject();

    const { loading: submitLoading } = useHttp();
    const processId = computed(() => Number($route.query.id));
    const { fetchData: parallelSteps } = useHttp(`/patent-corp_api/stage-step-list/${processId.value}`);
    const getStep = async () => {
      // 列表查询
      try {
        state.stepListData = await parallelSteps();
        state.eventStepResult = state.stepListData.eventStepResult;
        state.processStageStepList = state.stepListData.processStageStepList;
        // $message.success('查询成功!');
      } catch (err) {
        console.log('error', err);
        if (err.response) {
          $message.error(err.response.data);
        } else {
          $message.error('查询失败');
        }
      }
    };
    const cancel = () => {
      state.editShow = true;
      state.DoDditShow = false;
    };
    const handleChangeradio = (val) => {
      console.log(state.stepListData);
      console.log(state.textNextStageId);
      console.log(state.textNextStepId);
      console.log(state.textNextStepIsEnd);
      state.textNextStepIsEnd = {
        0: true,
        1: false,
        2: true,
      };
      if (val === 3701) {
        state.stepFormData.editDetailDataList = [
          {
            hasBelong: state.textNextStepIsEnd[0],
            result: state.stepListData.stepResult[0].label,
            resultId: state.stepListData.stepResult[0].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[0], state.textNextStepId[0]],
          },
        ];
      } else if (val === 3702) {
        state.stepFormData.editDetailDataList = [
          {
            hasBelong: state.textNextStepIsEnd[0],
            result: state.stepListData.stepResult[0].label,
            resultId: state.stepListData.stepResult[0].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[0], state.textNextStepId[0]],
          },
          {
            hasBelong: state.textNextStepIsEnd[1],
            result: state.stepListData.stepResult[1].label,
            resultId: state.stepListData.stepResult[1].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[1], state.textNextStepId[1]],
          },
        ];
      } else if (val === 3703) {
        state.stepFormData.editDetailDataList = [
          {
            hasBelong: state.textNextStepIsEnd[0],
            result: state.stepListData.stepResult[0].label,
            resultId: state.stepListData.stepResult[0].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[0], state.textNextStepId[0]],
          },
          {
            hasBelong: state.textNextStepIsEnd[1],
            result: state.stepListData.stepResult[1].label,
            resultId: state.stepListData.stepResult[1].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[1], state.textNextStepId[1]],
          },
          {
            hasBelong: state.textNextStepIsEnd[2],
            result: state.stepListData.stepResult[2].label,
            resultId: state.stepListData.stepResult[2].value,
            options: state.processStageStepList,
            label: [state.textNextStageId[2], state.textNextStepId[2]],
          },
        ];
      }
    };
    const resultEdit = async () => {
      state.editShow = false;
      state.DoDditShow = true;
      handleChangeradio(state.stepFormData.labelradioValue);
    };
    let stageStepFlows = [];
    const handleChange = (row) => {
      // 级联选择赋值
      if (row.hasBelong === false) {
        state.stageStepFlowssupplementID = {
          nextStageId: row.label[0],
          nextStepId: row.label[1] || 0,
          id: 0,
          stageStepId: Number(props.selectedStepId),
          stepResultId: row.resultId.toString(),
          isEnd: row.hasBelong,
        };
      } else {
        state.stageStepFlowssupplementID = {
          nextStageId: 0,
          nextStepId: 0,
          id: 0,
          stageStepId: Number(props.selectedStepId),
          stepResultId: state.resultId,
          isEnd: state.hasBelong,
        };
      }
      const hasId = stageStepFlows.some(item => item.stepResultId === row.resultId.toString());
      // state.stepFormData.editDetailDataList.hasBelong = row.hasBelong;
      if (!hasId) {
        stageStepFlows.push(state.stageStepFlowssupplementID);
      } else {
        stageStepFlows = stageStepFlows.map(item => (item.stepResultId === row.resultId.toString() ? state.stageStepFlowssupplementID : item));
      }
    };
    const Changeradio = (row) => {
      // 是否结项
      state.hasBelong = row.hasBelong;
      state.resultId = row.resultId.toString();
      if (state.hasBelong === true) {
        // const nextStageLabelId = row.label[0];
        state.stageStepFlowssupplementID = null;
      } else {
        state.stageStepFlowssupplementID = {
          nextStageId: 0,
          nextStepId: 0,
          id: 0,
          stageStepId: Number(props.selectedStepId),
          stepResultId: state.resultId.toString(),
          isEnd: state.hasBelong,
        };
      }
      handleChange(row);
    };
    const { url: peocessDataUrl, fetchData: fetchPeocessData } = useHttp();
    const resultFlow = (stageStepFlowsList) => {
      // 页面渲染
      // await getStep(); // 查询
      getStep(); // 查询
      state.textNextStageId = (stageStepFlowsList || []).map(item => item.nextStageId);
      state.textNextStepId = (stageStepFlowsList || []).map(item => item.nextStepId);
      state.textNextStepIsEnd = (stageStepFlowsList || []).map(item => item.isEnd);
      if (state.stepFormData.labelradioValue) {
        handleChangeradio(state.stepFormData.labelradioValue);
      }
    };
    const initData = async () => {
      // 详情查询
      peocessDataUrl.value = `/patent-corp_api/stage-steps/${props.selectedStepId}`;
      const peocessData = await fetchPeocessData();
      state.detailTableData = [];
      state.detailTableData = peocessData.stageStepFlows;
      state.eventResultType = peocessData.eventResultType;
      state.stepFormData.labelradioValue = state.eventResultType;
      const stageStepFlowsList = state.detailTableData;
      resultFlow(stageStepFlowsList);
    };
    const submitForm = async () => {
      // 编辑提交
      try {
        const { postData: postNewProcess } = useHttp('/patent-corp_api/stage-step-flow');
        const stageStepFlowsData = {
          stageStepID: Number(props.selectedStepId),
          eventResultType: state.stepFormData.labelradioValue,
          stageStepFlows,
        };
        await postNewProcess(stageStepFlowsData);
        state.editShow = true;
        state.DoDditShow = false;
        $message.success('提交成功!');
        initData();
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    const resultFalse = () => {
      // 确定按钮
      console.info(stepResultForm.value);
      stepResultForm.value.validate((valid) => {
        // 校验方法
        console.info(valid);
        if (!valid) return;
        console.log('submit success!!');
        submitForm(); // 提交方法
        resultFlow(); // 页面渲染
      });
    };
    onMounted(() => {
      initData();
    });
    watch(
      () => props.selectedStepId,
      () => {
        state.editShow = true;
        state.DoDditShow = false;
        state.stepFormData = {
          labelradioValue: '',
          editDetailDataList: [],
        };
        initData();
      },
    );

    return {
      ...toRefs(state),
      stepResultForm,
      getTypeName,
      steps,
      resultEdit,
      cancel,
      handleChange,
      Changeradio,
      resultFalse,
      formRules,
      submitLoading,
      handleChangeradio,
      validateEmpty,
    };
  },
});
</script>

<style lang="scss" scoped>
.event-action {
  .border-blue {
    display: inline-block;
    width: 4px;
    background-color: #0079fe;
    height: 14px;
    margin-right: 10px;
  }
  .form-border {
    // border: 1px solid #016eff;
    padding: 20px 0;
    .result-btn {
      width: 100%;
      height: 50px;
      text-align: center;
      margin-top: 30px;
    }
  }
  .step-table {
    margin-left: 5%;
    .table-th {
      background: #fafafa;
    }
    .table-th th,
    .table-td td {
      padding: 12px 0;
      box-sizing: border-box;
      text-overflow: ellipsis;
      vertical-align: middle;
      text-align: center;
    }
  }
  .final-selection {
    float: left;
    display: inline-block;
    .final-lable {
      display: inline-block;
      margin-right: 10px;
    }
    margin-right: 10px;
  }
  .edit-icon {
    font-size: 14px;
    font-weight: 400;
    color: #0079fe;
    cursor: pointer;
  }
}
</style>
