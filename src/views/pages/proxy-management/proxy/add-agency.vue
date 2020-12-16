<template style="margin-top:10px">
  <div>
    <div class="preliminary-review-button">
      <el-button
        class="right-back"
        @click="$router.back()"
        size="mini"
      >
        <i class="el-icon-arrow-left" />
        返回
      </el-button>
    </div>
    <div class="patent-detail">
      <panel-info-list
        label-width="180px"
        class="info-list"
      />
      <div class="application-confirmation">
        <el-form
          class="form"
          label-width="180px"
          ref="agencyForm"
          :model="formData"
          :rules="formRules"
        >
          <el-form-item
            class="labelName"
            :label="'代理所名称'"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              :placeholder="'请输入代理所名称'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'代理所简称'"
          >
            <el-input
              v-model="formData.shortName"
              :placeholder="'请输入代理所简称'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'社会统一信用代码'"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              :placeholder="'请输入社会统一信用代码'"
            />
          </el-form-item>
          <el-form-item
            label="合作时间"
            prop="cooperationStartAt"
          >
            <el-date-picker
              class="width-full"
              v-model="formData.cooperationStartAt"
              type="date"
              placeholder="开始日期"
              value-format="yyyy-MM-ddTHH:mm:ss.SSSZ"
            >
            </el-date-picker>
            <span style="line-height: 40px;display:inline-block; width:4%;text-align: center;">-</span>
            <el-date-picker
              class="width-full"
              v-model="formData.cooperationEndAt"
              type="date"
              placeholder="至今"
              value-format="yyyy-MM-ddTHH:mm:ss.SSSZ"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item
            label="合作类型"
            prop="cooperationType"
          >
            <panel-radio
              placeholder="请选择合作类型"
              v-model="formData.cooperationType"
              type="LAWFIRM_COOPERATION_AT"
              border
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'地址'"
          >
            <el-input
              v-model="formData.address"
              :placeholder="'请输入地址'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'接口人'"
            prop="dockingPeople"
          >
            <el-input
              v-model="formData.dockingPeople"
              :placeholder="'请输入接口人'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'邮箱地址'"
            prop="email"
          >
            <el-input
              v-model="formData.email"
              @change="changeIsEmail(formData.email)"
              :placeholder="'请输入邮箱地址'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'备用邮箱'"
            prop="spareEmail"
          >
            <el-input
              v-model="formData.spareEmail"
              :placeholder="'请输入备用邮箱'"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            :label="'联系电话'"
            prop="tel"
          >
            <el-input
              v-model="formData.tel"
              :placeholder="'请输入联系电话'"
            />
          </el-form-item>
          <el-form-item
            label="代理所类型"
            prop="type"
          >
            <panel-radio
              v-model="formData.type"
              placeholder="请选择代理所类型"
              type="LAWFIRM_TYPE"
              border
            />
          </el-form-item>
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
              v-model="formData.experiencedDomain"
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
          <el-form-item
            label="所属国家/地区"
            prop="regionCode"
          >
            <selector-country
              v-model="formData.regionCode"
              placeholder=""
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item
            label="业务覆盖国家/地区"
            prop="businessRegion"
          >
            <selector-country
              multiple
              autocomplete="new-password"
              v-model="formData.businessRegion"
              placeholder="该流程在哪些国家生效"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item
            label="是否海外所"
            prop="isOverseas"
          >
            <el-radio-group v-model="formData.isOverseas">
              <el-radio border :label="true">是</el-radio>
              <el-radio border :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="是否纳录考核"
            prop="isPerformanceReview"
          >
            <el-radio-group v-model="formData.isPerformanceReview">
              <el-radio border :label="true">是</el-radio>
              <el-radio border :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="返稿邮件抄送给接口人"
            prop="isCcDockingPeople"
          >
            <el-radio-group v-model="formData.isCcDockingPeople">
              <el-radio border :label="true">是</el-radio>
              <el-radio border :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="备注"
            class="remarkText"
          >
            <el-input
              v-model="formData.remark"
              type="textarea"
              class="text-information"
              :autosize="{ minRows: 3, maxRows: 10}"
            />
          </el-form-item>
          <el-form-item
            class="labelName"
            label="上传附件"
            prop="attachments"
          >
            <upload-attachment
              v-model="formData.attachments"
              drag
            />
          </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: center;">
          <el-button
            type="primary"
            @click="submitDomain"
            size="medium"
          >确 定</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed,
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import { useLookupsInject } from '@/context';
import utils from '@/utils';
import UploadAttachment from '@/components/upload-attachment.vue';
import PanelInfoList from '@/components/panel-info-list.vue';
import PanelRadio from '@/components/panel-radio.vue';
import SelectorCountry from '@/components/selector-country.vue';
import PanelSelectGroup from '@/components/panel-select-group.vue';
import PanelSelectSearch from '@/components/panel-select-search.vue';

export default defineComponent({
  name: 'AddAgency',
  components: {
    PanelInfoList,
    PanelRadio,
    SelectorCountry,
    PanelSelectGroup,
    UploadAttachment,
    PanelSelectSearch,
  },
  setup(_, context) {
    const { $router, $message, $route } = context.root;
    const agencyForm = ref();
    const formDataEmail = ref();
    const validateRegexSpare = (rule, value, callback) => {
      if (rule.field === 'spareEmail') {
        if (formDataEmail.value === value) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const state = reactive({
      formData: {
        name: null,
        code: null,
        isCcDockingPeople: null,
        isOverseas: null,
        cooperationType: null,
        type: null,
        isPerformanceReview: null,
        cooperationStartAt: null,
        dockingPeople: null,
        email: null,
        spareEmail: null,
        tel: null,
        experiencedDomain: [],
        regionCode: null,
        businessRegion: [],
        attachments: [],
      },
      lawFirmId: 0,
      domainList: [],
      groupOptions: [],
      domainLoading: false,
      formRules: {
        name: [
          { required: true, message: '请输入代理所名称', trigger: 'blur' },
        ],
        code: [
          {
            required: true,
            message: '请输入社会统一信用代码',
            trigger: 'blur',
          },
        ],
        isCcDockingPeople: [
          {
            required: true,
            message: '请选择返稿邮件抄送给接口人',
            trigger: 'change',
          },
        ],
        isOverseas: [
          {
            required: true,
            message: '是否海外所',
            trigger: 'change',
          },
        ],
        cooperationType: [
          {
            required: true,
            message: '请选择合作类型',
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: '请选择代理所类型',
            trigger: 'change',
          },
        ],
        isPerformanceReview: [
          {
            required: true,
            message: '是否纳录考核',
            trigger: 'change',
          },
        ],
        cooperationStartAt: [
          {
            required: true,
            message: '请选择开始日期',
            trigger: 'change',
          },
        ],
        dockingPeople: [
          { required: true, message: '请输入接口人', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱地址' },
          {
            type: 'email',
            message: '请输入正确的email',
            trigger: ['blur', 'change'],
          },
        ],
        spareEmail: [
          { required: true, message: '请输入备用邮箱' },
          {
            type: 'email',
            message: '请输入正确的email',
            trigger: ['blur', 'change'],
          },
          {
            message: '两个邮箱不能一致',
            validator: validateRegexSpare,
          },
        ],
        tel: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        experiencedDomain: [
          { required: true, message: '请选择擅长领域', trigger: 'change' },
        ],
        regionCode: [
          { required: true, message: '请选择所属国家/地区', trigger: 'change' },
        ],
        businessRegion: [
          {
            required: true,
            message: '请选择业务覆盖国家/地区',
            trigger: 'change',
          },
        ],
        attachments: [
          {
            required: true,
            message: '请上传附件',
            trigger: 'change',
          },
        ],
      },
    });
    const { postData: postNewProcess } = useHttp('/patent-corp_api/law-firms');
    const { getEnumsInfo } = useLookupsInject();
    const changeIsEmail = (val) => {
      formDataEmail.value = val;
    };
    const pickerOptions = computed(() => {
      const newTime = new Date(utils.dateFormat(
        state.formData.cooperationStartAt,
        'yyyy-MM-DD 00:00:00',
      )).getTime();
      const disabledDate = time => time.getTime() < newTime;
      return {
        disabledDate,
      };
    });
    const submitDomain = () => {
      const stepType = computed(() => getEnumsInfo('LAWFIRM_STATUS'));
      const addstepType = stepType.value.COMMIT;
      agencyForm.value.validate(async (valid) => {
        if (!valid) return;
        try {
          const businessRegion = state.formData.businessRegion.map(item => ({
            regionCode: item,
          }));
          const experiencedDomain = [];
          state.domainList = state.groupOptions.concat(state.domainList);
          state.formData.experiencedDomain.forEach((p) => {
            if (typeof p === 'string') {
              experiencedDomain.push({ domainId: 0, name: p });
            } else {
              const domain = state.domainList.find(z => z.id === p);
              experiencedDomain.push({
                domainId: p,
                name: domain ? domain.name : '',
              });
            }
          });
          const {
            address,
            code,
            cooperationType,
            dockingPeople,
            email,
            name,
            remark,
            shortName,
            isCcDockingPeople,
            isOverseas,
            isPerformanceReview,
            regionCode,
            spareEmail,
            tel,
            type,
            attachments,
            cooperationStartAt,
            cooperationEndAt,
          } = state.formData;
          const params = {
            address,
            attachments,
            businessRegion, // 业务覆盖国家,
            code,
            shortName,
            cooperationStartAt,
            cooperationEndAt,
            cooperationType,
            dockingPeople,
            email,
            experiencedDomain, // 擅长领域
            id: state.lawFirmId,
            isCcDockingPeople,
            isOverseas,
            isPerformanceReview,
            name,
            regionCode,
            remark,
            spareEmail,
            tel,
            type,
            status: addstepType,
          };
          if (state.lawFirmId !== 0) {
            const { putData: putNewProcess } = useHttp(`/patent-corp_api/law-firms/${state.lawFirmId}`);
            await putNewProcess(params);
          } else {
            await postNewProcess(params);
          }
          $message.success('操作成功!');
          $router.push('/proxy-management/agency-management');
        } catch (error) {
          $message.error(error.response.data);
        }
      });
    };
    const remoteMethodDomain = async (query) => {
      const { fetchData: getDomainList } = useHttp('/patent-corp_api/domains/search');
      const innerData = {
        limit: 20,
        offset: 0,
        name: query,
      };
      state.domainList = [];
      state.domainList = await getDomainList(innerData);
      // state.domainList = state.domainList.concat(await getDomainList(innerData));
      state.domainList = unique(state.domainList);
    };
    function unique(arr) {
      // 数组对象去重
      const res = new Map();
      return arr.filter(item => !res.has(item.id) && res.set(item.id, 1));
    }
    const isEdit = async () => {
      const { fetchData: newDetailProcess } = useHttp(`/patent-corp_api/law-firms/detail/${state.lawFirmId}`);
      state.formData = { ...(await newDetailProcess()) };

      state.formData.businessRegion = (state.formData.businessRegion || []).map(item => item.regionCode);
      state.groupOptions = (state.formData.experiencedDomain || []).map(item => ({
        id: item.domainId,
        name: item.name,
      }));
      state.formData.experiencedDomain = (
        state.formData.experiencedDomain || []
      ).map(item => item.domainId);
      state.domainList = state.groupOptions.concat(state.domainList);
      state.domainList = unique(state.domainList);
    };
    onMounted(async () => {
      state.lawFirmId = computed(() => Number($route.query.lawFirmId) || 0);
      await remoteMethodDomain();
      if (state.lawFirmId !== 0) {
        isEdit();
      }
    });
    return {
      ...toRefs(state),
      agencyForm,
      submitDomain,
      changeIsEmail,
      formDataEmail,
      pickerOptions,
      remoteMethodDomain,
      isEdit,
    };
  },
});
</script>
<style lang="scss" scoped>
.preliminary-review-button {
  .right-back {
    margin-left: 20px;
    margin-bottom: 10px;
  }
}
.patent-detail {
  display: flex;
  margin-left: 20px;
  background: white;
  text-align: center;
  width: 98%;
  padding: 20px 0;
  .form {
    text-align: left;
  }
}
::v-deep .el-date-editor.el-input {
  width: 48%;
}
::v-deep .el-input__inner {
  border: 1px solid #DCDFE6;
  width: 100%;
}
::v-deep .el-form-item.is-success .el-input__inner {
  border-color: #DCDFE6;
}
.application-confirmation {
  padding: 20px 60px 20px 100px;
  width: 70%;
}
</style>
