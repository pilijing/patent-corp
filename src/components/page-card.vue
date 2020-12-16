<template>
  <div class="page-card-wrapper">
    <el-card :class="`page-card ${cardStyle} ${ noPadding ? 'no-padding' : ''}`" shadow="hover">
      <div v-if="title" slot="header" class="title">
        <i v-if="icon" :class="`el-icon-${icon}`" />
        <span class="card-title" :title="title">{{ title }}</span>
        <span v-if="subtitle" class="subtitle">{{subtitle}}</span>
      </div>
      <slot />
    </el-card>
  </div>
</template>

<script>

export default {
  props: {
    icon: String,
    title: String,
    lite: Boolean, // 简化风格的面板样式
    noPadding: Boolean, // 卡片内部无需默认padding值，slot内容100%填充
    subtitle: String,
  },
  computed: {
    cardStyle() {
      if (!this.title) {
        return '';
      }
      return this.lite ? 'lite-card' : 'normal-card';
    },
  },
};
</script>

<style lang="scss" scoped>
.page-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 5px rgba(200, 200, 200, 0.231372549019608);
  margin-bottom: 20px;
}
.normal-card ::v-deep {
  .el-card__header {
    padding: 12px 20px;
    font-size: 16px;
  }
  .el-card__header i {
    margin-right: 10px;
  }
}
.lite-card ::v-deep {
  .el-card__header {
    border-bottom: none;
    padding-bottom: 0;
  }
  .el-card__body {
    padding: 15px 20px;
  }
}
.no-padding ::v-deep .el-card__body {
  padding: 0;
}
.subtitle {
  font-size: 12px;
  color: #1C92FF;
  background-color: rgba(234, 245, 255, 1);
  float: right;
  padding: 4px 6px;
  border-radius: 60px;
  margin-left: 4px;
}
</style>
