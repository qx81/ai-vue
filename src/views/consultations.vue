<template>
  <div>
    <PageHead title="咨询记录">
      <template #buttons>
        <el-button type="primary" @click="loadSessions">刷新</el-button>
      </template>
    </PageHead>

    <!-- 搜索表单 -->
    <TbaleSearch :formItems="searchFormItems" @search="handleSearch"/>

    <!-- 咨询会话列表 -->
    <el-card>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column label="会话ID" width="120">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="40" style="margin-right: 8px;">
                {{ row.userNickname }}
              </el-avatar>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="情绪标签" min-width="300">
          <template #default="{ row }">
            <div>
              <div class="session-title">{{ row.sessionTitle }}</div>
              <div class="last-message" :title="row.lastMessageContent">
                {{ row.lastMessageContent }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="消息数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.messageCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMessageTime" label="时间" width="160"/>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 会话详情弹窗 -->
    <el-dialog v-model="detailVisible" title="会话详情" width="800px">
      <div v-loading="messageLoading">
        <div class="session-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="会话ID">{{ currentSession.id }}</el-descriptions-item>
            <el-descriptions-item label="用户昵称">{{ currentSession.userNickname }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentSession.userId }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ currentSession.startedAt }}</el-descriptions-item>
            <el-descriptions-item label="持续时间">{{ currentSession.durationMinutes }} 分钟</el-descriptions-item>
            <el-descriptions-item label="消息数量">{{ currentSession.messageCount }}</el-descriptions-item>
            <el-descriptions-item label="最后消息时间">{{ currentSession.lastMessageTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="message-list" style="margin-top: 20px; max-height: 400px; overflow-y: auto;">
          <h4>消息记录</h4>
          <div v-for="(message, index) in messageList" :key="index" class="message-item">
            <div :class="['message-bubble', message.senderType === 1 ? 'user-message' : 'ai-message']">
              <div class="message-sender">{{ message.senderType === 1 ? '用户' : 'AI助手' }}</div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ message.createTime }}</div>
            </div>
          </div>
          <div v-if="messageList.length === 0" class="no-message">暂无消息记录</div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import PageHead from "@/components/PageHead.vue";
import TbaleSearch from "@/components/TbaleSearch.vue";
import {onMounted, reactive, ref} from "vue";
import {ElMessage} from 'element-plus';
import {getConsultationSessions, getSessionMessages} from "@/api/consultation.js";

// 搜索表单配置
const searchFormItems = [
  {
    label: '情绪标签',
    prop: 'emotionTag',
    type: 'input',
    placeholder: '请输入情绪标签',
    col: 6
  }
]

// 响应式数据
const tableData = ref([])
const loading = ref(false)
const messageLoading = ref(false)
const detailVisible = ref(false)
const currentSession = ref({})
const messageList = ref([])
const currentSearchParams = ref({})

const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})


// 搜索处理
const handleSearch = (formData) => {
  pagination.currentPage = 1
  currentSearchParams.value = {...formData}
  loadSessions()
}

// 加载咨询会话列表
const loadSessions = async () => {
  loading.value = true
  try {
    const params = {
      ...currentSearchParams.value,
      currentPage: pagination.currentPage,
      size: pagination.size
    }
    const result = await getConsultationSessions(params)

    // 处理接口返回的数据结构
    if (result.data) {
      tableData.value = result.data.records || []
      pagination.total = result.data.total || 0
      pagination.currentPage = result.data.current || 1
    } else {
      tableData.value = result.records || []
      pagination.total = result.total || 0
    }
  } catch (error) {
    console.error('获取咨询会话列表失败:', error)
    ElMessage.error('获取咨询会话列表失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadSessions()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadSessions()
}

// 查看详情
const handleDetail = async (row) => {
  try {
    currentSession.value = {...row}
    detailVisible.value = true
    messageLoading.value = true

    // 获取会话消息列表
    const result = await getSessionMessages(row.id)
    messageList.value = result || []

  } catch (error) {
    console.error('获取会话消息失败:', error)
    ElMessage.error('获取会话消息失败')
    messageList.value = []
  } finally {
    messageLoading.value = false
  }
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped lang="scss">
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.session-info {
  margin-bottom: 20px;
}

.session-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
}

.last-message {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.message-item {
  margin-bottom: 16px;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.user-message {
  background: #3b82f6;
  color: white;
  margin-right: auto;
  text-align: left;
}

.ai-message {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
  margin-left: auto;
  text-align: right;
}

.message-sender {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.8;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.6;
}

.no-message {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 20px;
}
</style>