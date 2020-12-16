<template>
  <div
    id="selection"
    class="claims-selection"
  >
    <div class="selection-aside">
      <p class="font_title claims-title">
        {{ isOfficialClaim ? "选择来文" : "选择请求" }}
      </p>
      <draggable
        type="transition"
        v-model="getOfficialClaimListState.data"
        @end="dragEnd"
        v-bind="dragOptions"
        v-loading="getOfficialClaimListState.loading"
      >
        <div
          class="menu-list"
          :class="activeMenu === item.id ? 'active' : ''"
          v-for="item in getOfficialClaimListState.data"
          :key="item.id"
        >
          <i
            class="el-icon-delete"
            @click="handleDelete(item.id)"
          />
          <span
            class="name"
            @click="handleMenuClick(item.id)"
            :title="item.name"
          >
            {{ item.name }}
          </span>
          <i
            class="el-icon-edit-outline"
            @click="handleEdit(item)"
          />
        </div>
      </draggable>
    </div>

    <div
      class="add_button"
      @click="(visibleAddPlat = true), (platformData = {})"
    >
      {{ isOfficialClaim ? "+ 添加来文" : "+ 添加请求" }}
    </div>
    <dialog-add-claims
      :visible.sync="visibleAddPlat"
      :data="platformData"
      @success="addPlatSuccess"
      :process-id="processId"
    />
  </div>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  computed,
  defineComponent,
  onMounted,
  watch,
} from '@vue/composition-api';

import { useHttp } from '@/hooks/http';
import Draggable from 'vuedraggable';
import {
  useClaimTypeInject,
  useLookupsInject,
  useOfficialClaimsInject,
} from '@/context';
import dialogAddClaims from './dialog-add-claims.vue';

export default defineComponent({
  name: 'EventSelection',
  props: {
    data: Number,
    processId: Number,
    claimTypeId: Number,
  },
  components: {
    dialogAddClaims,
    Draggable,
  },
  setup(props, context) {
    const { $confirm, $route, $message } = context.root;
    const { emit } = context;
    const state = reactive({
      activeMenu: null as number | null,
      visibleAddPlat: false,
      filter: {},
      multipleSelection: [],
      platformData: {},
    });
    const dragOptions = computed(() => ({
      animation: 200,
      disabled: false,
      ghostClass: 'ghost',
    }));

    const processId = Number($route.query.id);
    const processStageId = Number(props.processId);

    const {
      getOfficialClaimListState,
      getOfficialClaimList,
    } = useOfficialClaimsInject();

    const { curClaimsTypeId } = useClaimTypeInject();

    watch(curClaimsTypeId, async (id) => {
      if (id === props.claimTypeId) {
        await getOfficialClaimList(processId, processStageId, id);
        if (getOfficialClaimListState.error !== null) {
          $message.error(getOfficialClaimListState.error?.response?.data);
          return;
        }
        // 自动选择列表中第一个，如果列表长度大于0
        if (
          state.activeMenu === null
          && getOfficialClaimListState.data.length > 0
        ) {
          handleMenuClick(getOfficialClaimListState.data[0].id);
        }
      }
    });

    onMounted(async () => {
      if (curClaimsTypeId.value) {
        await getOfficialClaimList(
          processId,
          processStageId,
          curClaimsTypeId.value,
        );
        if (getOfficialClaimListState.error !== null) {
          $message.error(getOfficialClaimListState.error?.response?.data);
        }
      }
    });

    // 添加成功之后
    const addPlatSuccess = () => {
      if (curClaimsTypeId.value) {
        getOfficialClaimList(processId, processStageId, curClaimsTypeId.value);
      }
    };
    // 编辑
    const handleEdit = (item: any) => {
      state.platformData = item;
      state.visibleAddPlat = true;
    };
    // 删除
    const { url: deleteUrl, deleteData } = useHttp();
    const handleDelete = (id: unknown) => {
      deleteUrl.value = `/patent-corp_api/stage-claims/${id}`;
      $confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        await deleteData(id);
        $message.success('删除成功!');

        if (curClaimsTypeId.value) {
          await getOfficialClaimList(
            processId,
            processStageId,
            curClaimsTypeId.value,
          );
        }
      });
    };
    const { url: sortUrl, putData: putProcess } = useHttp();
    const dragEnd = async () => {
      const idData = getOfficialClaimListState.data.map(item => item.id);
      const listSortData = {
        processStageId: Number(props.processId),
        stageClaimsIds: idData,
      };
      sortUrl.value = '/patent-corp_api/stage-claims-priority';
      await putProcess(listSortData);
    };

    const { officialClaimTypeId } = useLookupsInject();
    const isOfficialClaim = computed(() => curClaimsTypeId.value === officialClaimTypeId.value);

    function handleMenuClick(id: number | null) {
      state.activeMenu = id;
      emit('update:switch', state.activeMenu);
    }

    return {
      ...toRefs(state),
      handleDelete,
      handleEdit,
      addPlatSuccess,
      dragOptions,
      dragEnd,
      getOfficialClaimListState,
      isOfficialClaim,
      handleMenuClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.claims-selection {
  width: 135px;
}
.selection-aside {
  width: 100%;
}

.claims-title {
  text-align: center;
  height: 50px;
  line-height: 50px;
}

.menu-list {
  text-align: center;
  cursor: pointer;
  text-align: left;
  display: flex;
  padding: 0 10px;
  color: black;
  .name {
    flex-grow: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: center;
    height: 36px;
    line-height: 36px;
    padding: 0 5px;
  }
  i {
    opacity: 0;
    height: 36px;
    line-height: 36px;
  }
  &:hover i {
    opacity: 1;
  }
}
.active {
  background: #fff;
  color: #016eff;
  background-color: #edf8ff;
}
.add_button {
  cursor: pointer;
  margin-top: 20px;
  border: 1px solid #abdbf6;
  background-color: #f4fbff;
  width: 100px;
  height: 30px;
  line-height: 30px;
  margin: auto;
  padding: initial;
  margin-top: 20px;
  text-align: center;
}
</style>
