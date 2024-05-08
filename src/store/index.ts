import { createStore } from 'vuex'

export default createStore({
  // 变量
  state: {
    Log: [], // 日志
    LiveList: [], // 直播列表
    cookie: "buvid3=B5D60E82-54FC-2675-DF17-8E3DEFE427F268299infoc; b_nut=1711182668; _uuid=AE108EB99-1CB4-310CC-3867-8FB74AE39EE468340infoc; buvid4=E81691C4-381A-6089-C3A8-F1D6288253CC68993-024032308-QyzHm7lqg%2BI5SECTkR5Jdw%3D%3D; rpdid=|(J~|J|Ymkk)0J'u~uuu)kYYm; enable_web_push=DISABLE; header_theme_version=CLOSE; CURRENT_FNVAL=4048; buvid_fp_plain=undefined; LIVE_BUVID=AUTO9117112934962696; hit-dyn-v2=1; DedeUserID=76775755; DedeUserID__ckMd5=3c3d0182e5cd8925; i-wanna-go-back=-1; b_ut=5; CURRENT_QUALITY=116; FEED_LIVE_VERSION=V_WATCHLATER_PIP_WINDOW3; bp_video_offset_76775755=919441327172616243; fingerprint=2d66d85a5c3f61b3e1667822abcd77e8; home_feed_column=4; bp_t_offset_76775755=923571818681335827; buvid_fp=2d66d85a5c3f61b3e1667822abcd77e8; PVID=2; b_lsid=FCD9AD58_18F4B810788; SESSDATA=1236ad45%2C1730510710%2C417fd%2A52CjAoSHma6NTR6QLfzGdcMiCJh-i2x61QaE22qUWlUfqsy7JKBmUtODzLR9FBaR_Ud-MSVm5Ca01GMGp1X3pabWJlWjMwal9DNVB3Z2p4cjhhM01acU5iaHJQWmpWbjM2RVdwN1Iwd0MzNl84Q1lYZWFaOEJIQ05vYVZmQTB5RzNnOUxMYllySHh3IIEC; bili_jct=c8ba15c093aad179909e230b7c00e81c; sid=8m2ukg8i; browser_resolution=502-750", // cookie
  },
  // 获取变量
  getters: {
    getLiveList: (state) => state.LiveList,
    getLog: (state) => state.Log
  },
  // 设置变量
  mutations: {
    setLiveList(state: { LiveList: { roomid: string }[] }, data: { roomid: string }[]) {
      state.LiveList = data;
    },

    // 删除直播列表
    delLiveList(state: { LiveList: { room_id: string }[] }, data: { room_id: string }) {
      state.LiveList = state.LiveList.filter((item) => {
        return item.room_id !== data.room_id;
      });
    },

    setLog(state: { Log: any[] }, data: any) {
      state.Log = data;
    },
    addLog(state: any, data) {
      // 查看是否有日期相同的日志,有则添加到该日期下，没有则新建日期
      if (state.Log.length === 0) {
        state.Log.push(data)
      } else {
        for (let i = 0; i < state.Log.length; i++) {
          if (state.Log[i].time.split(' ')[0] === data.time.split(' ')[0]) {
            state.Log[i].msg.push(data.msg[0]);
            return
          }
        }
      }

    }
  },


  // 异步设置变量
  actions: {
  },
  // 模块
  modules: {
  }
})
