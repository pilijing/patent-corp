<template>
  <div class="process-view">
    <div class="process-head">
      <el-form :model="searchData"
              label-width="0"
              class="form-search"
              style="display: flex;justify-content: space-between;"
      >
        <div class="form-left">
          <el-form-item class="form-radio">
            <el-radio-group v-model="searchData.state" size="small">
              <el-radio v-for="item in prosessStateList"
                                  :label="item.id"
                                  :key="item.id"
                                  border
              >
                                  {{item.name}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="form-radio">
            <el-radio-group v-model="searchData.isValid" size="small">
              <el-radio v-for="item in validList"
                                  :label="item.id"
                                  border
                                  :key="item.id"
              >
                                  {{item.name}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label=""
            class="from-country"
          >
            <selector-country
              autocomplete="new-password"
              v-model="searchData.regionCode"
              placeholder="国家"
              size="small"
            />
          </el-form-item>
          <el-form-item
            label=""
            class="from-type"
          >
            <panel-select
              v-model="searchData.applicationType"
              placeholder="申请类型"
              type="APPLY_TYPE"
              size="small"
            />
          </el-form-item>
          <el-form-item
            label=""
            class="from-type"
          >
            <panel-select
              v-model="searchData.patentType"
              placeholder="专利类型"
              type="PATENT_TYPE"
              size="small"
            />
          </el-form-item>
           <el-form-item
            label=""
            prop="termValidity"
          >
            <el-date-picker
              v-model="searchData.termValidity"
              type="daterange"
              range-separator="-"
              start-placeholder="生效日期"
              end-placeholder="失效日期"
              class="date-picker"
              size="small"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="" class="search-name">
            <el-input placeholder="输入流程关键字进行搜索"
                      clearable
                      v-model="searchData.name"
                      size="small">
              <!-- <i class="el-icon-search" slot="suffix" @click="handleClickSearch"></i> -->
            </el-input>
          </el-form-item>
        </div>
        <el-button type="primary"
                   size="small"
                   @click="handleClickSearch"
                   class="search-btn">查询</el-button>
     </el-form>
    </div>
    <div class="card-wrap">
      <page-card class="card" @click.native="handleNewProcess" shadow="hover">
          <div class="edit-process">
              <span class="el-icon-plus"></span>
              <span>新建流程</span>
          </div>
      </page-card>
      <page-card v-for="(item, index) in decorateCardData"
                 :key="index"
                 :title="item.name"
                 :subtitle="item.applicationTypeName"
                 class="card"
                 @click.native="handleToDetail(item)"
                 :class="{'card-cursor': (item.invalidState || item.state === processType.DISABLE)}"
                 >
        <div class="card-body">
          <div class="card-detail">
            <div class="process-regions" v-if="item.regionNameList.length > 0">
              <span>应用国家地区：</span>
              <span :title="item.regionNameList.join(',')">{{item.regionNameList.join(',')}}</span>
            </div>
            <div>
              <span>有效期：</span>
              <span>{{item.effectiveDate}}~{{item.invalidDate}}</span>
            </div>
            <div class="patent-type">{{ (item.patentType).join(',') }}</div>
          </div>
          <div class="card-bottom"  @click.stop="handleClicShield">
            <el-button type="text"
                       icon="el-icon-edit"
                       @click.stop="handleEditProcess(item.id)"
                       :disabled="item.invalidState || item.state === processType.DISABLE">编辑</el-button>
            <el-button type="text" icon="el-icon-copy-document">克隆</el-button>
            <el-button type="text"
              icon="el-icon-remove-outline"
              :class="{highlight: item.state === processType.DISABLE}"
              @click="handleProcessState(item)"
            >
              {{item.state === processType.ENABLE ? '禁用': '启用'}}
            </el-button>
          </div>
        </div>
        <div class="invalid-bg" v-if="item.invalidState">
          <img src="../../../../assets/invalid.png" />
        </div>
      </page-card>
    </div>
    <dialog-new-process :visible.sync="dialogNewProcess"
                        :is-add-process="isAddProcess"
                        :decorate-process-id="decorateProcessId" />
  </div>
</template>

<script lang="ts">
import {
  reactive, toRefs, defineComponent, computed, onMounted,
} from '@vue/composition-api';
import { useLookupsInject, useRegionsInject } from '@/context';
import PageCard from '@/components/page-card.vue';
import SelectorCountry from '@/components/selector-country.vue';
import PanelSelect from '@/components/panel-select.vue';
import PanelCheckbox from '@/components/panel-checkbox.vue';
import utils from '@/utils';
import { useHttp } from '@/hooks/http';
import DialogNewProcess from '../blocks/dialog-new-process.vue';

interface State {
  dialogNewProcess: boolean;
  searchData: {
    regionCode: string;
    termValidity: string[];
    applicationType: undefined;
    state: number;
    isValid: number;
    name: string;
  };
  validList: object[];
  isAddProcess: boolean;
  decorateProcessId: undefined | number;
}
interface CardData{
  results: object[];
  total: number;
}

interface CardResults{
  id: number;
  name: string;
  applicationType: number;
  applicationTypeName: string | undefined;
  effectiveDate: string;
  expirationDate: string;
  processRegions: object[];
  isUtility: boolean;
  isInvention: boolean;
  isDesign: boolean;
  state: number;
  stateName: number;
  invalidDate: string;
  invalidState: boolean;
  regionNameList: any[];
}

export default defineComponent({
  name: 'processView',
  components: {
    PageCard,
    PanelSelect,
    PanelCheckbox,
    SelectorCountry,
    DialogNewProcess,
  },
  setup(_, context: any) {
    const { $router, $message } = context.root;
    const {
      getEnumsInfo,
      sortLookups,
      getTypeName,
    } = useLookupsInject();
    const {
      getRegionName,
    } = useRegionsInject();
    const processType = computed(() => getEnumsInfo('PROCESS_STATE'));
    const prosessStateList = computed(() => sortLookups.value.PROCESS_STATE);
    const patentTypeList = computed(() => getEnumsInfo('PATENT_TYPE'));
    const state = reactive<State>({
      dialogNewProcess: false,
      searchData: {
        isValid: 1,
        regionCode: '',
        applicationType: undefined,
        termValidity: [],
        name: '',
        state: processType.value.ENABLE || 301,
      },
      validList: [
        { id: 1, name: '有效' },
        { id: 0, name: '失效' },
      ],
      isAddProcess: false,
      decorateProcessId: undefined,
    });
    const parmes = computed(() => {
      const ret = {
        ...state.searchData,
        limit: 0,
        offset: 0,
        effectiveDate: state.searchData.termValidity ? state.searchData.termValidity[0] : '',
        expirationDate: state.searchData.termValidity ? state.searchData.termValidity[1] : '',
        applicationType: state.searchData.applicationType || 0,
      };
      return ret;
    });
    const {
      loading: cardLoading,
      data: cardData,
      fetchData: fetchCardData,
    } = useHttp('/patent-corp_api/process');
    onMounted(async () => {
      await fetchCardData({
        ...parmes.value,
      });
    });
    const decorateCardData = computed(() => {
      const cardValue = cardData.value as unknown as CardData;
      const data = (cardValue || {}).results as unknown as CardResults[];
      const { dateFormat } = utils;
      const innerCardData = (data || []).map((item) => {
        const newDateTime = new Date(dateFormat(new Date(), 'yyyy-MM-DD 00:00:00')).getTime();
        const theDateTime = new Date(dateFormat(item.expirationDate, 'yyyy-MM-DD 00:00:00')).getTime();
        if (newDateTime > theDateTime) {
          item.invalidState = true;
        }
        item.effectiveDate = dateFormat(item.effectiveDate, 'yyyy-MM-DD');
        item.invalidDate = dateFormat(item.expirationDate, 'yyyy-MM-DD');
        const patentType: string[] = [];
        if (item.isInvention) {
          patentType.push(getTypeName(patentTypeList.value.INVENTION) ?? '');
        }
        if (item.isUtility) {
          patentType.push(getTypeName(patentTypeList.value.PRACTICAL) ?? '');
        }
        if (item.isDesign) {
          patentType.push(getTypeName(patentTypeList.value.FACADE) ?? '');
        }
        item.applicationTypeName = getTypeName(item.applicationType);
        item.regionNameList = (item.processRegions || []).map((region: any) => getRegionName(region.regionCode));
        return {
          ...item,
          patentType,
        };
      });
      return [...innerCardData];
    });
    const handleClickSearch = async () => {
      await fetchCardData({
        ...parmes.value,
      });
    };
    // 新建
    const handleNewProcess = () => {
      state.dialogNewProcess = true;
      state.isAddProcess = true;
      state.decorateProcessId = undefined;
    };
    // 编辑
    const handleEditProcess = (id: undefined | number) => {
      state.dialogNewProcess = true;
      state.isAddProcess = false;
      state.decorateProcessId = id;
    };
    // 禁用
    const { url: processStateUrl, putData: putProcessState } = useHttp();
    const handleProcessState = async (item: any) => {
      try {
        processStateUrl.value = `/patent-corp_api/process/${item.id}/state`;
        await putProcessState({
          state: item.state === processType.value.ENABLE ? processType.value.DISABLE : processType.value.ENABLE,
        });
        await fetchCardData({
          ...parmes.value,
        });
      } catch (error) {
        console.log('error', error);
        if (error.response) {
          $message.error(error.response.data);
        } else {
          $message.error('操作失败');
        }
      }
    };
    // 底部按钮屏蔽父组件点击事件
    const handleClicShield = () => false;
    const handleToDetail = (item: CardResults) => {
      if (item.invalidState || item.state === processType.value.DISABLE) {
        handleClicShield();
      } else {
        $router.push(`/backstage-management/process-definition?id=${item.id}`);
      }
    };

    return {
      parmes,
      ...toRefs(state),
      processType,
      cardLoading,
      decorateCardData,
      prosessStateList,
      handleNewProcess,
      handleClickSearch,
      handleEditProcess,
      handleToDetail,
      handleClicShield,
      handleProcessState,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-wrap {
  width: 100%;
  display: flex;
  align-content: flex-start;
  flex-flow: row wrap;
}
.card{
  margin-right: 20px;
  position: relative;
  margin-bottom: 20px;
  flex: 1;
  width:250px;
  min-width: 230px;
  max-width: 230px;
  // height: 220px;
  cursor: pointer;
  width: 230px;
  height: 200px;
  .edit-process{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(1, 110, 255);
    font-size: 15px;
    .el-icon-plus {
      margin-right: 8px;
    }
  }
}
.card-cursor {
  cursor: default;
}
.process-head {
  height: 58px;
  // box-shadow: rgba(200, 200, 200, 0.23) 0px 0px 5px;
  display: flex;
  background-color: #fff;
  align-items: center;
  padding-right: 30px;
  margin-bottom: 20px;
  padding-left: 20px;
}
.form-search {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.form-left {
  flex: 1;
  display: flex;
  padding-right: 20px;
  .el-form-item {
    margin-right: 12px;
  }
  .form-radio {
    flex-shrink: 0;
  }
  .from-country {
    max-width: 188px;
  }
  .from-type {
    max-width: 188px;
  }
}
.date-picker {
  max-width: 220px;
}
.el-form-item {
  margin-bottom: 0;
}
.search-name {
  flex: 1;
  min-width: 180px;
}
.search-btn {
  border-radius: 3px;
}
.card-body{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  background-image: url('../../../../assets/card_bg.png');
  background-repeat:  no-repeat;
  background-size: 100%;
}
.card-detail{
  font-size: 12px;
  color: #666666;
  display: flex;
  flex-direction: column;
  height: 78px;
  justify-content: space-between;
}
.card-detail div{
  margin-bottom: 8px;
}
.patent-type {
  margin-top: 6px;
  color: #FFB82E;
}
.process-regions{
  // height: 32px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.card-bottom{
  width: 100%;
  display: flex;
  justify-content: space-between;
  .el-button :hover{
    color: #0079FE;
  }
  .el-button.is-disabled :hover{
    color: #C3C3C3;
  }
}
.invalid-bg {
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  img {
    width: 100%;
    height: 100%;
  }
}
::v-deep {
  .el-form-item__content {
    line-height: 0;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #ffffff;
    background-color: rgb(1, 110, 255);
  }
  .card .el-card__header{
    border: 0;
    padding: 26px 20px 16px 20px;
    color: #333333;
  }
  .el-card__body{
    flex: 1;
    padding-top: 2px;
  }
  .el-button--text {
    font-size: 12px;
    color: #C3C3C3;
    i {
      font-size: 15px;
    }
  }
  .highlight {
    color: #0079FE;
  }
  .el-input__suffix-inner {
    color: #666666;
    font-size: 18px;
    cursor: pointer;
    margin-right: 4px;
    line-height: 32px;
  }
  .card-title{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100px;
  }
}
</style>
