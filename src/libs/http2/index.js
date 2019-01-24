import axios from 'axios'
import router from '@/router'
import {Message,MessageBox} from 'element-ui'
import store from '@/vuex'
import qs from 'querystring'
const TIME_OUT = 10000
let baseUrl = process.env.NODE_ENV === 'production' ? 'fwmp/api' : 'api/fwmp/api'
let http = axios.create({
  baseURL: baseUrl, // 和config/index.js下的proxyTable有关
  timeout: TIME_OUT,
  withCredentials: true
})
// 添加请求拦截器
http.interceptors.request.use(function (config) {
  if (config.method === 'post') {
    config.data = qs.stringify(config.data)
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  if(response.status==200){
    var resData = response.data
    if(resData.code==-1){
      if(resData.code==-1){
        MessageBox.confirm('点击“取消”将留在当前页，点击“确定”将转向登录页。',resData.message || '登录超时请重新登录').then(function(){
          router.push({name: 'login'})
          store.dispatch('exitLogin')
        })
      }
    }
  }
  return response
}, function (err) {
  if (err && err.response) {
    var errorCodeTxtMap = {
      0: '请求错误',
      400: '请求错误',
      401: '未授权，请进行授权',
      403: '拒绝访问',
      404: `请求地址出错: ${err.response.config.url}`,
      408: '请求超时',
      500: '服务器内部错误',
      501: '服务未实现',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
      505: 'HTTP版本不受支持',
    }
    var errorCode = 0
    switch (err.response.status) {
      case 400:
        errorCode = 400
        break			
      case 401:
        errorCode = 401
        break			
      case 403:
        errorCode = 403
        break			
      case 404:
        errorCode = 404
        break			
      case 408:
        errorCode = 408
        break			
      case 500:
        errorCode = 500
        break			
      case 501:
        errorCode = 501
        break			
      case 502:
        errorCode = 502
        break			
      case 503:
        errorCode = 503
        break			
      case 504:
        errorCode = 504
        break			
      case 505:
        errorCode = 505
        break			
      default: errorCode = 0
    }
    var errTxt = errorCodeTxtMap[errorCode] ? errorCodeTxtMap[errorCode] : errorCodeTxtMap[0]
    Message.error(errTxt)
  }
  return Promise.reject(err)
})
export default http
