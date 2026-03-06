import request from "@/api/request.js";

// 分页查询情绪日记
export const getEmotionDiaryPage = (params) => {
    return request({
        url: '/emotion-diary/admin/page',
        method: 'get',
        params: params
    })
}

// 删除情绪日记
export const deleteEmotionDiary = (id) => {
    return request({
        url: `/emotion-diary/admin/${id}`,
        method: 'delete'
    })
}

//获取会话情绪分析结果
export const getEmotionResult = (sessionId) => {
    return request({
        url: `/psychological-chat/session/${sessionId}/emotion`,
        method: 'get',
    })
}

//创建或更新情绪日记
export const updateEmotionDiary = (data) => {
    return request({
        url: `/emotion-diary`,
        method: 'post',
        data: data
    })
}