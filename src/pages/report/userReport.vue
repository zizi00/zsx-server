<template>
  <div class="user-report">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
        
        <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button> -->
        <Button v-if="hasPerm('userReport:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <Button v-if="hasPerm('userReport:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
      </Form>
    </div>
    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')" width="700">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="120px">
        <Row>
          <Col span="12">
            <el-form-item label="举报类型" prop="type">
              <el-select v-model="formDialog.type" placeholder="请选择" size="small">
                <el-option v-for="item in reportClass" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="举报的内容的ID" prop="reportTypeId">
              <Input v-model="formDialog.reportTypeId" placeholder="请手动输入"></Input>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="举报信息" prop="reportId">
              <!-- 举报信息可以多选 -->
              <el-select v-model="formDialog.reportId" placeholder="请选择" size="small" multiple>
                <el-option v-for="item in reportId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="发起举报的用户" prop="userId">
              <el-select v-model="formDialog.userId" placeholder="请选择" filterable size="small">
                <el-option
                  v-for="item in userId"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.userId" placeholder="请选择" filterable>
                <Option v-for="item in userId" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select> -->
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="是否有效" prop="reportStatus">
              <Select v-model="formDialog.reportStatus" placeholder="请选择">
                <Option v-for="item in reportStatus" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="是否处理" prop="isOk">
              <Select v-model="formDialog.isOk" placeholder="请选择">
                <Option v-for="item in isOk" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <el-form-item label="举报内容" prop="reportContent">
              <Input type="textarea" :rows="6" v-model="formDialog.reportContent" placeholder="举报内容"></Input>
            </el-form-item>
          </Col>
        </Row>
        <!-- 上传举报图片 -->
        <Row>
          <Col span="24">
            <el-form-item label="广告图片">
              <Row>
                <Col span="6">
                  <Upload name="file"
                      :action="url.upload"
                      accept=".jpg,.jpeg,.png,.gif"
                      :multiple="uploadImgMax==1 ? false : true"
                      :before-upload="myBeforeUpload"
                      :format="imgUploadFormat"
                      :on-format-error="handleFormatError"
                      :on-success="myHandleSuccess">
                    <Button type="default" icon="ios-cloud-upload-outline">选择图片</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">
                    <Tooltip>
                      <span>确定上传</span>
                      <p slot="content"  style="white-space: normal;">{{imgRequiredTxt}}</p>
                    </Tooltip>
                  </Button>
                </Col>
                <Col span="18">
                  <Row v-if="fileUrl.length">
                    <Col span="8" v-for="(item, index) in fileUrl" :key="index">
                      <div class="image-box">
                        <img :src="item" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-show="!fileUrl.length" class="image-box">
                    <img src="static/images/img-upload-default.png" class="ad-img">
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
        </Row>
      </el-form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <Modal v-model="previewShow" title="预览" :mask-closable="false">
      <div class="post-content">
        <div class="post-preview-header clearfix">
          <div class="head-portrait">
            <img :src="previewData.userheadPortrait" alt="头像">
          </div>
          <div class="post-user-info">
            <div class="info-header">
              <span class="user-name">{{previewData.userNickName}}</span>
              <img class="user-sex" :src="sexImgSrcMap[previewData.userSex]" alt="">
            </div>
            <div class="info-footer">
              <span>{{previewData.postTime}}</span>
              <!-- <span>5分钟前</span> -->
            </div>
          </div>
        </div>
        <div class="post-preview-conntent">{{previewData.postContent}}</div>
        <div class="post-preview-media clearfix" v-if="previewData.postImagesSrc && previewData.postImagesSrc.length">
          <template v-if="previewData.postImagesSrc.length==1">
            <template v-for="item in previewData.postImagesSrc">
              <template v-if="typeof item == 'object'">
                <video id="myvideo" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" 
                style="max-width: 100%;max-height: 10rem;" :poster="item.poster">
                  <source :src="item.src" type='video/mp4'>
                </video>
              </template>
              <template v-else>
                <img style="max-width: 100%;max-height: 225px;" :src="item" :alt="item">
              </template>
            </template>
          </template>
          <template v-else-if="previewData.postImagesSrc.length==4">
            <template v-for="item in previewData.postImagesSrc">
              <div class="post-img-item">
                <img :src="item" :alt="item">
              </div>
            </template>
          </template>
          <template v-else>
            <template v-for="(item,index) in previewData.postImagesSrc">
              <div v-if="(index+1)%3==0" style="margin-right: 0;" class="post-img-item">
                <img :src="item" alt="">
              </div>
              <div v-else class="post-img-item">
                <img :src="item" alt="">
              </div>
            </template>
          </template>
        </div>
      </div>
      <div slot="footer">
        <Button @click="previewShow=false;previewData={}">{{label.close}}</Button>
      </div>
    </Modal>

    <Modal v-model="imgShow" title="举报上传的图片" :mask-closable="false">
      <div class="preview-editor-content clearfix">
        <div v-for="item in imgSrcArr" :key="item" style="float: left;width: 48%;padding: 1%;max-height:250px;overflow: auto;">
          <a :href="item" target="_blank" style="display: block;">
            <img :src="item" :alt="item" style="max-width: 100%;">
          </a>
        </div>
      </div>
      <div slot="footer">
        <Button @click="imgShow=false;imgSrcArr=[]">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'userReport',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/user/report/add',
          delete: 'web/user/report/delete',
          edit: 'web/user/report/update',
          search: '',
          report: 'web/report/dataGrid',
          reportClass: 'web/report/class/dataGrid',
          appUser: 'user/dataSearch',
          sId: 'id/id',
          upload: 'file/',
          postSearch: 'post/dataSearch',
        },
        pager: {
          // 页面初始化
          url: 'web/user/report/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        sexImgSrcMap: {
          '0': 'static/images/girl.png',
          '1': 'static/images/boy.png',
        },
        imgSrcArr: [],
        imgShow: false,
        userData: {},
        // 预览的帖子的数据
        previewShow: false,
        previewData: {
          postImagesSrc: []
        },
        batchIdArr: [],
        needId: true,
        // 上传图片
        uploadImgMax: 9,
        uploadLoading: false,
        fileUrl: [],
        uploadImgArr: [],
        imgUploadFormat: ['jpg','jpeg','png','gif'],
        imgMaxSize: 3, // 图片最大大小  单位Mb
        imgMinSize: 4, // 最小10kb
        // 搜索表单
        formSearch: {
          
        },
        reportId: [],
        reportIdMap: {},
        reportClass: [],
        reportClassMap: {},
        userId: [],
        userIdMap: {},
        reportStatus: [
          {
            value: 0,
            label: '无效'
          },
          {
            value: 1,
            label: '有效'
          }
        ],
        reportStatusMap: {
          0: '无效',
          1: '有效'
        },
        isOk: [
          {
            value: 0,
            label: '未处理'
          },
          {
            value: 1,
            label: '已处理'
          }
        ],
        isOkMap: {
          0: '未处理',
          1: '已处理'
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          // 类型
          type: '',
          // 外键ID 比如举报的是评论，这个id就对应举报的那条评论的id  暂时默认填1
          reportTypeId: 1,
          reportId: [],
          userId: '',
          reportContent: '',
          reportStatus: '',
          isOk: '',
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
          //   width: 200,
          // },
          {
            'title': '举报类型',
            'key': 'type',
            width: 150,
            render: (create, params)=>{
              var key = params.row.type,map=this.reportClassMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '举报基础信息',
            'key': 'reportInfos',
            width: 150,
            render: (create, params)=>{
              var str = '',reportInfos=params.row.reportInfos
              reportInfos.forEach(item=>{
                str += item + '  '
              })
              return create('span',{style: {'white-space': 'pre-wrap'} },str)
            }
          },
          {
            'title': '用户昵称',
            'key': 'userId',
            width: 180,
            render: (create, params)=>{
              var key = params.row.userId,map=this.userIdMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '举报填写的内容',
            'key': 'reportContent',
            width: 250,
          },
          {
            'title': '举报上传的图片',
            'key': 'fileManageList',
            width: 400,
            render: (create, params)=>{
              var vm = this,arr=[],createArr=[]
              var imgSrcArr = vm.getImgArr(params.row.fileManageList)
              var lookMoreBtn = create('Button',{
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  'margin-top': '-40px'
                },
                on: {
                  click: function(){
                    vm.imgSrcArr = imgSrcArr
                    vm.imgShow = true
                  }
                }
              },'查看全部')
              imgSrcArr.forEach(src=>{
                arr.push(create('a',{
                  attrs: {
                    href: src,
                    target: '_blank'
                  },
                },[create('img',{
                  attrs: {
                    src: src,
                    alt: src
                  },
                  style: {
                    'max-width': '100px',
                    'max-height': '100px',
                    'margin': '10px'
                  }
                })]))
              })
              if(imgSrcArr.length>3){
                createArr = [arr[0],arr[1],lookMoreBtn]
              }else{
                createArr = arr
              }
              return create('div',createArr)
            }
          },
          {
            'title': '是否有效',
            'key': 'reportStatus',
            width: 150,
            render: (create, params)=>{
              var key = params.row.reportStatus,map=this.reportStatusMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '是否处理',
            'key': 'isOk',
            width: 150,
            render: (create, params)=>{
              var key = params.row.isOk,map=this.isOkMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '被举报的内容',
            'key': 'reportTypeId',
            width: 150,
            render: (create, params) => {
              var vm = this
              return create('Button',{
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: function(){
                    vm.previewReport(params.row)
                  }
                }
              },'预览')
            }
          },
          {
            'title': '创建时间',
            'key': 'createTime',
            width: 150,
          },
          {
            'title': '操作',
            'key': 'action',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('userReport:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('userReport:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          },
        ],
        rules: {
          type: [
            { required: true, message: '请选择举报类型', trigger: 'change' }
          ],
          reportId: [
            { required: true, message: '请选择举报信息', trigger: 'change' }
          ],
          userId: [
            { required: true, message: '请选择发起举报的用户', trigger: 'change' }
          ],
          reportContent: [
            { required: true, message: '举报内容不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      getImgArr(fileManageList){
        fileManageList = fileManageList || []
        var vm=this,arr = [],len=fileManageList.length
        var imageHost = vm.imageHost || sessionStorage.imageHost
        if(len){
          var fileType = fileManageList[0].fileType,
            filePath = fileManageList[0].filePath,
            fileList = fileManageList[0].fileList
          fileList.forEach(item=>{
            arr.push(imageHost + filePath + item.fileName)
          })
        }
        return arr
      },
      initPostDialog(data){
        // reportTypeId  458197483769856
        var vm=this,num = Number(data.reportTypeId)
        vm.formDialog.reportTypeId = isNaN(num) ? 1 : num
        vm.formDialog.reportId = data.reportId.join(',')
      },
      // 上传文件
      imgTest(fileObj){
        var vm = this,obj = {},
        code = 1,
        message = '',
        type = fileObj.type.split('/')[1],
        size = fileObj.size
        var fileUrl = vm.fileUrl,
          imgUploadFormat = vm.imgUploadFormat,
          imgMaxSize = vm.imgMaxSize,
          imgMinSize = vm.imgMinSize
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
        if(size/1000/1000>imgMaxSize){
          obj.code = 0
          obj.message = `请选择小于${imgMaxSize}Mb的文件`
          return obj
        }
        if(size/1000<imgMinSize){
          obj.code = 0
          obj.message = `请选择大于${imgMinSize}Kb的文件`
          return obj
        }
        // 尺寸约束
        function chicun (){
          let reader = new FileReader()
          reader.readAsDataURL(fileObj)
          // 这特喵是个异步
          reader.onloadend = function(e){
            var sizeErrorRange = 0.05 //误差范围
            var image = new Image();
            image.src= reader.result;
            image.onload=function(){
              var width = image.width,
                height = image.height,
                _width = 0,
                _height = 0
              if(imgMaxSize==1){
                // 单图
                _width = one.width,
                _height = one.height
              }else{
                // 多图
                if(len){
                  _width = secondary.width,
                  _height = secondary.height
                }else{
                  // 主图
                  _width = main.width,
                  _height = main.height
                }
              }
              if(_width<width){
                code=0
                message = '您选择的图片宽度过小,请重新选择'
              }else if(_height<height){
                code=0
                message = '您选择的图片高度过小,请重新选择'
              }else{
                if(!(width/_width<1+sizeErrorRange&&height/_height<1+sizeErrorRange)){
                  code = 0
                  message = '您选择的图片比例不符合要求，请重新上传'
                }
              }
              return {
                code: code,
                message: message
              }
            };
          }
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
        // readAsDataURL 方法用于读取指定 Blob 或 File 的内容
        // 当读操作完成，readyState 变为 DONE，loadend 被触发，此时 result 属性包含数据：URL（以 base64 编码的字符串表示文件的数据）
        // 读取文件作为 URL 可访问地址
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          if(!(vm.fileUrl.length<vm.uploadImgMax)){
            vm.fileUrl.shift()
            vm.uploadImgArr.shift()
          }
          vm.uploadImgArr.push(file)
          vm.fileUrl.push(reader.result)
        }
        return false
      },
      myHandleSuccess(){},
      myUpload(){
        // 确认上传
        var vm = this
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
        // s   1  用户  2  帖子  3  广告  4  资讯(原新闻)
        params.append('s',1)
        // 使用位置p1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 6:广告 7:系统通知 8:新闻 9 举报
        params.append('p',9)
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
            vm.fileUrl = []
            vm.$Message.success('上传图片成功！');
          }else{
            vm.$Message.error(rd.message)
          }
          vm.uploadLoading=false
        }).catch(err=>{})
      },
      handleFormatError(){
        this.$Message.error('文件格式错误，请选择jpg、jpeg、png或gif格式的文件！')
      },
      handleRemove(index){
        var vm = this
        vm.fileUrl.splice(index,1)
      },
      // 上传文件  end
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
      // 预览举报内容
      previewReport(data){
        var vm=this,type=data.type,reportTypeId=data.reportTypeId,params={}
        if(type==1){
          params = {
            url: vm.url.postSearch,
            method: 'post',
            data: {
              id: reportTypeId
            }
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var data = res.data.data.records,previewData={},imageHost=vm.imageHost || sessionStorage.imageHost
            var len = data.length
            if(len){
              previewData = data[0]
              previewData.postImagesSrc = vm.getPostImagesSrc(data[0].fileManageList)
              var userheadPortrait = previewData.userheadPortrait
              if(userheadPortrait.indexOf('http')==-1){
                userheadPortrait = imageHost + userheadPortrait
              }
              previewData.userheadPortrait = userheadPortrait
              vm.previewData = previewData
              vm.previewShow = true
            }else{
              vm.$Message.info('被举报的内容已不存在')
            }
          }
        })
      },
      getPostImagesSrc(data){ 
        var arr = [],vm=this;
        if(!data)return arr
        var len = data.length,i,j,item;
        if(len){
          var imageHost = vm.imageHost
          var filePath = data[0].filePath
          var fileList = data[0].fileList
          if(data[0].fileType==2){
            for(j=0;j<fileList.length;j++){
              item = fileList[j]
              arr.push({
                src: imageHost + filePath +  item.fileName,
                poster: imageHost + filePath +  item.fileVideoImage
              })
            }
          }else if (data[0].fileType==1){
            for(j=0;j<fileList.length;j++){
              item = fileList[j]
              arr.push(imageHost + filePath + item.fileName)
            }
          }
        }
        return arr
      },
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
        vm.fileUrl = []
        vm.uploadLoading=false
        vm.$refs[name].resetFields()
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
      initReport(){
        var vm = this
        var params = {
          url: vm.url.report,
          method: 'get'
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var data = res.data.records,reportId=[],reportIdMap={},val
            data.forEach(item=>{
              val = item.reportInfo || item.id
              reportId.push({
                value: item.id,
                label: val
              })
              reportIdMap[item.id] = val
            })
            vm.reportId = reportId
            vm.reportIdMap = reportIdMap
          }
        })
      },
      initReportClass(){
        var vm = this
        var params = {
          url: vm.url.reportClass,
          method: 'get'
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var data = res.data.records,arr=[],map={},val
            data.forEach(item=>{
              val = item.className || item.id
              arr.push({
                value: item.id,
                label: val
              })
              map[item.id] = val
            })
            vm.reportClass = arr
            vm.reportClassMap = map
          }
        })
      },
      initDialog(data){
        var vm = this
        if(typeof data.reportId == 'string'){
          vm.formDialog.reportId = data.reportId.split(',')
        }
      },
      initData(){
        var vm = this
        vm.initAppUser()
        vm.initReport()
        vm.initReportClass()
      }
    }
  }
</script>
<style scoped>
/* 帖子预览*/
.post-content{
  /* width: 750px; */
  box-sizing: border-box;
  padding: 15px;
  width: 375px;
  margin: 0 auto;
  border: 2px dotted aqua;

}
.post-preview-header{
  height: 42px;
  margin-bottom: 15px;
}
.head-portrait{
  float: left;
  margin-right: 10px;
  width: 40px;
  height: 40px;
}
.head-portrait img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.post-user-info{
  float: left;
}
.post-user-info .user-name{
  color: #3679DF;
  font-size: 16px;
}
.post-user-info .user-sex{
  height: 12px;
}
.post-user-info .info-footer{
  font-size: 12px;
  color: #999;
}
.post-preview-conntent{
  font-size: 17px;
  line-height: 26px;
  color: #333;
}
.post-preview-media{

}
.post-img-item{
	float: left;
	text-align: center;
	margin-right: 10px;
	margin-top: 10px;
  width: 105px;
  height: 105px;
}
.post-img-item img{
  max-width: 100%;
	max-height: 100%;
}
</style>
