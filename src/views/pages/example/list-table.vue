<template>
  <div class="list-table">
    <el-card>
      <table-filter>
        <table-filter-item label="腾讯号">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item label="申请类型">
          <el-select v-model="select" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </table-filter-item>
        <table-filter-item label="当前阶段">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item label="当前事件">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item label="工作时限">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="起始"
            end-placeholder="结束">
          </el-date-picker>
        </table-filter-item>
        <table-filter-item label="腾讯号2">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item label="腾讯号3">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item label="腾讯号4">
          <el-input v-model="input" placeholder="请输入内容"></el-input>
        </table-filter-item>
        <table-filter-item class="query-btn">
          <el-button type="primary" @click="handleQuery">查 询</el-button>
          <el-button @click="handleReset">重 置</el-button>
        </table-filter-item>
      </table-filter>
    </el-card>
    <el-card class="table">
      <table-paging
        v-loading="tableLoading"
        :data="tableData"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <el-table-column prop="number" label="腾讯号" />
        <el-table-column prop="name" label="专利名称" />
        <el-table-column prop="type" label="申请类型" />
        <el-table-column prop="status" label="当前阶段" />
        <el-table-column prop="event" label="当前事件" />
        <el-table-column prop="time" label="工作时限" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <a class="btn" @click="handleEditItem(row)">修改</a>
            <el-divider direction="vertical" />
            <a class="btn" @click="handleDeleteItem(row)">删除</a>
          </template>
        </el-table-column>
      </table-paging>
    </el-card>
    <el-card>
      <draggable
        type="transition"
        v-model="myArray"
        handle=".drag"
        @end="dragEnd"
        v-bind="dragOptions"
      >
      <div v-for="element in myArray" :key="element.id">
        <div class="drag">{{element.name}}</div>
      </div>
      </draggable>
    </el-card>
    <el-card>
      <upload-attachment drag v-model="attachments" />
    </el-card>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import TableFilter from '@/components/table-filter.vue';
import TableFilterItem from '@/components/table-filter-item.vue';
import TablePaging from '@/components/table-paging.vue';
import { usePagingData } from '@/hooks/pagination';
import Draggable from 'vuedraggable';
import UploadAttachment from '@/components/upload-attachment.vue';

interface State {
  input: string;
  select: string;
  options: object[];
  dateRange: string[];
  pagination: object;
  myArray: object[];
  attachments: object[];
}

export default defineComponent({
  name: 'ListTable',
  components: {
    TableFilter,
    TableFilterItem,
    TablePaging,
    Draggable,
    UploadAttachment,
  },
  setup() {
    const state = reactive<State>({
      input: '',
      select: '',
      options: [],
      dateRange: [],
      pagination: {
        limit: 20,
        offset: 0,
        total: 0,
      },
      myArray: [
        { id: 1, name: 'first', index: 1 },
        { id: 2, name: 'second', index: 2 },
        { id: 3, name: 'third', index: 3 },
      ],
      attachments: [],
    });

    const dragOptions = computed(() => ({
      animation: 200,
      disabled: false,
      ghostClass: 'ghost',
    }));

    const {
      loading: tableLoading,
      data: tableData,
      pagination,
      fetchList,
      handlePageChange,
    } = usePagingData('/patent-corp_api/list-table');
    fetchList();
    // method
    const handleQuery = () => {
      fetchList();
    };
    const handleReset = () => {
      fetchList();
    };
    const handleEditItem = (row: object) => {
      console.info(row);
    };
    const handleDeleteItem = (row: object) => {
      console.info(row);
    };

    const dragEnd = () => {
      console.info(state.myArray);
    };
    return {
      ...toRefs(state),
      handleQuery,
      handleReset,
      handlePageChange,
      handleEditItem,
      handleDeleteItem,
      tableLoading,
      pagination,
      tableData,
      dragEnd,
      dragOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.list-table {
  .query-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .table {
    margin-top: 20px;
  }
  .drag {
    border: 1px solid #eee;
    padding: 15px;
  }
}
</style>
