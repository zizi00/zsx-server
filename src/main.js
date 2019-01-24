import Vue from 'vue'
import App from './App'
import router from './router'
import element from 'element-ui'
import VueDND from 'awe-dnd'  // 拖拽组件
import 'babel-polyfill'
import 'element-ui/lib/theme-chalk/index.css';
import store from './vuex'
import http from './libs/http'
import http2 from './libs/http2'
import util from './libs/util'
Vue.config.productionTip = false
Vue.use(element)
Vue.use(VueDND)
Vue.prototype.$http = http
Vue.prototype.$http2 = http2
Vue.prototype.util = util
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})
