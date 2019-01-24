import { mainRoutes, appRoutes } from '@/router/routes'
export default {
  // 这个是干嘛的
  routers: [
    mainRoutes,
    ...appRoutes
  ],
  // mainRoutes 所有用户都有的  +  当前根据当前用户权限可以访问的
  tagsList: [...mainRoutes.children], // 标签（点击跳转的）路由都在里边 ，左侧菜单中的路由在main.js中created时 push进去
  // 已经打开的页面列表数据
  pageOpenedList: [
    {
      meta: {
        title: '首页'
      },
      path: '/',
      name: 'home'
    }
  ],
  // 带有页面权限数据的数组 实例： [{pageName: 'main', access: 1}, {pageName: 'member_index', access: 0}]  数组中的 pageName 可以改为其他，改过之后mutations中的updateMenulist函数中也要改也要相应的去改
  accessArr: [],
  // 要缓存的页面name数组
  cachePage: [],  // 这里边放的是组件的name，这样的话就需要每页组件的name与路由name一致
  currentPageName: '',
  // 面包屑数组
  currentPath: [
    {
      title: '首页',
      path: '/',
      name: 'home'
    }
  ],
  // 要展示的左侧菜单
  menuList: [],
  // 要展开的菜单数组
  openedSubmenuArr: [],
  // 按钮权限数组，是否有权限回拿权限字符串在此数组中循环，有就有权限
  permissionList: [],
  // 有权访问的菜单的name数组
  permissionMenuNames: [],
}
