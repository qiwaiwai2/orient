<template>
    <div class="parent">
        <Head></Head>
        <a-spin :spinning="showLoading" tip="Loading...">
            <div class="map_page_box">
                <div class="map_page">
                    <slider @selectedManid="getselectmanid" :createmap="createmap" :playInfo="playInfo"></slider>
                    <div class="right">
                        <div id="mapcontainer"></div>
                        <div class="control" >
                            <!-- <span @click="showPoint" style="cursor:pointer">select</span> -->
                            <img @click="play" v-if="suspend" src="../assets/images/suspend.png" alt="">
                            <img @click="play" v-else src="../assets/images/play_btn.png" alt="">
                            <a-slider :max="progressMan" class="prodress_bar" :step="1" @change="onChange" v-model="inputValue" :defaultValue="defaultValue" :disabled="disabled" />
                            <div>
                                <p @click="showSpeedModel">X{{speedNumber}}</p>
                                <ul v-show="selectSpeedModel">
                                    <li @click="selectSpeed(1)">1</li>
                                    <li @click="selectSpeed(5)">5</li>
                                    <li @click="selectSpeed(10)">10</li>
                                    <li @click="selectSpeed(15)">15</li>
                                    <li @click="selectSpeed(20)">20</li>
                                    <li @click="selectSpeed(30)">30</li>
                                    <li @click="selectSpeed(50)">50</li>
                                    <li @click="selectSpeed(120)">120</li>
                                </ul>
                            </div>
                            <img @click="fullscreen" class="fullScreen" src="../assets/images/FullScreen.png" alt="">
                        </div>
                        <div class="select_point"  v-show="showPoints" @click="hiddPoints">
                            <div class="select_point_model" @click.stop="">
                                <div class="select_point_title">Select points:</div>
                                <div class="select_points_list">
                                    <ul>
                                        <li v-for="(item,index) in poionList" :key="index" :class="{'selectedPoint':item.isSelect}" @click.stop="selectPoint(index)">
                                            <span></span>
                                            <span>{{item.no}}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="select_points_foot">
                                    <p @click="hiddPoints">NO</p>
                                    <p @click="confirmPoints">YES</p>
                                </div>
                            </div>
                        </div>
                        <div class="selectPointBtn"  @click="showPoint">
                            <img src="../assets/images/selectPoint.png" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </a-spin>
    </div>
</template>
<script>
import slider from '@/components/slider.vue'
import Head from '@/components/Head.vue'
import Maploader from '@/assets/js/AMap.js'
import {findListAndPostBack,selectGpsData,findLinePointData,findListAndGpsData} from '@/api'
export default {
    data(){
        return {
            showControl:false,
            pointList:[//中间点数组
                {
                    pointName:1,
                    isSelect:false
                },
                {
                    pointName:2,
                    isSelect:false
                },
                {
                    pointName:3,
                    isSelect:false
                },
                {
                    pointName:4,
                    isSelect:false
                }
            ],
            createmap:null,//地图
            selectSpeedModel:false,//选择速度模块
            speedNumber:10,//速度值
            defaultValue:0,
            theamap:null,
            inputValue:0,
            suspend:true,
            disabled:false,
            lineArr:[],//
            isBegin:true,//是否开始播放
            inter:null,//计时器
            playInfo:[],//人员列表
            playerList:[],
            colorArr : ['#FF3030','#FFC125','#FF00FF','#A0522D','#EECFA1','#C0FF3E','#B23AEE','#262626','#00CD00','#218868'],
            showPoints:false,//点选择
            showLoading:false,
            manList:[],//对比人物列表
            progressMan:100,//进度条最大值
            poionList:[],//点列表
            theselectPoint:[],//选择的点
            windowNum:'',//窗口号
            selectManidList:null,
            imgurl:'',
            mapcenter:''
        }
    },
    name: 'mapPage',
    components: {   
        Head,
        slider
        
    }, 
    mounted(){
        let query = this.$route.query
        this.windowNum = query.gameId+query.gameItemId+query.groupId
        this.getMap()
        this.getMan()
        // this.getHistory()
        if(query.groupId==4){//WE
            this.imgurl = require('../assets/images/WE.jpg')
        }else if(query.groupId==3){
            this.imgurl = require('../assets/images/ME.jpg')
        }
        this.getPointList(query.gameId,query.gameItemId,query.groupId)
        // this.getPoint(2,8,3,['e7d36749ac26470f87990098036a669f'],'77cf356933184806ba0d63a5235b225c','d0169e242ea5497a8a34a5d3340f788a')
        if(query.gameItemId == 8){
            this.mapcenter = [114.33894344444445,30.330064166666667]
        }else if(query.gameItemId == 9){
            this.mapcenter = [114.42234016666667,30.144698833333333]
        }else{
            this.mapcenter = [114.45079905599,30.154664442275]
        }
        
    },
    methods:{
        getselectmanid(res){
            // console.log(res)
            this.selectManidList = res
        },
        async confirmPoints(){//确认点选择
            let query = this.$route.query
            this.theselectPoint = []
            for(let i = 0;i<this.poionList.length;i++){
                let item = this.poionList[i]
                if(item.isSelect){
                    this.theselectPoint.push({
                        name:item.no,
                        id:item.id
                    })
                }
            }
            if(this.theselectPoint.length==0){
                alert('请选择点！')
            }else if(this.theselectPoint.length==1){
                alert('请选择结束点！')
            }else{
                if(this.selectManidList){
                    let params = {}
                    params.competitionId = query.gameId
                    params.competitionItemId = query.gameItemId
                    params.groupId = query.groupId
                    params.sportsmanIds = this.selectManidList
                    // params.startPointId = '77cf356933184806ba0d63a5235b225c'
                    // params.endPointId = 'd0169e242ea5497a8a34a5d3340f788a'
                    params.startPointId = this.theselectPoint[0].id
                    params.endPointId = this.theselectPoint[this.theselectPoint.length-1].id
                    await this.getPoint(params)
                    this.showPoints = !this.showPoints
                    for(let i = 0;i<this.playInfo.length;i++){
                        // this.$set(this.playInfo[i], 'isSelect', false)
                        if(this.playInfo[i].marker){
                            this.createmap.remove(this.playInfo[i].marker)
                        }
                        if(this.playInfo[i].passedPolyline){
                            this.createmap.remove(this.playInfo[i].passedPolyline)
                        }
                        if(this.playInfo[i].passedPolyline1){
                            this.createmap.remove(this.playInfo[i].passedPolyline1)
                        }
                    }
                    
                }else{
                    alert('请选择运动员！')
                }
            }
            
        },
        hiddPoints(){//隐藏点选择
            this.showPoints = !this.showPoints
        },
        selectPoint(index){//选择点
            this.$set(this.poionList[index], 'isSelect', !this.poionList[index].isSelect)
        },
        showPoint(){//展示点选择
            this.showPoints = !this.showPoints
        },
        fullscreen(){//全屏
            var elem = document.getElementById("mapcontainer");
            this.requestFullScreen(elem)
        },
        showSpeedModel(){//展开速度选择
            this.selectSpeedModel = !this.selectSpeedModel
        },
        selectSpeed(value){//选择速度
            this.speedNumber = value
            this.selectSpeedModel = false
        },
        play(){//播放按钮
            let that = this;
            that.suspend = !that.suspend;
            if(this.suspend){
                // console.log('暂停')
                for(let i = 0;i<that.manList.id.length;i++){
                    let id = that.manList.id[i]
                    that.manList['marker'+id].pauseMove()
                }
                this.stopTimer()
            }else{
                // console.log('播放')
                if(this.isBegin){
                    if(that.manList&&that.manList.id.length>0){
                        this.startTimer()
                        for(let i = 0;i<that.manList.id.length;i++){
                            let id = that.manList.id[i]
                            let listArr = that.manList['arr'+id]
                            let testarr=[]
                            if(that.manList['PointArr'+id]){
                                let pointArrIndex = that.manList['PointArr'+id]
                                testarr = listArr.slice(0,pointArrIndex)
                                that.manList['marker'+id].moveAlong(listArr.slice(pointArrIndex-1),that.manList['speed'+id]*that.speedNumber)
                            }else{
                                that.manList['marker'+id].moveAlong(listArr,that.manList['speed'+id]*that.speedNumber)
                            }
                            
                            that.manList['marker'+id].on('moving',function(e){
                                let truthData = e.passedPath
                                let testarr2;
                                if(that.manList['PointArr'+id]){
                                    truthData = testarr.concat(truthData)
                                }
                                if(truthData.length>10){
                                    testarr2 = truthData.slice(truthData.length-10)
                                }else{
                                    testarr2 = truthData.slice(0)
                                }
                                that.manList['passedPolyline'+id].setPath(testarr2)
                            })
                        }
                        this.isBegin=false
                    }else{
                        that.suspend = !that.suspend;
                    }
                }else{
                    for(let i = 0;i<that.manList.id.length;i++){
                        let id = that.manList.id[i]
                        that.manList['marker'+id].resumeMove()
                    }
                    this.startTimer()
                }
            }
        },
        
        timer(){//计时器函数
            this.inputValue+=1
            if(this.inputValue>=this.progressMan){
                // console.log(this.i)
                //进度条已走完
                clearInterval(this.inter)
            }
        },
        startTimer(){//开始计时器
            this.inter = setInterval(this.timer,100)
        },
        stopTimer(){//停止计时器
            clearInterval(this.inter);
        },
        onChange(value) {//进度条变化
            // console.log('change: ', value);
            this.suspend = true
            let that = this
            this.isBegin = true
            this.stopTimer()
            for(let i = 0;i<that.manList.id.length;i++){
                let id = that.manList.id[i]
                let listArr = that.manList['arr'+id]
                let ratio = that.progressMan/listArr.length;
                let thevalue = Math.ceil(value/ratio)
                that.manList['marker'+id].stopMove()
                that.manList['marker'+id].setPosition(listArr[parseInt(thevalue)-1])
                if(parseInt(thevalue)>10){
                    that.manList['passedPolyline'+id].setPath(listArr.slice(parseInt(thevalue)-10,parseInt(thevalue)));
                }else{
                    that.manList['passedPolyline'+id].setPath(listArr.slice(0,parseInt(thevalue)),parseInt(thevalue));
                }
                
                that.manList['PointArr'+id] =  thevalue
            }
        },
        getMap(){//获取地图
            let that = this
            Maploader().then(AMap => {
                console.log('地图加载成功')
               that.theamap=AMap
               
                let imageLayer = new AMap.ImageLayer({//地图贴图
                    url: that.imgurl,
                    opacity:0.8,
                    bounds: new AMap.Bounds(
                        [114.427930132379,30.14233452691],//西南角经纬度
                        [114.45079905599,30.154664442275]//东北角经纬度
                        // [114.427730132379,30.14253452691],//西南角经纬度
			            // [114.45059905599,30.154864442275]//东北角经纬度
                    ),
                    zooms: [3, 20]
                });
                that.createmap = new AMap.Map('mapcontainer', {//创建地图
                    center: that.mapcenter,
                    expandZoomRange:true,
                    zooms:[3,20],
                    zoom: 15,
                    layers:[
                        // new AMap.TileLayer(),//图片切层,取消则不显示地图
                        imageLayer,
                        // new AMap.TileLayer.Satellite()

                    ]
                });
                // that.createmap.setFitView();
            }).catch(error => {
                console.log('失败')
            })
        },
        liveTelecast(){//直播
            let that = this
            var websocket = null;
            //判断当前浏览器是否支持WebSocket
            if('WebSocket' in window){
                // let baseurl = 'http://120.77.175.26:8081/'
                let baseurl = 'http://120.79.142.200:8081/'
                var url=baseurl.replace("http","ws")+"websocket/"+this.windowNum;//20为客户端窗口标识
                // console.log(url)
                websocket = new WebSocket(url);
            }
            else{
                alert('Not support websocket')
            }

            //连接发生错误的回调方法
            websocket.onerror = function(){
                console.log("webSocket_Err")
            };

            //连接成功建立的回调方法
            websocket.onopen = function(event){
                console.log("open")
            }

            //接收到消息的回调方法
            let playerList = {};
            // var colorArr = ['red','AF5']
            playerList.playerId = []
            var colorArr = ['#FF3030','#FFC125','#FF00FF','#A0522D','#EECFA1','#C0FF3E','#B23AEE','#262626','#00CD00','#218868']
            websocket.onmessage = function(event){
                // console.log(JSON.parse(event.data))
                var data = JSON.parse(event.data);
                if(data.crossGpsData.isLocation=='定位'){
                    for(let i = 0;i<that.playInfo.length;i++){
                        let item = that.playInfo[i]
                        if(data.id == item.id){//给这个人添加
                            let id = item.id
                            item['testarr'+id] = null
                            item['testarr'+id] = []
                            if(!item.lineArr){//轨迹数组
                                item.lineArr = []
                                item['compare'+data.id] = []
                            }
                            // item.lineArr.push([data.crossGpsData.longitude,data.crossGpsData.latitude])//给当前点添加轨迹
                            if(item['compare'+data.id].length<=1){
                                if(!item.marker){
                                    item['compare'+data.id].push([data.crossGpsData.longitude,data.crossGpsData.latitude])
                                    //第一次拿到选手数据
                                    that.createmap.setCenter(item.lineArr.slice(0,1)[0]);
                                    item.marker = new that.theamap.Marker({
                                        map: that.createmap,
                                        position: item.lineArr[0],
                                        content:'<div style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+item.color+'"></div>',
                                        offset: new that.theamap.Pixel(-6, -6),
                                        label:{
                                            offset: new that.theamap.Pixel(3, 3),  //设置文本标注偏移量
                                            direction:'right',
                                            content:'<div class="info" style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:'+item.color+'">'+
                                                '<p>'+item.name+'</p>'+
                                                '<p>'+item.no+'</p>'+
                                            '</div>'
                                        },
                                    });
                                    item.passedPolyline = new that.theamap.Polyline({
                                        map: that.createmap,
                                        lineJoin:'round',
                                        lineCap:'round',
                                        strokeColor: item.color,  //线颜色
                                        strokeWeight: 5,      //线宽
                                    });
                                    item.passedPolyline1 = new that.theamap.Polyline({
                                        map: that.createmap,
                                        lineJoin:'bevel',
                                        lineCap:'round',
                                        strokeColor: item.color,  //线颜色
                                        strokeWeight: 5,      //线宽
                                    });
                                    if(item.isSelect){
                                        if(item.marker){
                                            // (item.marker).show()
                                            that.createmap.add(item.marker)
                                        }
                                        if(item.passedPolyline){
                                            // (item.passedPolyline).show()
                                            that.createmap.add(item.passedPolyline)
                                        }
                                        if(item.passedPolyline1){
                                            // (item.passedPolyline1).show()
                                            that.createmap.add(item.passedPolyline1)
                                        }
                                    }else{
                                        if(item.marker){
                                            // (item.marker).hide()
                                            that.createmap.remove(item.marker)
                                        }
                                        if(item.passedPolyline){
                                            // (item.passedPolyline).hide()
                                            that.createmap.remove(item.passedPolyline)
                                        }
                                        if(item.passedPolyline1){
                                            // (item.passedPolyline1).hide()
                                            that.createmap.remove(item.passedPolyline1)
                                        }
                                    }
                                }else{
                                    item['compare'+data.id].push([data.crossGpsData.longitude,data.crossGpsData.latitude])
                                }
                            }else{
                                if(item.isSelect){
                                    if(item.marker){
                                        // (item.marker).show()
                                        that.createmap.add(item.marker)
                                    }
                                    if(item.passedPolyline){
                                        // (item.passedPolyline).show()
                                        that.createmap.add(item.passedPolyline)
                                    }
                                    if(item.passedPolyline1){
                                        // (item.passedPolyline1).show()
                                        that.createmap.add(item.passedPolyline1)
                                    }
                                }else{
                                    if(item.marker){
                                        // (item.marker).hide()
                                        that.createmap.remove(item.marker)
                                    }
                                    if(item.passedPolyline){
                                        // (item.passedPolyline).hide()
                                        that.createmap.remove(item.passedPolyline)
                                    }
                                    if(item.passedPolyline1){
                                        // (item.passedPolyline1).hide()
                                        that.createmap.remove(item.passedPolyline1)
                                    }
                                }
                                let nowpoint = [data.crossGpsData.longitude,data.crossGpsData.latitude]
                                let lastpoint = item['compare'+data.id][item['compare'+data.id].length-1]//最后一个点
                                if(lastpoint == 'away'){
                                    let usepoint = item['compare'+data.id][item['compare'+data.id].length-2]
                                    let x = (nowpoint[0]+usepoint[0])/2
                                    let y = (nowpoint[1]+usepoint[1])/2
                                    item['compare'+data.id].push(nowpoint)
                                    item.lineArr.push([x,y])//真正运动的点
                                    if(item.lineArr.length>20){
                                        item.lineArr.splice(0,1)
                                        // item.passedPolyline1.setPath(item.lineArr.slice(item.lineArr.length-30,item.lineArr.length-1))
                                    }else{
                                        // item.passedPolyline1.setPath(item.lineArr.slice(0,item.lineArr.length-1))
                                    }
                                    item.passedPolyline1.setPath(item.lineArr.slice(0,item.lineArr.length-1))
                                    let p1 = item.lineArr[item.lineArr.length-1]
                                    let p2 = item.lineArr[item.lineArr.length-2]
                                    let dis = AMap.GeometryUtil.distance(p1, p2);
                                    (item.marker).moveAlong(item.lineArr.slice(item.lineArr.length-2), dis*1.8);
                                    (item.marker).on('moving', function (e) {
                                        item['testarr'+id] = item['testarr'+id].concat(e.passedPath)
                                        if(item['testarr'+id].length>20){
                                            item.passedPolyline.setPath(item['testarr'+id]);
                                            item['testarr'+id] = null
                                            item['testarr'+id] = []
                                        }
                                    });
                                    (item.marker).on('movealong', function (e) {
                                        item.passedPolyline.setPath(item['testarr'+id]);
                                    });
                                }else{//和上个点判断距离，如果小于2.5，抛弃
                                    let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint);
                                    if(dis<3){//如果小于2.5，抛弃
                                        item['compare'+data.id].push('away')
                                    }else{
                                        item['compare'+data.id].push(nowpoint)
                                        item.lineArr.push(nowpoint)//真正运动的点
                                        if(item.lineArr.length>20){
                                            item.lineArr.splice(0,1)
                                            // item.passedPolyline1.setPath(item.lineArr.slice(item.lineArr.length-30,item.lineArr.length-1))
                                        }else{
                                            // item.passedPolyline1.setPath(item.lineArr.slice(0,item.lineArr.length-1))
                                        }
                                        item.passedPolyline1.setPath(item.lineArr.slice(0,item.lineArr.length-1))
                                        let p1 = item.lineArr[item.lineArr.length-1]
                                        let p2 = item.lineArr[item.lineArr.length-2]
                                        let dis = AMap.GeometryUtil.distance(p1, p2);
                                        (item.marker).moveAlong(item.lineArr.slice(item.lineArr.length-2), dis*3.6);
                                        (item.marker).on('moving', function (e) {
                                            item['testarr'+id] = item['testarr'+id].concat(e.passedPath)
                                            if(item['testarr'+id].length>20){
                                                item.passedPolyline.setPath(item['testarr'+id]);
                                                item['testarr'+id] = null
                                                item['testarr'+id] = []
                                            }
                                        });
                                        
                                        (item.marker).on('movealong', function (e) {
                                            item.passedPolyline.setPath(item['testarr'+id]);
                                        });
                                    }
                                }
                            }
                            break
                        }
                    }
                }
            }
        },
        getMan(){//获取人员
            this.showLoading = true
            let query = this.$route.query
            // query.gameId,query.gameItemId,query.groupId
            findListAndPostBack(query.gameId,query.gameItemId,query.groupId).then(res=>{
                this.playInfo = []
                // console.log(res)
                if(res.status == 1){
                    if(res.data.length>0){
                        for(let i = 0;i<res.data.length;i++){
                            let indexArr = String(i).split('')
                            let theindex = indexArr[String(i).split('').length-1]
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
                        this.liveTelecast()
                    }else{
                        this.showLoading = false
                        alert('当前组别没有比赛人员！')
                    }
                }else{
                    this.showLoading = false
                }
            }).catch(err=>{
                // console.log(err)
                this.showLoading = false
            })
        },
        getRandomColor() {//随机获取颜色
            var r = Math.floor(Math.random()*256);
			var g = Math.floor(Math.random()*256);
			var b = Math.floor(Math.random()*256);
            var color = '#'+r.toString(16)+g.toString(16)+b.toString(16);
			return color;
        },
        requestFullScreen(element){
            var requestMethod=element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
            if(requestMethod){
                requestMethod.call(element);
            }else if(typeof window.ActiveXObject !== "undefined"){
                var wscript = new ActiveXObject("WScript.Shell");
                if(wscript !== null){
                    wscript.SendKeys("{F11}");
                }
            }
        },
        getHistory(){//获取历史记录
            let that = this;
            let man = {}
            man.id = []
            man.name = []
            selectGpsData("2019-09-08 09:40:03","2019-09-08 10:40:03").then(res=>{
                // console.log(res)
                let secondTime = that.getTimeDiff(res.data[res.data.length-1].currTime,res.data[0].currTime)/1000
                that.progressMan = secondTime
                for(var i=0;i<res.data.length;i++){
                    let item = res.data[i];
                    if(man.id.indexOf(item.sportsman.id)<0){
                        man.id.push(item.sportsman.id)
                        man.name.push(item.sportsman.name)
                    }
                    if(!man['arr'+item.sportsman.id]){
                        man['arr'+item.sportsman.id] = []
                        man['compare'+item.sportsman.id] = []
                        man['gps'+item.sportsman.id] = []
                    }else{
                        man['gps'+item.sportsman.id].push(item)
                        if(man['arr'+item.sportsman.id].length<=1){
                            man['arr'+item.sportsman.id].push([item.longitude,item.latitude])
                            man['compare'+item.sportsman.id].push([item.longitude,item.latitude])
                        }else{
                            let nowpoint = [item.longitude,item.latitude]
                            let lastpoint = man['compare'+item.sportsman.id][man['compare'+item.sportsman.id].length-1]//最后一个点 
                            if(lastpoint != 'away'){//上个点是正常点
                                let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint);
                                if(dis<3){//抛弃
                                    man['compare'+item.sportsman.id].push('away')
                                }else{//保留
                                    man['compare'+item.sportsman.id].push(nowpoint)
                                    man['arr'+item.sportsman.id].push(nowpoint)//真正运动的点
                                }
                            }else{
                                let usepoint = man['compare'+item.sportsman.id][man['compare'+item.sportsman.id].length-2]
                                let dis = AMap.GeometryUtil.distance(nowpoint, usepoint);
                                let x = (nowpoint[0]+usepoint[0])/2
                                let y = (nowpoint[1]+usepoint[1])/2
                                man['compare'+item.sportsman.id].push(nowpoint)
                                man['arr'+item.sportsman.id].push([x,y])//真正运动的点
                            }
                        }

                    }
                }

                for(var i = 0;i<man.id.length;i++){
                    let item = man.id[i]
                    let second = that.getTimeDiff(man['gps'+item][man['gps'+item].length-1].currTime,man['gps'+item][0].currTime)/1000
                    
                    var dis = that.theamap.GeometryUtil.distanceOfLine(man['arr'+item]);
                    man['speed'+item] = (dis/second)*3.6
                    man['passedPolyline'+item]  = new that.theamap.Polyline({
                        map: that.createmap,
                        lineJoin:'round',
                        // path:man['arr'+item],
                        strokeColor: that.colorArr[i],  //线颜色
                        strokeWeight: 5,      //线宽
                        strokeOpacity:1,
                        zIndex:51

                    }); 
                    man['passedPolyline1'+item]  = new that.theamap.Polyline({
                        map: that.createmap,
                        lineJoin:'round',
                        path:man['arr'+item],
                        strokeColor: 'red',  //线颜色
                        strokeWeight: 5,      //线宽
                        strokeOpacity:1

                    });
                    man['marker'+item] = new that.theamap.Marker({
                        map: that.createmap,
                        position: man['arr'+item][0],
                        content:'<div style="display:inline-block;width:13px;height:13px;border-radius:50%;background:'+'yellow'+'"></div>',
                        offset: new that.theamap.Pixel(-6, -6),
                        label:{
                            offset: new that.theamap.Pixel(5, 5),  //设置文本标注偏移量
                            direction:'right',
                            content:'<div class="info" style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:'+that.colorArr[i]+'">'+man.name[i]+'</div>'
                        },
                    });
                }
                that.manList = man
                // console.log(that.manList)
            }).catch(err=>{
                console.log(err)
            })
        },
        getTimeDiff(recordTime,golbTime){//获取时间差
            var curr_time = new Date(recordTime).getTime();
            var first_time = new Date(golbTime).getTime();
            var diff = curr_time - first_time;
            return diff
            //计算出小时数
            var leave1 = diff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
            var days = Math.floor(diff / (24 * 3600 * 1000));
            var hours = Math.floor(leave1 / (3600 * 1000))
                //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000))
                //计算相差秒数
            var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000)
            hours = hours >= 10 ? hours : "0" + hours;
            minutes = minutes >= 10 ? minutes : "0" + minutes;
            seconds = seconds >= 10 ? seconds : "0" + seconds;
            //赋值
            time = "+" + hours + ":" + minutes + ":" + seconds;
            return time
        },
        getPointList(competitionId,competitionItemId,groupId){
            let that = this
            findLinePointData(competitionId,competitionItemId,groupId).then(res=>{
                // console.log(res)
                if(res.status==1){
                    let data = res.data
                    if(data.length>0){
                        // console.log(data)
                        let obj = {}
                        let pointlength = data[0].pointList.length;
                        for(let i = 0;i<data.length;i++){
                            let arrdata = data[i]
                            for(let j = 0;j<arrdata.pointList.length;j++){
                                let point = arrdata.pointList[j]
                                if(!obj[j]){
                                    obj[j] = []
                                }
                                obj[j].push({no:point.pointNo,id:point.pointId,index:j,isSelect:false})
                            }
                        }
                        for(var i in obj){
                            let value = obj[i]
                            let arr = []
                            for(let i = 0;i<value.length;i++){
                                arr.push(value[i].no)
                            }
                            let repeat = Array.from(new Set(arr))
                            if(repeat.length<=1){
                                // value.isSelect = false
                                that.poionList.push(value[0])
                            }
                        }
                        // console.log(that.poionList)
                        
                    }

                }

            })
        },
        getPoint(competitionId,competitionItemId,groupId,sportsmanIds,startPointId,endPointId){
            this.showLoading = true
            let that = this
            findListAndGpsData(competitionId,competitionItemId,groupId,sportsmanIds,startPointId,endPointId).then(res=>{
                if(res.status==1){
                    that.showControl = true
                    let man = {}
                    man.id = []
                    man.name = []
                    let startTimelist = []
                    let endTimelist = []
                    for(let i = 0;i<res.data.length;i++){
                        let item = res.data[i];
                        
                        if(item.gpsData&&item.gpsData.length>0){
                            that.createmap.setCenter([item.gpsData[0].longitude,item.gpsData[0].latitude])
                            startTimelist.push(new Date(item.gpsData[0].currTime).getTime())
                            // endTimelist.push(item.gpsData[item.gpsData.length-1].currTime)
                            endTimelist.push(new Date(item.gpsData[item.gpsData.length-1].currTime).getTime())
                            man.id.push(item.id)
                            man.name.push(item.name)
                            man['arr'+item.id] = []
                            man['compare'+item.id] = []
                            man['gps'+item.id] = []
                            let gpslist = item.gpsData
                            for(let j = 0;j<gpslist.length;j++){
                                let gpsitem = gpslist[j]
                                man['gps'+item.id].push(gpsitem)
                                if(man['arr'+item.id].length<=1){
                                    man['arr'+item.id].push([gpsitem.longitude,gpsitem.latitude])
                                    man['compare'+item.id].push([gpsitem.longitude,gpsitem.latitude])
                                }else{
                                    let nowpoint = [gpsitem.longitude,gpsitem.latitude]
                                    let lastpoint = man['compare'+item.id][man['compare'+item.id].length-1]//最后一个点 
                                    if(lastpoint != 'away'){//上个点是正常点
                                        let dis = AMap.GeometryUtil.distance(nowpoint, lastpoint);
                                        if(dis<3){//抛弃
                                            man['compare'+item.id].push('away')
                                        }else{//保留
                                            man['compare'+item.id].push(nowpoint)
                                            man['arr'+item.id].push(nowpoint)//真正运动的点
                                        }
                                    }else{
                                        let usepoint = man['compare'+item.id][man['compare'+item.id].length-2]
                                        let dis = AMap.GeometryUtil.distance(nowpoint, usepoint);
                                        let x = (nowpoint[0]+usepoint[0])/2
                                        let y = (nowpoint[1]+usepoint[1])/2
                                        man['compare'+item.id].push(nowpoint)
                                        man['arr'+item.id].push([x,y])//真正运动的点
                                    }
                                }
                            }
                        }else{
                            // alert('')
                        }
                    }
                    for(var i = 0;i<man.id.length;i++){
                        let item = man.id[i]
                        let second = that.getTimeDiff(man['gps'+item][man['gps'+item].length-1].currTime,man['gps'+item][0].currTime)/1000
                        let indexArr = String(i).split('')
                        let theindex = indexArr[String(i).split('').length-1]-0
                        var dis = that.theamap.GeometryUtil.distanceOfLine(man['arr'+item]);
                        man['speed'+item] = (dis/second)*3.6
                        man['passedPolyline'+item]  = new that.theamap.Polyline({
                            map: that.createmap,
                            lineJoin:'round',
                            // path:man['arr'+item],
                            strokeColor: that.colorArr[theindex+1],  //线颜色
                            strokeWeight: 5,      //线宽
                            strokeOpacity:1,
                            zIndex:51

                        }); 
                        man['passedPolyline1'+item]  = new that.theamap.Polyline({
                            map: that.createmap,
                            lineJoin:'round',
                            path:man['arr'+item],
                            strokeColor: that.colorArr[theindex],  //线颜色
                            strokeWeight: 5,      //线宽
                            strokeOpacity:1

                        });
                        man['marker'+item] = new that.theamap.Marker({
                            map: that.createmap,
                            position: man['arr'+item][0],
                            content:'<div style="display:inline-block;width:13px;height:13px;border-radius:50%;background:'+'yellow'+'"></div>',
                            offset: new that.theamap.Pixel(-6, -6),
                            label:{
                                offset: new that.theamap.Pixel(5, 5),  //设置文本标注偏移量
                                direction:'right',
                                content:'<div class="info" style="font-weight:900;text-shadow:-1px 0 white,0 1px white,1px 0 white,0 -1px white; position: relative;top: 0;right: 0;min-width: 0;background: transparent; border: none;box-shadow: none;padding: 0;color:'+that.colorArr[i]+'">'+man.name[i]+'</div>'
                            },
                        });
                    }
                    startTimelist.sort()
                    endTimelist.sort()
                    let diffTime = (endTimelist[endTimelist.length-1]-startTimelist[0])/1000
                    that.progressMan = diffTime
                    that.manList = man
                    this.showLoading = false
                }
            })
        }
    },
    watch: {
        openKeys (val) {
            console.log('openKeys', val)
        },
    },
}
</script>
<style lang="scss" scoped>
.parent{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    overflow-y: auto;
    background-color: $bgc-color;
}
    .map_page_box{
        padding: 0 60px
    }
    .map_page{
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
        .left{
            color: #fff;
            width: 300px;
            background-color: #59ACF8;
            padding: 10px;
            padding-left: 15px;
            cursor: pointer;
            .set{
                display: flex;
                align-items: center;
                img{
                    width: 18px;
                    cursor: pointer;
                }
                div{
                    flex: 1;
                    margin-left: 10px;
                    background: url('../assets/images/search.png') no-repeat left 15px center;
                    background-size: 15px 17px;
                    background-color: #fff;
                    margin-right: 15px;
                    padding-left: 40px;
                    border-radius: 34px;
                    input{
                        width: 100%;
                        height: 28px;
                        border-radius: 34px;
                        color: #333;
                        border: none;
                        cursor: initial;
                        outline: none;
                        &:focus{
                            outline: none
                        }
                    }
                }
            }
            .selectAll{
                margin-top: 8px;
                span:nth-child(1){
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    vertical-align: middle;
                    &.selectAllActive{
                        background:url("../assets/images/selectAllIcon.png") no-repeat center center #fff;
                        background-size: 12px 9px
                    }
                }
                span:nth-child(2){
                    vertical-align: middle;
                    margin-left: 10px
                }
            }
            .player_list{
                padding: 10px 0;
                overflow-y: auto;
                max-height: 500px;
                padding-right: 15px;
                overflow-x: hidden;
                li{
                    padding: 10px;
                    font-size: 14px;
                    border-radius: 5px;
                    &.player_active{
                        background-color: #8AC3F7;
                    }
                    .player_info{
                        p:nth-child(1){
                            display: flex;
                            align-items: center;
                            span:nth-child(1){
                                display: inline-block;
                                width: 14px;
                                height: 14px;
                                border: 1px solid #666;
                                border-radius: 50%;
                                background-color: #fff;
                                margin-right: 10px;
                            }
                        }
                        p:nth-child(2){
                            padding-left: 28px;
                            font-size: 12px;
                            span{
                                margin-right: 15px
                            }
                        }
                    }
                    .play_detail{
                        padding: 0 28px;
                        font-size: 12px;
                        p{
                            display: flex;
                            justify-content: space-between;
                            margin-top: 3px;
                            font-weight: 900;
                            span{
                                font-weight: normal;
                                &:hover{
                                    font-weight: 900
                                }
                            }
                            .setActive{
                                color: #D10011;
                                &:hover{
                                    font-weight: normal
                                }
                            }
                        }
                        .color_show{
                            width: 22px;
                            height: 22px;
                            background-color: red;
                        }
                    }
                }
            }
            .player_list::-webkit-scrollbar{
                width: 5px;
            }
            .player_list::-webkit-scrollbar-thumb{
                background-color: #fff;
            }
            .player_list::-webkit-scrollbar-track{
                background-color: #59ACF8;
            }
            .player_list::-webkit-scrollbar{
                background-color: #59ACF8;
            }
        }
        .left_set{
            color: #fff;
            width: 300px;
            background-color: #59ACF8;
            // padding: 10px;
            .set_btn{
                padding-left: 15px;
                padding-top: 10px;
                margin-bottom: 10px;
                cursor: pointer;
                img{
                    width: 18px;
                }
            }
            .menutest{
                overflow-y: auto;
                height: 550px;
                .set_detail{
                    background-color: rgba(138,195,247,1);
                    height:auto;
                    overflow: inherit;
                    margin: 0;
                    padding-bottom: 6px;
                    .checkbosSet{
                        font-size: 12px;
                        margin-top: 10px
                    }
                    .LangedalSet{
                        div:nth-child(1){
                            input{
                                text-align: center;
                                background-color: #fff;
                                width: 120px;
                                height: 30px;
                                border: 1px solid #59acf8
                            }
                            span{
                                display: inline-block;
                                height: 30px;
                                width: 50px;
                                color: #fff;
                                border-radius: 4px;
                                background-color: #59acf8;
                                text-align: center;
                                line-height: 30px;
                                vertical-align: middle;
                                margin-left: 6px
                            }
                        }
                        div:nth-child(2){
                            background-color: #1e89ea;
                            text-align: center;
                            height: 32px;
                            line-height: 32px;
                            border-radius: 4px;
                            width: 176px;
                            margin-top: 4px
                        }
                    }
                    .slider{
                        margin: 0
                    }
                    p{
                        margin-bottom: 0
                    }
                    label{
                        color: #fff
                    }
                }
            }
            .set_item{
                overflow-y: auto;
                height: 550px;
                li{
                    margin-top: 10px;
                    .set_item_title{
                        padding-left: 30px;
                        padding-right: 30px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 16px;
                        img{
                            width: 13px;
                            height: 9px;
                        }
                    }
                    .set_detail{
                        background-color: rgba(138,195,247,1);
                        padding-left: 50px;
                        margin-top: 8px;
                        font-size: 14px;
                        padding-bottom: 6px;
                        p{
                            line-height: 30px;
                            margin-bottom: 0
                        }
                        .slider{
                            width: 150px;
                            margin: 0;

                        }
                        label{
                            color: #fff
                        }
                    }
                }
            }
            .menutest::-webkit-scrollbar{
                width: 5px;
            }
            .menutest::-webkit-scrollbar-thumb{
                background-color: #fff;
            }
            .menutest::-webkit-scrollbar-track{
                background-color: #59ACF8;
            }
            .menutest::-webkit-scrollbar{
                background-color: #59ACF8;
            }
        }
        .right{
            position: relative;
            flex: 1;
            #mapcontainer{
                width: 100%;
                height: 100%;
            }
            .control{
                background-color: #fff;
                padding: 15px 40px 15px 40px;
                display: flex;
                align-items: center;
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                img{
                    margin-right: 10px;
                    width: 18px;
                    height: 25px;
                    cursor: pointer;
                    margin-left: 10px
                }
                .fullScreen{
                    width: 25px;
                }
                .prodress_bar{
                    flex: 1
                }
                div{
                    position: relative;
                    p{
                        color: #59ACF8;
                        display: inline-block;
                        margin-left: 10px;
                        font-size: 18px;
                        cursor: pointer;
                        width: 60px;
                    }
                    ul{
                        // display: none;
                        background-color: #F2F3F7;
                        border-radius: 6px;
                        padding: 10px;
                        position: absolute;
                        bottom: 18px;
                        width: 65px;
                        padding-left: 20px;
                        li{
                            &:hover{
                                color: #59ACF8;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }
    span.ant-radio + *{
        padding-right: 6px
    }
    #mapcontainer{
        background-color: #fff !important;
    }
    @media screen and (min-width:1366px) and (max-width:1440px){
        .map_page{
            height: 500px;
        }
        .map_page .left .player_list{
            height: 400px;
        }
    }
    @media screen and (min-width:1440px) and (max-width:1600px){
        .map_page{
            height: 600px;
        }
        .map_page .left .player_list{
            height: 500px;
        }
    }
    @media screen and (min-width:1600px) and (max-width:1680px){
        .map_page{
            height: 640px;
        }
        .map_page .left .player_list{
            height: 540px;
        }
    }
    @media screen and (min-width:1680px) and (max-width:1920px){
        .map_page{
            height: 750px;
        }
        .map_page .left .player_list{
            height: 650px;
        }
    }
    @media screen and (min-width:1920px){
        .map_page{
            height: 780px;
        }
        .map_page .left .player_list{
            height: 680px;
        }
        .map_page .left .player_list li .player_info p:nth-child(1){
            font-size: 16px
        }
        .map_page .left .player_list li .player_info p:nth-child(2){
            font-size: 14px
        }
    }
    .select_point{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(29,29,29,.4);
        .select_point_model{
            width: 200px;
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
            .select_point_title{
                font-weight: 700;
            }
            .select_points_list{
                flex: 1;
                margin: 6px 0;
                ul{
                    display: flex;
                    flex-wrap: wrap;
                    li{
                        width: 50%;
                        // text-align: center;
                        cursor: pointer;
                        margin: 2px 0;
                        padding-left: 18px;
                        span:nth-child(1){
                            display: inline-block;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            border: 1px solid #666;
                            margin-right: 6px
                        }
                    }
                    .selectedPoint{
                        span:nth-child(1){
                            background-color: #1E89EA;
                        }
                    }
                }
            }
            .select_points_foot{
                display: flex;
                align-items: center;
                justify-content: space-around;
                p{
                    cursor: pointer;
                }
                p:nth-child(2){
                    color: #59ACF8
                }
            }
        }
    }
    .selectPointBtn{
        position: absolute;
        right: 20px;
        top: 20px;
        img{
            width: 20px;
            cursor: pointer;
            z-index: 10;
        }
    }
    .info{
            position: relative;
            top: 0;
            right: 0;
            min-width: 0;
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0
        }
</style>


