<template>
  <div class="dashboard-container">
    <PageHead title="数据仪表板">
      <template #buttons>
        <el-button type="primary" @click="loadData">刷新数据</el-button>
      </template>
    </PageHead>

    <!-- 系统概览 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="stat-card user-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32">
                <User/>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalUsers || 0 }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-subtitle">活跃用户:{{ overviewData.activeUsers || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card diary-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32">
                <Notebook/>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalDiaries || 0 }}</div>
              <div class="stat-label">情绪日志</div>
              <div class="stat-subtitle">今日新增:{{ overviewData.todayNewDiaries || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card session-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32">
                <ChatDotRound/>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalSessions || 0 }}</div>
              <div class="stat-label">咨询会话</div>
              <div class="stat-subtitle">今日新增:{{ overviewData.todayNewSessions || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card mood-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32">
                <TrendCharts/>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.avgMoodScore?.toFixed(0) || '0' }}/10</div>
              <div class="stat-label">平均情绪</div>
              <div class="stat-subtitle">情绪健康指数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 情绪趋势分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>情绪趋势分析</span>
            </div>
          </template>
          <VChart :option="trendOption" :loading="loading" style="height: 300px;"/>
        </el-card>
      </el-col>

      <!-- 咨询会话统计 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>咨询会话统计</span>
            </div>
          </template>
          <div class="consultation-stats">
            <div class="stat-item">
              <span class="stat-label">总会话数</span>
              <span class="stat-value">{{ consultationStats.totalSessions || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均时长</span>
              <span class="stat-value">{{ Math.round(consultationStats.avgDurationMinutes) || 0 }}分钟</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">活跃用户</span>
              <span class="stat-value">{{ overviewData.activeUsers || 0 }}</span>
            </div>
          </div>
          <VChart :option="consultationOption" :loading="loading" style="height: 250px;"/>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户活跃度趋势 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户活跃度趋势</span>
            </div>
          </template>
          <VChart :option="userActivityOption" :loading="loading" style="height: 300px;"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {
  User,
  TrendCharts,
  Notebook,
  ChatDotRound
} from '@element-plus/icons-vue'
import PageHead from '@/components/PageHead.vue'
import VChart from 'vue-echarts'
import {getDashboardOverview} from '@/api/dashboard'
import {use} from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {HeatmapChart, LineChart, BarChart} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  HeatmapChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent
])

// 响应式数据
const loading = ref(false)
const dashboardData = ref({})

// 计算属性
const overviewData = computed(() => dashboardData.value.systemOverview || {})
const trendData = computed(() => dashboardData.value.emotionTrend || [])
const consultationStats = computed(() => dashboardData.value.consultationStats || {dailyTrend: []})
const userActivityData = computed(() => dashboardData.value.userActivity || [])


// 情绪趋势配置
const trendOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['平均情绪评分', '记录数量'],
    top: 0,
    left: 'center'
  },
  grid: {//控制容器样式
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: false
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendData.value.map(item => item.date)
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 10
  },
  series: [
    {
      name: '平均情绪评分',
      type: 'line',
      data: trendData.value.map(item => item.avgMoodScore || 0),
      smooth: true,//使用平滑曲线
      lineStyle: {
        color: '#fac858',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(250, 200, 88, 0.3)'
          }, {
            offset: 1, color: 'rgba(250, 200, 88, 0.1)'
          }]
        }
      }
    },
    {
      name: '记录数量',
      type: 'line',
      data: trendData.value.map(item => item.recordCount || 0),
      smooth: true,
      lineStyle: {
        color: '#ee6666',
        width: 2,
        type: 'dashed'
      }
    }
  ]
}))

// 咨询统计配置
const consultationOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['会话数量', '参与用户数'],
    top: 0,
    left: 'center'
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: consultationStats.value.dailyTrend.map(item => item.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '会话数量',
      type: 'bar',
      data: consultationStats.value.dailyTrend.map(item => item.sessionCount || 0),
      itemStyle: {
        color: '#c6547c'
      }
    },
    {
      name: '参与用户数',
      type: 'bar',
      data: consultationStats.value.dailyTrend.map(item => item.userCount || 0),
      itemStyle: {
        color: '#fac858'
      }
    }
  ]
}))

// 用户活跃度配置
const userActivityOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
    top: 0,
    left: 'center'
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: userActivityData.value.map(item => item.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '活跃用户',
      type: 'line',
      data: userActivityData.value.map(item => item.activeUsers || 0),
      smooth: true,
      lineStyle: {
        color: '#7239ea',
        width: 2
      }
    },
    {
      name: '新增用户',
      type: 'line',
      data: userActivityData.value.map(item => item.newUsers || 0),
      smooth: true,
      lineStyle: {
        color: '#fac858',
        width: 2
      }
    },
    {
      name: '日记用户',
      type: 'line',
      data: userActivityData.value.map(item => item.diaryUsers || 0),
      smooth: true,
      lineStyle: {
        color: '#67c23a',
        width: 2
      }
    },
    {
      name: '咨询用户',
      type: 'line',
      data: userActivityData.value.map(item => item.consultationUsers || 0),
      smooth: true,
      lineStyle: {
        color: '#f56c6c',
        width: 2
      }
    }
  ]
}))

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const response = await getDashboardOverview()
    console.log(response, 'response')
    dashboardData.value = response
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
}

.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    padding: 20px;

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      margin-right: 15px;

      .el-icon {
        font-size: 28px;
        color: white;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }

      .stat-subtitle {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;

    .chart-subtitle {
      font-size: 12px;
      color: #909399;
      font-weight: normal;
    }
  }
}

.today-cards {
  margin-bottom: 20px;
}

.today-card, .avg-card, .peak-card {
  .today-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    color: #409EFF;
  }

  .today-content {
    .today-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .today-label {
        color: #666;
        font-size: 14px;
      }

      .today-value {
        font-weight: bold;
        color: #333;
        font-size: 16px;
      }
    }
  }
}

.consultation-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 8px;

  .stat-item {
    text-align: center;

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }
}

// 卡片悬停效果和颜色主题
.stat-card {
  transition: all 0.3s ease;

  &.user-card {
    .stat-icon {
      background: linear-gradient(135deg, #7239ea, #9c6bf2);
    }
  }

  &.diary-card {
    .stat-icon {
      background: linear-gradient(135deg, #f672b6, #f8a5d1);
    }
  }

  &.session-card {
    .stat-icon {
      background: linear-gradient(135deg, #409EFF, #66b1ff);
    }
  }

  &.mood-card {
    .stat-icon {
      background: linear-gradient(135deg, #67C23A, #85ce61);
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }
}


</style>