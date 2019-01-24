import main from '@/pages/main'
// 如果想要更逼真一些，可以在path上加 .html
// 例如登录的path可以写成： path: '/login.html'  在浏览器中显示的就是 www.zsx2017.com/login.html  其他同理
const loginRoute = {
  path: '/login',
  name: 'login',
  meta: {
    title: '登录'
  },
  component: resolve => { require(['@/pages/login'], resolve) }
}
export const mainRoutes = {
  path: '/',
  name: 'main',
  component: main,
  meta: {
    title: '首页',
    access: 1,
    icon: ''
  },
  redirect: {
    name: 'home',
  },
  children: [
    {
      path: 'home',
      name: 'home',
      meta: {
        title: '首页',
        access: 1,
        icon: ''
      },
      component: resolve => { require(['@/pages/home'], resolve) }
    }
  ]
}
export const appRoutes = [
  // 模板,测试
  {
    path: '/template',
    name: 'template',
    meta: {
      title: '模板/测试',
      access: 1,
      // icon 使用阿里图标库的icon-class
      icon: 'icon-template'
    },
    component: main,
    children: [
      {
        path: 'test',
        name: 'test',
        meta: {
          title: '测试',
          access: 1,
          icon: 'icon-test'
        },
        component: resolve => { require(['@/pages/test'], resolve) }
      },
      {
        path: 'template_index',
        name: 'template_index',
        meta: {
          title: '模板',
          access: 1,
          icon: 'icon-template'
        },
        component: resolve => { require(['@/pages/pageTemplate'], resolve) }
      }
    ]
  },
  // 权限
  {
    path: '/authority',
    name: 'authority',
    meta: {
      title: '权限管理',
      access: 1,
      icon: 'icon-permission'
    },
    component: main,
    children: [
      {
        path: 'systemUser',
        name: 'systemUser',
        meta: {
          title: '系统用户',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/user/systemUser'], resolve) }
      },
      {
        path: 'role',
        name: 'role',
        meta: {
          title: '系统角色',
          access: 1,
          icon: 'icon-role'
        },
        component: resolve => { require(['@/pages/user/role'], resolve) }
      },
      {
        path: 'authority_index',
        name: 'authority_index',
        meta: {
          title: '权限列表',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/authority'], resolve) }
      },
    ]
  },
  // 广告管理
  {
    path: '/ad',
    name: 'ad',
    meta: {
      title: '广告管理',
      access: 1,
      icon: 'icon-ad'
    },
    component: main,
    children: [
      {
        path: 'index',
        name: 'ad_index',
        meta: {
          title: '广告管理',
          access: 1,
          icon: 'icon-ad'
        },
        component: resolve => { require(['@/pages/ad'], resolve) }
      }
    ]
  },
  // 意见反馈
  {
    path: '/adviceBack',
    name: 'adviceBack',
    meta: {
      title: '意见反馈',
      access: 1,
      icon: 'icon-advice'
    },
    component: main,
    children: [
      {
        path: 'index',
        name: 'adviceBack_index',
        meta: {
          title: '反馈基础数据',
          access: 1,
          icon: 'icon-data'
        },
        component: resolve => { require(['@/pages/adviceBack'], resolve) }
      },
      {
        path: 'adviceContent',
        name: 'adviceContent',
        meta: {
          title: '反馈内容',
          access: 1,
          icon: 'icon-content'
        },
        component: resolve => { require(['@/pages/adviceBack/adviceContent'], resolve) }
      },
    ]
  },
  // 内容管理
  {
    path: '/content',
    name: 'content',
    component: main,
    meta: {
      title: '资讯管理',
      access: 1,
      icon: 'icon-content'
    },
    children: [
      {
        path: 'softtext',
        name: 'softtext',
        meta: {
          title: '资讯软文',
          access: 1,
          icon: 'icon-xinxixiangqing'
        },
        component: resolve => { require(['@/pages/content/softtext'], resolve) }
      },
      {
        path: 'chickenSoup',
        name: 'chickenSoup',
        meta: {
          title: '简报心语',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/chickenSoup'], resolve) }
      },
      {
        path: 'easypaper',
        name: 'easypaper',
        meta: {
          title: '每日简报',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/easypaper'], resolve) }
      },
    ]
  },
  //  服务
  {
    path: '/service',
    name: 'service',
    component: main,
    meta: {
      title: '服务',
      access: 1,
      icon: 'icon-i-w-service'
    },
    children: [
      {
        path: 'serviceClassify',
        name: 'serviceClassify',
        meta: {
          title: '服务分类',
          access: 1,
          icon: 'icon-classify1'
        },
        component: resolve => { require(['@/pages/service/serviceClassify'], resolve) }
      },
      {
        path: 'serviceNumber',
        name: 'serviceNumber',
        meta: {
          title: '服务',
          access: 1,
          icon: 'icon-i-w-service'
        },
        component: resolve => { require(['@/pages/service/serviceNumber'], resolve) }
      },
      {
        path: 'submission',
        name: 'submission',
        meta: {
          title: '投稿',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/service/submission'], resolve) }
      },
    ]
  },
  // 政务管理
  {
    path: '/guide',
    name: 'guide',
    component: main,
    meta: {
      title: '政务管理',
      access: 1,
      icon: 'icon-government_icon'
    },
    children: [
      {
        path: 'policy',
        name: 'policy',
        meta: {
          title: '招商引资',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/policy'], resolve) }
      },
      {
        path: 'gover',
        name: 'gover',
        meta: {
          title: '政务信息',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/gover'], resolve) }
      },
    ]
  },
  // 办事管理
  {
    path: '/work',
    name: 'work',
    component: main,
    meta: {
      title: '办事管理',
      access: 1,
      icon: 'icon-work'
    },
    children: [
      {
        path: 'workClass',
        name: 'workClass',
        meta: {
          title: '办事分类',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/workClass'], resolve) }
      },
      {
        path: 'workMatter',
        name: 'workMatter',
        meta: {
          title: '办事事项',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/content/workMatter'], resolve) }
      },
    ]
  },
  // 系统配置
  {
    path: '/systemSetting',
    name: 'systemSetting',
    component: main,
    meta: {
      title: '系统配置',
      access: 1,
      icon: 'icon-setting'
    },
    children: [
      {
        path: 'article',
        name: 'article',
        meta: {
          title: '系统通知',
          access: 1,
          icon: 'icon-notice'
        },
        component: resolve => { require(['@/pages/systemSetting/article'], resolve) }
      },
      {
        path: 'message',
        name: 'message',
        meta: {
          title: '用户消息',
          access: 1,
          icon: 'icon-message'
        },
        component: resolve => { require(['@/pages/systemSetting/message'], resolve) }
      },
      {
        path: 'sensitiveWords',
        name: 'sensitiveWords',
        meta: {
          title: '敏感词库',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/systemSetting/sensitiveWords.vue'], resolve) }
      },
      {
        path: 'appVersion',
        name: 'appVersion',
        meta: {
          title: 'APP版本',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/systemSetting/appVersion'], resolve) }
      },
    ]
  },
  // 用户
  {
    path: '/user',
    name: 'user',
    meta: {
      title: '用户管理',
      access: 1,
      icon: 'icon-user'
    },
    component: main,
    children: [
      {
        path: 'app',
        name: 'app',
        meta: {
          title: 'APP用户',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/user/user'], resolve) }
      },
      {
        path: 'postUser',
        name: 'postUser',
        meta: {
          title: 'WEB用户',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/user/postUser'], resolve) }
      },
      {
        path: 'agent',
        name: 'agent',
        meta: {
          title: '代理商',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/user/agent'], resolve) }
      },
    ]
  },
  // 举报
  {
    path: '/report',
    name: 'report',
    meta: {
      title: '举报管理',
      access: 1,
      icon: 'icon-report'
    },
    component: main,
    children: [
      {
        path: 'report_index',
        name: 'report_index',
        meta: {
          title: '基础信息',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/report'], resolve) }
      },
      {
        path: 'reportClass',
        name: 'reportClass',
        meta: {
          title: '举报分类',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/report/reportClass'], resolve) }
      },
      {
        path: 'userReport',
        name: 'userReport',
        meta: {
          title: '用户举报',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/report/userReport'], resolve) }
      },
    ]
  },
  // 动态
  {
    path: '/post',
    name: 'post',
    meta: {
      title: '所有动态',
      access: 1,
      icon: 'icon-find'
    },
    component: main,
    children: [
      {
        path: 'post_index',
        name: 'post_index',
        meta: {
          title: '动态列表',
          access: 1,
          icon: ''
        },
        component: resolve => { require(['@/pages/post'], resolve) }
      }
    ]
  },
  // 基础数据
  {
    path: '/basiceData',
    name: 'basiceData',
    meta: {
      title: '基础数据',
      access: 1,
      icon: 'icon-data'
    },
    component: main,
    children: [
      {
        path: 'province',
        name: 'province',
        meta: {
          title: '省市区',
          access: 1,
          icon: 'icon-yidiandiantubiao03'
        },
        component: resolve => { require(['@/pages/basiceData/province'], resolve) }
      }
    ]
  },
  {
    path: '/count',
    name: 'count',
    meta: {
      title: '统计',
      access: 1,
      icon: 'icon-count'
    },
    component: main,
    children: [
      {
        path: 'hometown',
        name: 'hometown',
        meta: {
          title: '用户家乡分布',
          access: 1,
          icon: 'icon-home'
        },
        component: resolve => { require(['@/pages/count/hometown'], resolve) }
      }
    ]
  }
]
export const errorRoutes = [
  {
    path: '/404',
    name: 'error_404',
    component: resolve => { require(['@/pages/error/404'], resolve) }
  },
  {
    path: '*',
    redirect: '/404',
  }
]

const routes = [
  loginRoute,
  mainRoutes,
  ...appRoutes,
  ...errorRoutes
]
// export const commonRoutes = [loginRoute, mainRoutes, ...errorRoutes]
// 动态挂载路由:404的路由需要在动态新增路由时再挂载，否则可能会先匹配到404路由  登陆前可以不挂载404路由，会自动重定向到登录页    
export const commonRoutes = [loginRoute, mainRoutes]
export default routes
