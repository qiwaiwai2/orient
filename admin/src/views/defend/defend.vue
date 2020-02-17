<template>
  <div class="defend">
      <div class="gameSetHead">
            <div class="drawLoats_cont_navigation">
                <a-menu
                    v-model="current"
                    mode="horizontal"
                    @click="click"
                >
                    <a-menu-item @click="fingerCard" key="zk">指卡</a-menu-item>
                    <a-menu-item @click="gps" key="gps" >gps跟踪器</a-menu-item>
                    <!-- <a-menu-item @click="postback" key="zjd" >中间点回传设备</a-menu-item> -->
                </a-menu>
            </div>
        </div>
        <div class="gamesetCont">
            <router-view></router-view>
        </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            current:['zk']
        }
    },
    mounted(){
        // console.log(process.env)
    },
    methods:{
        click(item){
            // console.log(item)
        },
        fingerCard(){
            this.$router.push({path:'/defend/fingerCard'})
        },
        gps(){
            this.$router.push({path:'/defend/gps'})
        },
        postback(){

        }
    }
}
</script>
<style lang="scss">

.gameSet{
        height: 100%;
        overflow-y: auto
    }
    .drawLoats_cont_navigation{
        ul{
            text-align: left;
            padding-left: 50px;
            li{
                margin-right: 20px
            }
        }
        
    }
    .gamesetCont{
        margin-top: 20px
    }
</style>
