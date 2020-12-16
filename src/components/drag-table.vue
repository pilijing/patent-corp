<template>
  <div class="app-container">
    <el-table ref="dragTable"
      :data="listTable"
      row-key="id"
      style="width: 100%"
    >
      <slot />
    </el-table>
  </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
  name: 'DragTable',
  props: {
    value: Array,
    isCanDrag: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      sortable: null,
    };
  },
  computed: {
    listTable: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    isCanDrag: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.getList();
        } else {
          this.sortable = null;
        }
      },
    },
  },
  methods: {
    async getList() {
      this.$nextTick(() => {
        this.setSort();
      });
    },
    setSort() {
      // eslint-disable-next-line prefer-destructuring
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        // setData(dataTransfer) {
        //   dataTransfer.setData('Text', '');
        // },
        onEnd: (evt) => {
          // eslint-disable-next-line prefer-destructuring
          const targetRow = this.listTable.splice(evt.oldIndex, 1)[0];
          this.listTable.splice(evt.newIndex, 0, targetRow);
        },
      });
    },
  },
};
</script>

<style>
.sortable-ghost{
  opacity: .8;
  color: #fff !important;
  background: #95BFFF  !important;
}
</style>

<style scoped>
.icon-star{
  margin-right: 2px;
}
.drag-handler{
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d{
  margin-top: 15px;
}
</style>
