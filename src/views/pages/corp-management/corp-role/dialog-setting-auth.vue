<template>
  <div class="dialog-setting-auth">
    <el-dialog
      title="角色授权"
      :visible.sync="dialogVisible"
      width="66%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      append-to-body
      custom-class="dialog-setting-auth"
    >
      <el-tree
        v-loading="loading"
        ref="treeNode"
        class="tree-node"
        :data="treeData"
        node-key="uid"
        show-checkbox
        check-on-click-node
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="submitLoading"
          @click="handleSubmit"
          >授 权</el-button
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
} from '@vue/composition-api';
import { useHttp } from '@/hooks/http';
import PageTitle from '@/components/page-title.vue';
import utils from '@/utils';
import { useUserInfo } from '@/context';

export default defineComponent({
  name: 'DialogSettingAuth',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    roleId: String,
  },
  components: { PageTitle },
  setup(props, context) {
    const { $nextTick, $message } = context.root;
    const { emit } = context;
    const state = reactive({
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      checkTreeNode: [],
    });
    const dialogVisible = computed({
      get() {
        return props.visible;
      },
      set(val) {
        emit('update:visible', val);
      },
    });
    const treeNode = ref(null);
    const { userInfo } = useUserInfo();

    // 获取全部权限信息
    const {
      loading,
      data: treeDataList,
      fetchData: fetchTreeData,
    } = useHttp(`/patent-corp_api/permission-opts?objectId=${userInfo.value.staffId}&objectType=staff`);
    // 改变tree样式
    const changeTreeNodeCss = () => {
      const levelName = document.getElementsByClassName('levelname');
      levelName.forEach((item) => {
        item.parentNode.parentNode.style.width = '100%';
      });
    };
    const renderAuthTree = async () => {
      await fetchTreeData();
      state.treeData = utils.arrayToTree(treeDataList.value);
      $nextTick(() => {
        changeTreeNodeCss();
      });
    };

    // 获取角色权限信息
    const {
      url: roleAuthUrl,
      data: roleAuthData,
      fetchData: fetchRoleAuth,
    } = useHttp();
    const renderRoleAuth = async () => {
      roleAuthUrl.value = `/patent-corp_api/roles/${props.roleId}/opt`;
      await fetchRoleAuth();
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
      const arr = (roleAuthData.value || []).map((item) => {
        const obj = funOpts[item.uid];
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

    const handleCheckChange = () => {
      state.checkTreeNode = treeNode.value.getCheckedNodes(false, true);
    };
    const {
      loading: submitLoading,
      url: submitUrl,
      putData: putRoleAuth,
    } = useHttp();
    const handleSubmit = async () => {
      try {
        const options = state.checkTreeNode.map(item => item.uid);
        submitUrl.value = `/patent-corp_api/roles/${props.roleId}/opt`;
        await putRoleAuth({ options });
        $message.success('授权成功!');
        dialogVisible.value = false;
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    watch(() => props.visible, async (val) => {
      if (val) {
        await renderAuthTree();
        await renderRoleAuth();
      }
    });
    return {
      ...toRefs(state),
      loading,
      dialogVisible,
      treeNode,
      submitLoading,
      handleSubmit,
      handleCheckChange,
    };
  },
});
</script>

<style lang="scss" scoped>
::v-deep {
  .tree-node {
    min-height: 656px;
  }
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
}
</style>
