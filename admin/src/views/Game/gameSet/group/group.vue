<template>
    <div class="gameItem">
       <a-table :columns="columns" align='center'  :dataSource="gamedata" :pagination="{ pageSize: 10,hideOnSinglePage:true }" >
           
            <span slot="action" class="operate" slot-scope="text, record">
                <img @click="edit(record.key,record.name,record.order,record.parentId,record.isab,record.groupType)" src="../../../../assets/image/edit.png" alt="">
                <img  @click.stop="deleteItem(record.key)" src="../../../../assets/image/delete.png" alt="">
            </span>
        </a-table>
        <a-button @click="createGameItem" class="createBtn">+创建</a-button>
        <!-- 创建组别 -->
        <a-modal
            title="创建组别"
            v-model="visible"
            @ok="handleOk"
            >
            <div class="game_local">
                父级组别：<a-select v-model='gamenamedefault' @change="handleChange">
                            <!-- <a-select-option value="noOne">无</a-select-option> -->
                            <a-select-option v-for="(item,index) in gameNameList" :key="index" :value="item.key">{{item.name}}</a-select-option>
                        </a-select>
            </div>
            <div class="game_local">
                组别名称：<a-input v-model="groupName" placeholder="请输入组别名称" />
            </div>
            <div class="game_local">
                组别类型：<a-select v-model="groupType" :allowClear='true' @change="handleChange2">
                            <a-select-option value="1">参赛组</a-select-option>
                            <a-select-option value="2">救援组</a-select-option>
                        </a-select>
            </div>
            <div v-show="isShowAb" class="game_local">
                A/ B路线：<a-select v-model="isAb" :allowClear='true' @change="handleChange1">
                            <a-select-option value="1">A路线</a-select-option>
                            <a-select-option value="2">B路线</a-select-option>
                        </a-select>
            </div>
            <div class="game_local">
                选择排序：<a-input v-model="sortNum" placeholder="请输入排序编号" />
            </div>
        </a-modal>
    </div>
</template>
<script>
import {groupfindAllList,groupsaveEntity,groupdelEntity} from '@/api'
export default {
    data(){
        return {
            columns:[{
                    title: '组别名称',
                    dataIndex: 'name',
                    key: 'name',
                    align:'center'
                }, {
                    title: 'A/B路线',
                    dataIndex: 'age',
                    key: 'age',
                    align:'center'
                }, {
                    title: '排序',
                    dataIndex: 'order',
                    key: 'order',
                    align:'center',
                }, {
                    title: '操作',
                    key: 'action',
                    dataIndex:'action',
                    align:'center',
                    scopedSlots: { customRender: 'action' },
            }],
            gamedata:[],
            gameNameList:[{
                name:'无',
                key:0
            }],
            groupType: '1', //组别类型
            mode: 'time',
            visible:false, // 显示创建编辑弹窗
            groupid:null, // 组别id，新增为null
            competitionId:'', // 赛事id
            groupName:'', // 组别名称
            parentId:'', // 父级组别id
            isAb:null, // ab路线
            sortNum:'', // 排序编号
            isShowAb:false,
            gamenamedefault:'',
        }
    },
    mounted(){
        this.competitionId = this.$route.query.gameId
        this.getData()
    },
    methods:{
        edit(id,name,order,parentid,isab,grouptype){ //编辑路线
            this.groupid = id
            this.groupName = name
            this.sortNum = order
            this.visible = true
            this.isAb = isab
            this.groupType = String(grouptype)
            this.parentId = parentid
            if(parentid){
                this.gameNameList.forEach(item=>{
                    if(parentid == item.key){
                        this.gamenamedefault = item.name
                    }
                })
                this.isShowAb = true
            }else{ //没有父组别
                this.gamenamedefault = this.gameNameList[0].name
                this.isShowAb = false
            }

        },
        handleChange(e){ //选择父组别
            if(!e){ //没有父组别
                this.parentId = null
                this.isAb = null
                this.isShowAb = false
            }else{
                this.parentId = e
                this.isAb = '1'
                this.isShowAb = true
            }
        },
        handleChange1(e){ //AB路线
            this.isAb = e
        },
        handleChange2(e){ //组别类型
            this.groupType = e
        },
        handleOk(e) { //创建组别
            let params = {
                id:this.groupid,
                groupName:this.groupName,
                competitionId:this.competitionId,
                parentId:this.parentId,
                isAb:this.isAb?String(this.isAb):this.isAb, //ab线，a为1，b为2
                sortNum:this.sortNum,
                groupType:this.groupType
            }
            console.log(params)
            groupsaveEntity(params).then(res=>{
                // console.log(res)
                if(res.status == 1){
                    this.$message.success('创建成功！',1).then((res)=>{
                        this.getData()
                        this.visible = false
                    })
                }else{
                    this.$message.error('创建失败！').then(()=>{
                        this.visible = false
                    })
                }
            })
            // this.visible = false
        },
        createGameItem(){//创建赛项
            this.groupid = null
            this.visible = true
            this.groupName = '',
            this.parentId = '',
            this.isAb = null
            this.sortNum = ''
            this.isShowAb = false
            this.gamenamedefault = this.gameNameList[0].name
            this.groupType = '1'
        },
        deleteItem(key){//删除
            this.$tips.confirm('是否确定要删除此条信息？').then((res)=>{
                this.gameNameList = [{
                    name:'无',
                    key:0
                }]
                groupdelEntity(key).then(res=>{
                    if(res.status == 1){
                        this.$message.success('删除成功！',1).then((res)=>{
                           this.gamedata.forEach((ele,index) => {
                                if(key == ele.key){
                                    this.gamedata.splice(index,1)
                                }else{
                                    this.gameNameList.push({
                                        name:ele.name,
                                        key:ele.key
                                    })
                                }
                            });
                        })
                        this.gamenamedefault = this.gameNameList[0].name
                    }
                })
            }).catch((err)=>{
            })
        },
        getData(){//获取所有组别
            this.gamedata = []
            this.gameNameList = [{
                name:'无',
                key:0
            }]
            groupfindAllList(this.competitionId).then(res=>{
                console.log(res)
                if(res.status == 1){
                    let data = res.data
                    data.forEach((item,index) => {
                        this.gamedata.push({
                            key: item.id,
                            name: item.groupName,
                            age: item.isAb?(item.isAb==1?'A路线':'B路线'):'',
                            isab:item.isAb,
                            order: item.sortNum,
                            align:'center',
                            parentId:item.parentId,
                            groupType:item.groupType
                        })
                        this.gameNameList.push({
                            name:item.groupName,
                            key:item.id
                        })
                        this.gamenamedefault = this.gameNameList[0].name
                    })
                }
            })
        }
    },

}
</script>
<style lang="scss" scoped>
    .createBtn{
        position: absolute;
        bottom: 40px;
        width: 100px;
        height: 40px;
        line-height: 40px;
        background-color: #387EE8;
        color: #fff;
        right: 100px;
        cursor: pointer
    }
    .game_name{
        input{
            width: 300px;
            margin-left: 10px
        }
    }
    .game_time{
        margin-top: 10px;
        .game_time_select{
            width: 300px !important;
            margin-left: 10px
        }
    }
    .game_local{
        margin-top: 10px;
        .ant-select,input {
            width: 300px;
            margin-left: 10px
        }
    }
    .operate1{
        input{
            width: 50px;
            height: 24px;
            text-align: center;
            border: 1px solid #999
        }
    }
    .operate{
        img{
            margin: 0 5px;
            cursor: pointer;
        }
    }
</style>


