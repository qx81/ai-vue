<template>
  <div class="consultation-container">
    <div class="sidebar">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-icon size="24" color="white">
            <ChatDotRound/>
          </el-icon>
        </div>
        <div class="assistant-name">宁渡AI助手</div>
        <div class="online-status">
          <span class="status-dot"></span>
          在线服务中
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">
            <el-icon>
              <Sunny/>
            </el-icon>
            情绪花园
          </div>
        </div>

        <div class="emotion-info">
          <div class="emotion-name">中性</div>
          <div class="emotion-score">{{ currentEmotion.emotionScore }}</div>
        </div>

        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion" style="background: linear-gradient(135deg, #ff9a9e, #fecfef); color: white;">
              {{ currentEmotion.isNegative ? '需要关注' : '很不错' }}
            </span>
          </div>
          <!--情绪等级-->
          <div class="emotion-intensity">
            <div class="intensity-dots">
              <span v-for="ii in 3" class="dot"
                    :class="{'active' : getEmotionIntensityClass(currentEmotion.emotionScore) >= ii}"></span>
            </div>
            <span class="intensity-text">{{
                getRiskLevelText(currentEmotion.riskLevel)
              }}</span>
          </div>
          <!--小建议-->
          <div class="warm-suggestion" v-if="currentEmotion.suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
            </div>
          </div>

          <!--治愈小行动-->
          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length > 0">
            <div class="actions-title">治愈小行动</div>
            <div class="actions-list">
              <div class="action-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">
                <div class="action-icon">✨</div>
                <div class="action-text">{{ action }}</div>
              </div>
            </div>
          </div>

          <!--风险提示 只有负面情绪出现时 才会出现-->
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 会话历史 -->
      <div class="session-history">
        <div class="section-title"><span>会话历史</span></div>

        <div class="session-list">
          <div class="session-item" v-for="session in sessionList" :key="session.id"
               @click="handleSessionClick(session)">
            <div class="session-info">
              <div class="session-title">
                <span>{{ session.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ session.startedAt }}</span>
                </div>

                <div class="session-preview">
                  <span class="session-time">{{ session.lastMessageContent }}</span>
                </div>

                <div class="session-stats">
                  <span>
                    <el-icon class="session-count-icon" color="#ff6b6b"><ChatRound/></el-icon>{{
                      session.messageCount || 0
                    }}
                  </span>

                  <span>
                    <el-icon class="session-count-icon" color="#ff6b6b"><Clock/></el-icon>{{
                      session.durationMinutes || 0
                    }}
                  </span>
                </div>
              </div>

              <div class="session-actions">
                <el-button text type="danger" size="small" @click="handleSessionDelete(session.id)">
                  <el-icon size="16">
                    <DeleteFilled/>
                  </el-icon>
                </el-button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div class="no-sessions-text" v-if="sessionList.length === 0">暂无会话记录</div>
    </div>

    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="likeIconUrl" style="height: 30px; width: 30px"/>
          </div>
          <div class="chat-info">
            <h2>AI助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button circle @click="createnewFrontendSession" title="添加会话">
          <el-icon size="20">
            <Plus/>
          </el-icon>
        </el-button>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="iconUrl" style="height: 30px; width: 30px"/>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>

        <!--消息列表-->
        <div v-else
             v-for="message in messages"
             :key="message.id"
             class="message-item"
             :class="{ 'ai-message': message.senderType === 2, 'user-message': message.senderType === 1 }"
        >
          <div class="message-avatar">
            <el-image :src="message.senderType === 1 ? usersIconUrl : iconUrl" style="height: 30px; width: 30px"/>
          </div>
          <div class="message-content">
            <div class="message-bubble">

              <!--AI正在思考中-->
              <div class="typing-indicator" v-if="message.senderType === 2 && isTyping && !message.content">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>

              <!--AI错误提示-->
              <div v-else-if="message.isError" class="error-message">
                <p>{{ message.content }}</p>
              </div>

              <!--正常的AI消息-->
              <MarkdownRenderer v-else-if="message.senderType === 2 && message.content && !message.isError"
                                :content="message.content" :is-ai-message="true"/>

              <!--用户消息-->
              <p v-else-if="message.senderType === 1 && message.content" v-html="formatMessage(message.content)"></p>

            </div>
            <div class="message-time">
              {{ message.senderType === 2 && isTyping && !message.content ? '正在输入中' : message.createdAt }}
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="请输入您想要分享的内容..."
              :maxlength="500"
              @keydown="handleKeydown"
              resize="none"
              :disabled="isTyping"
              clearable
          />
          <div class="input-footer">
            <span>按Enter发送，Shift+Enter换行</span>
            <span>{{ inputMessage.length }}/500</span>
          </div>
        </div>
        <el-button
            class="send-btn"
            type="primary"
            :disabled="!inputMessage.trim() || inputMessage.length >500 || isSending"
            @click="sendMessage"
        >
          <el-icon size="20">
            <Promotion/>
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onMounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {ChatDotRound, ChatRound, Clock, DeleteFilled, Plus, Promotion, Sunny} from '@element-plus/icons-vue'
import {deleteSession, getMessageList, getSessionList, startSession} from '@/api/consultation.js'
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {getEmotionResult} from "@/api/emotion.js";
// 响应式数据
const inputMessage = ref('')
const isSending = ref(false)
const isTyping = ref(false)
const messagesContainer = ref(null)
const messages = ref([])
const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const likeIconUrl = new URL('@/assets/images/like.png', import.meta.url).href
const usersIconUrl = new URL('@/assets/images/users.png', import.meta.url).href


//当前会话对象
const currentSession = reactive({
  sessionId: '',
  status: 'TEMP',
  sessionTitle: '新对话'
})

//会话历史数据
const sessionList = ref([])

//情绪花园
const currentEmotion = ref({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态平稳',
  improvementSuggestions: [],
  riskDescription: ''
})

const loadSessionEmotion = (sessionId) => {
  //校验sessionId格式 以session_开头
  const actualSessionId = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`;
  getEmotionResult(actualSessionId).then(res => {
    console.log(res, 'loadSessionEmotion')
    currentEmotion.value = res
  })
}

const getEmotionIntensityClass = (score) => {
  if (score > 61) {
    return 3
  }
  if (score <= 31) {
    return 2
  }
  return 1
}

const getRiskLevelText = (level) => {
  switch (level) {
    case 0:
      return '正常'
    case 1:
      return '关注'
    case 2:
      return '预警'
    case 3:
      return '危机'
    default:
      return '未知'
  }
}

const handleSessionClick = (session) => {
  getMessageList(session.id).then(res => {
    messages.value = res
  })
  loadSessionEmotion(session.id)
  //更新当前会话对象数据
  Object.assign(currentSession, {
    sessionId: "session_" + session.id,
    status: 'ACTIVE',
    sessionTitle: session.sessionTitle
  })

}

const formatMessage = (message) => {
  return message.replace(/\n/g, '<br>')
}

const handleSessionDelete = (sessionId) => {
  ElMessageBox.confirm('确定要删除该会话吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSession(sessionId).then(() => {
      ElMessage.success('删除成功')
      getSessionPage()
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

//添加会话
const createnewFrontendSession = () => {
  const newSession = {
    sessionId: `temp-${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  Object.assign(currentSession, newSession)

  // 初始化聊天内容，使用默认的AI欢迎消息
  messages.value = []
}

//添加会话
const startNewSession = (message) => {
  //构建会话参数
  const sessionParams = {
    initialMessage: message
  }
  if (currentSession.sessionTitle === '新对话') {
    sessionParams.sessionTitle = `AI助手-${new Date().toLocaleString()}`
  } else {//历史会话记录
    sessionParams.sessionTitle = currentSession.sessionTitle
  }
  //调用接口
  startSession(sessionParams).then(response => {
    //将后端返回的数据转换为前端定义的会话格式
    console.log(response)
    const sessionData = {
      sessionId: response.sessionId,
      status: response.status,
      sessionTitle: sessionParams.sessionTitle
    }
    //如果当前是临时会话，更新数据
    if (currentSession.status === 'TEMP') {
      Object.assign(currentSession, sessionData)
    } else {
      //否则，创建一个新的会话
      Object.assign(currentSession, sessionData)
    }
    //更新会话数据列表
    getSessionPage()

    //开始流式对话
    startAIResponse(currentSession.sessionId, message)
  })
}

//AI流式回话
const startAIResponse = (sessionId, message) => {
  //防止重复发送
  if (isTyping.value) {
    ElMessage.error('AI助手正在输入中，请稍后')
    return
  }
  isTyping.value = true
  const aiMessage = {
    id: `ai-${Date.now()}`,
    senderType: 2,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(aiMessage)
  //调用流式对话 安装npm i @microsoft/fetch-event-source
  const ctl = new AbortController() //用来终止fetch请求
  fetchEventSource('/api/psychological-chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userMessage: message,
    }),
    signal: ctl.signal,
    onopen: (response) => {
      console.log(response)
      if (response.headers.get('Content-Type') !== 'text/event-stream') {
        ElMessage.error('服务器返回非流式数据')
        ctl.abort()

      }
    },
    onmessage: (event) => {
      const raw = event.data
      if (!raw) return

      // 获取到当前会话AI消息
      const aiMessage = messages.value[messages.value.length - 1]

      try {
        const payload = JSON.parse(raw);

        if (event.event === 'done') {
          // 流式对话结束
          isTyping.value = false
          ctl.abort()

          //会话结束 进行情绪分析
          if (currentSession && currentSession.sessionId) {
            if (currentSession && currentSession.sessionId) {
              loadSessionEmotion(currentSession.sessionId)
            }
          }
          return
        }

        const ok = String(payload.code) === '200'
        if (ok && payload.data && payload.data.content) {
          // 累加显示AI回复内容，实现打字机效果
          if (!aiMessage.content) {
            aiMessage.content = payload.data.content
          } else {
            aiMessage.content += payload.data.content
          }

          // 滚动到底部
          nextTick(() => {
            if (messagesContainer.value) {
              messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
          })
        } else {
          // AI错误回复显示
          handleAiError(payload.message || 'AI回复失败')
        }
      } catch (error) {
        console.error('解析流式数据错误:', error)
        handleAiError('数据解析失败')
      }
    },
    onerror: (error) => {
      handleAiError(error || 'AI回复失败')
      throw error
    },
    onclose: () => {
      //会话结束 进行情绪分析
      loadSessionEmotion(currentSession.sessionId)
    }
  })

}

//AI错误回复显示
const handleAiError = (err) => {
  //获取到当前会话AI消息
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage) {
    aiMessage.content = 'AI回复失败，请重试'
    aiMessage.isError = true
  }
  isTyping.value = false
  ElMessage.error(err)
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  isSending.value = true
  console.log(currentSession, 'currentSession')

  // 重置发送状态
  isSending.value = false
  // 添加用户消息
  const userMsg = {
    id: Date.now(),
    senderType: 1,
    content: userMessage,
    createdAt: new Date().toISOString()
  }
  messages.value.push(userMsg)

  // 如果没有会话或者是临时会话，需要创建一个新的会话
  if (currentSession.status === 'TEMP') {
    startNewSession(userMessage)
  } else {
    // 已有会话，直接发送消息
    startAIResponse(currentSession.sessionId, userMessage)
  }

  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

//获取历史会话列表
const getSessionPage = () => {
  const params = {
    pageNum: 1,
    pageSize: 10
  }
  getSessionList(params).then(response => {
    console.log(response)
    sessionList.value = response.records
  })
}

// 页面加载时滚动到底部
onMounted(() => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      createnewFrontendSession()
      getSessionPage()
    }
  })
})
</script>
<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;

    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }

      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }

        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto 20px auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;

              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;

    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 14px;
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }

        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }

        .message-content {
          max-width: 70%;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }

            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border: 1px solid #F87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991B1B;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;

      .input-container {
        flex: 1;
      }

      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }

      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }

    }

  }
}
</style>