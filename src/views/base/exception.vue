<template>
  <div class="exception">
    <div class="title">{{ msg }}</div>
  </div>
</template>
<script>
export default {
  props: {
    msg: String,
  },
};
</script>

<style scoped>
.exception {
  display: flex;
  width: 100%;
  min-width: 650px;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 40px;
}
</style>
