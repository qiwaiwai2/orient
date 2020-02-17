import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {Slider,Radio,Menu,Checkbox,Row,Col,Spin,Progress,DatePicker,Input,Button,Select} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
Vue.config.productionTip = false
Vue.use(Slider)
Vue.use(Radio)
Vue.use(Menu)
Vue.use(Row)
Vue.use(Checkbox)
Vue.use(Col)
Vue.use(Spin)
Vue.use(Progress)
Vue.use(DatePicker)
Vue.use(Input)
Vue.use(Button)
Vue.use(Select)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
