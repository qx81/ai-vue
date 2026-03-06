import request from '@/api/request'

// 获取仪表板数据
export function getDashboardOverview() {
  return request({
    url: '/data-analytics/overview',
    method: 'GET'
  })
}