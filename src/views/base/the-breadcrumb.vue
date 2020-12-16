<template>
  <div class="breadcrumb">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item
        v-for="breadcrumb in breadcrumbList"
        :key="breadcrumb.id"
        :to="breadcrumb.router && breadcrumb.router !== $route.path ? breadcrumb.router : ''"
      >
        <i
          v-if="breadcrumb.icon"
          style="margin-right: 5px;"
          :class="`el-icon-${breadcrumb.icon}`"
        />
        <span>{{ breadcrumb.name }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
export default {
  name: 'TheBreadcrumb',
  props: {
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    breadcrumbList() {
      const ret = [];
      const setBreadcrumb = (current) => {
        ret.unshift(current);
        if (current.bpid) {
          setBreadcrumb(this.list.find(item => item.id === current.bpid));
        }
      };
      const current = this.list.find(item => item.router === this.$route.path);
      if (!current) {
        return ret;
      }
      setBreadcrumb(current);
      return ret;
    },
  },
};
</script>
<style lang="scss" scoped>
.breadcrumb {
  padding: 18px;
  position: sticky;
  top: 0px;
  z-index: 999;
  background: #fff;
  box-shadow: 0 1px 2px #e0e1e2;
}
</style>
