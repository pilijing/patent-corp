<template>
  <div>
    <el-form
      style="margin-top: 20px"
      :model="rulesDatas"
      ref="formRef"
      label-width="90px"
      :rules="validateRules"
    >
      <div class="charge-conditions">
        <p class="rules-title"><span class="blue-border"></span>收费条件</p>
        <conditions-create-charge
          v-model="rulesDatas.feeCondition.conditionItems"
          :conditionsInfo="['field', 'compare', 'value', 'plus', 'minus']"
        />
        <el-form-item
          style="margin-top: 10px;"
          label="备注说明"
        >
          <el-input
            type="textarea"
            v-model="rulesDatas.feeCondition.remark"
            rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </div>
      <div class="charge-conditions">
        <p class="rules-title"><span class="blue-border"></span>收费标准</p>
        <el-form-item
          label="标准方式"
          prop="feeStandard.standardType"
        >
          <panel-radio
            v-model="rulesDatas.feeStandard.standardType"
            type="FEE_STANDARD_TYPE"
            border
          />
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6604"
          prop="feeStandard.standardFormulas"
          label=" 计算公式"
        >
          <conditions-create-charge
            v-model="rulesDatas.feeStandard.standardFormulas"
            is-in-formula
            :conditionsInfo="[
            'field','lBracket', 'rBracket', 'plus', 'minus','multiplication','division','numerical',
            ]"
          />
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6601"
          label=" 固定值"
          prop="feeStandard.fixedValue"
        >
          <el-input
            v-model="rulesDatas.feeStandard.fixedValue"
            placeholder="请填写金额"
            type="number"
          />
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6602"
          label="区间"
          prop="feeStandard.minAmount"
        >
          <div class="formula-item">
            <el-form-item prop="feeStandard.minAmount">
              <el-input
                placeholder="请填写最小金额"
                type="number"
                v-model="rulesDatas.feeStandard.minAmount"
              />
            </el-form-item>
          </div>
          <span style="width:8%;float:left;text-align:center;">—</span>
          <div class="formula-item">
            <el-form-item prop="feeStandard.maxAmount">
              <el-input
                placeholder="请填写最大金额"
                type="number"
                v-model="rulesDatas.feeStandard.maxAmount"
              />
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6603"
          label=" 时薪"
          prop="feeStandard.fixedValue"
        >
          <el-input
            placeholder="请填写时薪"
            type="number"
            v-model="rulesDatas.feeStandard.fixedValue"
          />
        </el-form-item>
        <el-form-item
          prop="feeStandard.currency"
          label=" 币种"
        >
          <panel-select
            v-model="rulesDatas.feeStandard.currency"
            placeholder="请选择币种"
            type="CURRENCY"
          />
        </el-form-item>
        <el-form-item
          style="margin-top: 10px;"
          label="备注说明"
        >
          <el-input
            type="textarea"
            v-model="rulesDatas.feeStandard.remark"
            rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  watch,
} from '@vue/composition-api';
import PanelRadio from '@/components/panel-radio.vue';
import PanelSelect from '@/components/panel-select.vue';
import ConditionsCreateCharge from '../../blocks/conditions-create-charge.vue';

export default defineComponent({
  name: 'DialogRules',
  props: {
    feeType: Number,
    rulesData: Array,
  },
  components: {
    PanelRadio,
    ConditionsCreateCharge,
    PanelSelect,
  },
  setup(props, context) {
    // const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();
    const conditionItemData = ref();
    const state = reactive({
      conditionLists: [],
      rulesDatas: {
        feeType: null,
        feeCondition: {
          conditionItems: [],
          remark: null,
        },
        feeStandard: {
          currency: null,
          fixedValue: null,
          maxAmount: null,
          minAmount: null,
          standardFormulas: [],
          remark: null,
          standardType: null,
        },
      },
      validateRules: {
        'feeStandard.standardType': [
          { required: true, message: '请选择标准方式', trigger: 'change' },
        ],
        'feeStandard.standardFormulas': [
          { required: true, message: '请选择计算公式', trigger: 'blur' },
        ],
        'feeStandard.fixedValue': [
          { required: true, message: '请输入值', trigger: 'blur' },
        ],
        'feeStandard.minAmount': [
          { required: true, message: '请填写最小金额', trigger: 'blur' },
        ],
        'feeStandard.maxAmount': [
          { required: true, message: '请填写最大金额', trigger: 'blur' },
        ],
        'feeStandard.currency': [
          { required: true, message: '请选择币种', trigger: 'change' },
        ],
      },
    });
    const resetDetail = () => {
      state.rulesDatas.feeType = props.feeType;
      (props.rulesData || [])
        .filter(item => item.feeType === props.feeType)
        .forEach((p) => {
          state.rulesDatas.feeCondition = p.feeCondition;
          state.feeType = p.feeType;
          state.rulesDatas.feeStandard = p.feeStandard;
          (p.feeCondition.conditionItems || []).forEach((i) => {
            i.valKey = i.itemValue;
            i.name = i.itemValue;
          });
          if (p.feeCondition.conditionItems) {
            const res = p.feeCondition.conditionItems.reduce((prev, cur) => {
              if (prev[cur.lineNumber]) {
                prev[cur.lineNumber].push(cur);
              } else {
                prev[cur.lineNumber] = [cur];
              }
              return prev;
            }, {});
            state.rulesDatas.feeCondition.conditionItems = Object.keys(res).map(item => res[item]);
          } else {
            state.rulesDatas.feeCondition.conditionItems = [];
          }
          (p.feeStandard.standardFormulas || []).forEach((i) => {
            i.valKey = i.itemValue;
            i.name = i.itemValue;
          });
          if (p.feeStandard.standardFormulas) {
            const ress = p.feeStandard.standardFormulas.reduce((prev, cur) => {
              if (prev[cur.lineNumber]) {
                prev[cur.lineNumber].push(cur);
              } else {
                prev[cur.lineNumber] = [cur];
              }
              return prev;
            }, {});
            state.rulesDatas.feeStandard.standardFormulas = Object.keys(ress).map(item => ress[item]);
          } else {
            state.rulesDatas.feeStandard.standardFormulas = [];
          }
        });
    };
    onMounted(() => {
      resetDetail();
    });
    const validateForm = () => {
      let isValid = false;
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        isValid = true;
      });
      return isValid;
    };
    watch(
      () => state.rulesDatas.feeStandard.standardType,
      () => {
        (props.rulesData || [])
          .filter(item => item.feeType === props.feeType)
          .forEach((p) => {
            if (
              p.feeStandard.standardType
              !== state.rulesDatas.feeStandard.standardType
            ) {
              state.rulesDatas.feeStandard.standardFormulas = [];
              state.rulesDatas.feeStandard.fixedValue = null;
              state.rulesDatas.feeStandard.minAmount = null;
              state.rulesDatas.feeStandard.maxAmount = null;
            }
          });
      },
    );
    return {
      ...toRefs(state),
      formRef,
      validateForm,
      conditionItemData,
      resetDetail,
    };
  },
});
</script>
<style lang="scss" scoped>
.charge-conditions {
  padding: 0 20px;
}
.blue-border {
  display: inline-block;
  height: 10px;
  border: 2px solid #016eff;
  margin-right: 10px;
}
.formula-item {
  width: 46%;
  float: left;
  // margin-right: 10px;
}
.rules-title {
  margin-bottom: 10px;
}
</style>
