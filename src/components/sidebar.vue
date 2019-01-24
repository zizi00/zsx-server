<template>
  <el-menu @select="menuSelect" :collapse="isCollapse">
    <template v-for="item in menuList">
      <template v-if="item.children && item.children.length">
        <el-submenu :index="item.name">
          <template slot="title">
            <i :class="['iconfont', item.meta.icon]"></i>
            <span>{{item.meta.title}}</span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.name" :index="child.name">
            <i :class="['iconfont', child.meta.icon]"></i>
            <span>{{child.meta.title}}</span>
          </el-menu-item>
        </el-submenu>
      </template>
      <el-menu-item v-else :index="item.name">
        <i :class="['iconfont', item.meta.icon]"></i>
        <span>{{item.meta.title}}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script>
  import {getParentRouterNameByName} from '@/libs/util/util'
  export default {
    name: 'sidebar',
    props: {
      menuList: Array,
      isCollapse: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        
      }
    },
    computed: {
      currentPageName () {
        return this.$route.name
      },
      openedSubmenuArr () {
        return this.$store.state.openedSubmenuArr
      }
    },
    methods: {
      menuSelect (name) {
        let vm = this
        // 更新快捷导航
        sessionStorage.currentPageName = name
        vm.$store.dispatch('openNewPage',name)
        vm.$store.dispatch('setCurrentPath',name)
        vm.$router.push({name: name})
      },
    },
    updated () {
      // this.$nextTick(() => {
      //   if (this.$refs.sideMenu) {
      //     this.$refs.sideMenu.updateOpened()
      //   }
      // })
    },
    mounted () {
      // var vm=this
      // let parentName = getParentRouterNameByName(sessionStorage.currentPageName)
      // if(parentName){
      //   // 只展开一个
      //   vm.$store.commit('clearOtherOpenedSubmenuArr', parentName)
      // }
    }
  }
</script>
