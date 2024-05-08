import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios"
// 手动引入element-plus的message组件样式
import 'element-plus/es/components/message/style/css'
// 手动引入element-plus的loading组件样式
import 'element-plus/es/components/loading/style/css'
// 手动引入element-plus的组件
import { ElLoading, ElMessage } from 'element-plus'
import store from '@/store/index'


interface Result<T = any> {
  url(url: any): unknown;
  code: number | string;
  msg: string;
  data: T;
  total: number;
};


// 导出Request类，可以用来自定义传递配置来创建实例
class HttpRequest {
  baseURL: string;
  timeout: number;

  constructor() {
    this.baseURL = '/api';
    this.timeout = 60000
  }

  request<T = any>(options: AxiosRequestConfig): Promise<Result<T>> {
    // axios 实例
    const instance: AxiosInstance = axios.create()
    this.setInterceptors(instance)
    const opts = this.mergeOptions(options)
    return instance(opts)
  }

  get<T = any>(url: string, data?: any, outHeaders = {}): Promise<Result<T>> {
    return this.request<T>({
      method: 'get',
      url,
      params: { ...data }, // get参数可以直接展开
      headers: {}
    })
  }

  post<T = any>(url: string, body = {}, outHeaders = {}): Promise<Result<T>> {
    let data = body
    let headers = outHeaders
    return this.request<T>({
      method: 'post',
      url,
      headers,
      data, // post要求必须传入data属性
    })
  }
  mergeOptions(options: AxiosRequestConfig) {
    //console.log('合并参数', options)
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      ...options
    }
  }
  // 设置拦截器
  setInterceptors(instance: AxiosInstance) {
    let loading: any
    // 请求拦截器
    instance.interceptors.request.use((config) => {
      loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      // 一般会请求拦截里面加token，用于后端的验证
      /*       const token = localStorage.getItem("token")
            config!.headers!.Authorization = token
            config.headers = Object.assign(config.headers, { ...config.headers, token }); */

      return config
    },
      (err: any) => {
        console.log(err);
        return Promise.reject(err);
      })

    // 响应拦截器
    instance.interceptors.response.use(
      (res) => {
        let { status, data, request } = res
        // 是否成功添加到日志
        store.commit('addLog', {
          time: new Date().toLocaleString(),
          msg: [{
            url: request.responseURL,
            status: request.status,
            time: new Date().toLocaleString().split(' ')[1],
          }]
        })
        if (status === 200) {
          // if (data.code === 0) {
            loading.close() // 立即关闭加载框
            return data
          // } else {
          //   ElMessage.error(data.msg)
          //   loading.close() // 立即关闭加载框
          //   return Promise.reject(data)
          // }
        } else {
          ElMessage.error(data)
          loading.close() // 立即关闭加载框
          return Promise.reject(data)
        }
      },
      err => {
        ElMessage.error(err.message)
        loading.close() // 立即关闭加载框
        return Promise.reject(err)
      }
    )
  }
}
// 默认导出Request实例
export default new HttpRequest()