<template>
  <div class="frontend-layout">
    <div class="navbar-container">
      <div class="brand-section">
        <el-image :src="iconUrl" style="height: 50px; width: 50px"/>
        <h1 class="brand-name">AI-VUE</h1>
      </div>

      <div class="nav-section">
        <router-link :to="{name: 'home'}" class="nav-link">
          首页
        </router-link>
        <router-link :to="{name: 'chat'}" class="nav-link" v-if="isLoginIn">
          AI咨询
        </router-link>
        <router-link :to="{name: 'feemotional'}" class="nav-link" v-if="isLoginIn">
          情绪日记
        </router-link>
        <router-link :to="{name: 'feknowledge'}" class="nav-link">
          知识库
        </router-link>
        <el-button type="primary" class="logout-btn" v-if="isLoginIn" @click="handleLogout">退出登录</el-button>
        <template v-else>
          <router-link :to="{name: 'login'}" class="nav-link">
            登录
          </router-link>
          <router-link :to="{name: 'register'}" class="nav-link">
            <el-button type="primary">注册</el-button>
          </router-link>
        </template>
      </div>
    </div>

    <div class="main-container">
      <router-view></router-view>
    </div>

    <div class="footer-container">
      <div class="footer-bottom">
        <p>Copyright © 2026 心里健康AI助手. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import {logout} from '@/api/login.js'
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

const router = useRouter();

const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href;

const isLoginIn = ref(false);

onMounted(() => {
  isLoginIn.value = localStorage.getItem("userInfo") !== null;
})

const handleLogout = () => {
  isLoginIn.value = false;
  logout().then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('退出登录成功')
    // 这里可以添加跳转到登录页的逻辑
    router.push('/auth/login')
  })
}
</script>
<style scoped lang="scss">
.frontend-layout {
  background-color: #fff;

  .navbar-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .brand-section {
      display: flex;
      align-items: center;

      .brand-name {
        margin-left: 10px;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }
    }

    .nav-section {
      display: flex;
      align-items: center;
      gap: 40px;

      .nav-link {
        color: #4b5563;
        font-size: 16px;
        font-weight: 500;

        &:hover {
          color: #4A90E2;
        }
      }
    }
  }

  .footer-container {
    background: #1f2937;
    color: white;
    padding: 15px 0;
    margin-top: auto;

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 10px;
      text-align: center;
    }
  }
}
</style>