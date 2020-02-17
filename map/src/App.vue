<template>
  <div id="app">
    <div id="nav">
      <router-link to="/"></router-link>
    </div>
    <router-view/>
  </div>
</template>
<style lang="scss">
  @import './style/common.scss';
  .amap-marker-label{
    border: 0;
    background-color: transparent;
}
.info{
    position: relative !important;
    top: 0 !important;
    right: 0 !important;
    min-width: 0 !important;
    padding: 4px !important;
}
.amap-logo,.amap-copyright{
  display: none !important
}
.control{
  .ant-slider-rail{
      height: 14px !important;
      background-color: #F1F1F1;
  }
  .ant-slider-track{
      height: 14px !important;
      border-radius: 40px
  }
  .ant-slider-handle{
    width: 20px;
    height: 20px;
    margin-top: -4px
  }
  .ant-slider{
    padding: 0;
    padding-bottom: 15px
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
