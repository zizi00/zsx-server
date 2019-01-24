<template>
  <div class="work-class">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" :rules="rules" inline :label-width="70">
        <template v-if="hasPerm('workClass:search')">
          <FormItem label="分类名称">
            <Input v-model="formSearch.className" placeholder="分类名称" size="small" style="width: 120px" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <!-- <FormItem label="关联地区">
              <Cascader :data="provinceCityData" v-model="derail_address_obj_s" @on-change="searchAddrChange" filterable size="small" style="margin-top: 5px;"></Cascader>
          </FormItem> -->
          <FormItem label="状态" prop="classStatus">
              <Select v-model="formSearch.classStatus" placeholder="请选择" style="width: 80px;" size="small" clearable>
                  <Option :value="0">无效</Option>
                  <Option :value="1">有效</Option>
              </Select>
          </FormItem>
          <FormItem label="分类类型">
              <Select v-model="formSearch.classType" size="small" style="width: 80px;" clearable>
                <Option :value="0">个人</Option>
                <Option :value="1">企业</Option>
              </Select>
          </FormItem>
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <Button v-if="hasPerm('workClass:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <Button v-if="hasPerm('workClass:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="settingworkClass" size="small">配置分类</Button>
        <Button v-if="hasPerm('workClass:clearCache')" type="warning" style="margin: 5px 8px 24px 0;" @click="clearCache('办事分类')" size="small">{{label.clearCache}}</Button>
      </Form>
    </div>
    <!-- <mainTable :columns="columns" :data="pager.data" :height="610"></mainTable> -->
    <mainTable :columns="columns" :data="pager.data" :height="tableHeight" :loading="pageLoading"></mainTable>
    <!-- <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging> -->
    <!-- 弹出框 -->
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="750" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <Row>
          <Col span="12">
            <el-form-item label="分类类别" prop="classType">
              <el-select v-model="formDialog.classType" size="small">
                <el-option :value="0" :label="'个人'"></el-option>
                <el-option :value="1" :label="'企业'"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="分类名称" prop="className">
              <Input v-model="formDialog.className" placeholder="请输入分类名称"></Input>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="分类状态" prop="classStatus">
              <Select v-model="formDialog.classStatus" placeholder="请选择状态">
                <Option :value="0">无效</Option>
                <Option :value="1">有效</Option>
              </Select>
            </el-form-item>
          </Col>
        </Row>
        <Row>
           <Col span="12">
              <el-form-item label="关联省">
                <!-- <Cascader :data="provinceCityData" v-model="provinceCity" filterable @on-change="addrChange"></Cascader> -->
                <Cascader :data="provinceData" v-model="province" @on-change="addrChange2"></Cascader>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="关联市">
                <Select v-model="cities" multiple @on-change="cityChange">
                  <Option v-for="item in citiesData" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </el-form-item>
            </Col>
        </Row>
        <el-form-item v-if="formDialog.cityIds.length" label="已选择">
          <Tag v-for="item in formDialog.cityIds" :key="item" closable @on-close="handleClose(item)">
            {{item == 1 ? '全国' : util.getProvinceCityArea([parseInt(item/10000)*10000,item],chinaJson,true)}}
          </Tag>
        </el-form-item>

        <!-- 上传图片 -->
        <!-- <Row>
          <Col span="12">
            <el-form-item label="事项图标">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload"
                      :format="['jpg','jpeg','png','gif']"
                      :on-format-error="handleFormatError"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize">
                    <Button type="default" icon="ios-cloud-upload-outline">选择图片</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">确定上传</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileUrl.length">
                    <Col span="8" v-for="(item, index) in fileUrl" :key="item">
                      <div class="image-box">
                        <img :src="item" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-show="!fileUrl.length" class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
        </Row> -->
      </el-form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" >{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 配置分类弹出框 -->
    <Modal v-model="settingClassShow" title="配置分类" :mask-closable="false" width="750" @on-cancel="resetsettingClassForm('settingClassDialog')">
      <div style="height: 600px; overflow: auto;">
        <Form :model="settingClassDialog" ref="settingClassDialog" :rules="rules" :label-width="80">
          <Row>
            <Col span="12">
              <!-- {{settingClassDialog.classIds.length}} -->
              <p>
                办事分类
                <el-checkbox :indeterminate="indeterminate" v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
              </p>
              <el-tree
                :data="permTreeData"
                show-checkbox
                node-key="id"
                ref="permTree"
                @check-change="permCheckChange"
                highlight-current>
              </el-tree>
            </Col>
            <Col span="12">
              <!-- {{settingClassDialog.citys.length}} -->
              <p>
                关联区域
                <el-checkbox :indeterminate="indeterminate2" v-model="checkAll2" @change="handleCheckAll2">全选</el-checkbox>
              </p>
              <el-tree
                :data="permTreeData2"
                show-checkbox
                node-key="id"
                ref="permTree2"
                @check-change="permCheckChange2"
                highlight-current>
              </el-tree>
            </Col>
          </Row>
        </Form>
      </div>
      
      <div slot="footer">
        <Button @click="resetsettingClassForm('settingClassDialog')">{{label.clear}}</Button>
        <Button type="primary" :loading="relationLoading" @click="submitsettingClassForm('settingClassDialog')" >{{label.submit}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import mainTable from '@/components/mainTable'
  import page from '@/mixins/page'
  import paging from '@/components/paging'
  export default {
    name: 'workClass',
    components: {
      mainTable,
      paging
    },
    mixins: [page],
    data: function () {
      return {
        // 没有分页 计算表格高度时不计算分页的高度 没有noPaging属性时不减分页的高度
        noPaging: true,
        url: {
          add: 'web/work/class/add',
          edit: 'web/work/class/edit',
          delete: 'web/work/class/delete',
          upload: 'file/',
          sId: 'id/id',
          search: '',
          clearCache: 'web/cache/workClass',
          settingClass: 'web/work/class/link/class/citys'
        },
        pager: {
          data: [],
          url: 'web/work/class/dataGrid',
          method: 'post',
          deleteMethod: 'get',
        },
        // 配置分类
        relationLoading: false,
        settingClassShow: false,
        settingClassDialog: {
          classIds: [],
          citys: []
        },
        allClassIds: [], //  所有分类的id
        allCityIds: [],  //  所有市id
        indeterminate: false,
        checkAll: false,
        permTreeData: [],
        indeterminate2: false,
        checkAll2: false,
        permTreeData2: [],
        // 配置分类 end
        needId: true,
        fileUrl: [],
        uploadImgArr: [],
        uploadLoading: false,
        derail_address_obj_s: [],
        province: [],
        cities: [],
        citiesData: [],
        provinceData: [],
        provinceCityData: [],
        provinceCity: [],
        detialAddressJson: {},
        chinaJson: {},
        formSearch: {
          // input: '',
          className: '',
          classStatus: '',
          classType: '',
          // cityCode: ''
        },
        formDialog: {
          id: '',
          className: '',
          // classIcon: '',
          classType: '',
          cityIds: [],
          // cityCode: '',
          classStatus: 1
        },
        columns: [
          // {
          //   title: '编号',
          //   key: 'id',
          //   fixed: 'left',
          //   width: 200
          // },
          {
            title: '分类名称',
            key: 'className'
          },
          {
            title: '关联区域',
            key: 'cityIds',
            render: (create, params) => {
              var vm = this
              var txtArr = [],chinaJson=vm.chinaJson,cityCodes=params.row.cityIds,provinceCode=0
              // cityCodes = [1,410400,430300,430400,321700,321800,211000,210800] // 示例数据
              if(cityCodes instanceof Array && cityCodes.length){
                cityCodes.forEach(function(item){
                  if(item==1){
                    txtArr.push('全国')
                  }else{
                    provinceCode = parseInt(item/10000)*10000
                    txtArr.push(chinaJson['100000'][provinceCode] + chinaJson[provinceCode][item])
                  }
                })
              }
              if(txtArr.length){
                var txt = ''
                if(txtArr.length>3){
                  txtArr.slice(0,3).forEach(item=>{
                    txt += item + '  '
                  })
                  var perviewBtn = create('Button',{
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      'margin-bottom': '10px'
                    },
                    on:{
                      click: function(){
                        vm.$Modal.info({
                          title: '全部关联区域',
                          render: function(create){
                            var _txt = ''
                            txtArr.forEach(item=>{
                              _txt += item + '  '
                            })
                            return create('pre',{
                              style: {
                                'white-space':'pre-wrap'
                              }
                            }, _txt)
                          }
                        })
                      }
                    }
                  },'预览全部')
                  return create('div',[
                    create('pre',{
                      style: {
                        'white-space':'pre-wrap'
                      }
                    }, txt),
                    perviewBtn
                  ])
                }else{
                  txtArr.forEach(item=>{
                    txt += item + '  '
                  })
                  return create('pre',{
                    style: {
                      'white-space':'pre-wrap'
                    }
                  }, txt)
                }
              }else{
                return create('span', '无')
              }
            }
          },
          {
            title: '分类类型',
            key: 'classType',
            render: function (create, params) {
              var map = {
                '0': '个人',
                '1': '企业'
              }
              return create('span', map[params.row.classType])
            }
          },
          // {
          //   title: '分类图标',
          //   key: 'classIcon',
          //   render: (create, params) => {
          //     var imageHost=this.imageHost || sessionStorage.imageHost,url=params.row.classIcon
          //     if (url) {
          //       if(url.indexOf('http')==-1){
          //         url = imageHost + url
          //       }
          //       return create('a',{
          //         attrs: {
          //           href: url,
          //           target: '_blank'
          //         },
          //       },[create('img', {
          //         style: {
          //           margin: '5px 0',
          //           maxWidth: '100%',
          //           maxHeight: '100%'
          //         },
          //         attrs: {
          //           src: url,
          //           alt: url
          //         }
          //       })])
          //     } else {
          //       return create('span', '无')
          //     }
          //   }
          // },
          {
            title: '分类状态',
            key: 'classStatus',
            render: function (create, params) {
              var map = {
                '0': '无效',
                '1': '有效'
              }
              return create('span', map[params.row.classStatus])
            }
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true
          },
          {
            title: '操作',
            key: 'action',
            width: 140,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('workClass:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('workClass:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          }
        ],
        rules: {
          className: [
            {required: true, message: '请填写分类名称', trigger: 'blur'}
          ],
          classType: [
            {required: true, message: '请选择分类类别', trigger: 'change'}
          ]
        },
      }
    },
    methods: {
      // 配置分类
      settingworkClass(){
        var vm = this
        vm.settingClassShow = true
      },
      resetsettingClassForm(name){
        var vm = this
        // 清空提交数据
        vm.settingClassDialog.classIds = []
        vm.settingClassDialog.citys = []
        // 清空展示
        vm.indeterminate = false
        vm.checkAll = false
        vm.indeterminate2 = false
        vm.checkAll2 = false
        vm.$refs['permTree'].setCheckedKeys([])
        vm.$refs['permTree2'].setCheckedKeys([])
      },
      submitsettingClassForm(name){
        var vm = this
        var data = vm.settingClassDialog
        if(!data.classIds.length){
          vm.$Message.info('请先选择要关联的分类');
          return
        }
        if(!data.citys.length){
          vm.$Message.info('请先选择要关联的区域');
          return
        }
        var params = {
          url: vm.url.settingClass,
          data,
          method: 'post'
        }
        vm.relationLoading = true
        vm.$http2(params).then(res=>{
          vm.relationLoading = false
          if(res&&res.status==200){
            if(res.data.code==1){
              vm.$Message.success('关联成功')
              vm.paging()
              vm.resetsettingClassForm(name)
              vm.settingClassShow = false
            }else{
              vm.$Message.error(res.data.message || '关联失败')
            }  
          }  
        }).catch(err=>{
          vm.relationLoading = false
        })
      },
      handleCheckAll(val){
        var vm = this
        if(val){
          vm.settingClassDialog.classIds = vm.allClassIds
          vm.$refs['permTree'].setCheckedKeys(vm.allClassIds)
        }else{
          vm.settingClassDialog.classIds = []
          vm.$refs['permTree'].setCheckedKeys([])
        }
      },
      permCheckChange(){
        var vm = this
        var classIds = vm.$refs['permTree'].getCheckedKeys(true)
        vm.settingClassDialog.classIds = classIds
        if(classIds.length == vm.allClassIds.length){
          vm.indeterminate = false
          vm.checkAll = true
        }else if(classIds.length == 0){
          vm.indeterminate = false
          vm.checkAll = false
        }else{
          vm.indeterminate = true
          vm.checkAll = false
        }
      },
      handleCheckAll2(val){
        var vm = this
        if(val){
          vm.settingClassDialog.citys = vm.allCityIds
          vm.$refs['permTree2'].setCheckedKeys(vm.allCityIds)
        }else{
          vm.settingClassDialog.citys = []
          vm.$refs['permTree2'].setCheckedKeys([])
        }
      },
      permCheckChange2(){
        var vm = this
        var cityIds = vm.$refs['permTree2'].getCheckedKeys(true)
        vm.settingClassDialog.citys = cityIds
        // allCityIds
        if(cityIds.length == vm.allCityIds.length){
          vm.indeterminate2 = false
          vm.checkAll2 = true
        }else if(cityIds.length == 0){
          vm.indeterminate2 = false
          vm.checkAll2 = false
        }else{
          vm.indeterminate2 = true
          vm.checkAll2 = false
        }
      },
      // 配置分类结束
      submitSearch(){
        var vm = this,item
        for(let key in vm.formSearch){
          item = vm.formSearch[key]
          if(typeof(item) == 'undefined'){
            vm.formSearch[key] = ''
          }
        }
        var obj = $.extend(vm.pager, vm.formSearch);
        $.each(obj, function (key, val) {
          // 因为   0 == ''  结果为true
          if (val instanceof String && val == '') {
            delete obj[key];
          }
        });
        vm.pager = obj;
        vm.paging(1);
      },
      initDialog (data) {
        var vm=this,cityCode = data.cityCode,arr = []
        if(cityCode){
          var provinceCode = parseInt(cityCode/10000)*10000
          arr = [provinceCode, cityCode]
        }
        vm.provinceCity = arr
        // 修改数据内存指向
        vm.formDialog.cityIds = vm.util.deepcopy(data.cityIds)
      },
      resetSearch (name) {
        let vm = this
        vm.derail_address_obj_s = []
        vm.formSearch.className = ''
        vm.formSearch.classType = ''
        vm.formSearch.cityCode = ''
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
        // vm.paging(1)
      },
      resetDialogForm (name) {
        name = name || 'formDialog'
        let vm = this
        vm.province = []
        vm.cities = []
        vm.citiesData = []
        vm.provinceCity = []
        vm.formDialog.classIcon = ''
        // vm.formDialog.cityCode = ''
        vm.dialogSubmitLoading = false
        vm.formDialog.cityIds = []
        vm.$refs[name].resetFields()
      },
      submitDialogForm (name) {
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            if (vm.initPostDialog) {
              vm.initPostDialog(vm.formDialog)
            }
            var pager = vm.pager,currDialog=vm.currDialog,ajaxUrl='',ajaxData={}
            if(currDialog=='add'){
              ajaxUrl = vm.url[currDialog]
              ajaxData = vm.editAddAjaxData(vm.currDialog)
            }else if(currDialog=='edit'){
              var id = vm.formDialog.id
              // ajaxUrl = vm.url[currDialog] + id
              ajaxUrl = vm.url[currDialog]
              for(let key in vm.formDialog){
                // if(key!='id'){
                  ajaxData[key] = vm.formDialog[key]
                // }
              }
            }
            var method =  pager.method
            if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
              method = pager.addMethod
            }
            if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
              method = pager.editMethod
            }
            vm.dialogSubmitLoading = true
            var params = {
              url: ajaxUrl,
              method: method,
            }
            if(ajaxData.id){
              if(method=='post'){
                params.data = ajaxData
              }else if(method=='get'){
                params.params = ajaxData
              }
              vm.selfSubmit(params, name)
            }else{
              vm.$http.post(vm.url.sId).then(res=>{
                var resData = res.data
                if(resData.code==1){
                  ajaxData.id = resData.data
                  if(method=='post'){
                    params.data = ajaxData
                  }else if(method=='get'){
                    params.params = ajaxData
                  }
                  vm.selfSubmit(params, name)
                }else{
                  vm.$Message.error(resData.message)
                }
              }).catch(err=>{})
            }
          }
        })
      },
      selfSubmit(params,name){
        var vm = this
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
        }).catch(err=>{})
      },
      searchAddrChange (value) {
        var vm = this
        if(value){
          vm.derail_address_obj_s = [Number(value[0]), Number(value[1])]
        }
        vm.formSearch.cityCode = value[1]
      },
      addrChange (value) {
        var vm = this
        if(value){
          vm.provinceCity = [Number(value[0]), Number(value[1])]
        }
        vm.formDialog.cityCode = value[1]
      },
      addrChange2 (value) {
        var vm = this,citiesData=[],cities={},key
        if(value){
          cities = vm.chinaJson[value]
          for(key in cities){
            citiesData.push({
              value: Number(key),
              label: cities[key]
            })
          }
        }
        vm.cities = []
        vm.citiesData = citiesData
      },
      cityChange(val){
        var vm = this,arr2=[]
        var arr = vm.util.deepcopy(vm.formDialog.cityIds)
        if(val instanceof Array){
          val.map(function(code){
            if(arr.indexOf(code) == -1){
              arr2.push(code)
            }
          })
          arr = arr.concat(arr2)
        }
        vm.formDialog.cityIds = arr
      },
      handleClose(code){
        var vm = this
        if(code){
          var ind = vm.formDialog.cityIds.indexOf(code)
          if(ind != -1){
            vm.formDialog.cityIds.splice(ind,1)
          }
          var _ind = vm.cities.indexOf(code)
          if(_ind != -1){
            var arr = vm.util.deepcopy(vm.cities)
            arr.splice(_ind,1)
            vm.cities = arr
          }
        }
      },
      handleSuccess (res, file) {
        if(res.state=="SUCCESS"){
          this.$Message.success("上传成功！")
          this.formDialog.classIcon = res.url
        }
      },
      handleFormatError () {
        this.$Message.error('文件格式错误，请选择jpg,jpeg或png格式的文件')
      },
      // 上传图片
      imgTest(fileObj){
        var vm = this,obj = {},
        code = 1,
        message = '',
        type = fileObj.type.split('/')[1],
        size = fileObj.size
        var fileUrl = vm.fileUrl,
          imgUploadFormat = vm.imgUploadFormat || ['jpg','jpeg','png','gif'],
          imgMaxSize = vm.imgMaxSize || 3,
          imgMinSize = vm.imgMinSize || 10
        var len = fileUrl.length,len2 = imgUploadFormat.length,typeIsOk = false,sizeIsOk = false,typeTxt=''
        if(!type){
          code = 0
          message = '文件格式未知，请重新选择'
        }else{
          type = type.toLocaleLowerCase()
        }
        for(let i=0;i<len2;i++){
          typeTxt += i==len2-1 ? imgUploadFormat[i] : imgUploadFormat[i] + '、' 
          if(type==imgUploadFormat[i]){
            typeIsOk = true
            break
          }
        }
        if(!typeIsOk){
          obj.code = 0
          obj.message = `请选择${typeTxt}格式的文件`
          return obj
        }
        if(imgMaxSize&&size/1000/1000>imgMaxSize){
          obj.code = 0
          obj.message = `请选择小于${imgMaxSize}Mb的文件`
          return obj
        }
        if(imgMinSize&&size/1000<imgMinSize){
          obj.code = 0
          obj.message = `请选择大于${imgMinSize}Kb的文件`
          return obj
        }
        obj.code = code
        obj.message = message
        return obj
      }, 
      myBeforeUpload(file){
        var vm = this;
        var imgTestResult = vm.imgTest(file)
        if(!imgTestResult.code){
          vm.$Message.error({
            content: imgTestResult.message,
            duration: 3
          })
          return false
        }
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          vm.fileUrl = [reader.result]
          vm.uploadImgArr = [file]
        }
        return false
      },
      handleFormatError(){},
      handleMaxSize(){},
      myUpload(){
        // 确认上传
        var vm = this
        if(!vm.uploadImgArr.length){
          vm.$Message.error('请先选择上传的图片')
          return
        }
        vm.uploadLoading = true
        if(vm.currDialog=='add' && !vm.formDialog.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.formDialog.id = sId;
              vm.uploadFile(sId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.formDialog.id
          vm.uploadFile(sId)
        }
      },
      uploadFile(sId,userId){
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        params.append('s',3)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像  6广告
        params.append('p',6)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr = [];
            vm.$Message.success('上传图片成功！');
            var arr = [rd.data[0]]
            vm.formDialog.classIcon = arr[0] || '';
            vm.uploadLoading = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleView(index){},
      handleRemove(index){
        var vm = this
        vm.fileUrl.splice(index,1)
        vm.uploadImgArr.splice(index,1)
        vm.formDialog.headPortrait = ''
      },
      // 上传图片  end
      paging (current) {
        let vm = this
        if (current && Number(current)) {
          vm.changePager(current)
          return
        }
        var pager = {},method='post',ajaxData = {},params={}
        // 搜索和列表共用分页，通过状态判断是搜索翻页还是列表翻页
        if(vm.isSearchStatus){
          // 是搜索
          pager = vm.searchPager
          method = pager.method || method
          var _ajaxData = vm.pagingFiltData(pager),formSearch={},_formSearch=vm.formSearch
          for(let key in _ajaxData){
            formSearch[key] = _ajaxData[key]
          }
          for(let key in _formSearch){
            formSearch[key] = _formSearch[key]
          }
          ajaxData = formSearch
        }else{
          // 不是搜索
          pager = vm.pager
          method = pager.method || method
          ajaxData = vm.pagingFiltData(pager)
          if(typeof(ajaxData.current) != 'undefined'){
            delete ajaxData.current
          }
          if(typeof(ajaxData.size) != 'undefined'){
            delete ajaxData.size
          }
        }
        params = {
          url: pager.url,
          method: method,
        }
        if(method=='get'){
          params.params = ajaxData
        }else{
          params.data = ajaxData
        }
        // vm.currentPager = pager
        vm.pageLoading = true
        vm.$http(params).then(res => {
          vm.pageLoading = false
          let resData = res.data
          if (resData.code == 1) {
            if (typeof vm.pagerResult == 'function') {
              // 返回数据预处理
              resData.data = vm.pagerResult(resData.data)
            }
            vm.initOther(resData.data)
            setTimeout(function(){
              pager.data = resData.data
              pager.total = resData.total
              // vm.currentPager.current = resData.current
              // vm.currentPager.total = resData.total
              // vm.currentPager.data = resData.data
            },50)
          }
        }).catch(err=>{
          vm.pageLoading = false
        })
      },
      initOther(data){
        var vm = this,permTreeData=[],allClassIds=[]
        data.forEach(item=>{
          allClassIds.push(item.id)
          permTreeData.push({
            id: item.id,
            title:item.className,
            label:item.className,
          })
        })
        vm.allClassIds = allClassIds
        vm.permTreeData = permTreeData
      },
      initAddressTreeData(data){
        var vm = this,treeData = [],_item={},allCityIds=[]
        data.forEach(item=>{
          _item = {
            id: item.value,
            title:item.label,
            label:item.label,
            children: []
          }
          item.children.forEach(child=>{
            allCityIds.push(child.value)
            _item.children.push({
              id: child.value,
              title:child.label,
              label:child.label,
            })
          })
          treeData.push(_item)
        })
        vm.allCityIds = allCityIds
        vm.permTreeData2 = treeData
      },
      initData () {
        // chinaJson 在main.js中初始化
        let vm = this,provinceData=[],_item
        // 初始化省市数据
        let chinaJson = JSON.parse(sessionStorage.chinaJson)
        let chinaData = JSON.parse(sessionStorage.chinaData)
        let _chinaData = [
          {
            'value': 1,
            'label': '全国',
            children: [
              {
                'value': 1,
                'label': '全国',
              }
            ]
          }
        ]
        chinaData.forEach(item => {
          _item = vm.util.deepcopy(item)
          _item.children = []
          provinceData.push(_item)
          let childArr = []
          item.children.forEach(child => {
            childArr.push({
              'value': child.value,
              'label': child.label
            })
          })
          _chinaData.push({
            'value': item.value,
            'label': item.label,
            'children': childArr
          })
        })
        provinceData.unshift({
          value: 1,
          label: '全国'
        })
        vm.provinceCityData = _chinaData
        vm.initAddressTreeData(_chinaData)
        vm.provinceData = provinceData
        // 自定义全国类型的json数据
        chinaJson['100000'][1] = '全国'
        chinaJson[1] = {}
        chinaJson[1][1] = '全国'
        vm.chinaJson = chinaJson
      }
    },
  }
</script>
