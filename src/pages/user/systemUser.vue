<template>
  <div class="systemUser">
    <div id="search-wrapper">
      <el-form :model="formSearch" ref="formSearch" inline label-width="60px">
        <template v-if="hasPerm('systemUser:search')">
          <el-form-item label="用户" prop="key">
            <el-input v-model="formSearch.key" placeholder="账号/昵称" size="mini" @keydown.native.enter.prevent="submitSearch('formSearch')"></el-input>
          </el-form-item>
          <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.clear}}</el-button>
          <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.search}}</el-button>
        </template>
        <el-button v-if="hasPerm('systemUser:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
        <el-button v-if="hasPerm('systemUser:delete')" type="danger" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="mini">批量删除</el-button>
      </el-form>
    </div>

    <!-- :max-height="tableHeight" -->
    <el-table
      :data="currentPager.data"
      @selection-change="updateSelect"
      border
      style="width: 100%">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="loginName"
        label="账号"
        width="180">
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="昵称 "
        width="180">
      </el-table-column>
      <el-table-column
        prop="role"
        label="角色">
      </el-table-column>      
      <el-table-column
        prop="role"
        label="代理区域">
        <template slot-scope="scope">
          {{getArea(scope.row)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="action"
        fixed="right"
        label="操作"
        width="250">
        <template slot-scope="scope">
          <el-button v-if="hasPerm('systemUser:role')" type="success" @click="previewPerm(scope.row.id)" size="mini">角色</el-button>
          <el-button v-if="hasPerm('systemUser:edit')" type="primary" @click="editRow(scope.row)" size="mini">编辑</el-button>
          <el-button v-if="hasPerm('systemUser:delete')" type="danger" @click="delBtnClick(scope.row.id)" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :loading="pageLoading"></paging>

    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" :mask-closable="false" width="750px" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="账号" prop="loginName">
              <el-input v-model="formDialog.loginName" placeholder="请输入账号" size="small" :disabled="currDialog=='edit'"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-row>
              <el-col :span="8" v-if="currDialog=='edit'">
                <el-form-item label="修改密码">
                  <el-select v-model="passType" placeholder="请选择" style="width: 100px;" size="small">
                    <el-option v-for="item in type" :key="item.value" :value="item.value" :label="item.label"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="passSpan" :offset="passSpan==24 ? 0 : 1" v-if="currDialog=='add' || currDialog=='edit' && passType=='1'">
                <el-form-item label="密码" prop="loginPass" size="small">
                  <el-input v-model="loginPass" placeholder="请输入密码" type="password"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="formDialog.nickName" size="small" placeholder="请输入账号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="currDialog=='add'">
            <el-form-item label="角色" prop="roles">
              <el-select v-model="roles" placeholder="请选择" size="small" multiple>
                <el-option v-for="item in role" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="代理类型" prop="areaType">
              <el-select v-model="formDialog.areaType" size="small" placeholder="请选择">
                <el-option v-for="item in areaType" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
              </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formDialog.areaType">
            <el-form-item label="代理地区">
              <el-cascader :options="derail_address_arr" v-model="derail_address_obj" placeholder="请选择地区" :clearabled="false" transfer></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</el-button>
      </div>
    </el-dialog>
    <!-- 查看角色 -->
    <el-dialog :visible.sync="roleShow" title="角色" :mask-closable="false" width="300px">
      <div v-for="(val,key) in roleMap" style="margin-bottom: 15px;">
        <span>{{val}}</span>
        <span style="float: right">
          <el-button v-if="currRoles[key]" type="danger" size='small' @click="resultRole('delete',currRoles[key])">{{label.delete}}</el-button>
          <el-button v-else size='small' type="primary" @click="resultRole('add',key)">{{label.add}}</el-button>
        </span>
      </div>
      <div slot="footer">
        <el-button @click="roleShow=false">{{label.close}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  // import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'systemUser',
    mixins: [page],
    components: {
      // mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/sys/user/add',
          delete: 'web/sys/user/delete',
          edit: 'web/sys/user/update',
          search: 'web/sys/user/search',
          role: 'web/sys/role/dataGrid',
          // 根据用户id查角色
          getRole: 'web/sys/user/role/search/user',
          bindRole: 'web/sys/user/role/add',
          deleteRole: 'web/sys/user/role/delete'
        },
        pager: {
          // 页面初始化
          url: 'web/sys/user/dataGrid',
          // 主区域表格数据
          data: [],
        },
        searchPager: {
          url: 'web/sys/user/search'
        },
        // 选择的id
        roles: [],
        role: [],
        roleMap: {},
        roleShow: false,
        // 当前查询用户的角色id、userRoleId——数据表对应的行id 
        currRoles: {},
        currUserId: '',
        batchIdArr: [],
        derail_address_arr: [],
        derail_address_obj: [1],
        typeMap:{
          "0":"否",
          "1":"是"
        },
        type:[
          {
            value: '0',
            label:"否"
          },
          {
            value: '1',
            label:"是"
          }
        ],
        // 搜索表单
        formSearch: {
          key: ''
        },
        loginPass: '',
        passType:"0",
        // 新增/编辑表单
        formDialog: {
          id: '',
          loginName: '',
          loginPass: '',
          nickName: '',
          areaType: 0,
          areaCode: 0,
        },
        areaType: [
          {
            value: 0,
            label: '非代理商'
          }, {
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
        chinaJson: {},
        provinceData: [],
        cityData: [],
        areaData: [],
        countryData: [{label: "中国", value: 1, children: []}],
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
      // 获取代理区域
      getArea(data){
        var vm=this,txt = ''
        var areaType = data.areaType,
          areaCode = data.areaCode
        if(areaType==0){
          txt = '非代理用户'
        }else if(areaType==1){
          txt = '全国'
        }else if(areaType==2){
          txt = '省： ' + vm.util.getProvinceCityArea([areaCode],vm.chinaJson, true)
        }else if(areaType==3){
          txt = '市： ' + vm.util.getProvinceCityArea([parseInt(areaCode/10000)*10000,areaCode],vm.chinaJson,true)
        }else if(areaType==4){
          txt = '区： ' + vm.util.getProvinceCityArea([parseInt(areaCode/10000)*10000,parseInt(areaCode/100)*100,areaCode],vm.chinaJson,true)
        }
        return txt
      },
      submitDialogForm (name) {
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            if (vm.initPostDialog) {
              vm.initPostDialog(vm.formDialog)
            }
            var pager = vm.pager,currDialog=vm.currDialog
            let ajaxUrl = vm.url[currDialog]
            if(vm.currDialog=='edit'){
              ajaxUrl += '?type=' + vm.passType
            }
            var method =  pager.method
            if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
              method = pager.addMethod
            }
            if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
              method = pager.editMethod
            }
            let ajaxData = vm.editAddAjaxData(vm.currDialog)          
            var params = {
              url: ajaxUrl,
              method: method,
            }
            if(method=='get'|| method=='delete'){
              params.params = ajaxData
            }else{
              params.data = ajaxData
            }
            vm.dialogSubmitLoading = true
            vm.$http(params).then(res => {
              vm.dialogSubmitLoading = false
              var resData = res.data
              if(resData.code==1){
                vm.$message({
                  showClose: true,
                  type: 'success',
                  message: vm.label[vm.currDialog]+'成功!'
                });
                if(vm.currDialog=='add'){
                  vm.paging(1);
                }else{
                  vm.paging();
                }
                vm.dialogShow = false
                if(typeof vm.resetDialogForm == 'function'){
                  vm.resetDialogForm(name)
                }
                // 新增/编辑数据后更新某些数据
                if(typeof vm.updateOther == 'function'){
                  vm.updateOther()
                }
              }else{
                vm.$message({
                  showClose: true,
                  type: 'error',
                  message: vm.label[vm.currDialog]+'失败: ' + resData.message
                });
              }
            }).catch(err=>{
      
            })
          }
        })
      },
      updateSelect(selection){
        var vm = this,batchIdArr = [],len=selection.length;
        if(len){
          for(var i=0;i<len;i++){
            batchIdArr.push(selection[i].id)
          }
        }
        vm.batchIdArr = batchIdArr
      },
      // 查看角色
      previewPerm(id){
        var vm=this
        vm.currUserId = id
        var params = {
          url: vm.url.getRole,
          method: 'post',
          data:{
            id: id
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.data){
            var resData = res.data
            if(resData.code==1){
              var roles = resData.data.roles,currRoles={},i
              for(i=0;i<roles.length;i++){
                currRoles[roles[i].id] = roles[i].userRoleId
              }
              vm.currRoles = currRoles
            }
          }
          vm.roleShow = true
        })
      },
      resultRole(addOrDelete,id){
        var vm = this
        var isAdd = !!(addOrDelete == 'add')
        vm.$confirm('确定' + (isAdd ? '添加' : '删除') + '这个角色吗？', '确定操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var url = isAdd ? vm.url.bindRole : vm.url.deleteRole
          var method = isAdd ? 'post' : 'delete'
          var ajaxData = isAdd ? {
            roleId: id,
            sysUserId: vm.currUserId
          } : {
            id: id
          }
          var params = {
            url: url,
            method: method
          }
          if(method=='get' || method=='delete'){
            params.params = ajaxData
          }else{
            params.data = ajaxData
          }
          vm.$http(params).then(res=>{
            if(res&&res.data){
              var resData = res.data
              if(resData.code==1){
                vm.$message({
                  showClose: true,
                  type: 'success',
                  message: (isAdd? '新增' : '删除') + '成功'
                });
                vm.previewPerm(vm.currUserId)
              }
            }
          })
        })
      },
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.paging(1)
      },
      resetDialogForm (name) {
        name = name || 'formDialog'
        let vm = this
        vm.formDialog.areaType=0
        vm.passType='0'
        vm.derail_address_arr = vm.countryData 
        vm.formDialog.id=''
        vm.formDialog.nickName = ''
        vm.formDialog.loginName = ''
        vm.roles = []
        vm.loginPass = ''
        // vm.$refs[name].resetFields()
      },
      delRow (data) {
        var vm = this;
        var parmas = {
          method: 'post',
          url: vm.url.delete,
          data: {
            ids: [data.id]
          }
        }
        vm.batchoperation(parmas,vm.paging)
      },
      batchDelete(){
        var vm = this
        vm.$confirm('确认删除这些系统用户吗？请考虑清楚，谨慎操作！！！', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var parmas = {
            method: 'post',
            url: vm.url.delete,
            data: {
              ids: vm.batchIdArr
            }
          }
          vm.batchoperation(parmas)
        })
      },
      batchoperation(parmas,refresh){
        var vm = this
        parmas.method = parmas.method || 'post'
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$message({
              showClose: true,
              type: 'success',
              message: '操作成功'
            });
            vm.batchIdArr = []
            vm.paging()
          }else{
            vm.$message({
              showClose: true,
              type: 'error',
              message: resData.message || '批量操作失败'
            });
          }
        }).catch(err=>{})
      },
      initRole(){
        var vm = this
        var params = {
          url: vm.url.role,
          method: 'get'
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var data = res.data&&res.data.records || [],role=[],item,roleMap={}
            for(var i=0;i<data.length;i++){
              item=data[i]
              role.push({
                value: item.id,
                label: item.roleName || item.roleValue
              })
              roleMap[item.id] = item.roleName || item.roleValue
            }
            vm.role = role
            vm.roleMap = roleMap
          }
        })
      },
      initDialog(data){
        var vm=this,arr = []
        var areaType=data.areaType
        var areaCode=data.areaCode
        vm.passType="0"
        if(areaType==1){
          arr=[1]
        }else if (areaType==2){
          var provincesId=parseInt(areaCode/10000)*10000
          arr=[provincesId]
        }else if(areaType==3){
          var provincesId=parseInt(areaCode/10000)*10000
          var cityId=parseInt(areaCode/100)*100
          arr=[provincesId,cityId]
        }else{
          var provincesId=parseInt(areaCode/10000)*10000
          var cityId=parseInt(areaCode/100)*100
          var areaId=areaCode
          arr=[provincesId,cityId,areaId]
        }
        vm.$nextTick(function(){
          vm.derail_address_obj = arr
        })
      },
      initData () {
        let vm = this
        vm.initRole()
        if(sessionStorage.chinaData){
          var chinaData = JSON.parse(sessionStorage.chinaData)
          vm.chinaJson = JSON.parse(sessionStorage.chinaJson)
          vm.areaData = chinaData
          vm.cityData = vm.util.getCityDataByData(chinaData)
          vm.provinceData = vm.util.getProvinceDataByData(chinaData)
          vm.derail_address_arr = vm.countryData
        }
      }
    },
    computed:{
      passSpan(){
        return this.currDialog=='add' ? 24 : 15
      }
    },
    watch: {
      loginPass(val){
        var vm = this
        if(vm.currDialog == 'add'&&val||vm.passType=="1"){
          // 添加用户是进行md5加密，编辑时不用
          vm.formDialog.loginPass = hex_md5(val)
        }else{
           vm.formDialog.loginPass = val
          }
      },
      roles(val){
        var len = val.length,i,arr=[]
        for(i=0;i<len;i++){
          arr.push({
            id: val[i]
          })
        }
        this.formDialog.roles = arr
      },
      derail_address_obj (val) {
        var vm = this,len= val.length
        if(len){
          vm.formDialog.areaCode = val[len-1]
        }else{
          vm.formDialog.areaCode = ''
        }
      },
      'formDialog.areaType': function(val) {
        let vm = this
        if(val==0){
          vm.formDialog.areaCode = 0
        }else if (val==1) {
          vm.derail_address_arr = vm.countryData
          vm.derail_address_obj = [1]
        }else{
          if (val==2) {
            vm.derail_address_arr = vm.provinceData
          } else if (val==3) {
            vm.derail_address_arr = vm.cityData
          } else if (val==4) {
            vm.derail_address_arr = vm.areaData
          }
          vm.derail_address_obj = [] 
        }
      },
    }
  }
</script>
<style scoped>

</style>
