<template>
  <div class="serviceClassify">
    <div id="search-wrapper">
      <el-form :model="formSearch" ref="formSearch" inline label-width="80px">
        <template v-if="hasPerm('serviceClassify:search')">
          <el-form-item label="分类名称" prop="serviceNumberClassName">
            <el-input v-model="formSearch.serviceNumberClassName" placeholder="服务名称" size="mini" @keydown.native.enter.prevent="submitSearch('formSearch')"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="classStatus">
            <el-select v-model="formSearch.classStatus" placeholder="请选择" filterable size="mini">
              <el-option v-for="item in classStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.clear}}</el-button>
          <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.search}}</el-button>
        </template>
        <el-button v-if="hasPerm('serviceClassify:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
      </el-form>
    </div>
    <main-table :columns="columns" :data="pager.data"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging>
    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" width="750px" @closed="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务分类名称" prop="serviceNumberClassName">
              <el-input v-model="formDialog.serviceNumberClassName" placeholder="请输入分类名称" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类状态" prop="classStatus">
              <el-select v-model="formDialog.classStatus" placeholder="请选择" filterable size="small">
                <el-option v-for="item in classStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
         <!-- 上传图片 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="分类图标">
              <el-row>
                <el-col :span="6">
                  <Upload name="file"
                      :action="url.upload"
                      accept=".jpg,.jpeg,.png,.gif"
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
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading" size="small">{{label.submit}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'serviceClassify',
    mixins: [page],
    components: {
      mainTable,
      paging,
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
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/servicenumber/class/add',
          delete: 'web/servicenumber/class/delete',
          edit: 'web/servicenumber/class/update',
          search: 'web/servicenumber/class/dataGrid',
          upload: 'file/',
          sId: 'id/id',
        },
        pager: {
          // 页面初始化
          url: 'web/servicenumber/class/dataGrid',
          // 主区域表格数据
          data: [],
          editMethod: 'put',
          deleteMethod: 'delete'
        },
        // 搜索表单
        formSearch: {
          serviceNumberClassName: '',
          classStatus: '',
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          serviceNumberClassName: '',
          icon: '',
          classStatus: 0,
        },
        postUploadFormat: ['jpg','jpeg','png','gif'],
        uploadLoading: false,
        postRequiredTxt: '图片小于5Mb',
        fileArr: [],
        videoMark: '',
        audioMark: '',
        classStatus: [
          {
            value: 0,
            label: '正常'
          },
          {
            value: 1,
            label: '失效'
          }
        ],
        classStatusMap: {
          0: '正常',
          1: '失效'
        },
        columns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   fixed: 'left',
          //   width: 180
          // },
          {
            'title': '服务分类名称',
            'key': 'serviceNumberClassName',
            // width: 180
          },
          {
            'title': '服务分类图标',
            'key': 'icon',
            // width: 180,
            render: (create, params) => {
              var icon = params.row.icon,imageHost=sessionStorage.imageHost
              if(typeof(icon) == 'string'){
                var src = icon + ''
                if(icon.indexOf('http') == -1){
                  src = imageHost + icon
                }
                return create('a',{
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
                })])
              }else{
                return create('span', '无')
              }
            }
          },
          {
            'title': '状态',
            'key': 'classStatus',
            // width: 180,
            render: (create, params) => {
              var key = params.row.classStatus,map=this.classStatusMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '创建时间',
            'key': 'createTime',
            // width: 180
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('serviceClassify:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('serviceClassify:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div',arr)
            }
          },
        ],
        rules: {
          serviceNumberClassName: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { max: 30, message: '最多个30字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
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
        if(type){
          type = type.toLocaleLowerCase()
        }else{
          vm.$Message.error('未读取到您选择文件的格式,请重新选择！')
          return false
        }
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
            vm.$Message.error({
              content: `请选择小于${videoMaxSize}Mb的视频进行上传`,
              duration: 3
            })
            return false
          }
        }else if(type2=='mp3'){
          if(size/1000/1000>audioMaxSize){
            vm.$Message.error({
              content: `请选择小于${audioMaxSize}Mb的音频进行上传`,
              duration: 3
            })
            return false
          }
        }else{
          if(size/1000/1000>imgMaxSize){
            vm.$Message.error({
              content: `请选择小于${imgMaxSize}Mb的图片进行上传`,
              duration: 3
            })
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
        if(vm.currDialog=='add'){
          uploadArr = vm.fileArr
        }else if(vm.currDialog=='edit'){
          uploadArr = vm.fileArr.slice(vm.originalLength)
        }
        uploadArr.forEach(item=>{
          if(item.type == vm.videoMark || item.type == vm.audioMark){
            // 可以上传多个音频或视频时需要将此提示移除循环
            // vm.$Message.info('上传音频或视频耗时较长，请耐心等待')
            vm.$message({
              message: '上传音频或视频耗时较长，请耐心等待',
              type: 'success'
            });
          }
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
            vm.formDialog.icon = rd.data[0]
            // vm.$Message.success('上传成功！');
            vm.$message({
              message: '上传成功！',
              type: 'success'
            });
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{
          vm.uploadLoading = false
        })
      },
      handleRemove(index,data){
        var vm = this
        if(vm.currDialog == 'add'){
          vm.fileArr.splice(index, 1)
        }else{
          // 编辑时有删除可以提交的数据
          console.log(data)
        }
      },
      // 上传图片  end
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
      },
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
        console.log('obj: ',obj)
        vm.pager = obj;
        vm.paging(1);
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.formDialog.icon = ''
        vm.formDialog.serviceNumberClassName = ''
        vm.$refs[name].resetFields()
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
        vm.$http(params,config).then(res => {
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
            // vm.pager = pager
            // vm.currentPager = pager
          },50)
        }).catch(err=>{
          vm.pageLoading = false
        })
      },
    }
  }
</script>
<style scoped>

</style>
