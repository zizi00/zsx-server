<template>
  <div class="zsx-login" @keydown.enter="handleSubmit">
    <div class="zsx-system">SNS后台管理系统</div>
    <div class="login-con">
      <el-card :bordered="false">
        <p>
          <i class="iconfont icon-login"></i>
          欢迎登录
        </p>
        <div class="login-form">
          <el-form ref="loginForm" :model="loginForm" :rules="rules">
            <el-form-item prop="loginName">
              <el-input v-model="loginForm.loginName" type="text" size="small" placeholder="请输入账号">
                <span slot="prepend">
                  <i class="iconfont icon-user1"></i>
                </span>
              </el-input>
            </el-form-item>
            <el-form-item prop="loginPass">
              <el-input v-model="loginPass" type="password" size="small" placeholder="请输入密码">
                <span slot="prepend">
                  <i class="iconfont icon-password"></i>
                </span>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleSubmit" :loading="isLogining" style="width: 100%;" type="primary" long>登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
  import jsCookie from 'js-cookie'
  export default {
    name: 'login',
    data () {
      return {
        loginErrTxt: '您的用户名或密码输入错误，请重新输入',
        noAuthTxt: '对不起，您暂时无权访问本系统，请联系管理员给您进行授权',
        loginUrl: 'web/sys/user/login',
        getAuth: 'web/sys/perm/shiro/vue',
        rememberMe: true,
        loginPass: '',
        loginForm: {
          "loginName": "",
          "loginPass": "",
        },
        isLogining: false,
        rules: {
          loginName: [
            { required: true, message: '账号不能为空', trigger: 'blur' }
          ],
          loginPass: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      handleSubmit () {
        let vm = this
        vm.$refs.loginForm.validate((valid) => {
          if (valid) {
            var params = {
              method: 'post',
              url: vm.loginUrl
            }
            var method = params.method
            if(method=='get'){
              params.params = vm.loginForm
            }else{
              params.data = vm.loginForm
            }
            vm.isLogining = true
            vm.$store.dispatch('Login',params).then(data=>{
              vm.isLogining = false
              if (data.code == 1) {
                var sysUser = {}
                if(data){
                  sysUser = data.data.sysUser
                  jsCookie.set('JSESSIONID',data.data.sessionId,{ path: '' })
                }
                sessionStorage.sysUser = JSON.stringify(sysUser)
                var authParams = {
                  url: vm.getAuth,
                  method: 'post'
                }
                vm.$store.dispatch('getAuth',authParams).then(res=>{
                  vm.loginSuccess()
                  vm.$router.push({name: 'home'})
                  vm.$message({
                    showClose: true,
                    type: 'success',
                    message: '登录成功'
                  });
                }).catch(err=>{
                  vm.$message({
                    showClose: true,
                    message: vm.noAuthTxt
                  });
                })
              }else{
                vm.$message({
                  showClose: true,
                  type: 'error',
                  message: vm.loginErrTxt,
                });
              }
            }).catch(function(){
              vm.isLogining = false
            })
          }
        })
      },
      loginSuccess(){
        var vm = this
        var user = {
          loginName: vm.loginForm.loginName,
          loginPass: vm.loginForm.loginPass,
        }
        var userString = JSON.stringify(user)
        sessionStorage.user = userString
        if (vm.rememberMe) {
          localStorage.user = userString
        } else {
          if (localStorage.user) {
            localStorage.removeItem('user')
          }
        }
      },
    },
    watch: {
      loginPass(val){
        if(!val)return
        this.loginForm.loginPass = hex_md5(val)
      },
    },
    mounted () {
      if (localStorage.user) {
        var vm = this
        let user = JSON.parse(localStorage.user)
        vm.loginForm.loginName = user.loginName
        vm.loginPass = user.loginPass
        vm.rememberMe = true
        setTimeout(function(){
          // 延时给密码赋值，否则loginPass改变时会重写loginForm.loginPass
          vm.loginForm.loginPass = user.loginPass
        },50)
      }
    }
  }
</script>

<style scoped>
  .zsx-login{
    width: 100%;
    height: 100%;
    background-size: cover;
  }
  .zsx-system{
    text-align: center;
    padding-top: 10%;
    color: #fff;
    font-size: 45px;
  }
  .login-con{
    width: 300px;
    padding-top: 5%;
    margin: 0 auto;
  }
</style>
