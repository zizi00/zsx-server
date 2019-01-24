<template>
  <div class="province">
    <div id="search-wrapper">
      <div style="padding: 10px 0">
        <Button v-if="hasPerm('province:add')"  type="primary" size="small" style="margin-right: 10px;" @click="addRow('province')">{{label.add}}</Button>
        <Button v-if="hasPerm('province:check')" type="primary" size="small" @click="checkData">校验所有数据</Button>
      </div>
    </div>
    <main-table :columns="provinceColumns" :data="provinceData" :height="tableHeight" :loading="pageLoading"></main-table>

    <!-- 市弹窗 -->
    <Modal v-model="cityDialogShow" title="市" :mask-closable="false" width="750" :styles="{top:'20px'}">
      <div style="margin-bottom: 10px;">
        <Button v-if="hasPerm('province:add')" type="primary" @click="addRow('city')" size="small">{{label.add}}</Button>
      </div>
      <main-table :columns="cityColumns" :data="cityData" :loading="cityPageLoading"></main-table>
      <div slot="footer">
        <Button type="primary" @click="closeCityModal()">{{label.close}}</Button>
      </div>
    </Modal>

    <!-- 区弹窗 -->
    <Modal v-model="areaDialogShow" title="区" :mask-closable="false" width="750" :styles="{top:'20px'}">
      <div style="margin-bottom: 10px;">
        <Button v-if="hasPerm('province:add')" type="primary" style="margin-right: 10px;" @click="addRow('area')" :size="'small'">{{label.add}}</Button>
        <Button v-if="hasPerm('province:delete')" type="error" :disabled="batchIdArr.length==0" @click="batchDelete" size="small">批量删除</Button>
      </div>
      <main-table :columns="areaColumns" :data="areaData" @updateSelect="updateSelect" :loading="areaPageLoading"></main-table>
      <div slot="footer">
        <Button type="primary" @click="closeAreaModal()">{{label.close}}</Button>
      </div>
    </Modal>

    <!-- 添加/编辑 弹窗 -->
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80">
        <Row v-if="choice == 'province'">
          <!-- <Col span="12">
            <FormItem label="省code" prop="provinceId">
              <Input v-model="formDialog.provinceId" placeholder="请输入省code"></Input>
            </FormItem>
          </Col> -->
          <Col span="12">
            <FormItem label="省名称" prop="provinceName">
              <Input v-model="formDialog.provinceName" placeholder="请输入省名称"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="choice == 'city'">
          <!-- <Col span="12">
            <FormItem label="市code" prop="cityId">
              <Input v-model="formDialog.cityId" placeholder="请输入市code"></Input>
            </FormItem>
          </Col> -->
          <Col span="12">
            <FormItem label="市名称" prop="cityName">
              <Input v-model="formDialog.cityName" placeholder="请输入市名称"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="choice == 'area'">
          <!-- <Col span="12">
            <FormItem label="区code" prop="areaId">
              <Input v-model="formDialog.areaId" placeholder="请输入区code"></Input>
            </FormItem>
          </Col> -->
          <Col span="12">
            <FormItem label="区名称" prop="areaName">
              <Input v-model="formDialog.areaName" placeholder="请输入区名称"></Input>
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
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'province',
    components: {
      mainTable,
      paging
    },
    mixins: [page],
    data () {
      var provinceNameRule = function(rule, value, callback){
        if(!value){
          return callback(new Error("请输入省份"));
        }else if(!/^[\u4e00-\u9fa5]+$/.test(value)){
          return callback(new Error("省名称必须全为中文"))
        }else{
          callback();
        }
      }
      var cityNameRule = function(rule, value, callback){
        if(!value){
          return callback(new Error("请输入市"));
        }else if(!/^[\u4e00-\u9fa5]+$/.test(value)){
          return callback(new Error("市名称必须全为中文"))
        }else{
          callback();
        }
      }
      var areaNameRule = function(rule, value, callback){
        if(!value){
          return callback(new Error("请输入区"));
        }else if(!/^[\u4e00-\u9fa5]+$/.test(value)){
          return callback(new Error("区名称必须全为中文"))
        }else{
          callback();
        }
      }
      return {
        noPaging: true,
        url: {
          init: 'area/areas',
          add: 'province/add.do',
          edit: 'province/edit.do',
          delete: 'province/delete.do',
          province: {
            init: 'web/provinces/dataGrid',
            add: 'web/provinces/add',
            edit:'web/provinces/update',
            delete: 'web/provinces/delete/'
          },
          city: {
            init: 'web/city/data/from/province/',
            add: 'web/city/add',
            edit:'web/city/update',
            delete: 'web/city/delete/'
          },
          area: {
            init: 'area/data/from/city/',
            add: 'area/add',
            edit:'area/update',
            delete: 'area/delete'
          }
        },
        batchIdArr: [],
        cityPageLoading: false,
        areaPageLoading: false,
        cityDialogShow: false,
        areaDialogShow: false,
        pager: {
          url: 'web/provinces/dataGrid',
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
          deleteMethod: 'delete',
        },
        cityPager: {
          url: 'web/city/data/from/province/',
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
          deleteMethod: 'delete',
        },
        areaPager: {
          url: 'area/data/from/city/',
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
          deleteMethod: 'delete',
        },
        formDialog: {
          id: '',
          provinceId: '',
          provinceName: '',
          cityId: '',
          cityName: '',
          areaId: '',
          areaName: '',
        },
        currProvinceId: '',
        currCityId: '',
        choice: 'province',
        txtMap: {
          province: '省',
          city: '市',
          area: '区',
        },
        chinaJson: {},
        chinaData: [],
        provinceData: [],
        cityData: [],
        areaData: [],
        provinceColumns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   width: 200,
          //   fixed: 'left'
          // },
          {
            title: '省code',
            key: 'provinceId',
            width: 200,
          },
          {
            title: '省份',
            key: 'provinceName',
            render: (create, params) => {
              let vm = this
              return create('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: function () {
                    // vm.showCity(params.row.id)
                    vm.showCity(params.row.provinceId)
                  }
                }
              }, params.row.provinceName)
            }
          }, 
          // {
          //   title: "创建时间",
          //   key: "createTime",
          //   width: 180,
          //   sortable: true
          // },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              var choice = vm.choice
              var checkBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.check(params.row.provinceId,choice)
                  }
                }
              }, '校验')
              var editBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.editRow(params.row, choice)
                  }
                }
              }, vm.label.edit)
              var deleteBtn = create('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: function () {
                    vm.delRow(params.row.id, choice)
                  }
                }
              }, vm.label.delete)
              if(vm.hasPerm('province:check')){
                arr.push(checkBtn)
              }
              if(vm.hasPerm('province:edit')){
                arr.push(editBtn)
              }
              if(vm.hasPerm('province:delete')){
                arr.push(deleteBtn)
              }
              return create('div', arr)
            }
          }
        ],
        cityColumns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   width: 200,
          //   fixed: 'left'
          // }, 
          {
            title: '市code',
            key: 'cityId',
            width: 200,
          },
          {
            title: '市',
            key: 'cityName',
            render: (create, params) => {
              let vm = this
              return create('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: function () {
                    // vm.showArea(params.row.id)
                    vm.showArea(params.row.cityId)
                  }
                }
              }, params.row.cityName)
            }
          }, 
          // {
          //   title: "创建时间",
          //   key: "createTime",
          //   width: 180,
          //   sortable: true
          // },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              var choice = vm.choice
              var checkBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.check(params.row.cityId,choice)
                  }
                }
              }, '校验')
              var editBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.editRow(params.row, choice)
                  }
                }
              }, vm.label.edit)
              var deleteBtn = create('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: function () {
                    vm.delRow(params.row.id, choice)
                  }
                }
              }, vm.label.delete)
              if(vm.hasPerm('province:check')){
                arr.push(checkBtn)
              }
              if(vm.hasPerm('province:edit')){
                arr.push(editBtn)
              }
              if(vm.hasPerm('province:delete')){
                arr.push(deleteBtn)
              }
              return create('div', arr)
            }
          }
        ],
        areaColumns: [
          {
            type: 'selection',
            width: 80,
            fixed: 'left',
            align: 'center'
          },
          // {
          //   title: 'ID',
          //   key: 'id',
          //   width: 200,
          //   fixed: 'left'
          // }, 
          {
            title: '区code',
            key: 'areaId',
            width: 200,
          },
          {
            title: '区',
            key: 'areaName'
          }, 
          // {
          //   title: "创建时间",
          //   key: "createTime",
          //   width: 180,
          //   sortable: true
          // },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              var choice = vm.choice
              var checkBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.check(params)
                  }
                }
              }, '校验')
              var editBtn = create('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.editRow(params.row, choice)
                  }
                }
              }, vm.label.edit)
              var deleteBtn = create('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: function () {
                    vm.delRow(params.row.id, choice)
                  }
                }
              }, vm.label.delete)
              if(vm.hasPerm('province:check')){
                arr.push(checkBtn)
              }
              if(vm.hasPerm('province:edit')){
                arr.push(editBtn)
              }
              if(vm.hasPerm('province:delete')){
                arr.push(deleteBtn)
              }
              return create('div', arr)
            }
          }
        ],
        rules: {
          provinceName: [
            { required: true, message: '省份名称不能为空', trigger: 'blur' },
            {validator: provinceNameRule, trigger: 'blur'}
          ],
          cityName: [
            { required: true, message: '省份名称不能为空', trigger: 'blur' },
            {validator: cityNameRule, trigger: 'blur'}
          ],
          areaName: [
            { required: true, message: '省份名称不能为空', trigger: 'blur' },
            {validator: areaNameRule, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      addRow (choice) {
        this.choice = choice
        this.currDialog = 'add'
        this.dialogShow = true
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
      delRow(id,choice){
        var vm = this,url = '',data = {},method = 'post',params={},notice='确认删除该条数据？',errorTxt='删除失败！'
        if(vm.choice=='province'){
          method = 'delete'
          url = vm.url.province.delete + id
          notice = '删除省会将其下的市和区删除，确认么？'
          errorTxt = '该省删除失败！'
        }else if(vm.choice=='city'){
          url = vm.url.city.delete + id
          notice = '删除市会将其下的区删除，确认么？'
          errorTxt = '该市删除失败！'
        }else if(vm.choice=='area'){
          url = vm.url.area.delete + '?ids=' + [id]
          notice = '确认删除该区么？'
          errorTxt = '该区删除失败！'
          method = 'delete'
        }
        var _params = {
          url,method,data,params
        }
        vm.$Modal.confirm({
          title: '确认删除',
          content: notice,
          onOk: function(){
            vm.$http2(_params).then(res=>{
              if(res&&res.status==200){
                var resData = res.data
                if(resData.code==1){
                  vm.$Message.success('删除成功！')
                  if(vm.choice=='province'){
                    vm.paging();
                  }else if(vm.choice=='city'){
                    vm.getCityData2(vm.currProvinceId)
                  }else if(vm.choice=='area'){
                    vm.getAreaData2(vm.currCityId)
                  }
                }else{
                  vm.$Message.info(resData.message || errorTxt)
                }
              }
            })
          }
        })
      },
      batchDelete(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认删除',
          content: '确认删除这些区吗？',
          onOk: function(){
            var url = vm.url.area.delete + '?ids=' + vm.batchIdArr
            var method = 'delete'
            var params = {
              url,
              method
            }
            vm.$http2(params).then(res=>{
              if(res&&res.status==200){
                var resData = res.data
                if(resData.code==1){
                  vm.$Message.success('删除成功！')
                  vm.batchIdArr = []
                  vm.getAreaData2(vm.currCityId)
                }else{
                  vm.$Message.info(resData.message || errorTxt)
                }
              }
            })
          }
        })
      },
      editRow (data, choice) {
        let vm = this
        vm.choice = choice
        vm.currDialog = 'edit'
        for (let key in vm.formDialog) {
          if (typeof(data[key]) != 'undefined') {
            vm.formDialog[key] = data[key]
          }
        }
        vm.dialogShow = true
      },
      closeCityModal(){
        var vm = this
        vm.cityDialogShow = false
        vm.cityData = []
        vm.currProvinceId = ''
        vm.choice = 'province'
      },
      showCity (provinceId) {
        var vm = this
        vm.choice = 'city'
        // 从chinaJson中取
        // vm.cityData = vm.getCityData(provinceId)
        // 请求
        vm.getCityData2(provinceId)
        vm.cityDialogShow = true
      },
      closeAreaModal(){
        var vm = this
        vm.areaDialogShow = false
        vm.areaData = []
        vm.currCityId = ''
        vm.choice = 'city'
      },
      showArea (cityId) {
        var vm = this
        vm.choice = 'area'
        // 从chinaJson中取
        // vm.areaData = vm.getAreaData(cityId)
        // 请求
        vm.getAreaData2(cityId)
        vm.areaDialogShow = true
      },
      getCityData (provinceId) {
        var vm = this
        var data = vm.chinaJson[provinceId]
        var dataArr = []
        for (let key in data) {
          dataArr.push({
            'id': key,
            'cityName': data[key]
          })
        }
        return dataArr
      },
      getCityData2(code){
        var vm=this,arr = []
        vm.currProvinceId = code
        var pager = vm.cityPager
        var params = {
          method: pager.method,
          url: pager.url + code,
        }
        vm.cityPageLoading = true
        vm.$http(params).then(res=>{
          vm.cityPageLoading = false
          if(res&&res.status==200){
            vm.cityData = res.data.data
          }
        })
      },
      getAreaData (cityId) {
        var vm = this
        var data = vm.chinaJson[cityId]
        var dataArr = []
        for (let key in data) {
          dataArr.push({
            'id': key,
            'areaName': data[key]
          })
        }
        return dataArr
      },
      getAreaData2(code){
        var vm=this,arr = []
        vm.currCityId = code
        var pager = vm.areaPager
        var params = {
          method: pager.method,
          url: pager.url + code,
        }
        vm.areaPageLoading = true
        vm.$http(params).then(res=>{
          vm.areaPageLoading = false
          vm.areaData = res.data.data
        })
      },
      resetDialogForm (name) {
        name = name || 'formDialog'
        var vm = this
        vm.$refs[name].resetFields()
        // vm.formDialog.provinceName = ''
        // vm.formDialog.cityName = ''
        // vm.formDialog.areaName = ''
      },
      submitDialogForm(name){
        var vm = this,url = '',data = {},method = 'post'
        var currDialog = vm.currDialog,
          id = vm.formDialog.id,
          provinceId = vm.formDialog.provinceId,
          provinceName = vm.formDialog.provinceName,
          cityId = vm.formDialog.cityId,
          cityName = vm.formDialog.cityName,
          areaId = vm.formDialog.areaId,
          areaName = vm.formDialog.areaName
        if(vm.choice=='province'){
          url = vm.url.province[currDialog]
          data = {
            provinceId,
            provinceName
          }
        }else if(vm.choice=='city'){
          url = vm.url.city[currDialog]
          data = {
            cityId,
            cityName,
            provinceId: vm.currProvinceId
          }
        }else if(vm.choice=='area'){
          url = vm.url.area[currDialog]
          data = {
            areaId,
            areaName,
            cityId: vm.currCityId
          }
        }
        if(currDialog=='edit'){
          data.id = id
        }
        var params = {
          url,
          data,
          method
        }
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            vm.dialogSubmitLoading = true
            vm.$http(params).then(res=>{
              vm.dialogSubmitLoading = false
              if(res&&res.status==200){
                vm.$Message.success(vm.label[vm.currDialog]+'成功!')
                if(vm.choice=='province'){
                  vm.paging();
                }else if(vm.choice=='city'){
                  vm.getCityData2(vm.currProvinceId)
                }else if(vm.choice=='area'){
                  vm.getAreaData2(vm.currCityId)
                }
                vm.dialogShow = false
              }
            })
          }
        })
      },
      // 校验所有数据
      checkData () {},
      check(code,choice){

      },
      initPostDialog (data) {
        for (let key in data) {
          if (!data[key]) {
            delete data[key]
          }
        }
      },
      paging(){
        var vm = this
        vm.pageLoading = true
        vm.$http.get(vm.url.province.init).then(res=>{
          vm.pageLoading = false
          if(res&&res.status==200){
            vm.provinceData = res.data.data
          }
        })
        return

        vm.$http.post(vm.url.init).then(res => {
          vm.pageLoading = false
          var resData = res.data
          if(resData.code==1){
            var chinaData = resData.data 
            vm.chinaData = chinaData
            vm.chinaJson = vm.util.getChinaJsonByData(chinaData)
            let provinceData = []
            chinaData.forEach(item => {
              provinceData.push({
                'id': item.value,
                'provinceName': item.label
              })
            })
            vm.provinceData = provinceData
          }else{
            vm.$message.info(resData.message || '')
          }
        })
      }
    },
  }
</script>
