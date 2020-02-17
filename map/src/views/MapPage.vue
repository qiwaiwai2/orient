<template>
  <div class="parent">
    <Head></Head>
    <a-spin :spinning="showLoading" tip="Loading...">
      <div class="map_page_box">
        <div class="map_page">
          <slider @mapOpacitySet="mapopacityset" @letterset="letterset" @markerset="markerset" @tailset="taillengthset" :createmap="createmap" :manList="manList" :playInfo="playInfo"></slider>
          <div class="right">
            <div id="mapcontainer" @click="getPosition($event)"></div>
            <div class="control" v-show="isShowBar">
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
            <a-select class="mapStyle" v-model="defaultmap" style="width: 105px" @change="handleMapStyle">
                <a-select-option v-for="maptypeitem in mapTypes" :key="maptypeitem">{{maptypeitem}}</a-select-option>
            </a-select>
            <div class="select_point" v-show="showPoints" @click="hiddPoints">
              <div class="select_point_model" style="height:100px;margin-top:150px" @click.stop>
                <div class="select_point_title">
                  <!-- <p @click="selectShowType" :class="showPointSelect?'selectactive':''">Select points:</p>
                  <p @click="selectShowType" :class="!showPointSelect?'selectactive':''">Select time:</p> -->
                  <p @click="selectPoint(1)" :style="{color:!isSync?'#59ACF8':'#333'}" :class="showPointSelect?'selectactive':''">实时</p>
                  <p @click="selectPoint(0)" :style="{color:isSync?'#59ACF8':'#333'}" :class="!showPointSelect?'selectactive':''">同步</p>
                </div>
                <div class="select_points_foot">
                  <p @click="hiddPoints">NO</p>
                  <p @click="confirmTime">YES</p>
                </div>
              </div>
            </div>
            <div class="selectPointBtn" style="display:none" @click="showPoint">
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
      defaultmap:'无底图',
      mapTypes:['无底图','道路图','卫星图'],
      isSync:false,
      showPointSelect:true,//选择方式，点或者时间
      showControl: false,
      pointList: [], //中间点数组
      createmap: null, //地图
      selectSpeedModel: false, //选择速度模块
      speedNumber: 10, //速度值
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
      tailLength:10,//尾巴长度
      MarkerSize:13,//Marker宽高
      mapoacity:0.5,//地图透明度
      socket:{},
      flag:true,//控制websocket重连
      contextMenuPositon:null,//右键窗口坐标
      mouseTool:null,//右键工具
      contextMenu:null,//右键菜单
      timerlist:[],//定时器数组
      isShowBar:false,
      satellitelayer:null, //卫星图层
      satelTilelayer:null, //道路图层
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
  async beforeMounted(){
    await this.getMapData()
  },
  async mounted() {
    await this.getMapData()
    let query = this.$route.query
    this.windowNum = query.gameId + query.gameItemId + query.groupId
    this.groupId = query.groupId
    if(query.isplay==1){ //直播
      this.isShowBar = false
    }else{
      this.isShowBar = true
    }
    // await this.getMan()    
  },
  methods: {
    async getMap() {//获取地图
      let that = this
      await Maploader()
        .then(AMap => {
          console.log("地图加载成功")
          that.theamap = AMap
          that.satelTilelayer = new AMap.TileLayer() //道路图层
          that.satellitelayer = new AMap.TileLayer.Satellite() //卫星图层
          let imageLayer = new AMap.ImageLayer({
            //地图贴图
            url: 'http://120.79.142.200:82/' + that.imgUrl,
            opacity: that.mapoacity,
            bounds: new AMap.Bounds(
              [that.westlng,that.southlat],//西南角经纬度
              [that.eastlng,that.northlat]//东北角经纬度
            ),
            zooms: [5, 20]
          })
          that.createmap = new AMap.Map("mapcontainer", {
            //创建地图
            center: that.mapCenter,
            expandZoomRange: true,
            zooms: [5, 20],
            zoom: 15,
            animateEnable:false,
            layers: [
              // new AMap.TileLayer(), //图片切层,取消则不显示地图
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
          content.push("<p style='min-width:60px' id='getposition'>获取轨迹</p>")
          content.push("</div>")
          //通过content自定义右键菜单内容
          that.contextMenu = new AMap.ContextMenu({isCustom: true, content: content.join('')})
          //地图绑定鼠标右击事件——弹出右键菜单
          that.createmap.on('rightclick', function (e) {
              that.contextMenu.open(that.createmap, e.lnglat)
              that.contextMenuPositon = e.lnglat //右键菜单位置
          })
          that.getMan()   
        })
        .catch(error => {
          console.log("失败")
        })
    },
    handleMapStyle(value){ //选择地图类型
        if(value == '卫星图'){
            this.createmap.add(this.satellitelayer)
        }else if(value == '道路图'){ //道路图
            this.createmap.add(this.satelTilelayer)
            this.createmap.remove(this.satellitelayer)
        }else{ //无底图
          this.createmap.remove(this.satelTilelayer)
          this.createmap.remove(this.satellitelayer)
        }
        this.defaultmap = value
    },
    getPosition (e){ //根据坐标获取
      if(e.srcElement.className != 'marker'){
        let markerList = document.querySelectorAll('.markerInfo')
        for(let i = 0;i<markerList.length;i++){
          markerList[i].style.display = 'none'
        }
      }
      if(e.srcElement.id == 'getposition'){
        this.suspend = true
        this.isBegin = true
        this.stopTimer()
        for(let i = 0;i<this.timerlist.length;i++){
          clearTimeout(this.timerlist[i])
        }
        let progressList = []
        let selectPosition = [this.contextMenuPositon.Q,this.contextMenuPositon.P]
        for(let i = 0 ;i<this.manList.id.length;i++){
          let id = this.manList.id[i]
          let listArr = this.manList["arr" + id]
          let dislist = []
          let ratio = this.progressMan / listArr.length
          for(let j = 0;j<listArr.length;j++){
            let dis = AMap.GeometryUtil.distance(listArr[j], selectPosition)
            dislist.push({
              index:j,
              dis:dis
            })
          }
          dislist.sort(this.compare('dis'))
          let thevalue = dislist[0].index
          let value = thevalue*ratio
          progressList.push(value)
          this.manList["historymarker" + id].stopMove()
          this.manList["historypassedPolyline" + id].setPath([])
          this.manList["historymarker" + id].setPosition(listArr[parseInt(thevalue)])
          this.manList["PointArr" + id] = thevalue
          this.manList["positionArr" + id] = thevalue
        }
        progressList.sort()
        this.inputValue = progressList[0]
      }
      this.mouseTool.close();
      this.contextMenu.close();
    },
    compare(property) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    },
    check(){
      let that = this
      if(that.flag){
        that.socket.init(); 
        that.createmap.clearMap();
      }
      setTimeout(function(){that.check()},1000);
    },
    liveTelecast() {//直播
      let that = this;
      that.socket.init = function(){
        var websocket = null;
        //判断当前浏览器是否支持WebSocket
        if ("WebSocket" in window) {
          let baseurl = "http://120.79.142.200:8088/"
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
          // console.log(event.data.split('&'))
          let data = event.data.split('&') 
          // console.log(data)
          let currentTime = data[0] //当前时间
          let currentGps = [data[2],data[1]] //当前经纬度
          let currentspeed = data[3] //当前速度
          let alldis = data[4] //当前运动的总距离
          let sportmanid = data[5] //当前运动员id
          let islocation = data[6] //是否定位
          if (islocation == "1") {
            for (let i = 0; i < that.playInfo.length; i++) {
              let item = that.playInfo[i]
              if (sportmanid == item.id) {
                let thetotalDistance = String(alldis).substring(0,5)
                that.$set(that.playInfo[i], 'totalDistance', thetotalDistance)
                that.$set(that.playInfo[i], 'speed', currentspeed/10)
                // console.log(sportmanid)
                //给这个人添加
                let id = item.id
                item["testarr" + id] = null
                item["testarr" + id] = []
                if (!item.lineArr) {
                  //轨迹数组
                  item.lineArr = []
                  item["compare" + id] = []
                }
                if (item["compare" + id].length <= 1) {
                  if (!item.marker) {
                    item["compare" + id].push(currentGps);
                    //第一次拿到选手数据
                    that.createmap.setCenter(currentGps)
                    item.marker = new that.theamap.Marker({
                      map: that.createmap,
                      position: item.lineArr[0],
                      content:
                        '<div class="marker" style="display:inline-block;width:'+that.MarkerSize+'px;height:'+that.MarkerSize+'px;border-radius:50%;background:' + item.color +';border:4px solid #333"></div>',
                      offset: new that.theamap.Pixel(-8, -8),
                      label: {
                        offset: new that.theamap.Pixel(5, 5), //设置文本标注偏移量
                        direction: "right",
                        content:
                          '<div class="markerInfo" id='+"info"+id+' style="display:block;background:#fff;padding:10px;position:absolute;top:-28px;left:-25px">'+
                              // thetotalDistance+
                          '</div>'+
                          '<div class="info" id='+id+' style="font-size:16px;font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' +
                          item.color +
                          '">' +
                          "<p style='font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0'>" +
                          item.name +
                          "</p>" +
                          "<p style='font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0'>" +
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
                    item.marker.on('click',function(e){
                      let markerinfo = document.getElementById("info"+id)
                      markerinfo.style.display="block"
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
                    item["compare" + id].push(currentGps)
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
                  let nowpoint = currentGps;
                  let lastpoint = item["compare" + id][item["compare" + id].length - 1] //最后一个点
                  if (lastpoint == "away") {
                    let usepoint = item["compare" + id][item["compare" + id].length - 2]
                    let x = (Number(nowpoint[0]) + Number(usepoint[0])) / 2
                    let y = (Number(nowpoint[1]) + Number(usepoint[1])) / 2
                    item["compare" + id].push(nowpoint)
                    item.lineArr.push([x, y]) //真正运动的点
                    // if (item.lineArr.length > that.tailLength) {
                    //   item.lineArr.splice(0, 1)
                    // } 
                    item.lineArr.splice(0, item.lineArr.length-that.tailLength)
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
                      item["compare" + id].push("away")
                    } else {
                      item["compare" + id].push(nowpoint)
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
      this.mapoacity = value
      document.querySelectorAll('.amap-layers')[0].getElementsByTagName("img")[0].style.opacity = value
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
            let starttime = that.manList.item[0].startTime
            let thistime
            for (let i = 0; i < that.manList.item.length; i++) {
              let id = that.manList.item[i].id
              let manitem = that.manList.item[i]
              thistime = manitem.startTime
              let listArr = that.manList["arr" + id]
              let testarr = []
              if (that.manList["PointArr" + id]) {
                let pointArrIndex = that.manList["PointArr" + id]
                testarr = listArr.slice(0, pointArrIndex)
                that.manList["historymarker" + id].moveAlong(
                  listArr.slice(pointArrIndex),
                  that.manList["speed" + id] * that.speedNumber
                )
              } else {
                if(!that.isSync){ //实时
                  that.timerlist.push(setTimeout(() => {
                    that.manList["historymarker" + id].moveAlong (
                      listArr,
                      that.manList["speed" + id] * that.speedNumber
                    )
                  }, that.getTimeDiff(thistime,starttime)/((that.speedNumber/2)+10)))
                } else { //同步
                  that.manList["historymarker" + id].moveAlong (
                    listArr,
                    that.manList["speed" + id] * that.speedNumber
                  )
                }
              }
              that.manList["historymarker" + id].on("moving", function(e) {
                let truthData = e.passedPath
                let testarr2
                if (that.manList["PointArr" + id]) {
                  if(that.manList["positionArr" + id]){

                  }else{
                    truthData = testarr.concat(truthData)
                  }
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
    getNewHistory(params){//最新----获取历史轨迹
      this.showLoading = true
      let that = this
      findListAndGpsDataByStartTime(params).then(res => {
        console.log(res)
        if (res.status == 1) {
          that.createmap.clearMap()
          let man = {}
          man.item = []
          man["arrlist"] = []
          man.id = []
          let startTimelist = []
          let endTimelist = []
          for (let i = 0; i < res.data.length; i++) {
              let item = res.data[i]
              if (item.gListStr && item.gListStr.length > 0) {
                  that.createmap.setCenter([
                      item.gListStr[0].split('&')[2],
                      item.gListStr[0].split('&')[1],
                  ])
                  startTimelist.push(item.gListStr[0].split('&')[0])
                  endTimelist.push(item.gListStr[item.gListStr.length-1].split('&')[0])
                  // startTimelist.push(new Date(item.gpsData[0].currTime).getTime())
                  // endTimelist.push(new Date(item.gpsData[item.gpsData.length - 1].currTime).getTime())
                  man.item.push(item)
                  man.id.push(item.id)
                  man["arr" + item.id] = []
                  man["compare" + item.id] = []
                  man["gps" + item.id] = []
                  let gpslist = item.gListStr
                  for (let j = 0; j < gpslist.length; j++) {
                      let origindata = gpslist[j].split('&')
                      let gpsitem = {
                          longitude:origindata[2],
                          latitude:origindata[1],
                          currTime:origindata[0]
                      }
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
                          let nowpoint = [gpsitem.longitude, gpsitem.latitude]
                          let lastpoint = man["compare" + item.id][man["compare" + item.id].length - 1] //最后一个点
                          if (lastpoint != "away") {
                              //上个点是正常点
                              let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint)
                              if (dis < 2.5) {
                              //抛弃
                              man["compare" + item.id].push("away")
                              } else {
                              //保留
                              man["compare" + item.id].push(nowpoint)
                              man["arr" + item.id].push(nowpoint) //真正运动的点
                              }
                          } else {
                              let usepoint = man["compare" + item.id][man["compare" + item.id].length - 2]
                              let dis = AMap.GeometryUtil.distance(nowpoint, usepoint)
                              let x = (Number(nowpoint[0]) + Number(usepoint[0])) / 2
                              let y = (Number(nowpoint[1]) + Number(usepoint[1])) / 2
                              gpsitem.longitude = x
                              gpsitem.latitude = y
                              // console.log(x)
                              man["compare" + item.id].push(nowpoint)
                              man["arr" + item.id].push([x, y]) //真正运动的点
                          }
                      }
                  }
                  man["arrlist"].push(man["arr" + item.id])
              } 
          }
          for (var i = 0; i < man.item.length; i++) {
              let theitem = man.item[i]
              let item = theitem.id
              // let second = that.getTimeDiff (
              //     man["gps" + item][man["gps" + item].length - 1].currTime,
              //     man["gps" + item][0].currTime
              // ) / 1000
              let second = (man["gps" + item][man["gps" + item].length - 1].currTime-man["gps" + item][0].currTime) / 1000
              let indexArr = String(i).split("")
              let theindex = indexArr[String(i).split("").length - 1] - 0
              var dis = that.theamap.GeometryUtil.distanceOfLine(man["arr" + item])
              let arrlength = man["arr" + item].length
              man["speed" + item] = (dis / second) * 3.6
              // console.log(dis)
              man["historypassedPolyline" + item] = new that.theamap.Polyline({
                  map: that.createmap,
                  lineJoin: "round",
                  strokeColor: theitem.colorFlag?theitem.colorFlag:that.colorArr[theindex + 1], //线颜色
                  strokeWeight: 4, //线宽
                  strokeOpacity: 1,
                  zIndex: 51,
              })
              man["historypassedPolyline1" + item] = new that.theamap.Polyline({
                  map: that.createmap,
                  lineJoin: "round",
                  path:man['arr'+item],
                  strokeColor: theitem.colorFlag?theitem.colorFlag:that.colorArr[theindex+1], //线颜色
                  strokeWeight: 4, //线宽
                  strokeOpacity: 1,
                  zIndex: 51
              })
              that.createmap.remove(man["historypassedPolyline1" + item])
              let manno = ''
              if(theitem.no){
                  manno = theitem.no
              }
              let infoId = 'info'+item
              let itemcolor = theitem.colorFlag?theitem.colorFlag:that.colorArr[theindex+1]
              man["historymarker" + item] = new that.theamap.Marker({
                  map: that.createmap,
                  position: man["arr" + item][0],
                  content:
                      '<div  class="marker" style="display:inline-block;width:'+13+'px;height:'+13+'px;border-radius:50%;background-color:'+itemcolor+';border:2px solid #fff"></div>',
                  offset: new that.theamap.Pixel(-7, -7),
                  label: {
                      offset: new that.theamap.Pixel(0, 0), //设置文本标注偏移量
                      direction: "right",
                      content:
                      '<div class="markerInfo" id='+infoId+' style="display:none;background:#fff;padding:10px;position:absolute;top:-28px;left:-25px">'+infoId+'</div>'+
                      '<div class="info" id='+item+' style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' +
                      itemcolor +
                      '">' +
                      '<p  style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' + itemcolor +'">'+theitem.name+'</p>'+
                      '<p  style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:' + itemcolor +'">'+theitem.nationality + manno+'</p>'+
                      "</div>"
                  },
              })
              man["historymarker" + item].on('click',function(e){
                let markerinfo = document.getElementById(infoId)
                markerinfo.style.display="block"
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
        this.showLoading = false
      })
    },
    timer() { //计时器函数
      this.inputValue += 1
      if (this.inputValue >= this.progressMan) {
        //进度条已走完
        clearInterval(this.inter)
      }
    },
    startTimer() {
      //开始计时器
      this.inter = setInterval(this.timer, 1000/((this.speedNumber)))
    },
    stopTimer() {
      //停止计时器
      clearInterval(this.inter)
    },
    onChange(value) { //进度条变化
      this.suspend = true
      let that = this
      this.isBegin = true
      this.stopTimer()
      for(let i = 0;i<this.timerlist.length;i++){
        clearTimeout(this.timerlist[i])
      }
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
          )
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
    //是否选择所有时间
    changeIsAllTime(e) {
      this.isAllTime = e.target.checked
    },
    moment,
    //选择开始时间
    selectStartTime(date, dateString) {
      this.startTime = dateString
    },
    selectEndTime(date, dateString) {
      this.endTime = dateString
    },
    taillengthset(value){//获取尾巴线长度
      this.tailLength = value
    },
    //选择时间的逻辑
    async confirmTime() {
      this.showPoints = false
      clearInterval(this.inter)
      this.suspend = true
      this.isBegin = true
      this.inputValue = 0
      let query = this.$route.query
      let params = {}
      params.competitionId = query.gameId
      params.competitionItemId = query.gameItemId
      params.groupId = query.groupId
      this.getNewHistory(params)
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
      return
      this.suspend = true
      let that = this
      this.isBegin = true
      this.stopTimer()
      for (let i = 0; i < that.manList.id.length; i++) {
        let id = that.manList.id[i]
        let listArr = that.manList["arr" + id]
        // console.log(listArr);
        let ratio = that.progressMan / listArr.length
        let thevalue = Math.ceil(this.inputValue / ratio)+2
        that.manList["historymarker" + id].stopMove()
        that.manList["historymarker" + id].setPosition(listArr[parseInt(thevalue) - 1])
        if (parseInt(thevalue) > that.tailLength) {
          that.manList["historypassedPolyline" + id].setPath(
            listArr.slice(parseInt(thevalue) - that.tailLength, parseInt(thevalue))
          )
        } else {
          that.manList["historypassedPolyline" + id].setPath(
            listArr.slice(0, parseInt(thevalue)),
            parseInt(thevalue)
          )
        }
        that.manList["PointArr" + id] = thevalue
      }
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
                }else{
                    this.westlng = 113.9439660000,
                    this.southlat = 22.5288250000,
                    this.eastlng = 113.9439660000,
                    this.northlat = 22.5288250000
                    this.mapCenter = [(this.westlng+this.eastlng)/2,(this.southlat+this.northlat)/2]
                    this.getMap()
                }
            }
        })
    },
    getMan() {//获取人员
      this.showLoading = true
      let that = this
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
                item.color = item.colorFlag?item.colorFlag:this.colorArr[theindex];
                item.isSelect = true
                item.centerSet = false
                item.autocenterset = false
                item.highlightset = false
                item.fullrouteset = false
                item.totalDistance = 0
                item.speed = 0
                this.playInfo.push(item)
              }
              this.showLoading = false
              let query = this.$route.query
              let params = {}
              params.competitionId = query.gameId
              params.competitionItemId = query.gameItemId
              params.groupId = query.groupId
              if(query.isplay==1){ //直播
                that.liveTelecast()
              }else{
                this.getNewHistory(params)
              }
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
    getRandomColor() {//随机获取颜色
      var r = Math.floor(Math.random() * 256)
      var g = Math.floor(Math.random() * 256)
      var b = Math.floor(Math.random() * 256)
      var color = "#" + r.toString(16) + g.toString(16) + b.toString(16)
      return color
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
  background: url('../assets/images/beijing.png');
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
  
  .right {
    position: relative;
    flex: 1;
    #mapcontainer {
      width: 100%;
      height: 100%;
    }
    .mapStyle{
      position: absolute;
      top: 10px;
      left: 10px;
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


