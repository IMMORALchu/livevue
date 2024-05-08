<style scoped lang="scss">
:global(.el-card__header) {
  padding: 0 !important;
}

:global(.el-card__body) {
  display: flex;
  /* justify-content: space-between; */
  flex-direction: row;
  flex-wrap: wrap;
}

:global(.el-timeline) {
  padding: 0 1rem !important;
}

:global(.el-timeline-item__timestamp.is-top) {
  font-size: 1.3rem;
}

.log_box {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
<template>
  <div>
    <el-card style="max-width: 100vw">
      <template #header>
        <div class="card-header">
          <h2>View Log</h2>
        </div>
      </template>
      <el-scrollbar height="80vh">
        <div>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in log_list"
              :key="index"
              :timestamp="item.time.split(' ')[0]"
              placement="top"
            >
              <el-card>
                <div class="log_box" v-for="items in item.msg" :key="items">
                  <span style="line-height: 1.8; margin-right: 20px">{{
                    items.time
                  }}</span>
                  <span style="line-height: 1.8; margin-right: 20px">{{
                    items.url
                  }}</span>
                  <el-tag :type="items.status == 200 ? 'success' : 'warning'">{{
                    items.status
                  }}</el-tag>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-scrollbar>
    </el-card>
    <websocket
      v-for="item in $store.state.LiveList"
      :key="item.room_id"
      :liveData="item"
      :eventData="eventData"
    />
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import {
  getLiveList,
  getVerifyKey,
  uploadLiveInfo,
  getLiveListByThird,
} from "../api/api";
import websocket from "../components/websocket.vue";
@Options({
  components: {
    websocket,
  },
})
export default class HomeView extends Vue {
  log_list: any[] = []; // 日志列表
  eventData: any[] = []; // 直播间事件数据列表

  async mounted() {
    // 获取直播间列表
    const res = await getLiveList({ type: 1 });
    // 获取第三方直播间列表
    const res3 = await getLiveListByThird();
    // 合并直播间列表,res3中的直播间添加到res中
    // @ts-ignore
    for (let i = 0; i < res3.length; i++) {
      // 检测是否已经存在
      // @ts-ignore
      if (res.data.some((item: any) => item.room_id !== res3[i])) {
        res.data.push({
          // @ts-ignore
          room_id: res3[i],
        });
      }
    }
    // 获取直播间key
    const res2 = await getVerifyKey({
      room_id: res.data.map((item: any) => item.room_id),
      cookie: this.$store.state.cookie,
    });
    // 找到res中对应的room_id,并添加token
    res.data.forEach((item: any) => {
      res2.data.forEach((item2: any) => {
        if (item.room_id === item2.room_id) {
          item.token = item2.token;
          item.room_info = item2.room_info;
        }
      });
    });
    this.$store.commit("setLiveList", res.data);
    setInterval(async () => {
      // 获取直播间列表
      const res = await getLiveList({ type: 1 });
      // 获取第三方直播间列表
      const res3 = await getLiveListByThird();
      // 合并直播间列表,res3中的直播间添加到res中
      // @ts-ignore
      for (let i = 0; i < res3.length; i++) {
        // 检测是否已经存在
        // @ts-ignore
        if (res.data.some((item: any) => item.room_id !== res3[i])) {
          res.data.push({
            // @ts-ignore
            room_id: res3[i],
          });
        }
      }

      // 单独获取直播间key
      // 找到不在this.$store.state.LiveList中的直播间
      // 找到res中对应的room_id,并添加token
      // 添加到res.data中
      const newLiveList = res.data.filter(
        (item: any) =>
          // @ts-ignore
          !this.$store.state.LiveList.some((item2: any) => item2.room_id === item.room_id)
      );
      if (newLiveList.length === 0) return;
      const res2 = await getVerifyKey({
        room_id: newLiveList.map((item: any) => item.room_id),
        cookie: this.$store.state.cookie,
      });
      newLiveList.forEach((item: any) => {
        res2.data.forEach((item2: any) => {
          if (item.room_id === item2.room_id) {
            item.token = item2.token;
            item.room_info = item2.room_info;
          }
        });
      });
      this.$store.commit("setLiveList", res.data);
    }, 500000);
  }

  created() {
    this.$watch(
      "$store.state.Log",
      (newVal, oldVal) => {
        this.log_list = newVal;
      },
      { deep: true }
    );
    this.$watch(
      "eventData",
      async (newVal, oldVal) => {
        // @ts-ignore
        if (newVal.length == this.$store.state.LiveList.length) {
          const res = await uploadLiveInfo({
            data: this.eventData,
          });
          if (res.code == 0) {
            console.log("上传成功");
            this.eventData = [];
          }
        }
      },
      { deep: true }
    );
  }
}
</script>
