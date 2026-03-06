<template>
  <div class="navbar">
    <div class="flex-box">
      <el-button @click="handCollapse">
        <el-icon>
          <Expand/>
        </el-icon>
        <p class="page-title">{{ route.meta.title }}</p>
      </el-button>
    </div>
    <div class="flex-box">
      <el-dropdown @command="handleCommand" trigger="click">
        <div class="flex-box">
          <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          <p class="user-name">{{ userInfo.username }}</p>
          <el-icon>
            <arrow-down/>
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup>
import {ArrowDown, Expand} from "@element-plus/icons-vue";
import {useAdminStore} from '@/stores/admin.js'
import {logout} from '@/api/login.js'
import {ElMessage} from 'element-plus'
import {onMounted, ref} from "vue";
import {useRouter, useRoute} from 'vue-router'

const router = useRouter()
const route = useRoute()

// 定义响应式变量
const userInfo = ref({});

const handleCommand = async (command) => {
  console.log(command)
  if (command === "logout") {
    try {
      await logout()
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('退出登录成功')
      // 这里可以添加跳转到登录页的逻辑
      await router.push('/auth/login')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }
}

const handCollapse = () => {
  console.log("折叠")
  useAdminStore().toggleCollapse()
}

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
})
</script>
<style scoped lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 15px;
  background: white;
  box-shadow: 0 1px 4px 0 rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;

  .flex-box {
    display: flex;
    justify-content: center;
    align-items: center;

    .user-name {
      margin: 0 5px;
      font-size: 14px;
      color: #1f2937;
    }

    .page-title {
      margin-left: 20px;
      font-size: 26px;
      font-weight: bold;
      color: #1f2937;
    }
  }
}
</style>