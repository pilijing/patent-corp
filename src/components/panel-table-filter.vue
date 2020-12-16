<template>
  <div class="panel-table-filter">
    <el-form
      class="filter-wrapper"
      ref="filter_form"
      v-bind="$attrs"
      :label-width="labelWidth"
      :model="formModel"
    >
      <template v-for="(colItem, colItemI) in itemList">
        <div
          class="filter-item"
          :class="{'form-btn-group': colItem.type === 'form-btn'}"
          :key="colItemI"
          :style="{width: colItem.width}"
          v-show="colItem.show"
        >
          <el-form-item
            v-if="colItem.type === 'form-btn'"
            label-width="0"
          >
            <el-button
              :size="btnSize"
              type="primary"
              @click="submitForm"
              class="button"
            >
              查询
            </el-button>
            <el-button
              :size="btnSize"
              @click="resetField"
              class="button reset"
            >
              重置
            </el-button>
            <!-- <el-button
              v-if="itemList.length - 1 > beginHideIndex"
              :size="btnSize"
              @click="toggleFold"
              type="text"
            >
              {{ folding ? '展开' : '折叠' }}
              <i :class="folding ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
            </el-button> -->
          </el-form-item>
          <template v-else>
            <el-form-item :prop="colItem.configKey">
              <div slot="label" class="slot-label">
                <span :title="colItem.label">{{ colItem.label }}</span>
              </div>
              <!-- input -->
              <el-input
                v-if="colItem.type === 'input'"
                v-model="formModel[colItem.configKey]"
                :filterable="colItem.filterable"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- input-number -->
              <el-input-number
                v-else-if="colItem.type === 'input-number'"
                v-model="formModel[colItem.configKey]"
                :filterable="colItem.filterable"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- radio -->
              <el-radio-group
                v-else-if="colItem.type === 'radio'"
                v-model="formModel[colItem.configKey]"
                :size="btnSize"
                v-bind.sync="colItem"
              >
                <template v-if="(colItem.options instanceof Array)">
                  <el-radio
                    v-for="(optionItem, optionItemI) in colItem.options"
                    :key="optionItemI"
                    :label="optionItem.value"
                  >
                    {{ optionItem.label }}
                  </el-radio>
                </template>
              </el-radio-group>
              <!-- select -->
              <el-select
                v-else-if="colItem.type === 'select'"
                v-model="formModel[colItem.configKey]"
                :filterable="colItem.filterable"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              >
                <template v-if="(colItem.options instanceof Array)">
                  <el-option
                    v-for="(optionItem, optionItemI) in colItem.options"
                    :key="optionItemI"
                    :label="optionItem.name"
                    :value="optionItem.id"
                  />
                </template>
              </el-select>
              <!-- panel-select -->
              <panel-select
                v-else-if="isPanelSelect(colItem.type)"
                :type="colItem.type.split('|')[1]"
                v-model="formModel[colItem.configKey]"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- panel-select-search -->
              <panel-select-search
                v-else-if="colItem.type === 'search'"
                v-model="formModel[colItem.configKey]"
                :default-options="defaultOptions"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- number-range -->
              <number-range
                v-else-if="colItem.type === 'number-range'"
                v-model="formModel[colItem.configKey]"
                :clearable="colItem.clearable"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- date -->
              <el-date-picker
                v-else-if="colItem.type === 'date'"
                v-model="formModel[colItem.configKey]"
                :range-separator="colItem.rangeSeparator || '-'"
                :start-placeholder="colItem.startPlaceholder || '开始日期'"
                :end-placeholder="colItem.endPlaceholder || '结束日期'"
                type="daterange"
                :filterable="colItem.filterable"
                :clearable="colItem.clearable"
                style="width: 100%;"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <selector-country
                v-else-if="colItem.type === 'region'"
                autocomplete="new-password"
                v-model="formModel[colItem.configKey]"
                placeholder="国家"
                :size="btnSize"
                v-bind.sync="colItem"
              />
              <!-- ... -->
              <!-- ... -->
              <!-- more -->
            </el-form-item>
          </template>
        </div>
      </template>
    </el-form>
  </div>
</template>

<script>
import PanelSelect from '@/components/panel-select.vue';
import PanelSelectSearch from '@/components/panel-select-search.vue';
import SelectorCountry from '@/components/selector-country.vue';

export default {
  name: 'PanelTableFilter',
  components: {
    PanelSelect, PanelSelectSearch, SelectorCountry,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    labelWidth: {
      type: String,
      default: '100px',
    },
    btnSize: {
      type: String,
      default: 'medium',
    },
    cols: {
      type: Number,
      default: 4,
    },
    defaultOptions: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      // 折叠状态
      folding: false,
      // 超过2行折叠
      defaultShowRows: 2,
      // 配置模板
      configTemplate: {
        configKey: '',
        label: '',
        placeholder: '请输入',
      },
    };
  },
  computed: {
    // 每列宽度 占 一行百分比，整行为 1
    itemWidth() {
      return 1 / this.cols;
    },
    // 开始隐藏项的索引
    beginHideIndex() {
      const colNum = Math.floor(1 / this.itemWidth);
      return (this.defaultShowRows * colNum) - 1;
    },
    formModel: {
      get() {
        return this.value;
      },
      set(model) {
        this.$emit('input', model);
      },
    },
    valueKeys() {
      return Object.keys(this.formModel);
    },
    columnsKeyValue() {
      const keyValue = {};
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < this.columns.length; i++) {
        const item = this.columns[i];
        keyValue[item.dataIndex] = item;
      }
      return keyValue;
    },
    itemList() {
      const itemList = [];
      // 计算每个 item 宽度
      for (let colNumIndex = 0; colNumIndex < this.valueKeys.length; colNumIndex++) {
        let show = true;
        if (this.folding) {
          if (colNumIndex >= this.beginHideIndex) {
            show = false;
          }
        }
        const key = this.valueKeys[colNumIndex];
        // 计算每个 item config
        const defaultWidth = this.columnsKeyValue[key].type === 'date'
          ? `${this.itemWidth * 200}%` : `${this.itemWidth * 100}%`;
        itemList.push({
          width: defaultWidth,
          show,
          // 配置模板
          ...this.configTemplate,
          // 与 model 对应的 key
          configKey: key,
          // 默认显示值
          label: key,
          // 父组件项
          ...this.columnsKeyValue[key],
          // defaultOptions,
        });
      }
      itemList.push({
        show: true,
        type: 'form-btn',
      });
      return itemList;
    },
  },
  methods: {
    isSelector(type) {
      if (type) {
        if (type.indexOf('|') === -1) return false;
        return type.split('|')[0] === 'select';
      }
      return false;
    },
    // panel-select组件
    isPanelSelect(type) {
      if (type) {
        return this.isSelector(type, 'select');
      }
      return false;
    },
    toggleFold() {
      this.folding = !this.folding;
    },
    resetForm() {
      this.$refs.filter_form.resetFields();
    },
    submitForm() {
      Object.keys(this.formModel).forEach((key) => {
        if (typeof this.formModel[key] === 'string') {
          this.formModel[key] = this.formModel[key].trim();
        }
      });
      this.$emit('submit', this.formModel);
    },
    resetField() {
      this.resetForm();
      this.$emit('reset');
    },
  },
};
</script>

<style lang="scss">
.panel-table-filter {
  .filter-wrapper {
    margin-bottom: -22px;
    display: flex;
    flex-wrap: wrap;
    .filter-item {
      flex: none;
      &.form-btn-group {
        flex-grow: 1;
        text-align: right;
        margin-left:50px;
        font-size: 14px;
      }
    }
    .slot-label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .button {
      border-radius: 3px;
    }
    .el-button--medium {
      width: 64px;
      height: 35px;
      padding: 10px;
    }
  }
  // reset el css
  ::v-deep {
    .el-date-editor, .el-input-number {
      width: 100%;
    }
  }
}
</style>
