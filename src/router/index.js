import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes.js'
import {getCookie} from '@/libs/util/util'
import {commonRoutes} from './routes.js'
import {Message} from 'element-ui'
import store from '@/vuex'
Vue.use(Router)
let map = {}
routes.forEach(item => {
  if (item.children) {
    item.children.forEach(child => {
      if (child.meta) {
        map[child.name] = child.meta.title
      }
    })
  } else {
    if (item.meta) {
      map[item.name] = item.meta.title
    }
  }
})
const router = new Router({
  routes: commonRoutes,
})
const AUTHKEY = 'JSESSIONID'
const WHITELIST = ['login', 'error_404']
router.beforeEach((to, from, next) => {
  var name = to.name
  var currentPageName = sessionStorage.currentPageName
  if(WHITELIST.indexOf(name) != -1){
    next()
  }else if(getCookie(AUTHKEY)){
    // 已登录
    var authorized = !!store.state.permissionList.length
    if(authorized){
      // 已授权
      next()
    }else{
      // 未授权
      store.dispatch('getAuth').then(()=>{
        if(name){
          if(name=='error_404'){
            next({name: currentPageName})
          }else{
            next()
          }
        }else{
          next({name: currentPageName})
        }
      }).catch(()=>{
        Message('授权失败，请重新登录')
        next({name: 'login'})
        store.dispatch('exitLogin')
      })
    }
  }else{
    // 未登录
    next({ name: 'login' })
  }
  var title = map[to.name] ? map[to.name] + ' - 众善行后台管理系统' : '众善行后台管理系统'
  window.document.title = title
})
router.afterEach((to, from) => {

})
export default router
