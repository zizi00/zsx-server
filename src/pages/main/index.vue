<template>
  <div class="zsx-main">
    <div class="side-menu" :style="{width: hideMenuText ? '64px' : '200px'}">
      <sidebar :menuList="menuList" :isCollapse="hideMenuText"></sidebar>
    </div>
    <div class="all-right" :style="{left: hideMenuText ? '64px' : '200px'}">
      <div class="main-header">
        <div class="navicon-con">
          <el-button type="text" icon="el-icon-back" @click="toggleClick" :style="{transform: 'rotateZ(' + (this.hideMenuText ? '-180' : '0') + 'deg)'}"></el-button>
        </div>
        <div class="header-middle-con">
          <div class="main-breadcrumb">
            <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
          </div>
        </div>
        <div class="header-avator-con">
          <span>欢迎</span>
          <span v-if="isAgent">
            <strong>{{agentAddress}}</strong>
            <span>代理商</span>
          </span>
          <el-dropdown @command="clickDropdown" style="margin-right: 30px;">
            <el-button type="text" size="small">
              <span>{{user.nickName || user.loginName}}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="modify">修改昵称/密码</el-dropdown-item>
              <el-dropdown-item command="logout">注销</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!-- 已打开过页面的快捷导航 -->
      <div class="quick-menu">
        <tags-page-opened :pageOpenedList="pageOpenedList"></tags-page-opened>
      </div>
      <!-- 单页内容展示区域 -->
      <div class="single-page">
        <keep-alive :include="cachePage">
          <router-view></router-view>
        </keep-alive>
      </div>
      <div class="copyright">
        Copyright © 深圳市众善行文化传播有限公司版权所有
      </div>
    </div>

    <!-- 修改昵称密码 -->
    <el-dialog :visible.sync="dialogShow" title="修改昵称/密码"  @closed="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="账号" prop="loginName">
              <el-input v-model="formDialog.loginName" placeholder="请输入账号" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="formDialog.nickName" placeholder="请输入昵称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="修改密码">
              <el-select v-model="passType" placeholder="请选择" style="width: 100px;">
                <el-option v-for="item in type" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="passType==1">
          <el-col :span="12">
            <el-form-item label="密码" prop="loginPass">
              <el-input v-model="formDialog.loginPass" placeholder="请输入密码" type="password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码">
              <el-input v-model="loginPass" placeholder="请确认密码" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')">重置</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import sidebar from '@/components/sidebar'
  import tagsPageOpened from '@/components/tagsPageOpened'
  import breadcrumbNav from '@/components/breadcrumbNav'
  export default {
    name: 'zsx_main',
    components: {
      sidebar,
      tagsPageOpened,
      breadcrumbNav
    },
    data () {
      return {
        hideMenuText: false,
        // exitUrl: 'web/sys/user/quit/',
        exitUrl: 'web/sys/user/quit',
        modify: 'web/sys/user/update',
        typeMap:{
          0:"否",
          1:"是"
        },
        type:[
          {
            value: 0,
            label:"否"
          },
          {
            value: 1,
            label:"是"
          }
        ],
        areaType: [
          {
            value: 1,
            label: '全国'
          }, {
            value: 2,
            label: '省级'
          }, {
            value: 3,
            label: '市级'
          }, {
            value: 4,
            label: '区级'
          }
        ],
        isAgent: false,
        agentAddress: '',
        dialogSubmitLoading: false,
        dialogShow: false,
        passType: 0,
        chinaJson: {},
        user: {
          id: '',
          loginName: '',
          nickName: '',
        },
        formDialog: {
          id: '',
          loginName: '',
          loginPass: '',
          nickName: '',
        },
        rules: {
          loginPass: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ],
        }
      }
    },
    // 计算属性 引入vuex进行状态管理，从store实例中读取状态最简单的方法就是在计算属性中返回某个状态
    computed: {
      menuList () {
        return this.$store.state.menuList
      },
      // 所有打开的页面
      pageOpenedList () {
        return this.$store.state.pageOpenedList
      },
      // 面包屑数组
      currentPath () {
        return this.$store.state.currentPath
      },
      cachePage () {
        return this.$store.state.cachePage
      }
    },        
    methods: {
      exitToLogin () {
        let vm = this
        vm.$confirm('点击“取消”将留在当前页，点击“确定”将转向登录页。','确定退出登录').then(function(){
          vm.$http.get(vm.exitUrl).then(res=>{
            if(res&&res.data){
              var resData = res.data
              if(resData.code==1){
                vm.$message({
                  showClose: true,
                  type: 'success',
                  message: '退出成功！'
                });
                vm.$store.dispatch('exitLogin')
              }
            }
          })
        })
      },
      toggleClick (e) {
        this.hideMenuText = !this.hideMenuText
        e && e.preventDefault();
      },
      clickDropdown(name){
        var vm = this,key
        if(name=='modify'){
          // 修改密码
          for(key in vm.formDialog){
            vm.formDialog[key] = vm.user[key]
          }
          vm.dialogShow = true
        }else if(name=='logout'){
          vm.exitToLogin()
        }
      },
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.passType = 0
        vm.formDialog.nickName = vm.user.nickName + ''
        // 不能清除当前用户信息
        // vm.$refs[name].resetFields()
      },
      submitDialogForm(name){
        var vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            var url='',data={},params={},method='post'
            url = vm.modify + '?type=' + vm.passType
            data = vm.util.deepcopy(vm.formDialog)
            if(vm.passType){
              // 修改密码
              if(vm.formDialog.loginPass == vm.loginPass){
                data.loginPass = hex_md5(data.loginPass)
              }else{
                vm.$Message.info('您输入的确认密码和密码不一致，请重新输入')
                return false
              }
            }else{
              // 不修改密码
              delete data.loginPass
            }
            params = {
              url,
              method,
              data
            }
            vm.dialogSubmitLoading = true
            vm.$http(params).then(res=>{
              vm.dialogSubmitLoading = false
              if(res&&res.status==200){
                if(res.data.code==1){
                  vm.$Message.success('修改成功')
                  vm.dialogShow = false
                  if(sessionStorage.sysUser){
                    var sysUser = JSON.parse(sessionStorage.sysUser)
                    var nickName = vm.formDialog.nickName + ''
                    if(typeof(sysUser.nickName) != 'undefined'){
                      sysUser.nickName = nickName
                      sessionStorage.sysUser = JSON.stringify(sysUser)
                    }
                    vm.user.nickName = nickName
                  }
                }else{
                  if(res.data.message){
                    vm.$Message.info(res.data.message)
                  }
                }
              }
            })
          }
        })
      },
    },
    watch: {
      passType(val){
        var vm = this
        vm.formDialog.loginPass = ''
        vm.loginPass = ''
      }
    },
    mounted () {
      let vm = this
      // 解决刷新时已打开快捷导航状态丢失
      var currentPath = sessionStorage.currentPath,pageOpenedList=sessionStorage.pageOpenedList
      if (pageOpenedList) {
        vm.$store.commit('setPageOpenedList', JSON.parse(pageOpenedList))
      }
      if (currentPath) {
        vm.$store.commit('setCurrentPath', JSON.parse(currentPath))
      }
      var obj = {},key,_obj={}
      if(sessionStorage.sysUser){
        obj = JSON.parse(sessionStorage.sysUser)
      }
      for(key in vm.user){
        _obj[key] = obj[key] || ''
      }
      vm.user = vm.util.deepcopy(_obj)
      vm.formDialog = vm.util.deepcopy(_obj)
    }
  }
</script>

<style scoped>
  .side-menu{
    position: absolute;
    top: 0;
    height: 100%;
    width: 200px;
    z-index: 1;
    overflow: hidden;
    background-color: aqua;
    transition: left .3s;
  }
  .all-right{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 200px;
    right: 0;
    transition: left .3s;
  }
  .all-right .main-header{
    height: 59px;
    line-height: 59px;
    border-bottom: 1px solid #eee;
  }
  .navicon-con{float: left}
  .header-middle-con{float: left}
  .header-avator-con{float: right}
  .all-right .single-page{
    position: absolute;
    top:110px;
    left: 10px;
    right: 10px;
    bottom: 70px;
    border: 1px solid #eee;
    padding: 10px;
    overflow: auto;
  }
  .all-right .copyright{
    position: absolute;
    height: 60px;
    bottom: 0;
    right: 0;
    left: 0;
    text-align: center;
    line-height: 60px;
  }
</style>
