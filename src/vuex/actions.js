import http from '@/libs/http'
import http2 from '@/libs/http2'
import util from '@/libs/util'
import router from '@/router'
import {appRoutes,errorRoutes} from '@/router/routes'

export function Login({commit}, payload){
  return new Promise((resolve, reject)=>{
    http2(payload).then(res=>{
      if(res&&res.data){
        var data = res.data
        resolve(data);
      }
    }).catch(err=>{
      reject(err)
    })
  })
}
export function exitLogin ({commit}){
  // 清空用户数据
  if (sessionStorage.user) {sessionStorage.removeItem('user')}
  // 清空左侧展开菜单数据
  if (sessionStorage.currentPageName) {sessionStorage.removeItem('currentPageName')}
  if (sessionStorage.currentPath) {sessionStorage.removeItem('currentPath')}
  if (sessionStorage.pageOpenedList) {sessionStorage.removeItem('pageOpenedList')}
  // 清空快捷导航菜单数组
  commit('clearPageOpenedList')
  // 清空面包屑
  commit('clearCurrentPath')
  // 清空所有左侧展开菜单
  commit('clearOpenedSubmenuArr')
  // 清空按钮权限
  commit('resetPermissionList')
  // 清空左侧菜单数组
  commit('updateMenulist2',[])
  router.push({name: 'login'})
}

// 根据获取的权限动态挂载路由
export function authRouter ({commit,state},payload){
  // 路由动态挂载完成后resolve出去
  return new Promise((resolve, reject)=>{
    var menuList = payload.menuList,
      permissionList = payload.permissionList

    // 如果获取的权限菜单或按钮数组任一为空，则表明无权访问
    if(!menuList.length || !permissionList.length){
      reject('您无权访问本系统，请联系管理员进行授权')
    }

    // 把permissionList处理成一个不含中文冒号不含空字符串的数组放到state中，方便在组件中判断
    // var _permissionList=[] 
    var permList=[]
    permissionList.forEach(item=>{
      // 如果有中文冒号，将其替换为英文冒号
      if(item.indexOf('：') != -1){
        item = item.replace(/：/g,':')
      }
      // 跳过菜单，只取权限
      if(item.split(':').length!=1){
        permList.push(util.trimArray(item.split(':')).join(':'))
      }
      // _permissionList.push(util.trimArray(item.split(':')))
    })
    // 更新按钮权限
    commit('updatePermissionList',permList)
    // var permissionListNames = []  //有权访问的菜单name
    var permissionListNames = menuList  //有权访问的菜单name
    // _permissionList.forEach(item=>[
    //   permissionListNames.push(item[0])
    // ])
    permissionListNames = [...new Set(permissionListNames)]
    var menuRoutes = util.deepcopy(appRoutes),permissionRoutes=[],copyItem
    // 生成父级菜单路由
    var parentRoutesNamesArr=[]
    permissionListNames.forEach(_item=>{
      // 将父级加进权限路由
      var _name = util.getParentRouterNameByName(_item)
      parentRoutesNamesArr.push(_name)
    })
    parentRoutesNamesArr = [...new Set(parentRoutesNamesArr)]
    menuRoutes.forEach(item => {
      parentRoutesNamesArr.forEach(name=>{
        if(item.name==name){
          copyItem=util.deepcopy(item)
          copyItem.children=[]
          permissionRoutes.push(copyItem)
        }
      })
    });
    // 生成父级菜单路由  end
    // 将有权访问的子菜单路由放进permissionRoutes
    menuRoutes.forEach(item => {
      if(item.children){
        item.children.forEach(child=>{
          // 遍历所有子菜单，通过name获取的父name值与item.name值相同时将child推入指定的路由
          permissionListNames.forEach(name=>{
            // 子name相同就push
            if(name==child.name){
              permissionRoutes.forEach(permItem=>{
                if(permItem.name==item.name){
                  permItem.children.push(child)
                }
              })
            }
          })
        })
      }
    });
    // permissionRoutes  最终通过权限的路由表
    // var _routes = permissionRoutes.push(...errorRoutes) //这个为什么是两个数组拼在一起的数组长度
    var _routes = permissionRoutes.concat(errorRoutes)
    router.addRoutes(_routes)
    // 更新左侧显示菜单
    commit('updateMenulist2',permissionRoutes)
    let tagsList = []
    state.menuList.forEach(item => {
      if (item.children.length === 0) {
        tagsList.push(item)
      } else {
        tagsList.push(...item.children)
      }
    })
    // 设置当前用户有权访问的页面
    commit('setTagsList', tagsList)
    // 有权访问的菜单的name数组
    var permissionMenuNames = []
    tagsList.forEach(item=>{
      permissionMenuNames.push(item.name)
    })
    commit('setPermissionMenuNames', permissionMenuNames)
    resolve()
  })

}


export function getAuth({dispatch}, params){
  return new Promise((resolve, reject)=>{
    params = params || {
      url: 'web/sys/perm/shiro/vue',
      method: 'post'
    }
    http(params).then(res=>{
      if(res&&res.status==200){
        var resData = res.data
        if(resData.code==1){
          var data = resData.data
          dispatch('authRouter',data).then(()=>{
            resolve(data)
          }).catch(()=>{
            reject()
          })
        }
      }
    })
    // dispatch('initChinaDataAndJson')
    // dispatch('initImageHost')
  })
}

// 更新面包屑
export function setCurrentPath({commit,state},name){
  let currentPathArr = []
  if (name === 'home' || name === 'main') {
    currentPathArr = [{
      title: '首页',
      name: 'home'
    }]
  } else {
    // 默认属于mainRoutes
    let isMainRoutes = true
    state.routers.forEach(item => {
      if (item.name === 'main') {
        // mainRoutes
        item.children.forEach(child => {
          if (child.name === name) {
            isMainRoutes = true
          }
        })
      } else {
        // appRoutes
        item.children.forEach(child => {
          if (child.name === name) {
            isMainRoutes = false
          }
        })
      }
    })
    if (isMainRoutes) {
      // mainRoutes
      state.routers.forEach(item => {
        if (item.name === 'main') {
          item.children.forEach(child => {
            if (child.name === name) {
              currentPathArr = [{
                title: '首页',
                name: 'home'
              }, {
                title: child.meta.title,
                name: child.name
              }]
            }
          })
        }
      })
    } else {
      // appRoutes
      state.routers.forEach(item => {
        if (item.name !== 'main') {
          item.children.forEach(child => {
            if (child.name === name) {
              currentPathArr = [{
                title: '首页',
                name: 'home'
              }, {
                title: item.meta.title,
                name: item.name
              }, {
                title: child.meta.title,
                name: child.name
              }]
            }
          })
        }
      })
    }
  }
  commit('setCurrentPath', currentPathArr)
}

// 更新快捷导航
export function openNewPage ({commit,state},name) {
  let isOpened = false
  for (let i = 0; i < state.pageOpenedList.length; i++) {
    if (state.pageOpenedList[i].name === name) {
      isOpened = true
      break
    }
  }
  if (isOpened) {
    // 打开过了
  } else {
    // 未打开: 创建一个标签
    let tag = state.tagsList.filter(item => {
      return item.name === name
    })[0]
    commit('increateTag', tag)
  }
  commit('setCurrentPageName', name)
}


export function initChinaDataAndJson(){
  if (!sessionStorage.chinaJson || !sessionStorage.chinaData) {
    http.post('area/areas').then(res => {
      if(res&&res.status==200){
        var resData = res && res.data
        if(resData.code==1){
          let chinaData = resData.data
          let chinaJson = util.getChinaJsonByData(chinaData)
          sessionStorage.chinaJson = JSON.stringify(chinaJson)
          sessionStorage.chinaData = JSON.stringify(chinaData)
        }
      }
    })
  }
}

export function initImageHost(){
  var imageHost = sessionStorage.imageHost
  if(!imageHost){
    http.get('web/server/get').then(res=>{
      sessionStorage.imageHost = res.data
    }).catch(error=>{})
  }
}