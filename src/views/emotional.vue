<template>
  <div>
    <PageHead title="情绪日志">
      <template #buttons>
        <el-button type="primary" @click="loadEmotionDiary">刷新</el-button>
      </template>
    </PageHead>

    <!-- 搜索表单 -->
    <TbaleSearch :formItems="searchFormItems" @search="handleSearch" />

    <!-- 情绪日志列表 -->
    <el-card>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="40" />
        <el-table-column label="会话ID" width="80">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="40" style="margin-right: 8px;">
                {{ row.nickname }}
              </el-avatar>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="记录日期" width="120" />
        <el-table-column prop="moodScore" label="情绪评分" width="320" align="center">
          <template #default="{ row }">
            <el-rate
              v-model="row.moodScore"
              :max="10"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lifeIndicators" label="生活指标" width="120" align="center">
          <template #default="{ row }">
            <div class="life-indicators">
              <span>睡眠：{{ row.sleepQuality }}/5</span>
              <span>压力：{{ row.stressLevel }}/5</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="emotionTriggers" label="情绪触发因素" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.emotionTriggers }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="diaryContent" label="日记内容" min-width="100">
          <template #default="{ row }">
            <div class="content-text" :title="row.diaryContent">{{ row.diaryContent }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 详情弹框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="情绪日记详情"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <el-descriptions v-if="currentDetail" :column="2" border>
        <el-descriptions-item label="ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ currentDetail.nickname }}</el-descriptions-item>
        <el-descriptions-item label="会话ID">{{ currentDetail.sessionId }}</el-descriptions-item>
        <el-descriptions-item label="记录日期">{{ currentDetail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="情绪评分" :span="2">
          <el-rate
            v-model="currentDetail.moodScore"
            :max="10"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          />
        </el-descriptions-item>
        <el-descriptions-item label="睡眠质量">
          <el-tag :type="getSleepType(currentDetail.sleepQuality)">
            {{ currentDetail.sleepQuality }}/5
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="压力水平">
          <el-tag :type="getStressType(currentDetail.stressLevel)">
            {{ currentDetail.stressLevel }}/5
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="情绪触发因素" :span="2">
          <el-tag type="warning">{{ currentDetail.emotionTriggers }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="日记内容" :span="2">
          <div style="padding: 8px; background: #f5f7fa; border-radius: 4px;">
            {{ currentDetail.diaryContent }}
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import PageHead from "@/components/PageHead.vue";
import TbaleSearch from "@/components/TbaleSearch.vue";
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { getEmotionDiaryPage, deleteEmotionDiary } from "@/api/emotion.js";

// 搜索表单配置
const searchFormItems = [
  {
    label: '用户ID',
    prop: 'userId',
    type: 'input',
    placeholder: '请输入用户ID',
    col: 6
  },
  {
    label: '情绪评分',
    prop: 'emotionScore',
    type: 'select',
    placeholder: '选择评分',
    col: 6,
    options: [
      { label: '非常负面', value: 1 },
      { label: '负面', value: 2 },
      { label: '中性', value: 3 },
      { label: '正面', value: 4 },
      { label: '非常正面', value: 5 }
    ]
  }
]

// 响应式数据
const tableData = ref([])
const loading = ref(false)
const currentSearchParams = ref({})
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})

// 睡眠质量类型映射
const getSleepType = (quality) => {
  if (quality >= 4) return 'success'
  if (quality >= 3) return 'warning'
  return 'danger'
}

// 压力水平类型映射
const getStressType = (level) => {
  if (level <= 2) return 'success'
  if (level <= 3) return 'warning'
  return 'danger'
}



// 搜索处理
const handleSearch = (formData) => {
  pagination.currentPage = 1
  currentSearchParams.value = { ...formData }
  loadEmotionDiary()
}

// 加载情绪日记列表
const loadEmotionDiary = async () => {
  loading.value = true
  try {
    const params = {
      ...currentSearchParams.value,
      currentPage: pagination.currentPage,
      size: pagination.size
    }
    const result = await getEmotionDiaryPage(params)

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
    console.error('获取情绪日记列表失败:', error)
    ElMessage.error('获取情绪日记列表失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadEmotionDiary()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadEmotionDiary()
}

// 查看详情
const handleDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 关闭详情弹框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentDetail.value = null
}

// 删除情绪日记
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.nickname}"的情绪日记吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用删除接口
    await deleteEmotionDiary(row.id)

    ElMessage.success('情绪日记删除成功')

    // 刷新列表
    await loadEmotionDiary()

  } catch (error) {
    // 如果用户取消删除，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('删除情绪日记失败:', error)
    ElMessage.error('删除情绪日记失败')
  }
}

onMounted(() => {
  loadEmotionDiary()
})
</script>

<style scoped lang="scss">
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.content-text {
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}



.life-indicators {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
</style>