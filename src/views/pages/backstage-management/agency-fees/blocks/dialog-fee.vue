<template>
  <div>
    <el-dialog
      title="费用项目管理"
      :visible.sync="dialogVisible"
      width="70%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="resetForm"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="formRef"
        label-width="90px"
        :rules="validateRules"
      >
        <el-form-item
          label="费用类型"
          prop="feeTypeList"
        >
          <el-checkbox-group
            v-model="formData.feeTypeList"
            v-on="$listeners"
            v-bind="$attrs"
          >
            <el-checkbox
              border
              v-for="item in feeTypeData"
              :key="item.id"
              :label="item.id"
            >
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <el-tabs v-if="activeName" class="tabs-border" v-model="activeName">
        <el-tab-pane
          :label="tabList[item]"
          :name="String(item)"
          v-for="item in formData.feeTypeList"
          :key="item"
        >
          <dialog-fee-rules
            :fee-type="item"
            :rules-data="formData.feeTypes"
            ref="rulesData"
          />
        </el-tab-pane>
      </el-tabs>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
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
  defineComponent,
  onMounted,
  watch,
} from '@vue/composition-api';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';
import cloneDeep from 'lodash/cloneDeep';
import { useLookupsInject } from '@/context';
import DialogFeeRules from '../../cost-allocation-management/blocks/dialog-fee-rules.vue';

export default defineComponent({
  name: 'DialogFeeItem',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    feeItemInfo: Object,
  },
  components: {
    PanelSelectSearch,
    PanelCheckbox,
    PanelSelect,
    DialogFeeRules,
  },
  setup(props, context) {
    const { $message } = context.root;
    const { emit } = context;
    const formRef = ref();
    const rulesData = ref();
    const formDataConditionRule = ref();
    const {
      sortLookups,
    } = useLookupsInject();
    const currentOptions = computed(() => sortLookups.value.FEE_TYPE);
    const validateRegexSpare = (rule, value, callback) => {
      if (rule.field === 'conditionRule') {
        if (formDataConditionRule.value === '') {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const state = reactive({
      feeTypeData: [],
      activeName: '1601',
      feeCategoryIds: null,
      tabList: {
        1600: '官费收费规则',
        1601: '本所代理费收费规则',
        1602: '外所代理费收费规则',
      },
      formData: {
        feeTypes: [],
        feeTypeList: [],
        conditionRule: '',
        feeCategoryId: null,
      },
      validateRules: {
        feeTypeList: [
          { required: true, message: '请选择费用类型', trigger: 'change' },
        ],
        conditionRule: [
          {
            required: true,
            message: '请新增收费规则',
            validator: validateRegexSpare,
          },
        ],
      },
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
      formRef.value.resetFields();
    };
    const {
      loading: submitLoading, url, putData,
    } = useHttp();
    const handleSubmit = () => {
      (rulesData.value || []).forEach((item) => {
        state.formData.feeTypes.push(item.rulesDatas);
        const temp = {};
        state.formData.feeTypes = state.formData.feeTypes.reduce(
          (prev, curv) => {
            if (temp[curv.feeType]) {
              // console.log(curv.feeType);
            } else {
              temp[curv.feeType] = true;
              prev.push(curv);
            }
            return prev;
          },
          [],
        );
      });
      formDataConditionRule.value = state.formData.conditionRule;
      formRef.value.validate(async (valid) => {
        if (rulesData.value) {
          const flag = rulesData.value[0].validateForm();
          if (flag) {
          // console.log('00');
          } else {
            return;
          }
        }
        if (!valid) return;
        try {
          const feeTypes = cloneDeep(state.formData.feeTypes) || [];
          const feeTypesData = [];
          (state.formData.feeTypeList || []).map((i) => {
            (feeTypes || []).filter(item => item.feeType === i).forEach((p) => {
              feeTypesData.push(p);
            });
            return i;
          });
          feeTypesData.forEach((p) => {
            if (p.feeCondition.conditionItems.length === 0) {
              return;
            }
            const conditionItems = [];
            for (let x = 0; x < p.feeCondition.conditionItems.length; x++) {
              for (
                let y = 0;
                y < p.feeCondition.conditionItems[x].length;
                y++
              ) {
                let itemVal = null;
                if (p.feeCondition.conditionItems[x][y].itemValue) {
                  itemVal = String(p.feeCondition.conditionItems[x][y].itemValue);
                } else if (p.feeCondition.conditionItems[x][y].valKey) {
                  itemVal = String(p.feeCondition.conditionItems[x][y].valKey);
                }
                if (itemVal === undefined) {
                  itemVal = null;
                }
                if (p.feeCondition.conditionItems[x][y].inputValue === undefined) {
                  p.feeCondition.conditionItems[x][y].inputValue = '';
                }
                const item = {
                  itemValue: itemVal,
                  itemOrder: y + 1,
                  itemType: p.feeCondition.conditionItems[x][y].itemType,
                  lineNumber: x + 1,
                  inputValue:
                    String(p.feeCondition.conditionItems[x][y].inputValue)
                    || '',
                };
                conditionItems.push(item);
              }
            }
            p.feeCondition.conditionItems = conditionItems;
            const standardFormulas = [];
            if (p.feeStandard.standardFormulas.length === 0) {
              return;
            }
            for (let x = 0; x < p.feeStandard.standardFormulas.length; x++) {
              for (
                let y = 0;
                y < p.feeStandard.standardFormulas[x].length;
                y++
              ) {
                let itemVal = null;
                if (p.feeStandard.standardFormulas[x][y].itemValue) {
                  itemVal = String(p.feeStandard.standardFormulas[x][y].itemValue);
                } else if (p.feeStandard.standardFormulas[x][y].valKey) {
                  itemVal = String(p.feeStandard.standardFormulas[x][y].valKey);
                }
                if (itemVal === undefined) {
                  itemVal = null;
                }
                if (p.feeStandard.standardFormulas[x][y].inputValue === undefined) {
                  p.feeStandard.standardFormulas[x][y].inputValue = '';
                }
                const item = {
                  itemValue: itemVal,
                  itemOrder: y + 1,
                  itemType: p.feeStandard.standardFormulas[x][y].itemType,
                  lineNumber: x + 1,
                  inputValue:
                    String(p.feeStandard.standardFormulas[x][y].inputValue)
                    || '',
                };
                standardFormulas.push(item);
              }
            }
            p.feeStandard.standardFormulas = standardFormulas;
          });
          const params = {
            feeCategoryId: state.feeCategoryIds,
            feeTypes: feeTypesData,
          };
          url.value = `/patent-corp_api/agency-fee/${props.feeItemInfo.id}`;
          await putData(params);
          state.formData.feeTypes = [];
          state.formData.feeTypesData = [];
          emit('success', true);
          resetForm();
          dialogVisible.value = false;
        } catch (error) {
          if (error.response) {
            $message.error(error.response.data);
          } else {
            $message.error('操作失败');
          }
        }
      });
    };
    const {
      url: feeRulesDetailUrl,
      data: feeRulesDetailData,
      fetchData: feeRulesDetail,
    } = useHttp();
    watch(() => state.formData.feeTypeList, (val) => {
      if (val.length !== 0) {
        state.activeName = String(val[0]);
      } else {
        state.activeName = null;
      }
    });
    onMounted(async () => {
      state.feeTypeData = cloneDeep(currentOptions.value);
      if (state.feeTypeData) {
        const len = state.feeTypeData.length - 1;
        for (let i = len; i >= 0; i--) {
          if (state.feeTypeData[i].id === 1600) {
            state.feeTypeData.splice(i, 1);
          }
        }
      }
      if (props.feeItemInfo) {
        feeRulesDetailUrl.value = `/patent-corp_api/agency-fee/${props.feeItemInfo.id}`;
        await feeRulesDetail();
        state.formData.feeTypeList = (feeRulesDetailData.value.feeTypes || []).map(item => item.feeType);
        state.feeCategoryIds = feeRulesDetailData.value.feeCategoryId;
        state.formData.feeTypes = feeRulesDetailData.value.feeTypes;
      } else {
        state.formData.feeTypes = [];
      }
    });
    return {
      ...toRefs(state),
      dialogVisible,
      submitLoading,
      formRef,
      rulesData,
      resetForm,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.icon-btn {
  color: #016eff;
  margin-left: 7px;
  font-size: 18px;
  vertical-align: middle;
  cursor: pointer;
}
.tabs-border{
  border: 1px solid #e4e7ed;
  padding: 20px;
}
</style>
