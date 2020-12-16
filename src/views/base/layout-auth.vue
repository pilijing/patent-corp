<template>
  <el-container class="page-container">
    <div class="main">
      <div class="content">
        <the-sidebar
          :menu="authMenu"
          :active="activeIndex"
          @childByValue="handleReload"
          :collapse="isCollapse"
          class="side-menu"
        />
        <div
          class="page"
          id="router-main"
          :style="{'margin-left': (isCollapse ? '64px' : '200px') }"
        >
          <div class="content-header">
            <div class="collapse-icon">
              <i
                :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
                @click="isCollapse = !isCollapse"
              />
            </div>
            <the-breadcrumb
              class="content-breadcrumb"
              :list="authMenu"
            />
            <!-- <div class="content-search">
              <el-input
                placeholder="请输入"
                prefix-icon="el-icon-search"
                v-model="searchInput"
                size="small"
              >
              </el-input>
            </div> -->
            <user-profile
              class="content-user-profile"
              :user-name="userInfo && userInfo.fullName"
              :system-name="systemName"
            />
          </div>

          <router-view
            style="margin: 20px"
            :key="activeDate + pathKey"
          />
        </div>
      </div>
    </div>
  </el-container>
</template>

<script lang="ts">
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  ref,
} from '@vue/composition-api';
import UserProfile from './user-profile.vue';
import TheBreadcrumb from './the-breadcrumb.vue';
import TheSidebar from './the-sidebar.vue';
import menu from '../../store/menu';

interface State {
  activeIndex: string;
  activeDate: string;
}

export default defineComponent({
  name: 'Layout',
  components: {
    UserProfile,
    TheBreadcrumb,
    TheSidebar,
  },
  setup(_, context) {
    const {
      root: { $store, $route },
    } = context;
    const state = reactive<State>({
      activeIndex: '1',
      activeDate: '',
    });
    const pathKey = computed(() => $route.fullPath);
    const userInfo = computed(() => $store.getters.userInfo);
    const systemName = computed(() => $store.state.systemName);
    const authMenu = computed(() => {
      const { permissions } = $store.state.profile;
      return menu.filter((item) => {
        if (!item.limit) return true;
        return permissions.indexOf(item.limit) !== -1;
      });
    });

    const handleReload = (activeDate: string) => {
      state.activeDate = activeDate;
    };
    const isCollapse = ref(false);
    const searchInput = ref();
    return {
      isCollapse,
      pathKey,
      userInfo,
      systemName,
      authMenu,
      ...toRefs(state),
      handleReload,
      searchInput,
    };
  },
});
</script>
<style lang="scss" scoped>
.page-container {
  flex-flow: column;
  height: 100%;
  .main {
    position: relative;
    width: 100%;
    margin: 0 auto;
    height: 100%;
  }
  .content {
    display: flex;
    height: 100%;
    .side-menu {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2001;
      scrollbar-width: none; /* firefox */
      -ms-overflow-style: none; /* IE 10+ */
      ::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
    }
    .content-header {
      position: sticky;
      top: 0px;
      z-index: 999;
      display: flex;
      background: #fff;
      box-shadow: 0 1px 2px #e0e1e2;
      .content-breadcrumb {
        flex-grow: 1;
      }
      .collapse-icon {
        text-align: center;
        margin-left: 20px;
        width: 40px;
        display: flex;
        align-items: center;
        align-content: center;
        i {
          cursor: pointer;
          font-size: 20px;
          color: #888888;
        }
      }
      .content-search {
        display: flex;
        align-items: center;
        padding: 0 12px;
      }
    }
  }
  .page {
    width: 100%;
  }
}
</style>
