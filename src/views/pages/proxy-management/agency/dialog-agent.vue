<template>
  <div class="dialog-add-agent">
    <el-dialog
      :title="editAgent ? '编辑代理人' : '新增代理人'"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <el-form
        style="margin-top: 20px"
        :model="formData"
        ref="viewForm"
        label-width="120px"
        :rules="validateRules"
      >
        <el-form-item label="姓名" prop="name">
          <el-input placeholder="请输入姓名" v-model="formData.name" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telephone">
          <el-input placeholder="联系电话" v-model="formData.telephone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱" v-model="formData.email" />
        </el-form-item>
        <el-form-item label="代理所" prop="lawFirmId">
          <panel-select-search
            v-model="formData.lawFirmId"
            placeholder="请输入代理所"
            maxlength="50"
            api="/patent-corp_api/law-firms"
            query-key="key"
            label-key="lawFirmName"
            value-key="id"
            :default-options="agencyOptions"
            @changeitem="handleChangeEngineer"
            :disabled="isAgency"
          />
        </el-form-item>
        <el-form-item label="在职状态" prop="isWorking">
          <el-radio v-model="formData.isWorking" border :label="true">在职</el-radio>
          <el-radio v-model="formData.isWorking" border :label="false">离职</el-radio>
        </el-form-item>
        <el-form-item label="代理人级别" prop="agentGrade">
          <panel-select
            v-model="formData.agentGrade"
            type="AGENT_GRADE"
            placeholder="请选择代理人级别"
          />
        </el-form-item>

        <!-- <el-form-item :label="'擅长领域'">
          <el-select
            filterable
            multiple
            allow-create
            v-model="formData.adeptDomain"
            placeholder="请选择擅长领域"
          >
            <el-option
              v-for="item in domainList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item> -->

          <el-form-item
            class="labelName"
            :label="'擅长领域'"
            prop="experiencedDomain"
          >
            <el-select
              filterable
              multiple
              allow-create
              remote
              :remote-method="remoteMethodDomain"
              :loading="domainLoading"
              v-model="formData.adeptDomain"
              placeholder="请选择擅长领域"
            >
              <el-option
                v-for="(item, index) in domainList"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

        <el-form-item label="代理人角色" prop="agentRole">
          <panel-select multiple
            v-model="formData.agentRole"
            type="AGENT_ROLE"
            placeholder="请选择代理人级别"
          />
        </el-form-item>
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
import { useUserInfo } from '@/context';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import { useHttp } from '@/hooks/http';

const initformData = {
  id: null,
  name: null,
  telephone: null,
  email: null,
  isWorking: null,
  adeptDomain: [],
  staffName: null,
  corpName: '',
  groupEngineerList: [],
  agentGrade: null,
  agentRole: null,
  agencyOptions: [],
  lawFirmId: null,
  isEnabled: true,
};
export default defineComponent({
  name: 'DialogAgent',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    agentInfo: Object || null,
    editAgent: Boolean,
    isAgency: {
      type: Boolean,
      default: false,
    },
    agencyOption: Array,
  },
  components: { PanelSelectSearch, PanelCheckbox, PanelSelect },
  setup(props, context) {
    const regexList = computed(() => ({
      phone: /^[1][3,4,5,6,7,8][0-9]{9}$/,
      // 固话
      landline: /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/,
    }));
    const { $route, $message } = context.root;
    const { emit } = context;
    const viewForm = ref();
    const { userInfo } = useUserInfo();
    const validateRegex = (rule, value, callback) => {
      if (rule.field === 'email') {
        const email = /^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}$/;
        if (!email.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      } else if (rule.field === 'telephone') {
        const { phone, landline } = regexList.value;
        if (!phone.test(value) && !landline.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const state = reactive({
      formData: {
        name: null,
        telephone: null,
        email: null,
        isWorking: null,
        adeptDomain: [],
        staffName: null,
        corpName: userInfo.value.corpName,
        groupEngineerList: [],
        agentGrade: null,
        agentRole: null,
        agencyOptions: [],
        lawFirmId: null,
        isEnabled: true,
      },
      domainLoading: false,
      workingArray: [
        { name: '在职', val: true },
        { name: '离职', val: false },
      ],
      validateRules: {
        name: [{ required: true, message: '请输入姓名' }],
        telephone: [
          { required: true, message: '请输入联系电话' },
          {
            type: 'telephone',
            message: '请输入正确的联系电话',
            validator: validateRegex,
          },
        ],
        email: [
          { required: true, message: '请输入邮箱' },
          {
            type: 'email',
            message: '请输入正确的email',
            trigger: ['blur', 'change'],
          },
        ],
        lawFirmId: [{ required: true, message: '请选择代理所' }],
        isWorking: [{ required: true, message: '请选择在职状态' }],
      },
      staffOptions: [],
      groupOptions: [],
      agencyOptions: [],
      domainList: [],
    });
    const remoteMethodDomain = async (query) => {
      const {
        fetchData: getDomainList,
      } = useHttp('/patent-corp_api/domains/search');
      const innerData = {
        limit: 20,
        offset: 0,
        name: query,
      };
      state.domainList = await getDomainList(innerData);
    };
    // 弹框
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const {
      loading: submitLoading,
      url: submitEngineerUrl,
      postData: postAgent,
      putData: putAgent,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const { formData } = state;
          const params = {
            ...formData,
          };
          params.adeptDomainArray = [];
          if (params.adeptDomain !== null) {
            params.adeptDomain.forEach((p) => {
              if (typeof (p) === 'string') {
                params.adeptDomainArray.push({ id: 0, name: p });
              } else {
                const domain = state.domainList.find(z => z.id === p);
                params.adeptDomainArray.push({ id: p, name: domain ? domain.name : '' });
              }
            });
          }

          if (params.agentGrade === '') {
            params.agentGrade = null;
          }

          if (props.editAgent) {
            submitEngineerUrl.value = `/patent-corp_api/agents-edit/${props.agentInfo.id}`;
            await putAgent(params);
          } else {
            submitEngineerUrl.value = '/patent-corp_api/agents';
            await postAgent(params);
          }
          emit('success', true);
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
    const handleChangeEngineer = (val) => {
      if (val.length > 0) {
        state.formData.groupEngineerList = val.map(item => ({
          groupId: item.id,
          groupName: item.orgPath,
        }));
      }
    };
    const domainQuery = async () => {
      const { fetchData: domains } = useHttp('/patent-corp_api/domains/search');
      const innerData = {
        limit: 20,
        offset: 0,
      };
      state.domainList = await domains(innerData);
    };
    function unique(arr) { // 数组对象去重
      const res = new Map();
      return arr.filter(item => !res.has(item.id) && res.set(item.id, 1));
    }
    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          await remoteMethodDomain();
          if (props.agentInfo) {
            state.formData = { ...state.formData, ...props.agentInfo };
            state.agencyOptions = [
              {
                id: props.agentInfo.lawFirmId,
                lawFirmName: props.agentInfo.lawFirmName,
              },
            ];
            state.groupOptions = (props.agentInfo.domainList || []).map(item => ({
              id: item.id,
              name: item.name,
            }));
            state.domainList = state.groupOptions.concat(state.domainList);
            state.domainList = unique(state.domainList);
          } else {
            state.formData = { ...state.formData, ...initformData };
            if (props.isAgency) {
              state.formData.lawFirmId = Number($route.query.id);
              state.agencyOptions = props.agencyOption;
            }
          }
        }
      },
    );

    const handleSearchInput = (val) => {
      if (!val) {
        const { formData } = state;
        formData.email = null;
        formData.phone = null;
        formData.staffName = null;
      }
    };
    const handleClose = () => {
      if (viewForm.value) {
        viewForm.value.resetFields();
      }
      state.staffOptions = [];
      state.groupOptions = [];
    };
    onMounted(async () => {
      await remoteMethodDomain();
    });
    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      handleSearchInput,
      handleSubmit,
      handleChangeEngineer,
      handleClose,
      submitLoading,
      domainQuery,
      remoteMethodDomain,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
