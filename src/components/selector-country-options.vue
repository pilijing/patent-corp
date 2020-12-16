<template>
  <el-tabs class="country-options" :stretch="!keyword" v-model="activeName">
    <el-tab-pane
      v-for="group in groups"
      :label="group.label"
      :name="group.name"
      :key="group.name"
    >
      <el-option
        v-for="item in group.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script type="text/babel">
import Emitter from 'element-ui/src/mixins/emitter';

export default {
  mixins: [Emitter],

  name: 'CountryOptions',

  componentName: 'ElOption', // Select会给这个名为ElOption组件广播事件

  props: {
    list: Array,
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      activeName: 'hot',
      keyword: null,
    };
  },
  computed: {
    groups() {
      if (this.keyword) {
        return [{
          label: '搜索结果',
          name: 'searchResult',
          options: this.formatOption(this.list.filter(item => item.code.indexOf(this.keyword) !== -1
          || item.name.indexOf(this.keyword) !== -1 || item.englishName.toUpperCase().indexOf(this.keyword) !== -1)),
        }];
      }
      return [
        {
          label: '常用',
          name: 'hot',
          options: this.formatOption(this.list.filter(item => item.isPopular)),
        },
        ...this.groupByCode(['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ']),
      ];
    },
  },

  watch: {
    disabled(val) {
      this.broadcast('ElOption', 'handleGroupDisabled', val);
    },
  },
  methods: {
    queryChange(val) {
      if (val && val.trim() !== '') {
        this.keyword = val.trim().toUpperCase();
        this.activeName = 'searchResult';
      } else {
        this.keyword = null;
        this.activeName = 'hot';
      }
    },
    filterByCodePrefix(prefixGroup) {
      return this.formatOption(this.list.filter((item) => {
        const prefix = item.code.substring(0, 1);
        return prefixGroup.indexOf(prefix) !== -1;
      }));
    },
    groupByCode(codes) {
      return codes.map(code => ({
        label: code,
        name: code,
        options: this.filterByCodePrefix(code),
      }));
    },
    formatOption(array) {
      return array.map(item => ({
        label: `${item.code}   ${item.name}`,
        value: item.code,
      }));
    },
  },

  created() {
    this.$on('queryChange', this.queryChange);
  },

  mounted() {
    if (this.disabled) {
      this.broadcast('ElOption', 'handleGroupDisabled', this.disabled);
    }
  },
};
</script>

<style lang="scss" scoped>
.country-options {
  width: 635px;
  & ::v-deep {
    .el-tab-pane {
      display: flex;
      flex-wrap: wrap;
      .el-select-dropdown__item {
        width: 150px;
      }
    }
    .el-tabs__header {
      padding: 0 10px;
      background: #E7F4FF;
      .el-tabs__item {
        font-weight: normal;
      }
    }
    .el-tabs__content {
      padding: 0 10px 10px 10px;
    }
    .el-tabs__nav-wrap:after {
      background-color: transparent;
    }
  }
}
</style>
