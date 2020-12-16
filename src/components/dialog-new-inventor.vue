<template>
  <div class="new-inventor">
    <el-dialog
      :title="isAddInventor ? '新增发明人' : '编辑发明人'"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      style="margin-top: -4vh;"
      @close="handleDialogClose"
      v-if="dialogVisible"
      :key="inventorId"
    >
      <el-form :model="inventorForm"
               ref="viewForm"
               :rules="validateRules"
               id="form-main"
               v-loading="formLoading"
               label-width="120px">
        <div class="flex-select">
          <el-form-item
            label="是否内部员工"
            prop="isInternal"
          >
            <el-radio-group v-model="inventorForm.isInternal">
              <el-radio border :label="true">是</el-radio>
              <el-radio border :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label=""
            prop="staffId"
            label-width="20px"
            style="flex: 1; margin-right: 30px;"
            v-show="inventorForm.isInternal"
            :rules="[
              { message: '请输入员工姓名或者员工号', validator: validateStaff },
            ]"
          >
            <panel-select-search
              v-model="inventorForm.staffId"
              :default-options="staffDeafultOptions"
              placeholder="请输入员工姓名或者员工号"
              maxlength="50"
              api="/patent-corp_api/staffs/names/like"
              query-key="name"
              label-key="staffFullName"
              value-key="staffId"
              @changeitem="handleChangeStaff"
              @input="handleSearchInput"
            />
          </el-form-item>
        </div>
        <div class="info-box">
          <div class="flex-input">
            <el-form-item
              label="姓名"
              prop="lastName"
              class="input-left"
            >
              <el-input placeholder="姓"
                        v-model="inventorForm.lastName"
                        :disabled="isDisabledInfo && disabledLastName" />
            </el-form-item>
            <el-form-item
              label=""
              prop="firstName"
              label-width="10px"
              class="input-right"
            >
              <el-input placeholder="名"
                        v-model="inventorForm.firstName"
                        :disabled="isDisabledInfo && disabledFirstName" />
            </el-form-item>
          </div>
          <div class="flex-input">
            <el-form-item
              label="拼音"
              prop="lastNamePinyin"
              class="input-left"
            >
              <el-input placeholder="姓拼音，例如ZHANG" v-model="inventorForm.lastNamePinyin" />
            </el-form-item>
            <el-form-item
              label=""
              prop="firstNamePinyin"
              label-width="10px"
              class="input-right"
            >
              <el-input placeholder="名拼音，例如TIAN SHI" v-model="inventorForm.firstNamePinyin" />
            </el-form-item>
          </div>
          <el-form-item
            label="国籍"
            prop="nationality"
          >
            <selector-country
              autocomplete="new-password"
              v-model="inventorForm.nationality"
              placeholder="请选择"
              style="width: 100%;"
            />
          </el-form-item>
          <div class="flex-select">
            <el-form-item
              label="证件号码"
              prop="certificateType"
            >
              <panel-select
                type="CERTIFICATE_TYPE"
                v-model="inventorForm.certificateType"
                placeholder="请选择"
                class="selectt-number"
              />
            </el-form-item>
            <el-form-item
              style="width: 100%;"
              label-width="10px"
              label=""
              prop="certificateNumber"
              required
              :rules="[
                { message: '证件号不能为空', validator: validateEmpty },
                { message: '请输入正确的证件号', validator: validateCertificate },
              ]"
            >
              <el-input
                placeholder="证件号码"
                v-model.trim="inventorForm.certificateNumber"
              />
            </el-form-item>
          </div>
        </div>
        <div class="info-other">
          <el-form-item
            label="Email"
            prop="email"
          >
            <el-input placeholder="Email"
                      v-model="inventorForm.email"
                      :disabled="isDisabledInfo && disabledEmail" />
          </el-form-item>
           <el-form-item
            label="Tel"
            prop="telephone"
          >
            <el-input placeholder="Tel"
                      v-model="inventorForm.telephone"
                      :disabled="isDisabledInfo && disabledPhone" />
          </el-form-item>
           <el-form-item
            label="联系地址"
            prop="chineseAddress"
          >
            <el-input placeholder="联系地址" v-model="inventorForm.chineseAddress" />
          </el-form-item>
           <el-form-item
            label="联系地址英文"
            prop="englishAddress"
          >
            <el-input placeholder="联系地址英文" v-model="inventorForm.englishAddress" />
          </el-form-item>
          <div class="edit-more" @click="editMore = !editMore">
            <span>填写更多</span>
            <i :class="editMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i></div>
        </div>
        <div v-show="editMore" style="margin: 12px 30px 0 0">
          <el-form-item
            label="性别"
            prop="gender"
          >
            <el-radio-group v-model="inventorForm.gender">
              <el-radio border label="MALE">男</el-radio>
              <el-radio border label="FEMALE">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="职称"
            prop="title"
          >
            <el-input placeholder="职称" v-model="inventorForm.title" />
          </el-form-item>
          <el-form-item
            label="出生日期"
            prop="birthday"
          >
            <el-date-picker
              v-model="inventorForm.birthday"
              type="date"
              placeholder="出生日期"
              style="width: 100%;"
              :picker-options="{
                 disabledDate(time) {
                  return time.getTime() > Date.now();
                },
              }"
              value-format="yyyy-MM-ddTHH:mm:ss.SSSZ" />
          </el-form-item>
          <el-form-item
            label="银行账户"
            prop="bankAccount"
          >
            <el-input placeholder="银行账户" v-model="inventorForm.bankAccount" />
          </el-form-item>
          <el-form-item
            label="户名"
            prop="accountName"
          >
            <el-input placeholder="户名" v-model="inventorForm.accountName" />
          </el-form-item>
          <el-form-item
            label="开户银行"
            prop="accountBank"
          >
            <el-input placeholder="开户银行" v-model="inventorForm.accountBank" />
          </el-form-item>
          <el-form-item
            label="开户省份"
            prop="accountProvince"
          >
            <!-- <panel-select placeholder="开户省份" v-model="inventorForm.accountProvince" /> -->
            <el-input placeholder="开户省份" v-model="inventorForm.accountProvince" />
          </el-form-item>
          <el-form-item
            label="邮政编码"
            prop="postalCode"
          >
            <el-input placeholder="邮政编码" v-model="inventorForm.postalCode" />
          </el-form-item>
          <el-form-item
            label="传真"
            prop="fax"
          >
            <el-input placeholder="传真" v-model="inventorForm.fax" />
          </el-form-item>
          <el-form-item
            label="所属机构"
            prop="affiliatedCompany"
          >
            <el-input placeholder="所属机构" v-model="inventorForm.affiliatedCompany" />
          </el-form-item>
          <el-form-item
            label="所属部门"
            prop="affiliatedDepartment"
          >
            <el-input placeholder="所属部门" v-model="inventorForm.affiliatedDepartment" />
          </el-form-item>
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input placeholder="备注" type="textarea" v-model="inventorForm.remark" />
          </el-form-item>
        </div>
      </el-form>
      <div class="submit-btn">
        <el-button type="primary"
                  style="height: 40px; font-size: 14px"
                   @click="submitInventorForm"
                   :loading="submitLoading">确定{{isAddInventor ? '新增' : '编辑'}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  toRefs, computed, reactive, ref, defineComponent, watch,
} from '@vue/composition-api';
import PanelSelect from '@/components/panel-select.vue';
import SelectorCountry from '@/components/selector-country.vue';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import { useLookupsInject, useUserInfo } from '@/context';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';

export default defineComponent({
  name: 'DialogNewInvertor',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isAddInventor: Boolean,
    inventorType: Number,
    inventorId: Number,
  },
  components: {
    PanelSelect,
    PanelSelectSearch,
    SelectorCountry,
  },
  setup(props, context) {
    const regexList = computed(() => ({
      phone: /^[1][3,4,5,6,7,8][0-9]{9}$/,
      // 固话
      landline: /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/,
    }));
    const validateEmpty = (rule, value, callback) => {
      if (utils.isEmpty(value)) {
        if (rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };
    const validateRegex = (rule, value, callback) => {
      if (rule.field === 'telephone') {
        const { phone, landline } = regexList.value;
        if (!phone.test(value) && !landline.test(value) && rule.message) {
          return callback(new Error(rule.message));
        }
      }
      return callback();
    };

    const {
      getEnumsInfo,
    } = useLookupsInject();
    const { userInfo } = useUserInfo();
    const certificateType = computed(() => getEnumsInfo('CERTIFICATE_TYPE'));
    const { $message, $nextTick } = context.root;
    const { emit } = context;
    const viewForm = ref(null);
    const state = reactive({
      formLoading: false,
      submitLoading: false,
      timer: null,
      inventorForm: {
        isInternal: null, // 是否内部员工*
        staffId: null, // *
        lastName: '', // 姓 *
        firstName: '', // 名 *
        lastNamePinyin: '',
        firstNamePinyin: '',
        nationality: '', // 国籍 *
        certificateType: null, // 证件类型 *
        certificateNumber: '', // 证件号码 *
        email: '', // *
        telephone: '', // *
        chineseAddress: '', // *
        englishAddress: '',
        gender: '',
        title: '',
        birthday: null,
        bankAccount: '', // 银行账号
        accountName: '', // 户名
        accountBank: null, // 开户银行
        postalCode: '',
        fax: '',
        affiliatedCompany: '', // 所属机构
        remark: '',
        accountProvince: '', // 开户省份
        affiliatedDepartment: '', // 所属部门
      },
      validateRules: {
        isInternal: [{ required: true, message: '请选择是否内部员工' }],
        // staffId: [{ required: true, message: '请输入员工姓名或者员工号', trigger: 'change' }],
        lastName: [{ required: true, message: '请输入姓' }],
        firstName: [{ required: true, message: '请输入名' }],
        nationality: [{ required: true, message: '请选择国籍' }],
        certificateType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
        ],
        telephone: [
          { required: true, message: '请输入联系电话' },
          { type: 'phone', message: '请输入正确的联系电话', validator: validateRegex },
        ],
        chineseAddress: [{ required: true, message: '请输入联系地址' }],
      },
      cloneForm: {},
      editMore: false,
      staffDeafultOptions: [],
      changeStaffItem: false,
      disabledEmail: true,
      disabledPhone: true,
      disabledLastName: true,
      disabledFirstName: true,
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
    state.cloneForm = { ...state.inventorForm };
    const handleDialogClose = () => {
      if (viewForm.value) {
        viewForm.value.resetFields();
      }
      state.editMore = false;
      state.changeStaffItem = false;
      state.disabledEmail = true;
      state.disabledPhone = true;
      state.disabledLastName = true;
      state.disabledFirstName = true;
      state.staffDeafultOptions = [];
      state.inventorForm = { ...state.cloneForm };
    };
    const {
      url: inventorDataUrl,
      fetchData: fetchInventorData,
      postData: postInventorData,
      putData: putInventorData,
    } = useHttp();
    const handleChangeStaff = async (val) => {
      const { isInternal } = state.inventorForm;
      if (val?.staffId) {
        if (viewForm.value) {
          viewForm.value.resetFields();
        }
        const newObj = {
          chineseAddress: val.address,
          email: val.email,
          fax: val.fax,
          gender: val.gender === 0 ? 'MALE' : 'FEMALE',
          telephone: val.mobile || val.phone,
          affiliatedDepartment: val.workDeptName,
          isInternal,
          staffId: val.staffId,
          staffFullName: val.staffFullName,
        };
        state.inventorForm = {
          ...state.inventorForm,
          ...newObj,
        };
        state.disabledEmail = val.email.length > 0;
        state.disabledPhone = newObj.telephone.length > 0;
        state.changeStaffItem = true;
        state.disabledLastName = false;
        state.disabledFirstName = false;
      }
    };
    const handleSearchInput = (val) => {
      if (!val) {
        const { isInternal } = state.inventorForm;
        if (viewForm.value) {
          viewForm.value.resetFields();
        }
        state.changeStaffItem = false;
        state.disabledEmail = false;
        state.disabledPhone = false;
        state.disabledLastName = false;
        state.disabledFirstName = false;
        state.inventorForm.isInternal = isInternal;
      }
    };
    watch(() => props.visible, async (newVal) => {
      if (newVal && props.inventorId) {
        state.formLoading = true;
        inventorDataUrl.value = `/patent-corp_api/inventor/${props.inventorId}`;
        const data = await fetchInventorData();
        $nextTick(() => {
          state.inventorForm = {
            ...data,
            accountProvince: data.accountProvince || '',
          };
          if (data.isInternal) {
            state.staffDeafultOptions = [{
              staffId: data.staffId,
              staffFullName: data.staffFullName,
            }];
          }
        });
        state.formLoading = false;
      }
      if (!newVal && state.timer) {
        // 清除定时器
        clearTimeout(state.timer);
        state.timer = null;
      }
    });
    watch(() => state.inventorForm.isInternal, () => {
      if (props.isAddInventor) {
        handleSearchInput('');
      }
    });
    const inventorForm = async () => {
      state.submitLoading = true;
      const params = {
        corpId: userInfo.value.corpId,
        ...state.inventorForm,
        accountProvince: state.inventorForm.accountProvince || '',
      };
      try {
        if (props.isAddInventor) {
          inventorDataUrl.value = '/patent-corp_api/inventor';
          await postInventorData(params);
          $message.success('新增成功!');
        } else {
          inventorDataUrl.value = `/patent-corp_api/inventor/${props.inventorId}`;
          await putInventorData(params);
          $message.success('编辑成功!');
        }
        handleDialogClose();
        dialogVisible.value = false;
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
      state.submitLoading = false;
    };
    const submitInventorForm = () => {
      viewForm.value.validate((valid) => {
        if (valid) {
          inventorForm();
        } else {
          // 页面定位到第一个未填的必填项位置
          state.timer = setTimeout(() => {
            const isError = document.getElementsByClassName('is-error');
            const scrollDom = document.getElementById('form-main');
            scrollDom.scrollTop = isError[0].offsetTop - 150;
          }, 1);
        }
      });
    };
    const isDisabledInfo = computed(() => (
      props.isAddInventor ? state.changeStaffItem : state.inventorForm.isInternal
    ));

    const validateCertificate = (rule, value, callback) => {
      // const IDCard = /\d{17}[\d|x]|\d{15}/;
      const PassPort1 = /^[a-zA-Z]{5,9}$/;
      const PassPort2 = /^[a-zA-Z0-9]{7,9}$/;
      if (state.inventorForm.certificateType === certificateType.value.IDCARD) {
        if (value && (value.length <= 18 && value.length >= 6)) {
          //
        } else {
          return callback(new Error('请输入正确的身份证号'));
        }
      }
      if (state.inventorForm.certificateType === certificateType.value.PASSPORT) {
        if (value && (!PassPort1.test(value) && !PassPort2.test(value))) {
          return callback(new Error('请输入正确的护照'));
        }
      }
      return callback();
    };
    const validateStaff = (rule, value, callback) => {
      if (state.inventorForm.isInternal) {
        if (utils.isEmpty(value) && rule.message) {
          return callback(new Error(rule.message));
        }
        return callback();
      }
      return callback();
    };

    return {
      ...toRefs(state),
      dialogVisible,
      viewForm,
      validateEmpty,
      validateCertificate,
      validateStaff,
      submitInventorForm,
      handleDialogClose,
      handleChangeStaff,
      isDisabledInfo,
      handleSearchInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.flex-input{
  display: flex;
  .input-left {
    width: 352px;
  }
  .input-right {
    flex: 1;
  }
}
.flex-select {
  display: flex;
}
.staff-class {
  opacity: 0;
}
.selectt-number {
  width: 160px;
}
.info-box {
  background-color: rgba(250, 250, 250, 1);
  padding-top: 20px;
  padding-right: 30px;
  margin-bottom: 16px;
}
.info-other {
  padding-right: 30px;
}
.edit-more {
  font-size: 14px;
  color: #0079FE;
  margin-left: 120px;
  cursor: pointer;
}
.submit-btn {
  width: 100%;
  text-align: center;
  margin-top: 20px;
  .el-button {
    width: 109px;
    background-color: rgba(0, 121, 254, 1);
    border-radius: 3px;
    font-size: 12px;
    color: #FFFFFF;
  }
}
::v-deep {
  .el-dialog__header {
    padding-left: 30px;
    background-color: #fff;
    border: 0;
    font-size: 16px;
  }
  .el-dialog__header::before{
    content: "";
    position: absolute;
    left: 20px;
    top: 18px;
    height: 18px;
    width: 3px;
    background-color: #016EFF;
  }
  .el-dialog__body {
    padding-right: 0;
  }
  #form-main {
    padding-right: 30px;
    overflow-y: auto;
    height: 640px;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #ffffff;
    background-color: rgb(1, 110, 255);
  }
}
</style>
