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
            :limit='1'
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
          <el-input type='number'
           class="my-input"
           placeholder="请填写金额"
           onkeyup="this.value= this.value.match(/\d+(\.\d{0,2})?/) ? this.value.match(/\d+(\.\d{0,2})?/)[0] : ''"
           @mousewheel.native.prevent
           @DOMMouseScroll.native.prevent
           v-model="rulesDatas.feeStandard.fixedValue"
           ></el-input>
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6602"
          label="区间"
          prop="feeStandard.minAmount"
        >
          <div class="formula-item">
            <el-form-item prop="feeStandard.minAmount">
              <!-- <el-input
                placeholder="请填写最小金额"
                type="number"
                v-model="rulesDatas.feeStandard.minAmount"
              /> -->
              <el-input type='number'
                class="my-input"
                placeholder="请填写最小金额"
                onkeyup="this.value= this.value.match(/\d+(\.\d{0,2})?/) ? this.value.match(/\d+(\.\d{0,2})?/)[0] : ''"
                @mousewheel.native.prevent
                @DOMMouseScroll.native.prevent
                v-model="rulesDatas.feeStandard.minAmount"
                ></el-input>
            </el-form-item>
          </div>
          <span style="width:8%;float:left;text-align:center;">—</span>
          <div class="formula-item">
            <el-form-item prop="feeStandard.maxAmount">
              <!-- <el-input
                placeholder="请填写最大金额"
                type="number"
                v-model="rulesDatas.feeStandard.maxAmount"
              /> -->
              <el-input type='number'
                class="my-input"
                placeholder="请填写最大金额"
                onkeyup="this.value= this.value.match(/\d+(\.\d{0,2})?/) ? this.value.match(/\d+(\.\d{0,2})?/)[0] : ''"
                @mousewheel.native.prevent
                @DOMMouseScroll.native.prevent
                v-model="rulesDatas.feeStandard.maxAmount"
              ></el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item
          v-if="rulesDatas.feeStandard.standardType === 6603"
          label=" 时薪"
          prop="feeStandard.fixedValue"
        >
          <!-- <el-input
            placeholder="请填写时薪"
            type="number"
            v-model="rulesDatas.feeStandard.fixedValue"
          /> -->
          <el-input type='number'
            class="my-input"
            placeholder="请填写时薪"
            onkeyup="this.value= this.value.match(/\d+(\.\d{0,2})?/) ? this.value.match(/\d+(\.\d{0,2})?/)[0] : ''"
            @mousewheel.native.prevent
            @DOMMouseScroll.native.prevent
            v-model="rulesDatas.feeStandard.fixedValue"
          ></el-input>
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
  name: 'DialogFeeRules',
  props: {
    feeType: Number,
    rulesData: Array,
  },
  components: {
    PanelRadio,
    ConditionsCreateCharge,
    PanelSelect,
  },
  setup(props) {
    const formRef = ref();
    const conditionItemData = ref();
    const state = reactive({
      standardFormulasArray: [],
      conditionLists: [],
      standardTypeId: null,
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
            const data = p.feeStandard.standardFormulas.reduce((prev, cur) => {
              if (prev[cur.lineNumber]) {
                prev[cur.lineNumber].push(cur);
              } else {
                prev[cur.lineNumber] = [cur];
              }
              return prev;
            }, {});
            state.rulesDatas.feeStandard.standardFormulas = Object.keys(data).map(item => data[item]);
          } else {
            state.rulesDatas.feeStandard.standardFormulas = state.standardFormulasArray;
          }
        });
    };
    onMounted(() => {
      resetDetail();
      (props.rulesData || [])
        .filter(item => item.feeType === props.feeType)
        .forEach((p) => {
          state.standardTypeId = p.feeStandard.standardType;
        });
    });
    watch(
      () => state.rulesDatas.feeStandard.standardType,
      () => {
        if (
          state.standardTypeId !== state.rulesDatas.feeStandard.standardType
        ) {
          // 标准方式改变，清除其他值
          state.rulesDatas.feeStandard.standardFormulas = [];
          state.rulesDatas.feeStandard.fixedValue = null;
          state.rulesDatas.feeStandard.minAmount = null;
          state.rulesDatas.feeStandard.maxAmount = null;
        }
      },
    );
    const validateForm = () => {
      let isValid = false;
      formRef.value.validate(async (valid) => {
        if (!valid) return;
        isValid = true;
      });
      return isValid;
    };
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
}
.rules-title {
  margin-bottom: 10px;
}
.my-input {
  ::v-deep input::-webkit-outer-spin-button,
  ::v-deep input::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
  }
  ::v-deep input[type='number'] {
      -moz-appearance: textfield !important;
  }
}
</style>
