<template>
  <div></div>
</template>

<script>
import { makeBrotliDecode } from "../components/decode/decode.js";
export default {
  props: {
    liveData: {
      type: Object,
      default: "",
    },
    eventData: {
      type: Array,
      default: [],
    },
  },

  data() {
    return {
      eventTarget: new EventTarget(),
      data: this.liveData,
      ws: null,
    };
  },

  created() {
    var _this = this;
    this.webSocket();
    let danmuList = [];
    let giftList = [];
    let scList = [];
    let guardList = [];
    let comboList = [];
    let onlineList = [];
    setInterval(async () => {
      // 如果有一样的room_id,则合并
      let index = this.eventData.findIndex((item) => item.room_id === _this.data.room_id);
      if (index !== -1) {
        this.eventData[index].danmu = this.eventData[index].danmu.concat(danmuList);
        this.eventData[index].gift = this.eventData[index].gift.concat(giftList);
        this.eventData[index].guard = this.eventData[index].guard.concat(guardList);
        this.eventData[index].online = this.eventData[index].online.concat(onlineList);
        this.eventData[index].sc = this.eventData[index].sc.concat(scList);
        this.eventData[index].combo = this.eventData[index].combo.concat(comboList);
      } else {
        this.eventData.push({
          room_id: _this.data.room_id,
          danmu: danmuList,
          gift: giftList,
          guard: guardList,
          online: onlineList,
          sc: scList,
          combo: comboList,
        });
      }
      this.$store.commit("addLog", {
        time: new Date().toLocaleString(),
        msg: [
          {
            url: _this.data.room_id + "数据添加成功",
            status: 200,
            time: new Date().toLocaleString().split(" ")[1],
          },
        ],
      });
      // 清空
      danmuList = [];
      giftList = [];
      scList = [];
      guardList = [];
      comboList = [];
      onlineList = [];
    }, 300000);
    //认证成功事件
    this.on("Certify_Success", function (e) {
      let data = e;
      if (data.code == 0) {
        _this.$store.commit("addLog", {
          time: new Date().toLocaleString(),
          msg: [
            {
              url: _this.data.room_id + "认证成功",
              status: 200,
              time: new Date().toLocaleString().split(" ")[1],
            },
          ],
        });
      } else {
        _this.$store.commit("addLog", {
          time: new Date().toLocaleString(),
          msg: [
            {
              url: "wss连接: " + _this.data.room_id,
              status: 500,
              time: new Date().toLocaleString(),
            },
          ],
        });
      }
    });

    //弹幕事件
    this.on("DANMU_MSG", function (e) {
      let data = e;
      let content = data.info[1];
      let send_user = data.info[0][15]["user"]["base"]["name"];
      let send_user_id = data.info[0][15]["user"]["uid"];
      let create_time = data.info[9]["ts"];
      danmuList.push({
        content: content,
        send_user: send_user,
        send_user_id: send_user_id,
        create_time: create_time,
        room_id: _this.data.room_id,
        live_id: _this.data.room_info.live_id,
      });
    });

    //礼物赠送事件
    this.on("SEND_GIFT", function (e) {
      let data = e;
      let send_user = data.data.sender_uinfo.base.name;
      let send_user_id = data.data.sender_uinfo.uid;
      let gift_name = data.data.giftName;
      let gift_id = data.data.batch_combo_id;
      let gift_num = data.data.num;
      let gift_price = data.data.price;
      let gift_type = data.data.coin_type;
      let create_time = data.data.timestamp;
      let up_id = data.data.receiver_uinfo.uid;
      let up_name = data.data.receiver_uinfo.base.name;
      if (gift_type == "gold") {
        gift_type = 0;
      } else {
        gift_type = 1;
      }
      giftList.push({
        send_user: send_user,
        send_user_id: send_user_id,
        gift_name: gift_name,
        gift_id: gift_id,
        gift_num: gift_num,
        gift_price: gift_price,
        gift_type: gift_type,
        create_time: create_time,
        up_id: up_id,
        up_name: up_name,
        room_id: _this.data.room_id,
        live_id: _this.data.room_info.live_id,
      });
    });

    // SC事件
    this.on("SUPER_CHAT_MESSAGE", function (e) {
      let data = e;
      let content = data.data.message;
      let price = data.data.price;
      let send_user = data.data.user_info.uname;
      let send_user_id = data.data.uid;
      let create_time = data.data.ts;
      let room_id = _this.room_id;
      let up_id = data.data.medal_info.target_id;
      let up_name = data.data.medal_info.medal_name;
      scList.push({
        content: content,
        price: price,
        send_user: send_user,
        send_user_id: send_user_id,
        create_time: create_time,
        room_id: _this.data.room_id,
        up_id: up_id,
        up_name: up_name,
        live_id: _this.data.room_info.live_id,
      });
    });

    // 舰长事件
    this.on("GUARD_BUY", function (e) {
      let data = e;
      let up_time = data.data.start_time;
      let end_time = data.data.end_time;
      let mouth = data.data.num;
      let price = data.data.price;
      let type = data.data.gift_name;
      let notice_id = data.data.uid;
      let notice_name = data.data.username;
      let room_id = _this.data.room_id;
      let create_time = parseInt(new Date().getTime() / 1000);
      guardList.push({
        up_time: up_time,
        end_time: end_time,
        mouth: mouth,
        price: price,
        type: type,
        notice_id: notice_id,
        notice_name: notice_name,
        room_id: _this.room_id,
        create_time: create_time,
        live_id: _this.data.room_info.live_id,
      });
    });

    // 组合礼物事件
    this.on("COMBO_SEND", function (e) {
      let data = e;
      let send_user = data.data.sender_uinfo.base.name;
      let send_user_id = data.data.sender_uinfo.uid;
      let gift_name = data.data.gift_name;
      let gift_id = data.data.batch_combo_id;
      let gift_num = data.data.combo_num;
      let gift_price = data.data.combo_total_coin;
      let gift_type = data.data.coin_type;
      let create_time = parseInt(new Date().getTime() / 1000);
      let room_id = _this.room_id;
      let up_id = data.data.receive_user_info.uid;
      let up_name = data.data.receive_user_info.uname;
      if (gift_type == "gold") {
        gift_type = 0;
      } else {
        gift_type = 1;
      }
      comboList.push({
        send_user: send_user,
        send_user_id: send_user_id,
        gift_name: gift_name,
        gift_id: gift_id,
        gift_num: gift_num,
        gift_price: gift_price,
        gift_type: gift_type,
        create_time: create_time,
        up_id: up_id,
        up_name: up_name,
        room_id: _this.data.room_id,
        live_id: _this.data.room_info.live_id,
      });
    });

    // 在线人数事件
    this.on("ONLINE_RANK_COUNT", function (e) {
      let data = e;
      let content = data.data.count;
      let create_time = parseInt(new Date().getTime() / 1000);
      let room_id = _this.room_id;
      onlineList.push({
        content: content,
        create_time: create_time,
        room_id: _this.data.room_id,
        live_id: _this.data.room_info.live_id,
      });
    });

    // 下播事件
    this.on("PREPARING", function (e) {
      _this.$data.ws.close();
      _this.$store.commit("addLog", {
        time: new Date().toLocaleString(),
        msg: [
          {
            url: _this.data.room_id + "下播",
            status: 500,
            time: new Date().toLocaleString().split(" ")[1],
          },
        ],
      });
      _this.$store.commit("delLiveList", {
        room_id: _this.data.room_id,
      });
    });
  },
  methods: {
    //事件注册
    on(eventType, callback) {
      this.$data.eventTarget.addEventListener(eventType, function (e) {
        callback(e.detail);
      });
    },

    //生成认证数据
    getCertification(json) {
      let encoder = new TextEncoder(); //编码器
      let jsonView = encoder.encode(json); //utf-8编码
      let buff = new ArrayBuffer(jsonView.byteLength + 16); //数据包总长度：16位头部长度+bytes长度
      let view = new DataView(buff); //新建操作视窗
      view.setUint32(0, jsonView.byteLength + 16); //整个数据包长度
      view.setUint16(4, 16); //头部长度
      view.setUint16(6, 1); //协议版本
      view.setUint32(8, 7); //类型,7为加入房间认证
      view.setUint32(12, 1); //填1
      for (let r = 0; r < jsonView.byteLength; r++) {
        view.setUint8(16 + r, jsonView[r]); //填入数据
      }
      return buff;
    },

    //处理服务器发送过来的数据，初步打包
    /*打包格式（JSON）
        键        值类型
        Len        int
        HeadLen     int
        Ver        int
        Type       int
        Num        int
        body       JSON（Type != 3）或者int（Type == 3）
        */
    handleMessage(blob, call) {
      let reader = new FileReader();
      reader.onload = function (e) {
        let buff = e.target.result; //ArrayBuffer对象
        let decoder = new TextDecoder(); //解码器
        let view = new DataView(buff); //视图
        let offset = 0;
        let packet = {};
        let result = [];
        while (offset < buff.byteLength) {
          //数据提取
          let packetLen = view.getUint32(offset + 0);
          let headLen = view.getUint16(offset + 4);
          let packetVer = view.getUint16(offset + 6);
          let packetType = view.getUint32(offset + 8);
          let num = view.getUint32(12);
          if (packetVer == 3) {
            //解压数据
            let brArray = new Uint8Array(buff, offset + headLen, packetLen - headLen);
            let BrotliDecode = makeBrotliDecode(); //生成Brotli格式解压工具的实例
            let buffFromBr = BrotliDecode(brArray); //返回Int8Array视图
            let view = new DataView(buffFromBr.buffer);
            let offset_Ver3 = 0;
            while (offset_Ver3 < buffFromBr.byteLength) {
              //解压后数据提取
              let packetLen = view.getUint32(offset_Ver3 + 0);
              let headLen = view.getUint16(offset_Ver3 + 4);
              let packetVer = view.getUint16(offset_Ver3 + 6);
              let packetType = view.getUint32(offset_Ver3 + 8);
              let num = view.getUint32(12);
              packet.Len = packetLen;
              packet.HeadLen = headLen;
              packet.Ver = packetVer;
              packet.Type = packetType;
              packet.Num = num;
              let dataArray = new Uint8Array(
                buffFromBr.buffer,
                offset_Ver3 + headLen,
                packetLen - headLen
              );
              packet.body = decoder.decode(dataArray); //utf-8格式数据解码，获得字符串
              result.push(JSON.stringify(packet)); //数据打包后传入数组
              offset_Ver3 += packetLen;
            }
          } else {
            packet.Len = packetLen;
            packet.HeadLen = headLen;
            packet.Ver = packetVer;
            packet.Type = packetType;
            packet.Num = num;
            let dataArray = new Uint8Array(buff, offset + headLen, packetLen - headLen);
            if (packetType == 3) {
              //获取人气值
              packet.body = new DataView(
                buff,
                offset + headLen,
                packetLen - headLen
              ).getUint32(0); //若入参为dataArray.buffer，会返回整段buff的视图，而不是截取后的视图
            } else {
              packet.body = decoder.decode(dataArray); //utf-8格式数据解码，获得字符串
            }
            result.push(JSON.stringify(packet)); //数据打包后传入数组
          }
          offset += packetLen;
        }
        call(result); //数据后续处理
      };
      reader.readAsArrayBuffer(blob); //读取服务器传来的数据转换为ArrayBuffer
    },

    async webSocket() {
      const _this = this;
      if ("WebSocket" in window) {
        var timer;
        var ws = new WebSocket("wss://broadcastlv.chat.bilibili.com:443/sub");
        _this.$data.ws = ws;
        ws.onopen = function (e) {
          // console.log("open");
          var certification = {
            uid: 76775755,
            roomid: parseInt(_this.data.room_id),
            protover: 3,
            // cookie里的buvid3
            buvid: "B5D60E82-54FC-2675-DF17-8E3DEFE427F268299infoc",
            platform: "web",
            type: 2,
            key: _this.data.token, //值为空字符串好像也没问题
          };
          ws.send(_this.getCertification(JSON.stringify(certification)));
          //发送心跳包
          timer = setInterval(function () {
            let buff = new ArrayBuffer(16);
            let i = new DataView(buff);
            i.setUint32(0, 0); //整个封包
            i.setUint16(4, 16); //头部
            i.setUint16(6, 1); //协议版本
            i.setUint32(8, 2); //操作码,2为心跳包
            i.setUint32(12, 1); //填1
            ws.send(buff);
          }, 30000); //30秒
        };

        ws.onmessage = function (e) {
          //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
          let blob = e.data;
          _this.handleMessage(blob, function (result) {
            // console.log(result);
            //触发事件
            for (let i = 0; i < result.length; i++) {
              let json = JSON.parse(result[i]);
              if (json.Type == 5) {
                let event = new CustomEvent(JSON.parse(json.body).cmd, {
                  detail: JSON.parse(json.body),
                });
                // console.log(CustomEvent);
                var list = [
                  "DANMU_MSG",
                  "SEND_GIFT",
                  "INTERACT_WORD",
                  "DM_INTERACTION",
                  "WATCHED_CHANGE",
                  "COMMON_NOTICE_DANMAKU",
                  "ENTRY_EFFECT",
                  "LIKE_INFO_V3_UPDATE",
                  "WIDGET_BANNER",
                  "ONLINE_RANK_V2",
                  "POPULAR_RANK_CHANGED",
                  "LIKE_INFO_V3_CLICK",
                  "NOTICE_MSG",
                  "LIVE_INTERACTIVE_GAME",
                  "DANMU_AGGREGATION",
                  "ROOM_REAL_TIME_MESSAGE_UPDATE",
                  "STOP_LIVE_ROOM_LIST",
                  "ONLINE_RANK_COUNT",
                ];
                if (list.includes(JSON.parse(json.body).cmd)) {
                } else {
                  // console.log(JSON.parse(json.body));
                }
                _this.$data.eventTarget.dispatchEvent(event);
              }
              if (json.Type == 8) {
                let event = new CustomEvent("Certify_Success", {
                  detail: JSON.parse(json.body),
                });
                _this.$data.eventTarget.dispatchEvent(event);
              }
              if (json.Type == 3) {
                let event = new CustomEvent("VIEW", { detail: json.body });
                _this.$data.eventTarget.dispatchEvent(event);
              }
            }
          });
        };

        ws.onclose = function (e) {
          //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
          if (timer != null) {
            clearInterval(timer); //停止发送心跳包
          }
        };

        ws.onerror = function (e) {
          //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
          console.log(e);
        };
      } else {
        console.log("您的浏览器不支持WebSocket");
      }
    },
  },
};
</script>
