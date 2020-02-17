<template>
    <div class="box">
        <router-link to="/equipDistribute/fingerCard">
            <div>
                <img src="" alt="">
                <span>指卡分配</span>
            </div>
        </router-link>
        <router-link to="/equipDistribute/gps">
            <div>
                <img src="" alt="">
                <span>GPS分配</span>
            </div>
        </router-link>
    </div>
</template>
<script>
    export default{
        
    }
</script>
<style lang="scss" scoped>
.box{
    display: flex;
    a{
        width: 300px;
        height: 160px;
        border-radius: 5px;
        margin-left: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        &:nth-child(1){
            background-color: #FFCCCC;
            color: #E03434
        }
        &:nth-child(2){
            background-color:#D3E4FF;
            color: #387EE8
        }
    }
}
</style>