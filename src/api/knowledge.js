import request from './request.js'

//get方式获取文章分类接口
export const getCategories = () => {
    return request({
        url: '/knowledge/category/tree',
        method: 'get'
    })
}

//分页获取知识文章列表
export const articlePage = (params) => {
    return request({
        url: '/knowledge/article/page',
        method: 'get',
        params
    })
}

//新增文章
export const articleAdd = (params) => {
    return request({
        url: '/knowledge/article',
        method: 'post',
        data: params
    })
}

//更新文章状态
export const articleStatus = (params) => {
    return request({
        url: `/knowledge/article/{id}/status`,
        method: 'put',
        data: params
    })
}

//更新文章
export const articleUpdate = (params) => {
    return request({
        url: `/knowledge/article/${params.id}`,
        method: 'put',
        data: params
    })
}

//文件上传
export const fileUpload = (params) => {
    return request({
        url: `/file/upload`,
        method: 'post',
        data: params
    })
}

//获取文章详情
export const getArticleDetail = (id) => {
    return request({
        url: `/knowledge/article/${id}`,
        method: 'get'
    })
}

//删除文章
export const deleteArticle = (id) => {
    return request({
        url: `/knowledge/article/${id}`,
        method: 'delete'
    })
}

//更新文章状态
export const updateArticleStatus = (id, status) => {
    return request({
        url: `/knowledge/article/${id}/status`,
        method: 'put',
        data: { status }
    })
}