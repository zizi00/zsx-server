<template>
  <div class="submission">
    <!-- element UI template -->
    <div id="search-wrapper">
      <el-form :model="formSearch" ref="formSearch" inline label-width="80px">
        <el-form-item label="服务名称" prop="serviceNumberId">
          <el-select  v-model="formSearch.serviceNumberId" placeholder="请选择" filterable size="mini">
            <el-option v-for="item in serviceNumberId" :value="item.value" :label="item.label" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="创建者" prop="userId">
          <el-select  v-model="formSearch.userId" placeholder="请选择" filterable size="mini">
            <el-option v-for="item in userId" :value="item.value" :key="item.value">{{ item.label }}</el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="审核状态" prop="status">
          <el-select  v-model="formSearch.status" placeholder="请选择" size="mini">
            <el-option v-for="item in status" :value="item.value" :label="item.label" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.clear}}</el-button>
        <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.search}}</el-button>
        <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
      </el-form>
    </div>
    <main-table :columns="columns" :data="pager.data" :height="tableHeight"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging>
    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" width="750px" @closed="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="110px">
        <!-- <el-row v-if="currDialog=='add'">
          <el-col :span="12">
            <el-form-item label="是否推送">
              <el-select v-model="isPush" placeholder="请选择" size="small">
                <el-option v-for="item in push" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="推送给">
              <el-select v-model="pushUserId" placeholder="请选择" size="small">
                <el-option v-for="item in userId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务" prop="serviceNumberId">
              <el-select v-model="formDialog.serviceNumberId" placeholder="请选择" filterable size="small" :disabled="currDialog=='edit'">
                <el-option v-for="item in serviceNumberId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 后台管理系统新增的投稿不选择投稿人，头端将该字段置空 -->
          <!-- <el-col :span="12">
            <el-form-item label="投稿人" prop="userId">
              <el-select v-model="formDialog.userId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in userId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="投稿内容" prop="content">
              <Input type="textarea" :rows="5" v-model="formDialog.content" placeholder="请输入投稿内容"></Input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 上传图片 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="图片/音频/视频">
              <el-row>
                <el-col :span="6">
                  <Upload name="file"
                      :action="url.upload"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.mp4,.mp3"
                      :before-upload="myBeforeUpload"
                      :format="postUploadFormat">
                    <Button type="default" icon="ios-cloud-upload-outline">选择文件</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">
                    <Tooltip>
                      <span>确定上传</span>
                      <p slot="content"  style="white-space: normal;">{{postRequiredTxt}}</p>
                    </Tooltip>
                  </Button>
                </el-col>
                <el-col :span="18">
                  <div class="drag-container">
                    <template v-if="fileArr.length">
                      <div :title="item.name" class="drag-box" v-for="(item, index) in fileArr" :key="item.base64" v-dragging="{item: item, 'list':fileArr}">
                        <div class="image-box service-item">
                          <video v-if="item.type == videoMark" loop autoplay style="max-width:100%;max-height:100%;">
                            <source :src="item.base64" type='video/mp4'>
                          </video>
                          <div v-else-if="item.type == audioMark">
                            <audio autoplay>
                              <source :src="item.base64" type='audio/mpeg'>
                              您的浏览器不支持音频播放
                            </audio>
                          </div>
                          <img v-else :src="item.base64" class="ad-img">
                          <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleRemove(index,item.delData)"></Icon>
                          </div>
                        </div>
                        <span>{{item.name | ellipsisFileName}}</span>
                      </div>
                    </template>
                    <div v-else class="image-box service-item">
                      <img :src="defaultUploadImgSrc" class="ad-img">
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')" size="small">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :disabled="uploadLoading" :loading="dialogSubmitLoading" size="small">{{label.submit}}</el-button>
      </div>
    </el-dialog>

    <Modal v-model="imgShow" title="全部图片">
      <div class="clearfix" style="max-height: 600px;overflow: auto;">
        <a v-for="item in imgSrcArr" :href="item" target="_blank" class="preview-img-container">
          <img :src="item" :alt="item" style="max-width: 100%;max-height: 100%;">
        </a>
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
    name: 'submission',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/servicenumber/content/add',
          edit: 'web/servicenumber/content/update',
          search: 'web/servicenumber/content/dataGrid',
          delete: 'web/servicenumber/content/delete',
          all: 'web/servicenumber/dataAllGrid', // 所有服务
          upload: 'file/',
          sId: 'id/id',
          examine: 'web/servicenumber/content/confirm/examine',
        },
        pager: {
          // 页面初始化
          url: 'web/servicenumber/content/dataGrid',
          // 主区域表格数据
          data: [],
          deleteMethod: 'delete'
        },
        postUploadFormat: ['jpg','jpeg','png','gif','mp4','mp3'],
        uploadLoading: false,
        postRequiredTxt: '图片最多选择九张，单张图片小于5Mb,mp3格式的音频小于10Mb,mp4格式的视频小于20Mb',
        imgMaxSize: 5,
        videoMaxSize: 20,
        audioMaxSize: 10,
        fileArr: [],
        videoMark: 'video',
        audioMark: 'audio',
        imgShow: false,
        imgSrcArr: [],
        originalLength: 0,
        // 搜索表单
        formSearch: {
          serviceNumberId: '',
          userId: '',
          status: '',
          areaCode: ''
        },
        isPush: 0,
        push: [
          {
            value: 0,
            label: '否'
          },
          {
            value: 1,
            label: '是'
          }
        ],
        pushUserId: '',
        userId: [],
        needId: true,
        // 新增/编辑表单
        formDialog: {
          id: '',
          serviceNumberId: '',
          userId: '',
          content: '',
          status: 0,
          sysUserId: ''
        },
        serviceNumberId: [],
        serviceNumberIdMap: {},
        status: [
          {
            value: 0,
            label: '未审核'
          },
          {
            value: 1,
            label: '已审核'
          },
          {
            value: 2,
            label: '审核未通过'
          }
        ],
        statusMap: {
          0: '未审核',
          1: '已审核',
          2: '审核未通过'
        },
        columns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   fixed: 'left',
          //   width: 180
          // },
          {
            'title': '服务',
            'key': 'serviceNumberId',
            width: 200,
            render: (create, params) => {
              var key = params.row.serviceNumberId,map=this.serviceNumberIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '投稿人',
            'key': 'userNickName',
            width: 200,
          },
          {
            'title': '内容',
            'key': 'content',
            width: 300
          },
          {
            'title': '状态',
            'key': 'status',
            width: 250,
            render: (create, params) => {
              var vm=this,key = params.row.status
              if(key == 1){
                return create('span','已审核')
              }else if(key==2){
                // 有审核的权限展示审核按钮，没权限展示未审核
                return create('span','未通过审核')
              }else{
                var acceptBtn = create('Button',{
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '10px'
                  },
                  on: {
                    click: function(){
                      vm.$Modal.confirm({
                        title: '确认审核',
                        content: '确认此投稿通过审核吗？',
                        onOk: function(){
                          vm.accept(params.row.id,1)
                        }
                      })
                    }
                  }
                },'通过审核')
                var refuseAcceptBtn = create('Button',{
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: function(){
                      vm.$Modal.confirm({
                        title: '确认审核',
                        content: '确认此稿不通过审核吗？',
                        onOk: function(){
                          vm.accept(params.row.id,2)
                        }
                      })
                    }
                  }
                },'不通过审核')
                if(vm.hasPerm('submission:examine')){
                  return create('div',[acceptBtn,refuseAcceptBtn])
                }else{
                  return create('span', '未审核')
                }
              }
            }
          },
          {
            'title': '图片/视频',
            'key': 'fileManageList',
            width: 400,
            render: (create, params) => {
              var vm = this,arr=[],createArr=[]
              var imgSrcArr = vm.getImgsSrc(params.row.fileManageList)
              if(imgSrcArr.length){
                imgSrcArr.forEach(item=>{
                  if(typeof(item)=='object'){
                    arr.push(create('video',{
                      attrs: {
                        loop: true,
                        controls: true,
                        poster: item.poster,
                        class: 'my-video'
                      },
                      style: {
                        'max-width': '350px',
                        'max-height': '250px',
                        'margin': '10px 20px' 
                      }
                    },[
                      create('source',{
                        attrs: {
                          src: item.src,
                          type: 'video/mp4'
                        }
                      })
                    ]))
                  }else{
                    arr.push(create('a',{
                      attrs: {
                        href: item,
                        target: '_blank'
                      },
                    },[create('img',{
                      attrs: {
                        src: item,
                        alt: item
                      },
                      style: {
                        'max-width': '100px',
                        'max-height': '100px',
                        'margin': '10px'
                      }
                    })]))
                  }
                })
                if(imgSrcArr.length>3){
                  var previewBtn = create('Button', {
                    props:{
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
                  }, '预览全部')
                  createArr = [arr[0],arr[1],previewBtn]
                }else{
                  createArr = arr
                }
                return create('div', createArr)
              }else{
                return create('span', '无')
              }
            }
          },
          {
            'title': '创建时间',
            'key': 'createTime',
            width: 200
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('serviceNumber:edit')){
                var disabled = params.row.status == 0 ? false : true
                arr.push(create('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: disabled
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      vm.editRow(params.row)
                    }
                  }
                }, '编辑'))
              }
              if(vm.hasPerm('serviceNumber:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div',arr)
            }
          },
        ],
        rules: {
          serviceNumberId: [
            { required: true, message: '请选择要投稿的服务', trigger: 'change' }
          ],
          content: [
            { required: true, message: '请输入投稿内容', trigger: 'blur' },
            { max: 500, message: '最多个500个字符', trigger: 'blur' }
          ],
        }
      }
    },
    filters: {
      ellipsisFileName(fileName){
        var txt = ''
        if(typeof(fileName) == 'string'){
          txt = fileName + ''
          if(txt.length>15){
            txt =  txt.slice(0,5) + '***' + txt.slice(txt.length-7)
          }
        }else{
          txt =  ''
        }
        return txt
      }
    },
    methods: {
      getImgsSrc(data){
        var vm=this,arr =[],src=''
        if(data&&data.length){
          var imageHost = sessionStorage.imageHost,
            fileType = data[0].fileType,
            filePath = data[0].filePath,
            fileList = data[0].fileList
          if(fileType==1){
            // 图片
            if(fileList.length){
              fileList.forEach(item=>{
                src = imageHost + filePath + item.fileName
                arr.push(src)
              })
            }
          }else if(fileType==2){
            if(fileList.length){
              fileList.forEach(item=>{
                src = imageHost + filePath + item.fileName
                var poster = imageHost + filePath + item.fileVideoImage
                arr.push({
                  poster: poster,
                  src: src
                })
              })
            }
          }
        }
        return arr
      },
      // 审核投稿
      accept(id,status){
        var vm = this
        // type 通过审核1  不通过审核2
        var params = {
          url: vm.url.examine,
          method: 'post',
          data: {
            id: id,
            type: status
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            if(res.data.code==1){
              if(status==1){
                vm.$Message.success('审核成功！')
              }else if(status==2){
                vm.$Message.success('审核不通过成功！')
              }
              vm.paging()
            }else{
              if(status==1){
                vm.$Message.info(res.data.message || '审核失败，请重试')
              }else if(status==2){
                vm.$Message.info(res.data.message || '审核不通过失败，请重试')
              } 
            }
          }
        }).catch(err=>{})
      },
      // 上传图片
      myBeforeUpload(file){
        var vm = this;
        var size = file.size,
          // 因为edge,firefox浏览器选择mp3文件，file.type得值是audio/mpeg
          type = file.type.split('/')[0],
          type2 = file.name.split('.')[file.name.split('.').length-1].toLocaleLowerCase(),
          name = file.name,
          imgMaxSize = vm.imgMaxSize,
          videoMaxSize = vm.videoMaxSize,
          audioMaxSize = vm.audioMaxSize,
          typeErrorTxt = vm.typeErrorTxt,
          imgFormat = vm.postUploadImgFormat,
          videoFormat = vm.postUploadVideoFormat,
          postFormat = vm.postUploadFormat,
          typeIsOk = false,
          sizeIsOK = false
        // 先验证类型，再验证大小  大小的单位为b
        for(let i=0;i<postFormat.length;i++){
          if(type2==postFormat[i]){
            typeIsOk = true
            break
          }
        }
        if(!typeIsOk){
          vm.$Message.error({
            content: typeErrorTxt,
            duration: 3
          })
          return false
        }
        if(type2=='mp4'){
          if(size/1000/1000>videoMaxSize){
            vm.$message.error(`请选择小于${videoMaxSize}Mb的视频进行上传`);
            // vm.$Message.error({
            //   content: `请选择小于${videoMaxSize}Mb的视频进行上传`,
            //   duration: 3
            // })
            return false
          }
        }else if(type2=='mp3'){
          if(size/1000/1000>audioMaxSize){
            vm.$message.error(`请选择小于${audioMaxSize}Mb的音频进行上传`);
            // vm.$Message.error({
            //   content: `请选择小于${audioMaxSize}Mb的音频进行上传`,
            //   duration: 3
            // })
            return false
          }
        }else{
          if(size/1000/1000>imgMaxSize){
            vm.$message.error(`请选择小于${imgMaxSize}Mb的图片进行上传`);
            // vm.$Message.error({
            //   content: `请选择小于${imgMaxSize}Mb的图片进行上传`,
            //   duration: 3
            // })
            return false
          }
        }
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var imgMaxLength = 9
          var item = {
            name: name,
            type: type,
            type2: type2,
            file: file,
            base64: reader.result
          }
          if(type==vm.videoMark){
            vm.fileArr = [item]
          }else if(type==vm.audioMark){
            vm.fileArr = [item]
          }else{
            vm.fileArr.forEach(item=>{
              if(item.type == vm.videoMark || item.type == vm.audioMark){
                vm.fileArr = []
                return
              }
            })
            var len = vm.fileArr.length
            if(len<imgMaxLength){
              vm.fileArr.push(item)
            }else{
              var arr = vm.util.deepcopy(vm.fileArr)
              arr.push(item)
              arr.splice(0,1)
              vm.fileArr = arr
            }
          }
        }
        return false
      },
      myUpload(){
        // 确认上传
        var vm = this
        if(!vm.fileArr.length){
          vm.$Message.error('请先选择要上传的文件！')
          return
        }
        vm.uploadLoading = true
        if(vm.currDialog=='add'&&!vm.formDialog.id){
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
        var uploadArr = []
        uploadArr = vm.fileArr
        // if(vm.currDialog=='add'){
        //   uploadArr = vm.fileArr
        // }else if(vm.currDialog=='edit'){
        //   uploadArr = vm.fileArr.slice(vm.originalLength)
        // }
        uploadArr.forEach(item=>{
          params.append('file',item.file)
        })
        params.append('sId',sId)
        var s = vm.uploadImgSourceMap.service,p=vm.uploadImgPositionMap.service
        params.append('s',s)
        params.append('p',p)
        var config =  {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 20000
        };
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          vm.uploadLoading = false
          let rd = res.data;
          if(rd.code==1){
            vm.fileArr = []
            // vm.$Message.success('上传成功！');
            vm.$message.success('上传成功！');
          }else{
            // vm.$Message.error(rd.message || '上传失败')
            vm.$message.error(rd.message || '上传失败')
          }
        }).catch(err=>{
          vm.uploadLoading = false
        })
      },
      handleRemove(index,data){
        var vm = this
        vm.fileArr.splice(index, 1)
        // if(vm.currDialog == 'add'){
        //   vm.fileArr.splice(index, 1)
        // }else{
        //   // 编辑时有删除可以提交的数据
        //   console.log(data)
        // }
      },
      // 上传图片  end
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
      },
      submitSearch(name){
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
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.uploadLoading = false
        vm.fileArr = []
        vm.formDialog.id = ''
        vm.formDialog.status = 0
        vm.formDialog.content = ''
        vm.$refs[name].resetFields()
      },
      initDialog(data){
        var vm = this
        vm.formDialog.serviceNumberId = Number(data.serviceNumberId)
        if(data.fileManageList.length){
          var fileManageList = data.fileManageList[0],imageHost=sessionStorage.imageHost,fileItem = {},fileArr=[]
          var fileType = fileManageList.fileType,
            filePath = fileManageList.filePath,
            fileList = fileManageList.fileList
          fileList.forEach(item=>{
            var type = vm.imageMark
            if(fileType==1){

            }else if(fileType==2){
              type = vm.videoMark
            }
            fileItem = {
              type: type,
              base64: imageHost + filePath + item.fileName,
              delData: {
                filePath: filePath,
                fileName: item.fileName
              }
            }
            fileArr.push(fileItem)
          })
          vm.originalLength = fileArr.length
          vm.fileArr = fileArr
        }
      },
      initService(){
        var vm = this
        vm.$http(vm.url.all).then(res=>{
          if(res&&res.status==200){
            if(res.data.code==1){
              var serviceNumberId = [],serviceNumberIdMap={}
              res.data.data.forEach(item=>{
                serviceNumberId.push({
                  value: item.id,
                  label: item.name || item.id
                })
                serviceNumberIdMap[item.id] = item.name || item.id
              })
              vm.serviceNumberId = serviceNumberId
              vm.serviceNumberIdMap = serviceNumberIdMap
            }else{
              vm.$Message.info(res.data.message || '服务数据初始化失败，请按F5刷新页面重试')
            }
          }
        })
      },
      changePager (data) {
        let vm = this
        // 切换分页时暂停所有视频的播放
        $('.my-video').trigger('pause')
        var pager = vm.isSearchStatus ? vm.searchPager : vm.pager
        if (typeof data === 'object') {
          for (let key in data) {
            pager[key] = data[key]
          }
        } else {
          pager.current = data
        }
        vm.currentPager = pager
        vm.paging()
      },
      justPlayOneVideo(){
        setTimeout(function(){
          // 只播放一个
          $('.my-video').on('play',function(){
            // 这里边是回调函数
            var videos = $('.my-video')
            var ind = videos.index($(this)),
              _ind=null,
              paused = $(this)[0].paused,
              isPlaying=[]
              for(var i=0;i<videos.length;i++){
                if(!videos[i].paused){
                  isPlaying.push(i)
                }
              }
              _ind = isPlaying.indexOf(ind)
              if(_ind != -1){
                isPlaying.splice(_ind,1)
              }
              isPlaying.forEach(item=>{
                videos.eq(item).trigger('pause')
              })
          })
        },500)
      },
      paging (data) {
        let vm = this,config={}
        // 对象类型的传参为修改此次请求的config;  number类型的传参为翻页翻到第几页
        if(typeof data == 'object'){
          config = data
        }else if (Number(data)) {
          vm.changePager(data)
          return
        }
        var pager = {},method='post',ajaxData = {},params={}
        // 搜索和列表共用分页，通过状态判断是搜索翻页还是列表翻页  点击搜索进入搜索状态，点击清空退出搜索状态
        if(vm.isSearchStatus){
          // 是搜索
          pager = vm.searchPager
          method = pager.method || (typeof(vm.pager.searchMethod) != 'undefined' ? vm.pager.searchMethod : method)
          var _ajaxData = vm.pagingFiltData(pager),_formSearch={},formSearch=vm.formSearch
          for(let key in _ajaxData){
            _formSearch[key] = _ajaxData[key]
          }
          for(let key in formSearch){
            if(formSearch[key] != ''){
              _formSearch[key] = formSearch[key]
            }
          }
          ajaxData = _formSearch
        }else{
          // 不是搜索
          pager = vm.pager
          method = pager.method || method
          ajaxData = vm.pagingFiltData(pager)
        }
        var ajaxData2 = {}
        for(let key in ajaxData){
          if(key != 'current' && key != 'size'){
            ajaxData2[key] = ajaxData[key]
          }
        }
        var ajaxUrl = pager.url + '?current=' + ajaxData['current'] + '&size=' + ajaxData['size']
        params = {
          url: ajaxUrl,
          method: method,
        }
        if(method=='get'){
          params.params = ajaxData2
        }else{
          params.data = ajaxData2
        }
        vm.pageLoading = true
        vm.$http(params).then(res => {
          let resData = res.data,data=[],total=0
          vm.pageLoading = false
          if(resData.records){
            data = resData.records
            total = resData.total
          }else if (resData.code == 1) {
            if(resData.data && typeof(resData.data.records) != 'undefined'){
              data = resData.data.records
              total = resData.data.total
            }else if(resData.data){
              data = resData.data
              total = resData.total
            }
          }
          if(!data)data=[]
          if(!total)total=0
          if (typeof vm.pagerResult == 'function') {
            // 返回数据预处理
            resData.data = vm.pagerResult(data)
          }
          if(typeof vm.initOther == 'function'){
            vm.initOther(data)
          }
          setTimeout(function(){
            pager.total = total
            pager.data = data
            typeof vm.searchPager == 'undefined' ? vm.pager = pager : vm.currentPager = pager
            vm.justPlayOneVideo()
            // vm.pager = pager
            // vm.currentPager = pager
          },50)
        }).catch(err=>{
          vm.pageLoading = false
        })
      },
      initData(){
        this.initService()
      }
    },
    mounted(){
      this.justPlayOneVideo()
    }
  }
</script>
<style scoped>
  .drag-box{
    width: 140px;
    height: 140px;
    float: left;
  }
  .preview-img-container{
    display: block;
    float: left;
    width: 210px;
    height: 210px;
    text-align: center;
    line-height: 210px;
    margin: 10px;
    padding: 10px;
    border: 1px solid #eee;
  }
</style>
