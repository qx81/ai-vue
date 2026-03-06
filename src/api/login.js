import request from './request.js'

// 登录接口
export const login = (data) => {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

// 退出登录接口
export const logout = () => {
    return request({
        url: '/user/logout',
        method: 'post'
    })
}

// 注册接口
export const register = (data) => {
    return request({
        url: '/user/add',
        method: 'post',
        data
    })
}