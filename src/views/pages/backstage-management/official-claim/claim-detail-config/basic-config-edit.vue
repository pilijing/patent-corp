<template>
  <div class="basic-config-edit">
    <el-form
      label-position="right"
      label-width="150px"
      ref="basicConfigForm"
      :rules="rules"
      :model="formData"
    >
      <el-form-item
        label="受理时专利状态"
        required
        prop="allowModifyPatentState"
      >
        <panel-select
          type="CHANGE_PATENT_STATE"
          multiple
          v-model="formData.allowModifyPatentState"
          size="small"
          style="width: 400px"
        />
      </el-form-item>
      <el-form-item
        :label="textState.isRequireLabel"
        required
        prop="isRequired"
      >
        <el-radio-group
          v-model="formData.isRequired"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="textState.dependencyLabel"
        prop="stageDocumentDependencies"
      >
        <el-cascader
          :options="getDependencyClaimListState.data"
          :props="{ multiple: true }"
          v-model="selectedDependencyClaimList"
          style="width: 280px"
          clearable
          size="small"
          v-loading="getDependencyClaimListState.loading"
          @change="handleClaimDependencyChange"
        >
        </el-cascader>
        <p style="display: inline-block; margin-left: 10px">
          <i
            class="el-icon-info"
            style="color: #ffce25"
          ></i>
          {{ textState.tooltips }}
        </p>
      </el-form-item>
      <el-form-item
        label="是否有账单"
        required
        prop="hasBill"
      >
        <el-radio-group
          v-model="formData.hasBill"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        prop="feeNameId"
        label="费用名称"
        required
        v-if="!!formData.hasBill"
      >
        <el-select
          filterable
          v-model="formData.feeNameId"
          placeholder="请选择费用名称"
          style="width: 280px"
          size="small"
          :loading="loadingLookups"
        >
          <el-option
            v-for="item in feeNameList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="是否重复性"
        required
        prop="isRepeat"
      >
        <el-radio-group
          v-model="formData.isRepeat"
          size="small"
        >
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row
        type="flex"
        class="row-bg"
        justify="center"
      >
        <el-col :span="6">
          <el-button
            size="small"
            @click="handleCancel"
          >取消</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleSaveBasicConfig"
            :loading="updateBasicConfigState.loading"
          >保存</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';

import {
  useClaimTypeInject,
  useLookupsInject,
  useOfficialClaimDetailInject,
  useOfficialClaimsInject,
} from '@/context';

import { ElForm } from 'element-ui/types/form';
import { getSelectRules } from '@/utils/form-rules';
import { Message } from 'element-ui';
import { StageDocumentDependency } from '@/types/claim-detail';
import PanelSelect from '@/components/panel-select.vue';

export default defineComponent({
  name: 'BasicConfigEdit',
  props: {
    textState: Object,
  },
  components: { PanelSelect },
  setup(_, { emit }) {
    const {
      getOfficialClaimDetailState,
      getDependencyClaimList,
      getDependencyClaimListState,
      updateBasicConfig,
      updateBasicConfigState,
      getOfficialClaimDetail,
    } = useOfficialClaimDetailInject();

    const basicConfigForm = ref<ElForm | null>(null);

    const rules = reactive({
      feeNameId: getSelectRules('请选择费用名称'),
      allowModifyPatentState: getSelectRules('请选择受理时专利状态'),
      isRepeat: getSelectRules('请选择是否重复性'),
    });
    const { curClaimsTypeId } = useClaimTypeInject();

    const { loading: loadingLookups, feeNameList } = useLookupsInject();

    const state = reactive({
      formData: { ...getOfficialClaimDetailState.data },
    });

    watch(
      () => getOfficialClaimDetailState.data,
      (curDetail) => {
        state.formData = { ...curDetail };
      },
    );
    const initSelectedDependencyClaimList = getSelectedDependencyClaimList(state.formData.stageDocumentDependencies);
    const selectedDependencyClaimList = ref<number[][] | null>(initSelectedDependencyClaimList);

    watch(
      () => state.formData.stageDocumentDependencies,
      (cur) => {
        selectedDependencyClaimList.value = getSelectedDependencyClaimList(cur);
      },
    );

    const { processId } = useOfficialClaimsInject();

    onMounted(async () => {
      if (
        getDependencyClaimListState.data.length === 0
        && processId.value
        && curClaimsTypeId.value
      ) {
        await getDependencyClaimList(processId.value, curClaimsTypeId.value);
      }
    });

    function handleClaimDependencyChange(selectedCascadeIds: number[][]) {
      if (
        Array.isArray(selectedCascadeIds)
        && selectedCascadeIds.length === 0
      ) {
        getOfficialClaimDetailState.data.stageDocumentDependencies = null;
      } else {
        getOfficialClaimDetailState.data.stageDocumentDependencies = selectedCascadeIds.map((item: number[]) => ({
          dependencyStageId: item[0],
          dependencyDocumentId: item[1],
          stageClaimsId: getOfficialClaimDetailState.data.id,
        }));
      }
    }

    // 将element ui 级联组件返回数据处理成更新基本设置接口需要的数据结构
    const dependencyDocumentIds = computed(() => (selectedDependencyClaimList.value
      ? selectedDependencyClaimList.value
        .filter(arr => arr.length === 2)
        .map(arr => arr[1])
      : []));

    async function handleSaveBasicConfig() {
      // 表单验证
      if (!basicConfigForm.value) {
        Message.error('表单DOM不存在');
        return;
      }
      const valid = await basicConfigForm.value.validate().catch(() => false);
      if (!valid) {
        return;
      }
      // 更新来文基本设置
      if (!getOfficialClaimDetailState.data.id) {
        Message.error('找不到来文ID');
        return;
      }
      await updateBasicConfig({
        allowModifyPatentState: state.formData.allowModifyPatentState || [],
        hasBill: !!state.formData.hasBill,
        feeNameId: state.formData.hasBill ? state.formData.feeNameId : null,
        isRequired: !!state.formData.isRequired,
        stageClaimsId: state.formData.id as number,
        dependencyDocumentIds: dependencyDocumentIds.value,
        isRepeat: state.formData.isRepeat as boolean,
      });
      // 更新错误则停留在当前，错误信息已经封装
      if (updateBasicConfigState.error !== null) {
        return;
      }
      // 通知上层组件成功，方便关闭编辑模式
      emit('success');
      // 重新获取最新来文详情
      await getOfficialClaimDetail(getOfficialClaimDetailState.data.id);
      // selectedDependencyClaimList.value = getInitialDependencyClaimList();
    }

    function handleCancel() {
      if (basicConfigForm.value) {
        basicConfigForm.value.resetFields();
      }
      // isEditing.value = false;
      emit('cancel');
    }

    return {
      getOfficialClaimDetailState,
      feeNameList,
      loadingLookups,
      handleSaveBasicConfig,
      rules,
      basicConfigForm,
      ...toRefs(state),
      handleClaimDependencyChange,
      getDependencyClaimListState,
      selectedDependencyClaimList,
      updateBasicConfigState,
      // isEditing,

      handleCancel,
    };
  },
});

// 将远程数据转换成element ui 可以用的数据结构
// 来文详情（officialClaimDetail）接口中的依赖来文（stageDocumentDependencies） 数据结构与element ui 级联组件需要数据结构不一致
function getSelectedDependencyClaimList(stageDocumentDependencies: StageDocumentDependency[] | null) {
  if (!stageDocumentDependencies) {
    return null;
  }
  return stageDocumentDependencies.map(({ dependencyStageId, dependencyDocumentId }) => [
    dependencyStageId,
    dependencyDocumentId,
  ]);
}
</script>

<style lang="scss" scoped></style>
