import axios from '@/util/request'

import Live from './config/Live'
import Verify from './config/Verify'

// =============================== 房间信息 ===============================

// 获取直播列表
export const getLiveList = ( params: any) => axios.get(Live.getLiveList, params)

// 获取直播列表(第三方接口)
export const getLiveListByThird = () => axios.get(Live.getLiveListByThird)

// 上传直播信息
export const uploadLiveInfo = (data: any) => axios.request({
    url: Live.uploadLiveInfo,
    method: 'post',
    data: data
})

// =============================== 直播间长链信息 ===============================

// 验证直播间长链信息key
export const getVerifyKey = (data: any) => axios.request({
    url: Verify.getVerifyKey,
    method: 'post',
    data: data
})
