<template>
  <page-card v-loading="loading">
    <div class="auth-list">
      <page-title title="授权信息" class="page-title" />
      <el-form
          :model="formData"
          ref="viewForm"
          label-width="100px"
          :rules="validateRules"
        >
        <el-form-item label="授权描述" prop="description">
          <el-input placeholder="请输入授权描述" v-model="formData.description" />
        </el-form-item>
        <el-form-item label="授权时间" prop="termValidity">
          <el-date-picker
            v-model="formData.termValidity"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item
          label="授权企业"
          prop="objectName"
          v-if="$route.query.objectId || authInfo.objectType === 'client'"
        >
          <el-input v-model="formData.objectName" disabled />
        </el-form-item>
        <template v-else>
          <el-form-item
            label="授权对象"
            prop="objectId"
          >
          <el-select v-model="formData.objectId"
              filterable
              placeholder="请选择授权对象"
              >
              <el-option
                v-for="item in corpStaffList"
                :key="item.staffId"
                :label="item.staffFullName"
                filter-method
                :value="item.staffId"
                >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="授予角色"
            prop="roleId"
          >
            <el-select v-model="formData.roleId"
              filterable
              multiple
              placeholder="请选择授予角色"
              >
              <el-option
                v-for="item in roleListData"
                :key="item.roleId"
                :label="item.roleName"
                filter-method
                :value="item.roleId"
                >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <page-title title="权限信息"  class="page-title" />
      <el-tree
        ref="treeNode"
        class="tree-node"
        :data="treeData"
        node-key="uid"
        show-checkbox
        default-expand-all
        :expand-on-click-node="false"
        :props="defaultProps"
         @check-change="handleCheckChange "
        >
        <p
          slot-scope="{ node }"
          class="custom-tree-node"
          :class="{'levelname': node.level === 2 && node.childNodes.length > 0}">
            <span class="node-label" :class="`node-label-${node.level}`">{{ node.label }}</span>
        </p>
      </el-tree>
    </div>
     <div class="auth-footer">
      <el-button @click="$router.back()">取 消</el-button>
      <el-button type="primary" v-loading="submitLoading" @click="handleSubmit">授 权</el-button>
     </div>
  </page-card>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs, ref,
  onMounted,
  onUnmounted,
  computed,
} from '@vue/composition-api';
import { useUserInfo, useAuthInject } from '@/context';
import { useHttp } from '@/hooks/http';
import utils from '@/utils';
import PageCard from '@/components/page-card.vue';
import PageTitle from '@/components/page-title.vue';

export default defineComponent({
  name: 'AuthAdd',
  components: { PageCard, PageTitle },
  setup(_, context) {
    const {
      $route, $router, $nextTick, $message,
    } = context.root;
    const state = reactive({
      loading: true,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      formData: {
        description: '',
        termValidity: [],
        roleId: [],
        objectId: '',
        objectName: '',
      },
      checkTreeNode: [],
      validateRules: {
        description: [{ required: true, message: '请输入授权描述' }],
        termValidity: [{ required: true, message: '请选择授权时间' }],
        objectId: [{ required: true, message: '请选择授权对象' }],
        objectName: [{ required: true, message: '请填写授权企业' }],
      },
      submitLoading: false,
      timer: null,
      isClient: false,
    });
    const treeNode = ref(null);
    const viewForm = ref();
    const { userInfo } = useUserInfo();
    const {
      authInfo, setAuthInfo, getAuthInfoList, getAuthInfoDetail,
    } = useAuthInject();

    // 改变tree样式
    const changeTreeNodeCss = () => {
      const levelName = document.getElementsByClassName('levelname');
      levelName.forEach((item) => {
        item.parentNode.parentNode.style.width = '100%';
      });
    };
    // 获取授予对象
    const {
      data: corpStaffs,
      fetchData: fetchCorpStaffData,
    } = useHttp(`/patent-corp_api/corp-staff-select?corpId=${userInfo.value.corpId}`);
    // 过滤授权对象
    const corpStaffList = computed(() => (corpStaffs.value || []));
    // 获取授予角色
    const {
      data: roleListData,
      fetchData: fetchRoleList,
    } = useHttp('/patent-corp_api/roles');
    // 获取权限信息
    const {
      url: treeDataUrl,
      data: treeDataList,
      fetchData: fetchTreeData,
    } = useHttp();
    // 获取企业信息
    const {
      fetchData: fetchCorpData,
    } = useHttp(`/patent-corp_api/corps/${$route.query.objectId}`);
    const renderFormData = async (clientId) => {
      // 若没有，就重新请求授权详情
      if (!authInfo.value.authId) {
        await getAuthInfoList();
      }
      await getAuthInfoDetail(clientId || $route.query.id);
      const data = authInfo.value;
      state.formData = {
        ...state.formData, ...data,
      };
      state.formData.termValidity = [data.startTime, data.endTime];
      state.formData.roleId = (data.roles || []).map(item => item.optId);
      const reduceOpt = (opts, id = 'uid') => (opts || []).reduce((prev, next) => {
        if (next[id]) {
          if (prev[next[id]]) {
            prev[next[id]].push(next);
          } else {
            prev[next[id]] = [next];
          }
        }
        return prev;
      }, {});
      const groupOpts = reduceOpt(treeDataList.value, 'pid');
      const funOpts = reduceOpt(treeDataList.value);
      const arr = (data.operations || []).map((item) => {
        const obj = funOpts[item.optId];
        if (obj && obj.length > 0) {
          const [fun] = obj;
          if (groupOpts[fun.id]) {
            return undefined;
          }
          return fun;
        }
        return undefined;
      });
      $nextTick(() => {
        treeNode.value.setCheckedNodes(arr);
      });
    };
    onMounted(async () => {
      await fetchCorpStaffData();
      await fetchRoleList();
      treeDataUrl.value = `/patent-corp_api/permission-opts?objectId=${userInfo.value.staffId}&objectType=staff`;
      await fetchTreeData();
      state.treeData = utils.arrayToTree(treeDataList.value);
      $nextTick(() => {
        changeTreeNodeCss();
      });
      // 从授权管理页面进来
      if ($route.query.id) {
        await renderFormData();
        if (state.formData.objectType === 'client') {
          state.isClient = true;
          state.formData.clientId = state.formData.objectId;
        }
      }
      // 从企业管理进来
      if ($route.query.objectId) {
        const data = await fetchCorpData();
        state.formData.objectName = data.name;
        state.formData.clientId = data.clientId;
        state.isClient = true;
        await renderFormData(data.clientId);
      }
      state.loading = false;
    });
    const handleCheckChange = () => {
      state.checkTreeNode = treeNode.value.getCheckedNodes(false, true);
    };
    const {
      url: submitUrl,
      postData: postFormData,
      putData: putFormData,
    } = useHttp();
    const handleSubmit = () => {
      viewForm.value.validate(async (valid) => {
        if (!valid) {
          state.timer = setTimeout(() => {
            const isError = document.getElementsByClassName('is-error');
            window.scrollTo(0, isError[0].offsetTop - 120);
          }, 1);
          return;
        }
        try {
          const { formData } = state;
          const operations = state.checkTreeNode.map(item => ({ optId: item.uid }));
          const roles = formData.roleId.map(item => ({ optId: item }));
          const params = {
            description: formData.description,
            startTime: formData.termValidity[0],
            endTime: formData.termValidity[1],
            objectId: state.isClient ? formData.clientId : formData.objectId,
            objectType: state.isClient ? 'client' : 'staff',
            operations,
            roles,
          };
          if (authInfo.value.authId) {
            submitUrl.value = `/patent-corp_api/permissions/${authInfo.value.authId}`;
            await putFormData(params);
            $message.success('编辑成功');
          } else {
            submitUrl.value = '/patent-corp_api/permissions';
            await postFormData(params);
            $message.success('新增成功');
          }
          $router.back();
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
    onUnmounted(() => {
      if (state.timer) {
        // 清除定时器
        clearTimeout(state.timer);
        state.timer = null;
      }
      setAuthInfo({});
    });

    return {
      ...toRefs(state),
      viewForm,
      treeNode,
      corpStaffList,
      handleCheckChange,
      handleSubmit,
      roleListData,
      authInfo,
    };
  },
});
</script>
<style lang="scss" scoped>
::v-deep {
  .tree-node>div {
    margin-bottom: 12px;
    padding: 8px;
    border: 1px solid #e4e4e485;
    box-shadow: 0px 0px 5px rgba(200, 200, 200, 0.23);
  }
  .tree-node>div:hover, .tree-node>div:focus {
      -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  .el-tree-node:hover {
    background-color: unset;
  }
  .tree-node .el-tree-node__children {
    display: flex;
    flex-wrap: wrap;
  }
  .tree-node .el-tree-node__content {
    margin-bottom: 6px;
    background-color: unset;
  }
  .node-label-1 {
    font-size: 15px;
    font-weight: 700;
    color: #303133;
  }
  .auth-footer {
    padding-top: 10px;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .page-title {
    margin-bottom: 12px;
  }
}
</style>
