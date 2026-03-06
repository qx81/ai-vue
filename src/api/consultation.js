import request from "@/api/request.js";

// 分页查询咨询会话
export const getConsultationSessions = (params) => {
    return request({
        url: '/psychological-chat/sessions',
        method: 'get',
        params: params
    })
}

// 获取会话消息列表
export const getSessionMessages = (sessionId) => {
    return request({
        url: `/psychological-chat/sessions/${sessionId}/messages`,
        method: 'get'
    })
}

//创建新的绘画
export const startSession = (message) => {
    return request({
        url: `/psychological-chat/session/start`,
        method: 'post',
        data: message
    })
}
//分页查询咨询会话
export const getSessionList = (params) => {
    return request({
        url: '/psychological-chat/sessions',
        method: 'get',
        params: params
    })
}

//删除咨询会话
export const deleteSession = (sessionId) => {
    return request({
        url: `/psychological-chat/sessions/${sessionId}`,
        method: 'delete'
    })
}

//获取会话消息列表
export const getMessageList = (sessionId) => {
    return request({
        url: `/psychological-chat/sessions/${sessionId}/messages`,
        method: 'get'
    })
}