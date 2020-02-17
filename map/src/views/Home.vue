<template>
  <div class="home">
    <Head></Head>
    <div class="home_box">
      <div class="home_container">
        <div class="title">Select event:</div>
        <div class="content">
          <div class="select_year">
            <div class="select_word">Select year:</div>
            <div class="year_list">
              <span class="active">2019</span>
            </div>
          </div>
          <div class="game_list">
            <div v-for="(item,index) in gameList" :key="index" class="game_item">
              <h3>{{item.name}}</h3>
              <!-- <h3>第七届世界军人运动会</h3> -->
              <ul class="game_item_list">
                <li v-for="(groupItem,groupIndex) in item.itemGroup" :key="groupIndex" @click="matchDetail(item.id,groupItem.competitionItemId,groupItem.id,groupItem.startDate,groupItem.endDate,groupItem.isPlay)">
                  <p>{{item.name}} {{groupItem.itemName}} {{groupItem.groupName}}</p>
                  <p style="text-align:center">{{item.location}}</p>
                  <p>{{groupItem.isPlay==0?'未开始':(groupItem.isPlay==1?'直播':'回放')}}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Head from '@/components/Head.vue'
import {findAllCompetition,findEntity} from '@/api'
export default {
  name: 'home',
  data(){
    return {
      gameList:[],//赛事列表
    }
  },
  components: {
    Head
  },
  mounted(){
    this.getData()
  },
  methods:{
    matchDetail(gameId,gameItemId,groupId,startTime,endTime,isplay){//赛事详情
      // console.log(groupId)
      this.$router.push({path:'/mapPage',query:{gameId,gameItemId,groupId,startTime,endTime,isplay}})
    },
    async getData(){//获取数据
      let gameList = await findAllCompetition().then(res=>{
        return res
      })
      if(gameList.status == 1){
        let data = gameList.data
        for(let i = 0;i<data.length;i++){
          let item = data[i]
          await findEntity(item.id).then(res=>{
            if(res.status == 1){
              // this.gameList.push(res.data)
              // console.log(res.data)
              for(let i = 0;i<res.data.length;i++){
                let item = res.data[i]
                item.gameItemList = {}
                let itemgroup = item.itemGroup
                for(let j = 0;j<itemgroup.length;j++){
                  let groupitem = itemgroup[j]
                  if(item.gameItemList[groupitem.competitionItemId]){
                    item.gameItemList[groupitem.competitionItemId].push(groupitem)
                  }else{
                    item.gameItemList[groupitem.competitionItemId] = []
                    item.gameItemList[groupitem.competitionItemId].push(groupitem)
                  }
                }
              }
              this.gameList.push(res.data)
            }
          })
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .home{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    overflow-y: auto;
    background: url('../assets/images/beijing.png');
    background-color: $bgc-color;
    .home_box{
      padding: 0 250px
    }
    .home_container{
      border: 1px solid #59ACF8;
      padding: 30px 50px;
      margin: 0 auto;
      background-color: #fff;
      margin-top: 20px;
      .title{
        padding: 0 20px;
        padding-bottom: 5px;
        font-size: 20px;
        color: #333;
        font-weight: 700;
        border-bottom: 1px solid #999
      }
      .content{
        padding: 10px 20px;
        color: #666;
        // padding-right: 200px;
        .select_year{
          display: flex;
          margin-bottom: 10px;
          .select_word{
            white-space: nowrap;
          }
          .year_list{
            *zoom: 1;
            &::after{
              content: '';
              display: block;
              height: 0;
              clear: both;
              visibility: hidden;
            }
            span{
              margin-left: 20px;
              float: left;
              margin-bottom: 5px;
              cursor: pointer
            }
            .active{
              color: #59ACF8;
              text-decoration: underline;
              cursor:default
            }
          }
        }
        .game_list{
          height: 450px;
          overflow-y: auto;
          .game_item{
            margin-bottom: 10px;
            h3{
              font-weight: 800;
              font-size: 16px;
              color: #666
            }
            .game_item_list{
              padding-right: 50px;
              li{
                display: flex;
                font-size: 12px;
                justify-content: space-between;
                background-color: #fff;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                &:hover{
                  background-color: #59ACF8;
                  color: #fff
                }
                p{
                  text-align: left;
                  margin-bottom: 0;
                  width: 50px
                }
                p:nth-child(1){
                  flex: 1.5
                }
                p:nth-child(2){
                  flex: 1
                }
              }
            }
          }
        }
        .game_list::-webkit-scrollbar{
            width: 10px;
        }
        .game_list::-webkit-scrollbar-thumb{
            background-color: #F2F3F7;
            box-shadow: 0
        }
        .game_list::-webkit-scrollbar-track{
            background-color: #fff;
        }
        .game_list::-webkit-scrollbar{
            background-color: #fff;
        }
      }
    }
  }
  @media screen and (min-width:1366px) and (max-width:1440px){
    .home .home_container .content .game_list{
      height: 330px;
    }
  }
  @media screen and (min-width:1440px) and (max-width:1600px){
    .home .home_container .content .game_list{
      height: 450px;
    }
  }
  @media screen and (min-width:1600px) and (max-width:1680px){
    .home .home_container .content .game_list{
      height: 450px;
    }
  }
  @media screen and (min-width:1680px) and (max-width:1920px){
    .home .home_container .content .game_list{
      height: 560px;
    }
    .home .home_container .content .game_list .game_item .game_item_list li{
      font-size: 14px
    }
  }
  @media screen and (min-width:1920px){
    .home .home_container .content .game_list{
      height: 600px;
    }
    .home .home_container .content .game_list .game_item .game_item_list li{
      font-size: 16px
    }
  }
</style>

