<template>
  <div class="agent">
    <Form :model="formSearch" ref="formSearch" inline :label-width="60">
      
      <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button> -->
      <Button v-if="hasPerm('agent:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
      <Button v-if="hasPerm('agent:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
      <Button v-if="hasPerm('agent:clearCache')" type="warning" style="margin: 5px 8px 24px 0;" @click="clearCache('代理商')" size="small">{{label.clearCache}}</Button>
    </Form>
    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :loading="pageLoading"></mainTable>
    <!-- <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging> -->
    <Modal v-model="dialogShow" :title="label[currDialog]" width="800" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="120">
        <Row>
          <Col span="12">
            <FormItem label="名称" prop="agentName">
              <Input v-model="formDialog.agentName" placeholder="请输入代理商名称"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="电话" prop="phone">
              <Input v-model="formDialog.phone" placeholder="请输入代理商电话"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="代理类型" prop="agentType">
              <Select v-model="formDialog.agentType" placeholder="请选择" transfer>
                <Option v-for="item in agentType" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12" v-if="formDialog.agentType!=0">
            <FormItem label="关联地区">
              <Cascader :data="addressData" v-model="address_arr" placeholder="请选择关联地区" :clearabled="false" filterable transfer></Cascader>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="formDialog.agentType==3">
          <Col span="24" >
            <FormItem label="区">
              <Select v-model="areaCodes" placeholder="请选择区" transfer multiple>
                <Option v-for="item in areaData" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="formDialog.agentType!=0">
          <Col span="12">
            <FormItem label="拥有APP账号" prop="isUserApp">
              <Select v-model="formDialog.isUserApp" placeholder="请选择" transfer>
                <Option v-for="item in hasAccount" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12" v-if="formDialog.isUserApp==1">
            <FormItem label="APP昵称" prop="userId">
              <el-select v-model="formDialog.userId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in userId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <!-- <Select v-model="formDialog.userId" placeholder="请选择" transfer filterable>
                <Option v-for="item in userId" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select> -->
            </FormItem>
          </Col>
        </Row>
        <Row v-if="formDialog.agentType!=0">
          <Col span="12">
            <FormItem label="拥有管理系统账号" prop="isUserWeb">
              <Select v-model="formDialog.isUserWeb" placeholder="请选择" transfer>
                <Option v-for="item in hasAccount" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12" v-if="formDialog.isUserWeb==1">
            <FormItem label="管理系统昵称" prop="sysUserId">
              <el-select v-model="formDialog.sysUserId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in sysUserId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  // import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'agent',
    mixins: [page],
    components: {
      mainTable,
      // paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/agent/add',
          delete: 'web/agent/delete',
          edit: 'web/agent/update',
          appUser: 'user/dataSearch',
          clearCache: 'web/cache/agent',
          systemAgent:'web/sys/user/dataAllGrid', // 所有是代理商的系统用户
        },
        pager: {
          // 页面初始化
          url: 'web/agent/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        batchIdArr: [],
        areaData: [],
        // 多选的区
        areaCodes: [],
        addressData: [],
        provincesData: [],
        citiesData: [],
        chinaData: [],
        chinaJson: {},
        address_arr: [],
        agentType: [
          {
            value: 0,
            label: '自身公司'
          },
          {
            value: 1,
            label: '省'
          },
          // {
          //   value: 2,
          //   label: '市'
          // },
          {
            value: 3,
            label: '区'
          }
        ],
        agentTypeMap: {
          0: '自身公司',
          1: '省',
          // 2: '市',
          3: '区'
        },
        hasAccount: [
          {
            value: 0,
            label: '未拥有'
          },
          {
            value: 1,
            label: '已拥有'
          },
        ],
        hasAccountMap: {
          0: '未拥有',
          1: '已拥有',
        },
        userId: [],
        userIdMap: {},
        sysUserId: [],
        sysUserIdMap: {},
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          agentName: '',
          agentType: 0,
          provincesCode: '',
          cityCode: '',
          // areaCode: '',
          phone: '',
          isUserApp: 0,
          userId: '',
          isUserWeb: 0,
          sysUserId: ''
        },
        columns: [
          {
            type: 'selection',
            width: 80,
            fixed: 'left',
            align: 'center'
          },
          // {
          //   'title': 'ID',
          //   'key': 'id',
          // },
          {
            'title': '名称',
            'key': 'agentName',
            'width': 200,
          },
          {
            'title': '类型',
            'key': 'agentType',
            'width': 200,
            render: (create, params) => {
              var vm = this
              var key=params.row.agentType,map=vm.agentTypeMap
              var txt = map[key] ? map[key] : key,txt2='',provincesCode=params.row.provincesCode,cityCode=params.row.cityCode,areaCode=params.row.areaCode
              if(key==1){
                txt2 = vm.util.getProvinceCityArea([provincesCode],vm.chinaJson,true)
              }else if(key==2){
                provincesCode = parseInt(cityCode/10000)*10000
                txt2 = vm.util.getProvinceCityArea([provincesCode,cityCode],vm.chinaJson,true)
              }else if(key==3){
                provincesCode = parseInt(areaCode/10000)*10000
                cityCode = parseInt(areaCode/100)*100
                txt2 = vm.util.getProvinceCityArea([provincesCode,cityCode,areaCode],vm.chinaJson,true)
              }
              var _txt = key ? (txt + '： ' + txt2 ) : txt
              return create('span',_txt)
            }
          },
          {
            'title': '电话',
            'key': 'phone',
            'width': 200,
          },
          {
            'title': '是否拥有APP账号',
            'key': 'isUserApp',
            'width': 200,
            render: (create, params) => {
              var key=params.row.isUserApp,map=this.hasAccountMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '用户昵称',
            'key': 'userId',
            'width': 200,
            render: (create, params) => {
              var key=params.row.userId,map=this.userIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '是否拥有管理系统账号',
            'key': 'isUserWeb',
            'width': 200,
            render: (create, params) => {
              var key=params.row.isUserWeb,map=this.hasAccountMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '管理系统昵称',
            'key': 'sysUserId',
            'width': 200,
            render: (create, params) => {
              var key=params.row.sysUserId,map=this.sysUserIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            title: "创建时间",
            key: "createTime",
            width: 180,
            sortable: true
          },
          {
            'title': '操作',
            'key': 'action',
            align: 'center',
            fixed: 'right',
            width: 250,
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('agent:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('agent:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          },
        ],
        rules: {
          agentName: [
            { required: true, message: '代理商名称不能为空', trigger: 'blur' },
          ],
        }
      }
    },
    methods: {
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.address_arr = []
        vm.areaCodes = []
        vm.$refs[name].resetFields()
      },
      submitDialogForm (name) {
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            if (vm.initPostDialog) {
              vm.initPostDialog(vm.formDialog)
            }
            var pager = vm.pager,currDialog=vm.currDialog
            var type = vm.formDialog.agentType
            let ajaxUrl = vm.url[currDialog] + '?areaCode=' + vm.areaCodes + '&areaType=' + type
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
                vm.$Message.success(vm.label[vm.currDialog]+'成功!')
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
                vm.$Message.error(vm.label[vm.currDialog]+'失败: ' + resData.message)
              }
            }).catch(err=>{
      
            })
          }
        })
      },
      updateSelect (selection) {
        var vm=this,batchIdArr = [],len=selection.length,i,item
        if(len){
          for(i=0;i<len;i++){
            item=selection[i]
            batchIdArr.push(item.id)
          }
        }
        vm.batchIdArr = batchIdArr
      },
      delRow(data){
        var vm = this;
        var parmas = {
          method: 'delete',
          url: vm.url.delete + '?ids=' + [data.id]
        }
        vm.batchoperation(parmas)
      },
      batchDelete () {
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些数据吗？',
          onOk: function () {
            var parmas = {
              method: 'delete',
              url: vm.url.delete + '?ids=' + vm.batchIdArr
            }
            vm.batchoperation(parmas)
          }
        })
      },
      batchoperation(parmas){
        var vm = this
        parmas.method = parmas.method || 'post'
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success('操作成功');
            vm.paging()
            vm.batchIdArr = []
          }else{
            vm.$Message.error(resData.message);
          }
        }).catch(err=>{})
      },
      initAppUser(){
        var vm = this
        var params = {
          url: vm.url.appUser,
          method: 'post',
          data: {
            source: 'app'
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.data){
            var resData = res.data
            if(resData.code==1){
              var data = resData.data,userId=[],userIdMap={},key,val
              data.forEach(item=>{
                key = item.id
                val = item.nickName || item.id
                userId.push({
                  value: key,
                  label: val
                })
                userIdMap[key] = val
              })
              vm.userId = userId
              vm.userIdMap = userIdMap
            }
          }
        })
      },
      initAgent(){
        var vm = this
        var params = {
          method: 'post',
          url: vm.url.systemAgent
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var sysUserId=[],sysUserIdMap={},key,val
            resData.data.forEach(item=>{
              key = item.id
              val = item.nickName || item.id
              sysUserId.push({
                value: key,
                label: val
              })
              sysUserIdMap[key] = val
            })
            vm.sysUserId = sysUserId
            vm.sysUserIdMap = sysUserIdMap
          }
        }).catch(function(){})
      },
      getArea(cityCode,chinaJson){
        var vm = this,areaData=[]
        if(!cityCode) return areaData
        var areaJson = chinaJson[cityCode]
        for(let key in areaJson){
          areaData.push({
            value: Number(key),
            label: areaJson[key]
          })
        }
        return areaData
      },
      initDialog(data){
        var vm = this
        var provincesCode = data.provincesCode,
          cityCode = data.cityCode,
          areaCode = data.areaCode
        if(provincesCode&&cityCode){
          vm.$nextTick(function(){
            vm.address_arr = [provincesCode, cityCode]
            vm.$nextTick(function(){
              vm.areaCodes = [areaCode]
            })
          })
        }
      },
      initData(){
        var vm = this,
          chinaData = JSON.parse(sessionStorage.chinaData),
          chinaJson = JSON.parse(sessionStorage.chinaJson)
        var provincesData = vm.util.getProvinceDataByData(chinaData),
          citiesData = vm.util.getCityDataByData(chinaData)
        vm.addressData = chinaData
        vm.chinaData = chinaData
        vm.chinaJson = chinaJson
        vm.provincesData = provincesData
        vm.citiesData = citiesData
        vm.initAgent()
        vm.initAppUser()
      }
    },
    watch: {
      'formDialog.agentType': function(val){
        var vm = this
        if(typeof(val) == 'number' &&val==0){
          vm.formDialog.isUserApp = 0
          vm.formDialog.userId = ''
          vm.formDialog.isUserWeb = 0
          vm.formDialog.sysUserId = ''
        }else if(val==1){
          vm.addressData = vm.provincesData
        }else if(val==2){
          vm.addressData = vm.citiesData
        }else if(val==3){
          vm.addressData = vm.citiesData
        }
        vm.address_arr = []
        vm.formDialog.provincesCode = ''
        vm.formDialog.cityCode = ''
      },
      address_arr: function(val){
        var vm=this,len = val&&val.length
        vm.formDialog.provincesCode = ''
        vm.formDialog.cityCode = ''
        if(len){
          if(len==2){
            vm.formDialog.cityCode = val[1]
            vm.areaData = vm.getArea(val[1],vm.chinaJson)
            vm.areaCodes = []
          }
          vm.formDialog.provincesCode = val[0]
        }
      },
    }
  }
</script>
