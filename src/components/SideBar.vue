<template>
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <el-menu
        default-active="2"
        @open="handleOpen"
        @close="handleClose"
        class="menu-style"
        :collapse="isCollapse"
        :collapse-transition="false"
    >
      <div class="brand">
        <el-image :src="iconUrl" style="width: 50px; height: 50px" fit="fill"></el-image>
        <div class="info-card" v-show="!isCollapse">
          <h1 class="brand-title">XXX-AI助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
      <el-menu-item @click="selectMenu(menu)" v-for="menu in getBackendRoutes()" :index="menu.path"
                    :key="menu.path">
        <el-icon>
          <component :is="menu.meta.icon"></component>
        </el-icon>
        <span>{{ menu.meta.title }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>
<script setup>
import {useRouter} from 'vue-router'

import {useAdminStore} from "@/stores/admin.js";
import {computed} from "vue";

const router = useRouter()
console.log(router)

const iconUrl = new URL("@/assets/images/机器人.png", import.meta.url).href

const handleOpen = () => {
}
const handleClose = () => {
}

const getBackendRoutes = () => {
  // 查找后台路由配置
  const backendRoute = router.options.routes.find(route => route.path === '/back')
  // 过滤掉没有meta属性的路由（如重定向路由）
  return backendRoute?.children?.filter(route => route.meta) || []
}

const selectMenu = (menu) => {
  console.log('selectMenu ,path=' + menu.path)
  // 构建完整的后台路由路径
  const fullPath = `/back/${menu.path === '/' ? '' : menu.path}`
  router.push(fullPath)
}

const isCollapse = computed(() => {
  return useAdminStore().isCollapse
})


</script>
<style lang="scss" scoped>
.menu-style {
  height: 100vh;

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;

    .info-card {
      margin-left: 10px;

      .brand-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .brand-subtitle {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>