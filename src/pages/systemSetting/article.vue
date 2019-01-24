<template>
  <div class="push_article">
    <!-- 推送分为：单人推送、区域推送、单平台推送、全平台推送 <br> -->
    <!-- <Form :model="formSearch" ref="formSearch" inline :label-width="60">
      <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
    </Form> -->
    <Button v-if="hasPerm('article:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
    <mainTable :columns="columns" :data="pager.data" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="800" @on-cancel="resetDialogForm('formDialog')" :styles="{top:'30px'}">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <Row>
          <Col span="12">
            <el-form-item label="推送类型" prop="pushType">
              <Select v-model="selectPushType" placeholder="请选择推送类型">
                <Option v-for="item in pushType" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </el-form-item>
          </Col>
          <Col v-if="selectPushType==1" span="12">
            <el-form-item label="接收人">
              <el-select v-model="receiveUserId" placeholder="请选择/输入关键字搜索" filterable size="small">
                <el-option v-for="item in allUser" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col v-if="selectPushType==2" span="12">
            <el-form-item label="推送区域" prop="pushArea">
              <Row>
                <Col span="18">
                  <Cascader :data="chinaData" v-model="pushArea" filterable :change-on-select="anySelect" width="240"></Cascader>
                </Col>
                <Col span="6">
                  <Button type="primary" @click="anySelect=!anySelect" style="margin-left:5px;">{{anySelect?'任意选':'推送区'}}</Button>
                </Col>
              </Row>
            </el-form-item>
          </Col>
          <Col v-if="selectPushType==3" span="12">
            <el-form-item label="推送平台" prop="pushPlatForm">
              <Select v-model="formDialog.pushPlatForm" placeholder="请选择推送类型" clearable>
                <Option v-for="item in pushPlatForm" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="主标题" prop="title">
              <Input v-model="formDialog.title" placeholder="请输入主标题"></Input>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="副标题" prop="subhead">
              <Input v-model="formDialog.subhead" placeholder="请输入副标题"></Input>
            </el-form-item>
          </Col>
        </Row>
        <!-- 上传图片 -->
        <Row>
          <Col span="12">
            <el-form-item label="图片">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload"
                      accept=".jpg,.jpeg,.png,.gif"
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
                    <div class="image-box" v-for="(item, index) in fileUrl">
                      <img :src="item" class="ad-img">
                      <div class="demo-upload-list-cover">
                        <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
                      </div>
                    </div>
                  </Row>
                  <div v-show="!fileUrl.length" class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="链接类型" prop="type">
              <Select v-model="formDialog.type" placeholder="请选择" transfer>
                <Option v-for="item in type" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </el-form-item>
          </Col>
          <Col span="12" v-if="formDialog.type==2">
            <el-form-item label="外链Url" prop="url">
              <Input v-model="formDialog.url" placeholder="请输入外链url"></Input>
            </el-form-item>
          </Col>
        </Row>
        <Row v-show="formDialog.type==1">
          <Row>
            <Col span="6">
              <el-form-item label="内容" prop="content">
                <Button type="success" @click="contentShow=true;articleContent=formDialog.content" size="small">预览</Button>
              </el-form-item>
            </Col>
            <Col span="18">
              <div style="width:375px;">
                <ueditor v-model="formDialog.content" :config="myConfig"></ueditor>
              </div>
            </Col>
          </Row>
        </Row>
      </el-form>
      <div slot="footer">
        <Button @click="resetDialogForm2('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <!-- 预览内容 -->
    <Modal v-model="contentShow" title="预览内链内容" @on-cancel="contentShow=false;articleContent=''" :styles="{'top': '30px'}">
      <div class="article-content">
        <div v-html="articleContent"></div>
      </div>
      <div slot="footer">
        <Button @click="contentShow=false;articleContent=''">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  import ueditor from '@/components/ueditor'
  export default {
    name: 'push_article',
    mixins: [page],
    components: {
      mainTable,
      paging,
      ueditor,
    },
    data(){
      return {
        url: {
          imgServer: 'web/server/get',
          add: '',
          edit: 'web/notification/update',
          delete: 'web/notification/delete',
          search: '',
          sId: 'id/id',
          upload: 'file/',
          one: 'web/test/push/one/',
          all: 'web/push/sendAll',
          allUser: 'user/all/user',
        },
        needId: true,
        pager: {
          url: 'web/notification/dataGrid',
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
          deleteMethod: 'get'
        },
        contentShow: false,
        anySelect: true,
        uploadLoading: false,
        pushArea: [], //推送的区域
        fileUrl: [],
        uploadImgArr: [],
        allUser: [],
        allUserMap: {},
        selectPushType: 4,
        type: [
          {
            value: 1,
            label: '内链'
          },
          {
            value: 2,
            label: '外链'
          },
        ],
        typeMap: {
          1: '内链',
          2: '外链'
        },
        s: 7,
        articleContent: '',
        pushType: [
          {
            value: 1,
            label: '单人推送'
          },
          // {
          //   value: 2,
          //   label: '区域推送'
          // },
          // {
          //   value: 3,
          //   label: '单平台推送'
          // },
          {
            value: 4,
            label: '全部推送'
          },
        ],
        pushPlatForm: [
          {
            value: 'android',
            label: '安卓'
          },
          {
            value: 'ios',
            label: '苹果'
          }
        ],
        chinaData: [],
        chinaJson: {},
        formSearch: {
          
        },
        receiveUserId: '',
        formDialog: {
          id: '',
          url: '',
          image: '',
          title: '',
          subhead: '',
          type: 2,
          content: '',
        },
        columns: [
          // {
          //   'title': 'ID',
          //   'key': 'id',
          //   'width': 200,
          // },
          {
            'title': '主标题',
            'key': 'title',
            'width': 200,
          },
          {
            'title': '副标题',
            'key': 'subhead',
            'width': 200,
          },
          // {
          //   'title': '内容',
          //   'key': 'content',
          //   'width': 150,
          // },
          {
            'title': '图片',
            'key': 'image',
            'width': 150,
            render: (create, params) => {
              var url = params.row.image,imageHost=this.imageHost || sessionStorage.imageHost
              if(!url) return create('span', '无')
              if(url.indexOf('http')==-1){
                url = imageHost + url
              }
              return create('a',{
                attrs: {
                  href: url,
                  target: '_blank'
                },
              },[create('img',{
                attrs: {
                  src: url,
                  alt: url
                },
                style: {
                  'border': '1px solid transparent',
                  'border-radius': '4px',
                  'margin': '10px 0',
                  'max-width': '100px',
                  'max-height': '100px'
                }
              })])
            }
          },
          {
            'title': '类型',
            'key': 'type',
            'width': 300,
            render: (create,params)=>{
              var vm=this,key = params.row.type,map=this.typeMap,url=params.row.url,content=params.row.content
              var map = vm.typeMap,arr=[]
              if(key==1){
                // 内链
                arr = [
                  create('span',{
                    style: {
                      'margin-right': '10px'
                    }
                  },'内链：'),
                  create('Button',{
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: function(){
                        vm.previewContent(content)
                      }
                    }
                  },'预览')
                ]
              }else if(key==2){
                // 外链
                arr = [
                  create('span','外链：'),
                  create('a',{
                    attrs: {
                      href: url,
                      target: '_blank'
                    }
                  },url)
                ]
              }
              return create('div',arr)
            }
          },
          {
            'title': '创建时间',
            'key': 'createTime',
            // 'width': 150,
            render: (create,params)=>{
              var vm=this,key=params.row.createTime,txt=key
              if(typeof key=='number'){
                txt = vm.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr = []
              if(vm.hasPerm('article:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('article:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div',arr)
            }
          }
        ],
        rules: {
          title: [
            { required: true, message: '主标题不能为空', trigger: 'blur' },
          ],
          subhead: [
            { required: true, message: '副标题不能为空', trigger: 'blur' },
          ],
          // content: [
          //   { required: true, message: '内容不能为空', trigger: 'blur' },
          // ],
          url: [
            { required: true, message: '外链URL不能为空', trigger: 'blur' },
          ]
        }
      }
    },
    methods: {
      // 预览内容
      previewContent(content){
        this.articleContent = content
        this.contentShow = true
      },
      // 上传图片
      myBeforeUpload(file){
        var vm = this;
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
        // s   1  用户  2  帖子  3  广告 4  资讯 
        params.append('s',1)
        // 使用位置 p1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 6:广告 7:系统通知 8:新闻
        params.append('p',7)
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
        vm.$http.post(vm.url.upload + sId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr = [];
            vm.fileUrl = [];
            vm.$Message.success('上传图片成功！');
            var imgUrl = ''
            for(var key in rd.data){
              if(key!='server'){
                imgUrl = rd.data[key]
                break
              }
            }
            vm.formDialog.image = imgUrl;
            vm.uploadLoading = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleRemove(index){
        var vm = this
        vm.fileUrl = []
        vm.uploadImgArr = []
        vm.formDialog.image = ''
      },
      // 上传图片  end
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.paging(1)
        // vm.submitSearch(name)
      },
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.selectPushType = 4
        vm.fileUrl = []
        vm.uploadImgArr = []
        vm.dialogSubmitLoading = false
        vm.formDialog.id = ''
        vm.formDialog.content = ''
        vm.$refs[name].resetFields()
      },
      resetDialogForm2(name){
        name = name || 'formDialog'
        var vm = this
        vm.selectPushType = 4
        vm.fileUrl = []
        vm.uploadImgArr = []
        vm.receiveUserId = ''
        vm.dialogSubmitLoading = false
        vm.formDialog.title = ''
        vm.formDialog.url = ''
        vm.formDialog.content = ''
      },
      submitDialogForm (name) {
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            var currDialog = vm.currDialog,pager=vm.pager,selectPushType=vm.selectPushType,ajaxUrl='',h2=false
            var method =  pager.method
            if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
              method = pager.addMethod
            }
            if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
              method = pager.editMethod
            }
            if(currDialog=='edit'){
              ajaxUrl = vm.url.edit
            }else if(currDialog=='add'){
              if(selectPushType==1){
                if(!vm.receiveUserId){
                  vm.$Message.info('请先选择接收人')
                  return
                }
                ajaxUrl = vm.url.one + vm.receiveUserId
                h2 = true
              }else if(selectPushType==2){
                ajaxUrl = ''
              }else if(selectPushType==3){
                ajaxUrl = ''
              }else if(selectPushType==4){
                ajaxUrl = vm.url.all
              }
            }
            var params = {
              url: ajaxUrl,
              method: method,
            }
            let ajaxData = vm.editAddAjaxData(vm.currDialog)
            vm.dialogSubmitLoading = true
            if(vm.currDialog =='add' && !ajaxData.id){
              vm.$http.post(vm.url.sId).then(res=>{
                var resData = res.data
                if(resData.code==1){
                  var sId = resData.data;
                  ajaxData.id = sId
                  if(method=='post'){
                    params.data = ajaxData
                  }else if(method=='get'){
                    params.params = ajaxData
                  }
                  vm.selfSubmit(params,h2)
                }
              }).catch(err=>{})
            }else{
              if(method=='post'){
                params.data = ajaxData
              }else if(method=='get'){
                params.params = ajaxData
              }
              vm.selfSubmit(params,h2)
            }
          }
        })
      },
      selfSubmit(params,h2){
        var vm = this;
        (function(){
          if(h2){
            return vm.$http2(params)
          }else{
            return vm.$http(params)
          }
        })().then(res => {
          vm.dialogSubmitLoading = false
          var resData = res.data
          if(resData.code==1){
            vm.dialogShow = false
            var txt = vm.currDialog == 'add' ? '推送成功!' : '编辑成功'
            vm.$Message.success(txt)
            vm.resetDialogForm(name)
            vm.paging()
          }else{
            vm.$Message.error(vm.label[vm.currDialog] + '失败: ' + resData.message)
          }
        }).catch(err=>{})
      },
      updateContent (content) {
        this.formDialog.content = content
      },
      initAllUserMap(){
        var vm = this
        vm.$http({
          method: 'get',
          url: vm.url.allUser,
        }).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var userData = resData.data
            var len = userData.length,i,item,allUserMap={},allUser=[];
            for(i=0;i<len;i++){
              item = userData[i]
              allUserMap[item.id] = item.nickName
              allUser.push({
                value: item.id,
                label: item.nickName || item.id
              })
            }
            vm.allUserMap = allUserMap
            vm.allUser = allUser
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      initData(){
        var vm = this
        vm.initAllUserMap()
        if(sessionStorage.chinaData){
          var chinaData = JSON.parse(sessionStorage.chinaData)
          vm.chinaData = chinaData
          vm.chinaJson = vm.util.getChinaJsonByData(chinaData)
        }
      }
    },
    watch: {
      selectPushType(type){
        var vm = this
        if(type==1){
          vm.url.add = vm.url.one
        }else if(type==2){

        }else if(type==3){
          
        }else if(type==4){
          vm.url.add = vm.url.allUser
        }
      },
      'formDialog.type': function(val){
        var vm = this
        if(val==1){
          vm.formDialog.url = ''
        }else if(val==2){
          vm.formDialog.content = ''
        }else{
          vm.formDialog.content = ''
          vm.formDialog.url = ''
        }
        
      }
    }
  }
</script>

<style>
  /* 不写scoped就可以限制住 */
  .article-content *{
    max-width: 100%;
  }
</style>

<style scoped>
.article-content{
  max-height: 600px;
  overflow: auto;
}
</style>
