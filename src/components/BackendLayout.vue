<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <SideBar/>
      <el-container>
        <el-header>
          <NaviBar/>
        </el-header>
        <!--        <el-aside width="200px">Aside</el-aside>-->
        <el-main>
          <router-view class="content-container"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import SideBar from "@/components/SideBar.vue";
import NaviBar from "@/components/NaviBar.vue";
</script>
<style lang="scss" scoped>
.backend-layout {
  height: 100vh;
 .el-header {
   height: 80px !important;
 }
  .main-container {
    height: 100vh;

    .content-container {
      padding: 20px;
      background: #fff;
      min-height: calc(100vh - 80px);
    }
  }
}
</style>