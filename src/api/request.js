import axios from 'axios'
import {ElMessage} from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        console.log(response,'response')
        // 对响应数据做点什么
        const {data} = response

        if (data.code === '200') {
            return data.data
        }
        //else if (data.code === '-1') {
            //未登录
            //ElMessage.error(data.message || '未登录')
            //localStorage.removeItem('token')
            //window.location.href = '/auth/login'
            //return Promise.reject(new Error(data.message || '未登录'))
        //}
        else {
            ElMessage.error(data.message || '请求失败')
            return Promise.reject(new Error(data.message || '请求失败'))
        }
    },
    (error) => {
        // 对响应错误做点什么
        if (error.response) {
            const {status, data} = error.response

            switch (status) {
                case 401:
                    ElMessage.error('登录已过期，请重新登录')
                    localStorage.removeItem('token')
                    window.location.href = '/auth/login'
                    break
                case 403:
                    ElMessage.error('没有权限访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器内部错误')
                    break
                default:
                    ElMessage.error(data?.message || '网络错误')
            }
        } else {
            ElMessage.error('网络连接失败')
        }

        return Promise.reject(error)
    }
)

export default request