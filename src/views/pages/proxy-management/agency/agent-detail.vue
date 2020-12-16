<template>
  <div>
    <div class="back-tool">
        <el-button @click="$router.back()" size="mini">
          <i class="el-icon-arrow-left" />
          返回
        </el-button>
      </div>

    <div v-loading="loading">
      <page-card>
        <div class="agent-detail">
          <div class="top_info">
            <div class="name_info">
              <label class="name_class">{{ agentDetailData.name }}</label>
            </div>
            <div class="name_info name_level" v-show="agentDetailData.agentGradeName != null">
              <span class="agentGradeName_class">{{ agentDetailData.agentGradeName }}</span>
            </div>
          </div>
          <descriptions
            :column="4"
            :label-width="80"
          >
            <descriptions-item label="在职状态" :value="agentDetailData.isWorking" />
            <descriptions-item label="联系电话" :value="agentDetailData.telephone" />
            <descriptions-item label="邮箱地址" :value="agentDetailData.email" />
            <descriptions-item label="代理人角色" :value="agentDetailData.agentRoleName" />
          </descriptions>
        <div>
          <label style="color: #757575;margin-left:18px;">擅长领域:</label>
          <label class="label-value domain" v-for="(v, i) in adeptDomainName" :key="i">
            <span class="domaincontent">
              {{ v }}
            </span>
          </label>
        </div>
       </div>
      </page-card>
    </div>
  </div>
</template>

<script>
import {
  defineComponent, onMounted, reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import utils from '@/utils';
import PanelSelectGroup from '@/components/panel-select-group.vue';
import { useHttp } from '@/hooks/http';
import DynamicFields from '@/components/dynamic-fields.vue';
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
  name: 'AgentDetail',
  components: {
    DynamicFields,
    PanelSelectGroup,
  },
  setup(_, context) {
    const { $route } = context.root;
    const dynamicForm = ref(null);
    const state = reactive({
      stepDetail: {},
      fields: [],
      formData: {},
      experts: null,
      visibleAddPlat: false,
      isClaim: null,
      tagList: [],
      adeptDomainName: [],
    });

    const {
      loading,
      data: agentData,
      fetchData: fetchAgentData,
    } = useHttp(`/patent-corp_api/agents/${$route.query.id}`);

    onMounted(async () => {
      await fetchAgentData();
      console.log(agentData);
      if (agentData.value.adeptDomainName) {
        state.adeptDomainName = agentData.value.adeptDomainName.split(',');
      }
    });
    const agentDetailData = computed(() => {
      const data = cloneDeep(agentData.value) || {};
      // eslint-disable-next-line no-nested-ternary
      data.isWorking = data.isWorking !== null ? (data.isWorking === true ? '在职' : '离职') : '';

      return data;
    });

    return {
      ...toRefs(state),
      loading,
      agentData,
      utils,
      dynamicForm,
      agentDetailData,
    };
  },
});
</script>

<style lang="scss" scoped>
.back-tool {
  // position: absolute;
  top: 8px;
  right: 40px;
  margin-bottom: 10px;
}
.page-container .page {
  margin: 0;
}
.detail-top {
  margin-bottom: 20px;
  width: 100%;
  height: 40px;
  line-height: 40px;
  background-color: white;
  .preliminary-review-title {
    float: left;
    margin-left: 20px;
    font-size: 16px;
    .border-blue {
      display: inline-block;
      width: 4px;
      background-color: #0079fe;
      height: 16px;
      margin-right: 10px;
    }
  }
  .preliminary-review-button {
    float: right;
    margin-right: 5%;
    .dialog-btn {
      height: 25px;
      width: 74px;
      line-height: 0;
      color: #016eff;
      border-color: #016eff;
      padding: 0;
    }
  }
}
::v-deep {
    .el-card__body {
      padding: 0px;
    }
  }
.agent-detail {

  .name_class {
    margin-top: 30px;
    border-width: 0px;
    width: 48px;
    height: 32px;
    font-family: "PingFangSC-Medium", "PingFang SC Medium", "PingFang SC", sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 24px;
    margin-left:18px;
  }
  .label-key {
    margin-left: 200px;
  }
  .label-value {
    margin-left: 10px;
  }
  .domain {
    border-width: 1px;
    border: 1px solid;
    left: 130px;
    top: 156px;
    width: 58px;
    height: 24px;
    font-family: "PingFangSC-Regular", "PingFang SC", sans-serif;
    font-style: normal;
    font-size: 12px;
    color: #ff7e01;
    padding: 2px 2px 2px 2px;
    border-radius: 3px;
  }
  .top_info {
    width: 100%;
    width: 1200px;
    height: 50px;
  }

  .name_info {
    float: left;
  }

  .agentGradeName_class {
    border-width: 0px;
    margin-left: 10px;
    width: 48px;
    height: 32px;
    background: inherit;
    background-color: rgba(255, 126, 1, 1);
    border: none;
    border-radius: 3px;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    font-family: "PingFangSC-Regular", "PingFang SC", sans-serif;
    font-weight: 400;
    font-style: normal;
    color: #ffffff;
    padding: 3px 3px 3px 3px;
  }

  padding-top: 20px;
  padding: 20px 40px 2px 40px;
  height: 150px;
 background-color: rgba(239, 249, 255, 1);
  font-family: "PingFangSC-Regular", "PingFang SC", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  text-align: left;
  line-height: 38px;

}

</style>
