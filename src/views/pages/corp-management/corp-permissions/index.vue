<template>
  <div class="permissions">
    <page-card>
      <el-button
        type="primary"
        class="add-btn"
        size="medium"
        icon="el-icon-plus"
        @click="$router.push('/corp-management/auth-add')"
      >新增
      </el-button>
      <div class="permissions-detail">
        <page-card
          v-for="(item, index) in permissionsDetail"
          :key="index"
          class="card-detail">
          <descriptions :column="1">
            <descriptions-item label="授权描述" >
              <span :title="item.description" class="auth-description">{{item.description}}</span>
            </descriptions-item>
            <descriptions-item label="授权时间" :value="item.permissionsTime" />
            <descriptions-item label="授权对象" :value="item.objectName" />
            <descriptions-item label="授予角色" class="operations-name">
              <span :title="item.roleName">{{item.roleName}}</span>
            </descriptions-item>
            <descriptions-item label="授予权限" class="operations-name">
             <span :title="item.operationName">{{item.operationName}}</span>
            </descriptions-item>
          </descriptions>
          <div class="btn-wrapper" v-if="canEdit(item)">
            <el-button type="text" @click="handleEditAuth(item)">编辑</el-button>
            <el-button type="text" @click="handleDeleteAuth(item)">删除</el-button>
          </div>
        </page-card>
        <div class="el-table__empty-block" v-if="permissionsDetail.length === 0">
          <span class="el-table__empty-text">暂无数据</span>
        </div>
      </div>
    </page-card>
  </div>
</template>

<script>
import {
  defineComponent, reactive, toRefs, onMounted, computed,
} from '@vue/composition-api';
import PageCard from '@/components/page-card.vue';
import { useUserInfo, useAuthInject } from '@/context';
import utils from '@/utils';
import cloneDeep from 'lodash/cloneDeep';
import { useHttp } from '@/hooks/http';

export default defineComponent({
  name: 'Index',
  components: { PageCard },
  setup(_, context) {
    const {
      $router, $message, $confirm,
    } = context.root;
    const {
      setAuthInfo, getAuthInfoList, authInfoList,
    } = useAuthInject();
    const state = reactive({
      dialogPermissionsVisible: false,
    });
    const { userInfo } = useUserInfo();

    const permissionsDetail = computed(() => {
      const data = cloneDeep(authInfoList.value) || [];
      data.forEach((item) => {
        item.permissionsTime = `${utils.dateFormat(item.startTime)} ~ ${utils.dateFormat(item.endTime)}`;
        item.operationName = (item.operations || []).map(ele => `${ele.optName}`).join('；');
        item.roleName = (item.roles || []).map(ele => `${ele.optName}`).join('；');
      });
      return data;
    });

    const handleEditAuth = (item) => {
      setAuthInfo(item);
      $router.push(`/corp-management/auth-add?id=${item.authId}`);
    };

    const {
      url: deleteAuthUrl,
      deleteData: deleteAuth,
    } = useHttp();
    const handleDeleteAuth = (item) => {
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          deleteAuthUrl.value = `/patent-corp_api/permissions//${item.authId}`;
          await deleteAuth();
          await getAuthInfoList();
          $message.success('删除成功');
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

    const canEdit = item => userInfo.value.staffId !== item.objectId;

    onMounted(async () => {
      await getAuthInfoList();
    });

    return {
      ...toRefs(state),
      canEdit,
      permissionsDetail,
      handleEditAuth,
      handleDeleteAuth,
    };
  },
});
</script>
<style lang="scss" scoped>
.permissions-detail {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  margin: 10px 0 ;
}
.btn-wrapper {
  position: absolute;
  top: 10px;
  right: 20px;
  background-color: #fff;
}
::v-deep {
  .el-card__body {
    position: relative;
  }
  .card-detail {
    width: 23.8%;
    margin-right: 1%;
    margin-bottom: 20px;
    .auth-description {
      display: block;
      padding-right: 40px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .card-detail .el-card__body {
    padding-bottom: 0;
  }
  .operations-name {
    align-items: flex-start;
  }
  .operations-name .wrap {
    -webkit-line-clamp: 4;
  }
  .el-button {
    margin: 0;
    margin-left: 3px;
  }
}
</style>
