<template>
  <div class="emotionDiary-container">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <el-image style="height: 30px;width: 30px" :src="iconUrl"/>
        <h1>情绪日记</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!--情绪评分-->
      <div class="diary-card">
        <!-- 情绪选择区域 -->
        <div class="title">今日情绪评分</div>

        <div class="section">
          <p>您今天的整体情绪状态如何？（1-10分）</p>
          <div class="rate">
            <el-rate v-model="dairyForm.moodScore" :texts="emotionStatus" show-text :max="10" size="large"></el-rate>
          </div>
        </div>
      </div>

      <!--主要情绪-->
      <div class="diary-card">
        <div class="title">主要情绪</div>
        <div class="emotion-grid">
          <div class="emotion-card" v-for="emotion in emotionOptions" :key="emotion.name"
               @click="selectEmotion(emotion.name)"
               :class="{'selected': emotion.name === dairyForm.dominantEmotion}">
            <el-image :src="emotion.url" style="width: 50px;height: 50px"></el-image>
            <div class="emotion-name">{{ emotion.name }}</div>
          </div>
        </div>
      </div>

      <!--详细记录-->
      <div class="diary-card">
        <div class="title">详细记录</div>

        <div class="detail-form">
          <!-- 情绪触发因素 -->
          <div class="form-label">情绪触发因素</div>
          <el-input
              v-model="dairyForm.emotionTriggers"
              type="textarea"
              :rows="3"
              placeholder="今天什么事情影响了您的情绪？"
              maxlength="1000"
              show-word-limit
          />

          <!-- 今日感想 -->
          <div class="form-label">今日感想</div>
          <el-input
              v-model="dairyForm.diaryContent"
              type="textarea"
              :rows="5"
              placeholder="写下您今天的想法、感受或发生的有趣事情..."
              maxlength="1000"
              show-word-limit
          />

          <div class="life-indicators">
            <!-- 睡眠质量 -->
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select v-model="dairyForm.sleepQuality" placeholder="请选择">
                <el-option label="很差" :value="1"/>
                <el-option label="较差" :value="2"/>
                <el-option label="一般" :value="3"/>
                <el-option label="良好" :value="4"/>
                <el-option label="优秀" :value="5"/>
              </el-select>
            </div>

            <!-- 压力水平 -->
            <div class="indicator-group">
              <div class="form-label">压力水平</div>
              <el-select v-model="dairyForm.stressLevel" placeholder="请选择">
                <el-option label="很低" :value="1"/>
                <el-option label="较低" :value="2"/>
                <el-option label="一般" :value="3"/>
                <el-option label="较高" :value="4"/>
                <el-option label="很高" :value="5"/>
              </el-select>
            </div>
          </div>


          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitForm" :loading="loading">提交记录</el-button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import {ref, reactive} from 'vue'
import {ElMessage} from 'element-plus'
import {updateEmotionDiary} from '@/api/emotion.js'
import {dayjs} from "element-plus";
//情绪评分
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']

//情绪选项
const emotionOptions = [
  {name: '开心', url: new URL('@/assets/images/开心.png', import.meta.url).href},
  {name: '平静', url: new URL('@/assets/images/平静.png', import.meta.url).href},
  {name: '焦虑', url: new URL('@/assets/images/焦虑.png', import.meta.url).href},
  {name: '悲伤', url: new URL('@/assets/images/悲伤.png', import.meta.url).href},
  {name: '兴奋', url: new URL('@/assets/images/兴奋.png', import.meta.url).href},
  {name: '疲惫', url: new URL('@/assets/images/疲惫.png', import.meta.url).href},
  {name: '惊讶', url: new URL('@/assets/images/惊讶.png', import.meta.url).href},
  {name: '困惑', url: new URL('@/assets/images/困惑.png', import.meta.url).href}
]


const iconUrl = new URL('@/assets/images/like.png', import.meta.url).href


// 响应式数据
const loading = ref(false)

const dairyForm = reactive({
  diaryDate: dayjs().format('YYYY-MM-DD'),//记录日期
  moodScore: 0,//情绪评分（1-10）
  dominantEmotion: '',//重要情绪
  emotionTriggers: '',//情绪触发因素
  diaryContent: '',//今日感想
  sleepQuality: 0,//睡眠质量
  stressLevel: 0//压力水平
})

const selectEmotion = (name) => {
  dairyForm.dominantEmotion = name
}

// 重置表单
const resetForm = () => {
  Object.assign(dairyForm, {
    diaryDate: dayjs().format('YYYY-MM-DD'),
    moodScore: 0,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: 0,
    stressLevel: 0
  })
}

// 提交表单
const submitForm = async () => {
  if (!dairyForm.moodScore) {
    ElMessage.warning('请选择情绪评分')
    return
  }

  if (!dairyForm.dominantEmotion) {
    ElMessage.warning('请选择主要情绪')
    return
  }

  loading.value = true

  try {
    await updateEmotionDiary(dairyForm)
    ElMessage.success('情绪记录提交成功')
    resetForm()
  } catch (error) {
    console.error('提交情绪记录失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

</script>
<style scoped lang="scss">
.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .header-section {
    background: linear-gradient(135deg, #7ED321 0%, #F5A623 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 15px;
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .emotion-card {
          padding: 15px;
          border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;

          .emotion-name {
            margin-top: 10px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            border-color: #7ED321;
            background: #F0FDF4;
            transform: translateY(-3px);
          }
        }
      }

      .detail-form {
        .form-label {
          margin: 10px 0;
          color: #374151;
        }

        .life-indicators {
          display: flex;
          gap: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px
        }
      }
    }
  }
}
</style>