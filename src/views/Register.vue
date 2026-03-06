<template>
  <div class="register-container">
    <div class="register-form">
      <div class="register-header">
        <h3>创建您的账户</h3>
        <p>请填写注册信息</p>
      </div>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          size="medium"
      >
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
              prefix-icon="UserFilled"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              style="width: 100%"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="$router.push('/auth/login')">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive} from 'vue'
import {createRouter as $router, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {register} from '@/api/login.js'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 0,
  userType: 0
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱地址', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  nickname: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur'}
  ],
  phone: [
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于6位', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, validator: validateConfirmPassword, trigger: 'blur'}
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 移除confirmPassword字段，只提交接口需要的字段
    const {confirmPassword, ...submitData} = registerForm
    await register(submitData)

    ElMessage.success('注册成功，请登录')
    await router.push('/auth/login')

  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-footer .el-link {
  margin-left: 5px;
}
</style>