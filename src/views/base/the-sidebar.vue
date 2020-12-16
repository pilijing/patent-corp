<template>
  <div>
    <el-menu
      :default-active="active"
      :default-openeds="opened"
      :router="true"
      :collapse="collapse"
      class="nav-menu el-menu-vertical-demo"
      @select="handleSelect"
      background-color="#1E232D"
      text-color="#888888"
      active-text-color="#fff"
    >
      <template v-for="rootMenu in menuTree">
        <el-submenu
          v-if="rootMenu.children"
          :key="rootMenu.id"
          :index="rootMenu.id"
        >
          <template slot="title">
            <template v-if="rootMenu.icon">
            <component :is="componentIcon[rootMenu.icon]" class="menu-icon" />
          </template>
            <span>{{ rootMenu.name }}</span>
          </template>
          <el-menu-item
            v-for="childMenu in rootMenu.children"
            :key="childMenu.id"
            class="second-item"
            :index="childMenu.id"
            :route="childMenu.router"
            @click="refreshPage(childMenu.router)"
          >
            <div class="title-wrapper">
              <span
                slot="title"
                style="padding-left: 10px;"
              >{{ childMenu.name }}</span>
              <!-- <span v-if="childMenu.msg && unreadMap[childMenu.msg]" class="msg">
                {{ unreadMap[childMenu.msg] | unreadNum }}
              </span> -->
            </div>
          </el-menu-item>
        </el-submenu>
        <el-menu-item
          v-else
          :key="rootMenu.id"
          :index="rootMenu.id"
          :route="rootMenu.router"
        >
          <template v-if="rootMenu.icon">
            <component :is="componentIcon[rootMenu.icon]" class="menu-icon" />
          </template>
          <span slot="title">{{ rootMenu.name }}</span>
        </el-menu-item>
      </template>

    </el-menu>
  </div>
</template>

<script>
import utils from '@/utils';
// import { mapGetters } from 'vuex';
import Application from '@/assets/svg/patent-application.svg';
import Workbench from '@/assets/svg/my-workbench.svg';
import Agent from '@/assets/svg/agent.svg';
import Backstage from '@/assets/svg/backstage.svg';
import Corp from '@/assets/svg/corp.svg';
import Expenses from '@/assets/svg/expenses.svg';
import Bill from '@/assets/svg/bill.svg';

export default {
  name: 'TheSidebar',
  props: {
    menu: {
      required: true,
      type: Array,
    },
    opened: {
      type: Array,
      default() {
        return ['0', '1'];
      },
    },
    collapse: Boolean,
  },
  components: {
    Application,
    Workbench,
    Agent,
    Backstage,
    Corp,
    Expenses,
    Bill,
  },
  data() {
    return {
      path: this.$route.path,
      isCollapse: false,
      componentIcon: {
        'icon-application': Application,
        'icon-workbench': Workbench,
        'icon-agent': Agent,
        'icon-backstage': Backstage,
        'icon-corp': Corp,
        'icon-expenses': Expenses,
        'icon-bill': Bill,
      },
    };
  },
  // filters: {
  //   unreadNum(num) {
  //     if (num > 99) {
  //       return '99+';
  //     }
  //     return num;
  //   },
  // },
  computed: {
    // ...mapGetters(['unreadMap']),
    menuTree() {
      return utils.arrayToTree(
        this.menu.filter(_ => _.mpid !== 'none'),
        'id',
        'mpid',
      );
    },
    // 默认被激活的菜单
    active() {
      const current = this.menu.find(item => item.router === this.$route.path);
      if (!current) return '';
      if (current.mpid === 'none') {
        // 如果是隐藏菜单，则取父级id
        return current.bpid;
      }
      return current.id;
    },
  },
  watch: {
    $route(route) {
      this.path = route.path;
    },
  },
  methods: {
    handleSelect() {
      // console.info(111);
    },
    refreshPage(path) {
      // 点击相同子菜单刷新页面
      if (path === this.path) {
        this.$emit('childByValue', new Date().toString());
      }
    },
  },
};
</script>
<style scoped lang='scss'>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
.nav-menu {
  height: 100vh;
  position: reactive;
  overflow: hidden auto;
}
.title-wrapper {
  padding-left: 5px;
}
.menu-icon {
  margin-right: 10px;
}
</style>
