import util from '@/libs/util'
import { appRoutes } from '@/router/routes'
// 从路由中初始化左侧菜单数据
export function updateMenulist (state,permissionRoutes) {
  let menuList = []
  let _appRoutes = util.deepcopy(permissionRoutes || appRoutes)
  _appRoutes.forEach((item, index) => {
    // 根据 accessArr 改变item.meta.access
    if (state.accessArr.length) { // 更改所有的父路由
      state.accessArr.forEach(accessArrItem => {
        if (item.name === accessArrItem.pageName) {
          item.meta.access = accessArrItem.access
        }
      })
    }
    // 父元素access为1
    if (item.meta && item.meta.access) {
      if (item.children.length && state.accessArr.length) {
        state.accessArr.forEach(accessArrItem => {
          item.children.forEach(child => {
            if (child.name === accessArrItem.pageName) {
              child.meta.access = accessArrItem.access
            }
          })
        })
      }
      if (item.children.length === 1) {
        if (item.children[0].meta.access) {
          menuList.push(item)
        }
      } else {
        //  子路由不只一个
        let len = menuList.push(item) // 为什么这里的menuList.push(item)===length
        let childrenArr = []
        childrenArr = item.children.filter(child => {
          if (child.meta && child.meta.access) {
            return child
          }
        })
        menuList[len - 1].children = childrenArr
      }
    }
  })
  state.menuList = menuList
}

export function updateMenulist2 (state,permissionRoutes) {
  var arr = permissionRoutes || []
  state.menuList = arr
  // state.tagsList.push(...arr)
}

export function setTagsList (state, list) {
  state.tagsList.push(...list)
}

// 更新面包屑数组
export function setCurrentPath (state, pathArr) {
  state.currentPath = pathArr
  sessionStorage.currentPath = JSON.stringify(pathArr)
}
// 新增标签（缓存页面的name） 缓存所有的已打开的页面
export function increateTag (state, tagObj) {
  state.cachePage.push(tagObj.name)
  state.pageOpenedList.push(tagObj)
  sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList)
}
// 移除标签
export function removeTag (state, name) {
  for (let i = 0; i < state.pageOpenedList.length; i++) {
    if (state.pageOpenedList[i].name === name) {
      state.pageOpenedList.splice(i, 1)
    }
  }
}
// 设置当前页name
export function setCurrentPageName (state, name) {
  state.currentPageName = name
}

// 关闭一个页面，该页面不再缓存
export function closePage (state, name) {
  for (let i = 0; i < state.cachePage.length; i++) {
    if (state.cachePage[i].name === name) {
      state.cachePage.splice(i, 1)
    }
  }
  var arr = JSON.parse(sessionStorage.pageOpenedList),_arr=[]
  arr.forEach(item=>{
    if(name != item.name){
      _arr.push(item)
    }
  })
  sessionStorage.pageOpenedList = JSON.stringify(_arr)
}
// 关闭所有（除主页home）
export function closeAllPage (state) {
  var home = [state.pageOpenedList[0]]
  state.pageOpenedList = home
  state.cachePage = []
  sessionStorage.pageOpenedList = JSON.stringify(home)
}
// 关闭其他页
export function closeOtherPage (state, currentPageName) {
  let home = [state.pageOpenedList[0]],arr=[]
  if (currentPageName === 'home') {
    arr = home
  } else {
    arr = home.concat(state.pageOpenedList.filter(item => {
      return item.name === currentPageName
    }))
  }
  state.pageOpenedList = arr
  sessionStorage.pageOpenedList = JSON.stringify(arr)
  state.cachePage = [currentPageName]
}


// 解决刷新时已经打开的页面数组状态丢失问题
export function updatePageOpenedList (state, arrList) {
  state.pageOpenedList = arrList
}
// 清空快捷导航菜单数组
export function clearPageOpenedList (state) {
  var home = [state.pageOpenedList[0]]
  state.pageOpenedList = home
  sessionStorage.pageOpenedList = JSON.stringify(home)
}
// 清空面包屑
export function clearCurrentPath (state) {
  state.currentPath.splice(1)
  sessionStorage.currentPath = JSON.stringify(state.currentPath)
}
// 在main.vue中初始化pageOpenedList，解决刷新时状态丢失问题
export function setPageOpenedList (state, arr) {
  state.pageOpenedList = arr
}
// 将指定父级展开
export function setOpenedSubmenuArr (state, name) {
  state.openedSubmenuArr.push(name)
}
// 关闭所有时清空左侧展开数组
export function clearOpenedSubmenuArr (state) {
  state.openedSubmenuArr = []
}
// 关闭其他时只剩一个
export function clearOtherOpenedSubmenuArr (state, name) {
  state.openedSubmenuArr = [name]
}

// 更新按钮权限数组
export function updatePermissionList (state, arr) {
  state.permissionList = arr
}

// 重置权限按钮数组
export function resetPermissionList(state){
  state.permissionList = []
}

// 更新有权访问的菜单的name数组
export function setPermissionMenuNames(state, arr){
  state.permissionMenuNames = arr
}

// -----------------------  action 提交的mutation  -------------------------------
