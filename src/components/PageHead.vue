<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="action-btn">
      <slot name="buttons"></slot>
    </div>
  </div>

</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "页面标题"
  }
})
</script>
<style scoped lang="scss">
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;

  .page-title {
    font-size: 20px;
    font-weight: bold;
    color: #1f2937;
  }

  .action-btn {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
  }
}
</style>