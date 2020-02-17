<template>
    <div>
        <div class="left" v-show="!showSet">
            <div class="set">
                <img src="../assets/images/set.png" @click="showSetModel" alt="">
                <div>
                    <input type="text" placeholder="Competitors...">
                </div>
            </div>
            <div class="selectAll">
                <span @click="selectAll" :class="isSelectAll?'selectAllActive':''"></span>
                <span>Select All</span> 
            </div>
            <ul class="player_list">
                <li v-for="(item,index) in playInfo" :key="index" :class="item.active?'player_active':''"  @click="selectPlay(index)">
                    <div class="player_info">
                        <p>
                            <span :style="{backgroundColor:item.isSelect?item.color:'#fff'}" @click.stop="selectPlayer(index,item.id)"></span>
                            <span>{{item.name}}</span>
                        </p>
                        <p>
                            <!-- <span>11:23:00</span>
                            <span>0km/h</span>
                            <span>0.00km</span>
                            <span>PRE</span> -->
                            <span>{{item.nationality}}   {{item.no}}</span>
                        </p>
                    </div>
                    <div class="play_detail" v-show="item.active">
                        <p>
                            <span @click.stop="select_effect(index,'center')" :class="item.centerSet?'':''">Center</span>
                            <span @click.stop="select_effect(index,'highlight')" :class="item.highlightset?'setActive':''">Highlight OFF</span>
                            <!-- <span @click.stop="select_effect(index,'autocenter')" :class="item.autocenterset?'setActive':''">Autocenter OFF</span> -->
                        </p>
                        <p>
                            <span @click.stop="select_effect(index,'fullroute')" :class="item.fullrouteset?'setActive':''">Full route OFF</span>
                        </p>
                        <!-- <p class="color_show" :style="{backgroundColor:item.color}"></p> -->
                    </div>
                </li>
            </ul>
        </div>
        <div class="left_set" v-show="showSet">
            <div class="set_btn" @click="showSetModel">
                <img src="../assets/images/setBtn.png" alt="">
            </div>
            <a-menu
                @click="handleClick"
                :openKeys.sync="openKeys"
                mode="inline"
                theme="dark"
                class="menutest"
                style="background:#59ACF8"
            >
                <!-- <a-sub-menu key="sub1">
                    <span slot="title">App Mode</span>
                    <a-menu-item key="1" class="set_detail">
                        <p>Desktop</p>
                        <p>Mobile</p>
                    </a-menu-item>
                </a-sub-menu> -->
                <a-sub-menu key="sub2">
                    <span slot="title">Tail</span>
                    <a-menu-item  style="padding-left:30px"  key="2" class="set_detail">
                        <p>Tail</p>
                        <a-slider class="slider" @change="tailOnChange" :defaultValue="30" :max="1000"  :disabled="disabled" />
                        <p>Route</p>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub3">
                    <span slot="title">Marker, line & map</span>
                    <a-menu-item style="padding-left:30px" key="3" class="set_detail">
                        <p>Maker Size:{{markerWH}}px</p>
                        <a-slider class="slider" @change="markeronChange" v-model="markerWH" :min="8" :defaultValue="13" :max="30" :disabled="disabled" />
                        <p>Letters:12px</p>
                        <a-slider class="slider" @change="letteronChange" v-model="letterfontsize" :defaultValue="12" :min="12" :max="30" :disabled="disabled" />
                        <!-- <p>Line Width:6px</p>
                        <a-slider class="slider" @change="onChange" :defaultValue="defaultValue" :disabled="disabled" />
                        <p>Line opacity:80%</p>
                        <a-slider class="slider" @change="onChange" :defaultValue="defaultValue" :disabled="disabled" /> -->
                        <p>Map opacity: {{mapOpacity}}</p>
                        <a-slider class="slider" @change="mapOpacityonChange" v-model="mapOpacity" :defaultValue="defaultValue" :min="0" :max="1" :step="0.01" :disabled="disabled" />
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub4">
                    <span slot="title">Competitor</span>
                    <a-menu-item  style="padding-left:30px"  key="4" class="set_detail">
                        <p>show</p>
                        <a-radio-group class="radioSet" name="radioGroup" :defaultValue="1">
                            <a-radio style="margin-right:0" :value="1">km/h</a-radio>
                            <a-radio style="margin-right:0" :value="2">min/km</a-radio>
                            <a-radio style="margin-right:0" :value="3">knot</a-radio>
                        </a-radio-group>
                        <p>hide</p>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub5">
                    <span slot="title">Offset</span>
                    <a-menu-item  style="padding-left:30px"  key="5" class="set_detail">
                        <p>Langedal</p>
                        <div class="LangedalSet">
                            <div>
                                <input type="text" value="0:00">
                                <span>OK</span>
                            </div>
                            <div>Reset all offsets</div>
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub6">
                    <span slot="title">Display Settings</span>
                    <a-menu-item  style="padding-left:30px"  key="6" class="set_detail">
                        <a-checkbox-group @change="checkboxonChange">
                            <a-row>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="A">National flag</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="B">Nationality</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="C">Name</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="D">ID</a-checkbox></a-col>
                            </a-row>
                        </a-checkbox-group>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </div>
    </div>
</template>>
<script>
export default {
    data(){
        return {
            showSet:false,//显示设置
            isSelectAll:true,//是否全选
            openKeys: ['sub1'],
            defaultValue:0,
            disabled:false,
            // selectManid:[],//选中的人员
            endTimeList:null,//结束时间
            markerWH:13,//marker大小
            letterfontsize:12,//marker文字大小
            mapOpacity:0.7,//地图透明度
        }
    },
    props:[
        'playInfo',
        'createmap',
        'manList',
        'createmap'
    ],
    mounted(){
        // this.selectManid = []
        let query = this.$route.query;
        
    },
    methods:{
        showSetModel(){//设置页面
            this.showSet=!this.showSet
        },
        selectAll(){//选择全部
            this.isSelectAll = !this.isSelectAll
            this.playInfo.forEach((item,itemIndex)=>{
                if(this.isSelectAll){
                    this.$set(this.playInfo[itemIndex], 'isSelect', true)
                    if(this.playInfo[itemIndex].marker){
                        this.createmap.add(this.playInfo[itemIndex].marker)
                    }
                    if(this.playInfo[itemIndex].passedPolyline){
                        this.createmap.add(this.playInfo[itemIndex].passedPolyline)
                    }
                    if(this.playInfo[itemIndex].passedPolyline1){
                        this.createmap.add(this.playInfo[itemIndex].passedPolyline1)
                    }
                    if(this.manList['historymarker'+item.id]){
                        this.createmap.add(this.manList['historymarker'+item.id])
                        this.createmap.add(this.manList['historypassedPolyline'+item.id])
                        this.createmap.add(this.manList['historypassedPolyline1'+item.id])
                    }
                }else{
                    this.$set(this.playInfo[itemIndex], 'isSelect', false)
                    if(this.playInfo[itemIndex].marker){
                        this.createmap.remove(this.playInfo[itemIndex].marker)
                    }
                    if(this.playInfo[itemIndex].passedPolyline){
                        this.createmap.remove(this.playInfo[itemIndex].passedPolyline)
                    }
                    if(this.playInfo[itemIndex].passedPolyline1){
                        this.createmap.remove(this.playInfo[itemIndex].passedPolyline1)
                    }
                    if(this.manList['historymarker'+item.id]){
                        this.createmap.remove(this.manList['historymarker'+item.id])
                        this.createmap.remove(this.manList['historypassedPolyline'+item.id])
                        this.createmap.remove(this.manList['historypassedPolyline1'+item.id])
                    }
                }
            })
        },
        selectPlay(index){//选中选手
            this.playInfo.forEach((item,itemIndex)=>{
                if(index==itemIndex){
                    this.$set(this.playInfo[itemIndex], 'active', true)
                }else{
                    this.$set(this.playInfo[itemIndex], 'active', false)
                }
            })
        },
        selectPlayer(index,id){//选择选手
            if(this.playInfo[index].isSelect){
                if(this.playInfo[index].marker){
                    this.createmap.remove(this.playInfo[index].marker)
                }
                if(this.playInfo[index].passedPolyline){
                    this.createmap.remove(this.playInfo[index].passedPolyline)
                }
                if(this.playInfo[index].passedPolyline1){
                    this.createmap.remove(this.playInfo[index].passedPolyline1)
                }
                if(this.manList['historymarker'+id]){
                    this.createmap.remove(this.manList['historymarker'+id])
                    this.createmap.remove(this.manList['historypassedPolyline'+id])
                    this.createmap.remove(this.manList['historypassedPolyline1'+id])
                }
            }else{
                if(this.playInfo[index].marker){
                    (this.playInfo[index].marker).show()
                    this.createmap.add(this.playInfo[index].marker)
                }
                if(this.playInfo[index].passedPolyline){
                    (this.playInfo[index].passedPolyline).show()
                    this.createmap.add(this.playInfo[index].passedPolyline)
                }
                if(this.playInfo[index].passedPolyline1){
                    (this.playInfo[index].passedPolyline1).show()
                    this.createmap.add(this.playInfo[index].passedPolyline1)
                }
                if(this.manList['historymarker'+id]){
                    this.createmap.add(this.manList['historymarker'+id])
                    this.createmap.add(this.manList['historypassedPolyline'+id])
                    this.createmap.add(this.manList['historypassedPolyline1'+id])
                }
                
            }
            this.$set(this.playInfo[index], 'isSelect', !this.playInfo[index].isSelect)
        },
        select_effect(index,ele){//选择显示效果
            if(ele == 'center'){
                this.$set(this.playInfo[index], 'centerset', !this.playInfo[index].centerset)
                this.createmap.setCenter([
                    this.manList['historymarker'+this.playInfo[index].id].getPosition().lng,
                    this.manList['historymarker'+this.playInfo[index].id].getPosition().lat
                ])
                
            }else if(ele == 'autocenter'){
                this.$set(this.playInfo[index], 'autocenterset', !this.playInfo[index].autocenterset)
            }else if(ele == 'highlight'){
                this.$set(this.playInfo[index], 'highlightset', !this.playInfo[index].highlightset)
            }else if(ele == 'fullroute'){
                this.$set(this.playInfo[index], 'fullrouteset', !this.playInfo[index].fullrouteset)
                if(this.playInfo[index].fullrouteset){
                    this.createmap.add(this.manList['historypassedPolyline1'+this.playInfo[index].id])
                }else{
                    this.createmap.remove(this.manList['historypassedPolyline1'+this.playInfo[index].id])
                }
            }
        },
        handleClick (e) {
            console.log('click', e)
        },
        checkboxonChange(checkedValues){//多选框选择
            console.log('checked = ', checkedValues)
        },
        markeronChange(value) {//marker宽高设置
            this.$emit('markerset',value)
            this.markerWH = value
        },
        tailOnChange(value){//尾巴设置
            this.$emit('tailset',value)
        },
        letteronChange(value){//marker文字大小设置
            this.$emit('letterset',value)
            this.letterfontsize = value
        },
        mapOpacityonChange(value){//地图透明度设置
            this.$emit('mapOpacitySet',value)
            this.mapOpacity = value
        }
    }
}
</script>>
<style lang="scss" scoped>
.left{
    color: #fff;
    width: 252px;
    background-color: #59ACF8;
    padding: 10px;
    padding-left: 15px;
    cursor: pointer;
    height: 100%;
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
            background: url('../assets/images/search.png') no-repeat left 8px center;
            background-size: 15px 17px;
            background-color: #fff;
            margin-right: 15px;
            padding-left: 20px;
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
        height: 430px;
        padding-right: 5px;
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
                    padding-left: 25px;
                    font-size: 12px;
                    span{
                        margin-right: 15px
                    }
                }
            }
            .play_detail{
                padding: 0 25px;
                padding-right: 0;
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
    width: 252px;
    background-color: #59ACF8;
    // padding: 10px;
    height: 100%;
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
            height: 300px;
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
                        text-align: center;
                        cursor: pointer;
                        margin: 2px 0;
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
</style>>