<template>
  <div class="parent">
    <Head></Head>
    <a-spin :spinning="showLoading" tip="Loading...">
      <div class="map_page_box">
        <div class="map_page">
          <slider @selectedManid="getselectmanid" @mapOpacitySet="mapopacityset" @letterset="letterset" @markerset="markerset" @tailset="taillengthset" :createmap="createmap" :manList="manList" :playInfo="playInfo"></slider>
          <div class="right">
            <div id="mapcontainer" @click="getPosition($event)"></div>
            <div class="control">
              <!-- <span @click="showPoint" style="cursor:pointer">select</span> -->
              <img @click="play" v-if="suspend" src="../assets/images/suspend.png" alt />
              <img @click="play" v-else src="../assets/images/play_btn.png" alt />
              <a-slider
                :max="progressMan"
                class="prodress_bar"
                :step="1"
                @change="onChange"
                v-model="inputValue"
              />
              <div>
                <p @click="showSpeedModel">X{{speedNumber}}</p>
                <ul v-show="selectSpeedModel">
                  <li @click="selectSpeed(1)">1</li>
                  <li @click="selectSpeed(5)">5</li>
                  <li @click="selectSpeed(10)">10</li>
                  <li @click="selectSpeed(15)">15</li>
                  <li @click="selectSpeed(20)">20</li>
                  <li @click="selectSpeed(30)">30</li>
                  <li @click="selectSpeed(60)">60</li>
                  <li @click="selectSpeed(120)">120</li>
                </ul>
              </div>
              <img @click="fullscreen" class="fullScreen" src="../assets/images/FullScreen.png" alt />
            </div>
            <div class="selectPointBtn" @click="showPoint">
              <img src="../assets/images/selectPoint.png" alt />
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>
<script>
import moment from "moment";
import slider from "@/components/slider.vue";
import Head from "@/components/Head.vue";
import Maploader from "@/assets/js/AMap.js";
import {
  findListAndPostBack,
  selectGpsData,
  findLinePointData,
  findListAndGpsData,
  findListAndGpsDataByPoint,
  findListAndGpsDataByStartTime,
  findListAndGpsDataByLocaltion,
  mapfindEntity
} from "@/api";
export default {
  data() {
    return {
      isSync:false,
      showPointSelect:true,//选择方式，点或者时间
      showControl: false,
      pointList: [], //中间点数组
      createmap: null, //地图
      selectSpeedModel: false, //选择速度模块
      speedNumber: 60, //速度值
      defaultValue: 0,
      theamap: null,
      inputValue: 0,
      suspend: true,
      isBegin: true, //是否开始播放
      inter: null, //计时器
      playInfo: [], //人员列表
      colorArr: [
        "#0000ff",
        "#fe0000",
        "#008000",
        "#800000",
        "#000080",
        "#ff0080",
        "#ff8000",
        "#0080ff",
        "#7f00fd",
        "#08bf08",
        "red"
      ],
      showPoints: false, //点选择
      showLoading: false,
      manList: [], //对比人物列表
      progressMan: 100, //进度条最大值
      poionList: [], //点列表
      theselectPoint: [], //选择的点
      windowNum: "", //窗口号
      selectManidList: [],
      imgUrl: "",
      mapCenter: [114.434956, 30.147048],
      startTime: "",
      endTime: "",
      defaultStartTime:'' ,
      defaultEndTime: '',
      isAllTime: false,
      westlng:'', //西南角经度
      southlat:'', //西南角纬度
      eastlng:'', //东北角经度
      northlat:'', //东北角纬度
      currentGameTime:'2019-10-20 10:00:00',
      tailLength:30,//尾巴长度
      MarkerSize:13,//Marker宽高
      mapoacity:0.5,//地图透明度
      socket:{},
      flag:true,//控制websocket重连
      contextMenuPositon:null,//右键窗口坐标
      mouseTool:null,//右键工具
      contextMenu:null,//右键菜单
    };
  },
  name: "mapPage",
  components: {
    Head,
    slider
  },
  created(){
    let query = this.$route.query;
    this.defaultStartTime = query.startTime;
    this.defaultEndTime = query.endTime;
    this.startTime = query.startTime;
    this.endTime = query.endTime;
  },
  mounted() {
    this.getMapData()
    let query = this.$route.query
    this.windowNum = query.gameId + query.gameItemId + query.groupId
    this.groupId = query.groupId
    this.getMan()
  },
  methods: {
    moment,
    getPosition (e){ //点击选择点获取历史数据
      if(e.srcElement.id == 'getposition'){
        let query = this.$route.query
        let params = {}
        params.competitionId = query.gameId
        params.competitionItemId = query.gameItemId
        params.groupId = query.groupId
        params.startLongitude = this.contextMenuPositon.Q //开始经度
        params.startLatitude = this.contextMenuPositon.P //开始纬度
        params.endLongitude = '114.31624675825236' //结束经度
        params.endLatitude = '30.33070437415784' //结束纬度
        params.sIds = []
        for(let i = 0;i<this.selectManidList.length;i++){
          let item = this.selectManidList[i]
          params.sIds.push(item.id)
        }
        console.log(params)
        // return
        this.showLoading = true
        let that = this
        findListAndGpsDataByLocaltion(params).then(res=>{
          console.log(res)
          if (res.status == 1) {
            that.createmap.clearMap()
            that.showControl = true
            let man = {}
            man.id = []
            man.name = []
            man.item = []
            let startTimelist = []
            let endTimelist = []
            for (let i = 0; i < res.data.length; i++) {
              let item = res.data[i];
              if (item.gpsData && item.gpsData.length > 0) {
                that.createmap.setCenter([
                  item.gpsData[0].longitude,
                  item.gpsData[0].latitude
                ])
                startTimelist.push(new Date(item.gpsData[0].currTime).getTime())
                endTimelist.push(new Date(item.gpsData[item.gpsData.length - 1].currTime).getTime())
                man.id.push(item.id)
                man.name.push(item.name)
                man.item.push(item)
                man["arr" + item.id] = [];
                man["compare" + item.id] = [];
                man["gps" + item.id] = [];
                let gpslist = item.gpsData;
                for (let j = 0; j < gpslist.length; j++) {
                  let gpsitem = gpslist[j];
                  man["gps" + item.id].push(gpsitem);
                  if (man["arr" + item.id].length <= 1) {
                    man["arr" + item.id].push([
                      gpsitem.longitude,
                      gpsitem.latitude
                    ]);
                    man["compare" + item.id].push([
                      gpsitem.longitude,
                      gpsitem.latitude
                    ]);
                  } else {
                    let nowpoint = [gpsitem.longitude, gpsitem.latitude];
                    let lastpoint =
                      man["compare" + item.id][man["compare" + item.id].length - 1]; //最后一个点
                    if (lastpoint != "away") {
                      //上个点是正常点
                      let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint);
                      if (dis < 0) {
                        //抛弃
                        man["compare" + item.id].push("away");
                      } else {
                        //保留
                        man["compare" + item.id].push(nowpoint);
                        man["arr" + item.id].push(nowpoint); //真正运动的点
                      }
                    } else {
                      let usepoint = man["compare" + item.id][man["compare" + item.id].length - 2];
                      let dis = AMap.GeometryUtil.distance(nowpoint, usepoint);
                      let x = (nowpoint[0] + usepoint[0]) / 2;
                      let y = (nowpoint[1] + usepoint[1]) / 2;
                      gpsitem.longitude = x
                      gpsitem.latitude = y
                      man["compare" + item.id].push(nowpoint);
                      man["arr" + item.id].push([x, y]); //真正运动的点
                    }
                  }
                }
              } 
            }
            for (var i = 0; i < man.item.length; i++) {
              let theitem = man.item[i]
              let item = theitem.id
              
              let second = that.getTimeDiff(
                  man["gps" + item][man["gps" + item].length - 1].currTime,
                  man["gps" + item][0].currTime
                ) / 1000
              let indexArr = String(i).split("")
              let theindex = indexArr[String(i).split("").length - 1] - 0
              var dis = that.theamap.GeometryUtil.distanceOfLine(man["arr" + item])
              let arrlength = man["arr" + item].length
              man["speed" + item] = (dis / second) * 3.6
              console.log(dis)
              man["historypassedPolyline" + item] = new that.theamap.Polyline({
                map: that.createmap,
                lineJoin: "round",
                strokeColor: that.colorArr[theindex + 1], //线颜色
                strokeWeight: 4, //线宽
                strokeOpacity: 1,
                zIndex: 51,
              })
              man["historypassedPolyline1" + item] = new that.theamap.Polyline({
                map: that.createmap,
                lineJoin: "round",
                path:man['arr'+item],
                strokeColor: that.colorArr[theindex+1], //线颜色
                strokeWeight: 4, //线宽
                strokeOpacity: 1,
                zIndex: 51
              })
              that.createmap.remove(man["historypassedPolyline1" + item])
              let manno = ''
              if(theitem.no){
                manno = theitem.no
              }
              man["historymarker" + item] = new that.theamap.Marker({
                map: that.createmap,
                position: man["arr" + item][0],
                content:
                  '<div  class="marker" style="display:inline-block;width:'+that.MarkerSize+'px;height:'+that.MarkerSize+'px;border-radius:50%;background-color:'+that.colorArr[theindex+1]+';border:2px solid #fff"></div>',
                offset: new that.theamap.Pixel(-7, -7),
                label: {
                  offset: new that.theamap.Pixel(0, 0), //设置文本标注偏移量
                  direction: "right",
                  content:
                    '<div class="info" style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' +
                    that.colorArr[theindex+1] +
                    '">' +
                    '<p  style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' + that.colorArr[theindex+1] +'">'+theitem.name+'</p>'+
                    '<p  style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' + that.colorArr[theindex+1] +'">'+theitem.nationality + manno+'</p>'+
                    "</div>"
                }
              })
            }
            startTimelist.sort()
            endTimelist.sort()
            let diffTime =
              (endTimelist[endTimelist.length - 1] - startTimelist[0]) / 1000
            that.progressMan = diffTime
            that.manList = man
            that.showLoading = false
            // console.log( that.manList)
          }else{
            this.showLoading = false
          }
        }).catch(err=>{
          console.log(err)
        })
      }
      this.mouseTool.close();
      this.contextMenu.close();
    },
    check(){
      let that = this
      if(that.flag){
        that.createmap.clearMap();
        that.socket.init();
      }
      setTimeout(function(){that.check()},1000);
    },
    liveTelecast() {//直播
      let that = this;
      that.socket.init = function(){
        var websocket = null;
        //判断当前浏览器是否支持WebSocket
        if ("WebSocket" in window) {
          let baseurl = "http://120.79.217.181:8088/"
          var url = baseurl.replace("http", "ws") + "websocket?urlCode=" + that.windowNum //20为客户端窗口标识
          websocket = new WebSocket(url)
        } else {
          alert("Not support websocket")
        }
        //连接发生错误的回调方法
        websocket.onerror = function() {
          console.log("webSocket_Err")
        };
        //连接成功建立的回调方法
        websocket.onopen = function(event) {
          console.log("open")
          that.flag=false
        };
        //接收到消息的回调方法
        let playerList = {}
        playerList.playerId = []
        websocket.onmessage = function(event) {
          // console.log(JSON.parse(event.data))
          var data = JSON.parse(event.data)
          if (data.crossGpsData.isLocation == "1") {
            for (let i = 0; i < that.playInfo.length; i++) {
              let item = that.playInfo[i]
              if (data.id == item.id) {
                //给这个人添加
                let id = item.id
                item["testarr" + id] = null
                item["testarr" + id] = []
                if (!item.lineArr) {
                  //轨迹数组
                  item.lineArr = []
                  item["compare" + data.id] = []
                }
                if (item["compare" + data.id].length <= 1) {
                  if (!item.marker) {
                    item["compare" + data.id].push([
                      data.crossGpsData.longitude,
                      data.crossGpsData.latitude
                    ]);
                    //第一次拿到选手数据
                    that.createmap.setCenter(item.lineArr.slice(0, 1)[0])
                    item.marker = new that.theamap.Marker({
                      map: that.createmap,
                      position: item.lineArr[0],
                      content:
                        '<div style="display:inline-block;width:'+that.MarkerSize+'px;height:'+that.MarkerSize+'px;border-radius:50%;background:' + item.color +';border:4px solid #333"></div>',
                      offset: new that.theamap.Pixel(-8, -8),
                      label: {
                        offset: new that.theamap.Pixel(5, 5), //设置文本标注偏移量
                        direction: "right",
                        content:
                          '<div class="info" style="font-size:16px;font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' +
                          item.color +
                          '">' +
                          "<p style='font-size:16px;font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0'>" +
                          item.name +
                          "</p>" +
                          "<p style='font-size:16px;font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0'>" +
                          item.nationality +" "+item.no +
                          "</p>" +
                          "</div>"
                      }
                    })
                    item.passedPolyline = new that.theamap.Polyline({
                      map: that.createmap,
                      lineJoin: "round",
                      lineCap: "round",
                      strokeColor: item.color, //线颜色
                      strokeWeight: 6 //线宽
                    })
                    item.passedPolyline1 = new that.theamap.Polyline({
                      map: that.createmap,
                      lineJoin: "round",
                      lineCap: "round",
                      strokeColor: item.color, //线颜色
                      strokeWeight: 5 //线宽
                    })
                    item.marker.on("moving", function(e) {
                      item.passedPolyline.setPath(e.passedPath)
                    })
                    if (item.isSelect) {
                      if (item.marker) {
                        that.createmap.add(item.marker)
                      }
                      if (item.passedPolyline) {
                        that.createmap.add(item.passedPolyline)
                      }
                      if (item.passedPolyline1) {
                        that.createmap.add(item.passedPolyline1)
                      }
                    } else {
                      if (item.marker) {
                        that.createmap.remove(item.marker)
                      }
                      if (item.passedPolyline) {
                        that.createmap.remove(item.passedPolyline)
                      }
                      if (item.passedPolyline1) {
                        that.createmap.remove(item.passedPolyline1)
                      }
                    }
                  } else {
                    item["compare" + data.id].push([
                      data.crossGpsData.longitude,
                      data.crossGpsData.latitude
                    ])
                  }
                } else {
                  if (item.isSelect) {
                    if (item.marker) {
                      that.createmap.add(item.marker)
                    }
                    if (item.passedPolyline) {
                      that.createmap.add(item.passedPolyline)
                    }
                    if (item.passedPolyline1) {
                      that.createmap.add(item.passedPolyline1)
                    }
                  } else {
                    if (item.marker) {
                      that.createmap.remove(item.marker)
                    }
                    if (item.passedPolyline) {
                      that.createmap.remove(item.passedPolyline)
                    }
                    if (item.passedPolyline1) {
                      that.createmap.remove(item.passedPolyline1)
                    }
                  }
                  let nowpoint = [
                    data.crossGpsData.longitude,
                    data.crossGpsData.latitude
                  ];
                  let lastpoint = item["compare" + data.id][item["compare" + data.id].length - 1] //最后一个点
                  if (lastpoint == "away") {
                    let usepoint = item["compare" + data.id][item["compare" + data.id].length - 2]
                    let x = (nowpoint[0] + usepoint[0]) / 2
                    let y = (nowpoint[1] + usepoint[1]) / 2
                    item["compare" + data.id].push(nowpoint)
                    item.lineArr.push([x, y]) //真正运动的点
                    if (item.lineArr.length > that.tailLength) {
                      item.lineArr.splice(0, 1)
                    } 
                    item.passedPolyline1.setPath(item.lineArr.slice(0, item.lineArr.length - 1))
                    let p1 = item.lineArr[item.lineArr.length - 1]
                    let p2 = item.lineArr[item.lineArr.length - 2]
                    let dis = AMap.GeometryUtil.distance(p1, p2)
                    item.marker.moveAlong(item.lineArr.slice(item.lineArr.length - 2),dis * 2)
                  } else {
                    //和上个点判断距离，如果小于2.5，抛弃
                    let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint)
                    if (dis < 2.5) {
                      //如果小于2.5，抛弃
                      item["compare" + data.id].push("away")
                    } else {
                      item["compare" + data.id].push(nowpoint)
                      item.lineArr.push(nowpoint) //真正运动的点
                      if (item.lineArr.length > that.tailLength) {
                        item.lineArr.splice(0, 1)
                      } 
                      item.passedPolyline1.setPath(item.lineArr.slice(0, item.lineArr.length - 1))
                      let p1 = item.lineArr[item.lineArr.length - 1]
                      let p2 = item.lineArr[item.lineArr.length - 2]
                      let dis = AMap.GeometryUtil.distance(p1, p2)
                      item.marker.moveAlong(item.lineArr.slice(item.lineArr.length - 2),dis * 3.6)
                    }
                  }
                }
                break
              }
            }
          }
        }
        //连接关闭的回调方法
        websocket.onclose = function(){
            that.flag=true
        }
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function(){
            websocket.close()
        }
        //关闭连接
        function closeWebSocket(){
            websocket.close()
        }
      }
      that.check()
    },
    markerset(value){//marker宽高设置
      let markerList = document.querySelectorAll('.marker')
      for(let i = 0;i<markerList.length;i++){
        markerList[i].style.width = value + "px"
        markerList[i].style.height = value + "px"
        
      }
      let infoList = document.querySelectorAll('.info')
      for(let i = 0;i<infoList.length;i++){
        infoList[i].parentNode.style.left = value+1+'px'
        infoList[i].parentNode.style.top = -28 + value/1.3 +'px'
      }
    },
    letterset(value){//marker文字大小
      let infoList = document.querySelectorAll('.info')
      for(let i = 0;i<infoList.length;i++){
        infoList[i].style.fontSize = value + "px"
        infoList[i].style.lineHeight = value + "px"
      }
    },
    mapopacityset(value){//地图透明度设置
      document.querySelectorAll('.amap-layers')[0].getElementsByTagName("img")[0].style.opacity = value
      this.createmap.getLayers()[0]['Je'].opacity=value
    },
    play() { //播放按钮
      let that = this
      that.suspend = !that.suspend
      if (this.suspend) {
        // console.log('暂停')
        for (let i = 0; i < that.manList.id.length; i++) {
          let id = that.manList.id[i]
          that.manList["historymarker" + id].pauseMove()
        }
        this.stopTimer()
      } else {
        // console.log('播放')
        if (this.isBegin) {
          if (that.manList && that.manList.id.length > 0) {
            this.startTimer()
            for (let i = 0; i < that.manList.id.length; i++) {
              let id = that.manList.id[i]
              let listArr = that.manList["arr" + id]
              let testarr = []
              if (that.manList["PointArr" + id]) {
                let pointArrIndex = that.manList["PointArr" + id]
                testarr = listArr.slice(0, pointArrIndex)
                that.manList["marker" + id].moveAlong(
                  listArr.slice(pointArrIndex - 1),
                  that.manList["speed" + id] * that.speedNumber
                )
              } else {
                if(that.isSync){//实时
                  let starttime = that.manList.item[0].startTime
                  let thistime
                  for(let i = 0;i<that.manList.item.length;i++){
                    let manitem = that.manList.item[i]
                    if(manitem.id == id){
                      thistime = manitem.startTime
                    }
                  }
                  setTimeout(() => {
                    that.manList["historymarker" + id].moveAlong(
                      listArr,
                      that.manList["speed" + id] * that.speedNumber
                    )
                  }, that.getTimeDiff(thistime,starttime)/that.speedNumber)
                }else{//同步
                  that.manList["historymarker" + id].moveAlong(
                    listArr,
                    that.manList["speed" + id] * that.speedNumber
                  )
                }
              }
              that.manList["historymarker" + id].on("moving", function(e) {
               
                let truthData = e.passedPath
                let testarr2
                if (that.manList["PointArr" + id]) {
                  truthData = testarr.concat(truthData)
                }
                if (truthData.length > that.tailLength) {
                  testarr2 = truthData.slice(truthData.length - that.tailLength)
                } else {
                  testarr2 = truthData.slice(0)
                }
                that.manList["historypassedPolyline" + id].setPath(testarr2)
              })
            }
            this.isBegin = false
          } else {
            that.suspend = !that.suspend
          }
        } else {
          for (let i = 0; i < that.manList.id.length; i++) {
            let id = that.manList.id[i]
            that.manList["historymarker" + id].resumeMove()
          }
          this.startTimer()
        }
      }
    },
    timer() {//计时器函数
      this.inputValue += 1
      if (this.inputValue >= this.progressMan) {
        //进度条已走完
        clearInterval(this.inter)
      }
    },
    startTimer() { //开始计时器
      this.inter = setInterval(this.timer, 100)
    },
    stopTimer() { //停止计时器
      clearInterval(this.inter)
    },
    onChange(value) {//进度条变化
      this.suspend = true
      let that = this
      this.isBegin = true
      this.stopTimer()
      for (let i = 0; i < that.manList.id.length; i++) {
        let id = that.manList.id[i]
        let listArr = that.manList["arr" + id]
        // console.log(listArr);
        let ratio = that.progressMan / listArr.length
        let thevalue = Math.ceil(value / ratio)
        that.manList["historymarker" + id].stopMove()
        that.manList["historymarker" + id].setPosition(listArr[parseInt(thevalue) - 1])
        if (parseInt(thevalue) > that.tailLength) {
          that.manList["historypassedPolyline" + id].setPath(
            listArr.slice(parseInt(thevalue) - that.tailLength, parseInt(thevalue))
          );
        } else {
          that.manList["historypassedPolyline" + id].setPath(
            listArr.slice(0, parseInt(thevalue)),
            parseInt(thevalue)
          )
        }
        that.manList["PointArr" + id] = thevalue
      }
    },
    selectShowType(){//选择方式
      this.showPointSelect = !this.showPointSelect
    },
    getselectmanid(res) {//获取人员选择
      this.selectManidList = res
    },
    taillengthset(value){//获取尾巴线长度
      this.tailLength = value
    },
    hiddPoints() {//隐藏点选择
      this.showPoints = !this.showPoints
    },
    selectPoint(index) {//选择点
      if(index==1){//实时
        this.isSync = false
      }else{//同步
        this.isSync = true
      }
      return
      this.$set(
        this.poionList[index],
        "isSelect",
        !this.poionList[index].isSelect
      )
    },
    showPoint() {//展示点选择
      this.showPoints = !this.showPoints
    },
    fullscreen() {//全屏
      var elem = document.getElementById("mapcontainer")
      this.requestFullScreen(elem)
    },
    showSpeedModel() {//展开速度选择
      this.selectSpeedModel = !this.selectSpeedModel
    },
    selectSpeed(value) {//选择速度
      this.speedNumber = value
      this.selectSpeedModel = false
    },
    getMap() {//获取地图
      let that = this
      Maploader()
        .then(AMap => {
          console.log("地图加载成功")
          that.theamap = AMap
          let imageLayer = new AMap.ImageLayer({
            //地图贴图
            url: 'http://120.79.142.200:82/' + that.imgUrl,
            opacity: that.mapoacity,
            bounds: new AMap.Bounds(
              [that.westlng,that.southlat],//西南角经纬度
              [that.eastlng,that.northlat]//东北角经纬度
            ),
            zooms: [13, 20]
          })
          that.createmap = new AMap.Map("mapcontainer", {
            //创建地图
            center: that.mapCenter,
            expandZoomRange: true,
            zooms: [13, 20],
            zoom: 15,
            layers: [
              new AMap.TileLayer(), //图片切层,取消则不显示地图
              imageLayer,
              // new AMap.TileLayer.Satellite()
            ]
          })
          //创建右键菜单
         
          //自定义菜单类
          //地图中添加鼠标工具MouseTool插件
          that.mouseTool = new AMap.MouseTool(that.createmap)
          
          var content = []
          content.push("<div class='info context_menu'>")
          content.push("<p style='min-width:60px' id='getposition'>获取坐标</p>")
          content.push("</div>")
          //通过content自定义右键菜单内容
          that.contextMenu = new AMap.ContextMenu({isCustom: true, content: content.join('')})
          //地图绑定鼠标右击事件——弹出右键菜单
          that.createmap.on('rightclick', function (e) {
              that.contextMenu.open(that.createmap, e.lnglat)
              that.contextMenuPositon = e.lnglat //右键菜单位置
          })
        })
        .catch(error => {
          console.log("失败")
        })
    },
    async getMapData(){ //获取地图信息
        let query = this.$route.query
        await mapfindEntity(query.gameId, query.gameItemId, query.groupId).then(res=>{
            console.log(res)
            if(res.status == '1'){
                if(res.data){
                    this.imgUrl =  res.data.mapUrl,
                    this.westlng = res.data.westLng,
                    this.southlat = res.data.southLat,
                    this.eastlng = res.data.eastLng,
                    this.northlat = res.data.northLat
                    this.mapCenter = [(this.westlng+this.eastlng)/2,(this.southlat+this.northlat)/2]
                    this.getMap()
                }
            }
        })
    },
    getMan() {//获取人员
      this.showLoading = true
      let query = this.$route.query
      findListAndPostBack(query.gameId, query.gameItemId, query.groupId)
        .then(res => {
          this.playInfo = []
          console.log(res)
          if (res.status == 1) {
            if (res.data.length > 0) {
              for (let i = 0; i < res.data.length; i++) {
                let indexArr = String(i).split("")
                let theindex = indexArr[String(i).split("").length - 1]
                let item = res.data[i]
                item.color = this.colorArr[theindex]
                item.isSelect = false
                item.centerSet = false
                item.autocenterset = false
                item.highlightset = false
                item.fullrouteset = false
                this.playInfo.push(item)
              }
              this.showLoading = false
              // this.liveTelecast();
            } else {
              this.showLoading = false
              alert("当前组别没有比赛人员！")
            }
          } else {
            this.showLoading = false
          }
        })
        .catch(err => {
          // console.log(err)
          this.showLoading = false
        });
    },
    requestFullScreen(element) {//全屏
      var requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen
      if (requestMethod) {
        requestMethod.call(element)
      } else if (typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell")
        if (wscript !== null) {
          wscript.SendKeys("{F11}")
        }
      }
    },
    getTimeDiff(recordTime, golbTime) {//获取时间差
      var curr_time = new Date(recordTime).getTime()
      var first_time = new Date(golbTime).getTime()
      var diff = curr_time - first_time
      return diff
      //计算出小时数
      var leave1 = diff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
      var days = Math.floor(diff / (24 * 3600 * 1000))
      var hours = Math.floor(leave1 / (3600 * 1000))
      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000))
      //计算相差秒数
      var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
      var seconds = Math.round(leave3 / 1000)
      hours = hours >= 10 ? hours : "0" + hours
      minutes = minutes >= 10 ? minutes : "0" + minutes
      seconds = seconds >= 10 ? seconds : "0" + seconds
      //赋值
      time = "+" + hours + ":" + minutes + ":" + seconds
      return time
    },
  },
};
</script>
<style lang="scss" scoped>
.parent {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  background-color: $bgc-color;
}
.map_page_box {
  padding: 0 60px;
}
.map_page {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  user-select: none;
  background-color: #fff;
  // width: 1200px;
  display: flex;
  margin: 0 auto;
  height: 600px;
  margin-top: 20px;
  .left {
    color: #fff;
    width: 300px;
    background-color: #59acf8;
    padding: 10px;
    padding-left: 15px;
    cursor: pointer;
    .set {
      display: flex;
      align-items: center;
      img {
        width: 18px;
        cursor: pointer;
      }
      div {
        flex: 1;
        margin-left: 10px;
        background: url("../assets/images/search.png") no-repeat left 15px
          center;
        background-size: 15px 17px;
        background-color: #fff;
        margin-right: 15px;
        padding-left: 40px;
        border-radius: 34px;
        input {
          width: 100%;
          height: 28px;
          border-radius: 34px;
          color: #333;
          border: none;
          cursor: initial;
          outline: none;
          &:focus {
            outline: none;
          }
        }
      }
    }
    .selectAll {
      margin-top: 8px;
      span:nth-child(1) {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid #fff;
        border-radius: 50%;
        vertical-align: middle;
        &.selectAllActive {
          background: url("../assets/images/selectAllIcon.png") no-repeat center
            center #fff;
          background-size: 12px 9px;
        }
      }
      span:nth-child(2) {
        vertical-align: middle;
        margin-left: 10px;
      }
    }
    .player_list {
      padding: 10px 0;
      overflow-y: auto;
      max-height: 500px;
      padding-right: 15px;
      overflow-x: hidden;
      li {
        padding: 10px;
        font-size: 14px;
        border-radius: 5px;
        &.player_active {
          background-color: #8ac3f7;
        }
        .player_info {
          p:nth-child(1) {
            display: flex;
            align-items: center;
            span:nth-child(1) {
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 1px solid #666;
              border-radius: 50%;
              background-color: #fff;
              margin-right: 10px;
            }
          }
          p:nth-child(2) {
            padding-left: 28px;
            font-size: 12px;
            span {
              margin-right: 15px;
            }
          }
        }
        .play_detail {
          padding: 0 28px;
          font-size: 12px;
          p {
            display: flex;
            justify-content: space-between;
            margin-top: 3px;
            font-weight: 900;
            span {
              font-weight: normal;
              &:hover {
                font-weight: 900;
              }
            }
            .setActive {
              color: #d10011;
              &:hover {
                font-weight: normal;
              }
            }
          }
          .color_show {
            width: 22px;
            height: 22px;
            background-color: red;
          }
        }
      }
    }
    .player_list::-webkit-scrollbar {
      width: 5px;
    }
    .player_list::-webkit-scrollbar-thumb {
      background-color: #fff;
    }
    .player_list::-webkit-scrollbar-track {
      background-color: #59acf8;
    }
    .player_list::-webkit-scrollbar {
      background-color: #59acf8;
    }
  }
  .left_set {
    color: #fff;
    width: 300px;
    background-color: #59acf8;
    // padding: 10px;
    .set_btn {
      padding-left: 15px;
      padding-top: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      img {
        width: 18px;
      }
    }
    .menutest {
      overflow-y: auto;
      height: 550px;
      .set_detail {
        background-color: rgba(138, 195, 247, 1);
        height: auto;
        overflow: inherit;
        margin: 0;
        padding-bottom: 6px;
        .checkbosSet {
          font-size: 12px;
          margin-top: 10px;
        }
        .LangedalSet {
          div:nth-child(1) {
            input {
              text-align: center;
              background-color: #fff;
              width: 120px;
              height: 30px;
              border: 1px solid #59acf8;
            }
            span {
              display: inline-block;
              height: 30px;
              width: 50px;
              color: #fff;
              border-radius: 4px;
              background-color: #59acf8;
              text-align: center;
              line-height: 30px;
              vertical-align: middle;
              margin-left: 6px;
            }
          }
          div:nth-child(2) {
            background-color: #1e89ea;
            text-align: center;
            height: 32px;
            line-height: 32px;
            border-radius: 4px;
            width: 176px;
            margin-top: 4px;
          }
        }
        .slider {
          margin: 0;
        }
        p {
          margin-bottom: 0;
        }
        label {
          color: #fff;
        }
      }
    }
    .set_item {
      overflow-y: auto;
      height: 550px;
      li {
        margin-top: 10px;
        .set_item_title {
          padding-left: 30px;
          padding-right: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          img {
            width: 13px;
            height: 9px;
          }
        }
        .set_detail {
          background-color: rgba(138, 195, 247, 1);
          padding-left: 50px;
          margin-top: 8px;
          font-size: 14px;
          padding-bottom: 6px;
          p {
            line-height: 30px;
            margin-bottom: 0;
          }
          .slider {
            width: 150px;
            margin: 0;
          }
          label {
            color: #fff;
          }
        }
      }
    }
    .menutest::-webkit-scrollbar {
      width: 5px;
    }
    .menutest::-webkit-scrollbar-thumb {
      background-color: #fff;
    }
    .menutest::-webkit-scrollbar-track {
      background-color: #59acf8;
    }
    .menutest::-webkit-scrollbar {
      background-color: #59acf8;
    }
  }
  .right {
    position: relative;
    flex: 1;
    #mapcontainer {
      width: 100%;
      height: 100%;
    }
    .control {
      background-color: #fff;
      padding: 15px 40px 15px 40px;
      display: flex;
      align-items: center;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      img {
        margin-right: 10px;
        width: 18px;
        height: 25px;
        cursor: pointer;
        margin-left: 10px;
      }
      .fullScreen {
        width: 25px;
      }
      .prodress_bar {
        flex: 1;
      }
      div {
        position: relative;
        p {
          color: #59acf8;
          display: inline-block;
          margin-left: 10px;
          font-size: 18px;
          cursor: pointer;
          width: 60px;
        }
        ul {
          // display: none;
          background-color: #f2f3f7;
          border-radius: 6px;
          padding: 10px;
          position: absolute;
          bottom: 18px;
          width: 65px;
          padding-left: 20px;
          li {
            &:hover {
              color: #59acf8;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
span.ant-radio + * {
  padding-right: 6px;
}
#mapcontainer {
  background-color: #fff !important;
}
@media screen and (min-width: 1366px) and (max-width: 1440px) {
  .map_page {
    height: 500px;
  }
  .map_page .left .player_list {
    height: 400px;
  }
}
@media screen and (min-width: 1440px) and (max-width: 1600px) {
  .map_page {
    height: 600px;
  }
  .map_page .left .player_list {
    height: 500px;
  }
}
@media screen and (min-width: 1600px) and (max-width: 1680px) {
  .map_page {
    height: 640px;
  }
  .map_page .left .player_list {
    height: 540px;
  }
}
@media screen and (min-width: 1680px) and (max-width: 1920px) {
  .map_page {
    height: 750px;
  }
  .map_page .left .player_list {
    height: 650px;
  }
}
@media screen and (min-width: 1920px) {
  .map_page {
    height: 780px;
  }
  .map_page .left .player_list {
    height: 680px;
  }
  .map_page .left .player_list li .player_info p:nth-child(1) {
    font-size: 16px;
  }
  .map_page .left .player_list li .player_info p:nth-child(2) {
    font-size: 14px;
  }
}
.select_point {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(29, 29, 29, 0.4);
  .select_point_model {
    width: 250px;
    height: 320px;
    background-color: #fff;
    border-radius: 10px;
    left: 50%;
    top: 50%;
    margin: 0 auto;
    margin-top: 70px;
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .select_point_title {
      // font-weight: 700;
      display: flex;
      justify-content: space-between;
      p{
        flex:1;
        font-weight:700;
        text-align:center;
        cursor: pointer;
      }
      .selectactive{
        color: #59acf8
      }
    }
    .select_points_list {
      flex: 1;
      margin: 6px 0;
      width: 200px;
      ul {
        display: flex;
        flex-wrap: wrap;
        li {
          width: 50%;
          // text-align: center;
          cursor: pointer;
          margin: 2px 0;
          padding-left: 18px;
          span:nth-child(1) {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #666;
            margin-right: 6px;
          }
        }
        .selectedPoint {
          span:nth-child(1) {
            background-color: #1e89ea;
          }
        }
      }
    }
    .select_points_foot {
      display: flex;
      align-items: center;
      justify-content: space-around;
      p {
        cursor: pointer;
      }
      p:nth-child(2) {
        color: #59acf8;
      }
    }
  }
}
.selectPointBtn {
  position: absolute;
  left: 20px;
  top: 20px;
  img {
    width: 20px;
    cursor: pointer;
    z-index: 10;
  }
}
.info {
  position: relative;
  top: 0;
  right: 0;
  min-width: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

</style>


