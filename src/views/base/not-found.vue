<template>
  <div class="page-not-found">
    <div class="text">
      <div class="title">抱歉！页面无法访问……</div>
      <div class="desc">页面链接可能已失效或被删除</div>
    </div>
  </div>
</template>
<script>
export default {};
</script>

<style scoped>
  .page-not-found {
    display: flex;
    width: 100%;
    height: calc(100vh - 140px);
    min-width: 650px;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .title {
    font-size: 38px;
    color: #303133;
  }
  .desc {
    padding-top: 10px;
    font-size: 18px;
    color: #666666;
  }
</style>
