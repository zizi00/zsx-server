const deepcopy = function (source) {
  if (!source) {
    return source;
  }
  let sourceCopy = source instanceof Array ? [] : {};
  for (let item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
  }
  return sourceCopy;
}
const page = {
  data: function () {
    return {
      // 百度富文本默认配置
      myConfig: {
        // 百度配置
        // UEDITOR_HOME_URL: 'static/third-party/ueditor/',
        // 135配置
        UEDITOR_HOME_URL: 'static/third-party/135/js/',
        initialFrameWidth: null,
        initialFrameHeight: 300,
        // 指定富文本支持的文字大小
        fontsize: [10, 11, 12, 14, 16, 17, 18, 19, 20, 24, 36],
        autoFloatEnabled:false,//是否保持toolbar位置不变
        enableAutoSave: true,
        // 阻止div自动转换为p
        allowDivTransToP: false,
        lang:"zh-cn"
      },
      imgServer: 'web/server/get',
      addressServer: 'area/areas',
      imageHost: sessionStorage.imageHost || '',
      uploadImgSourceMap: {
        user: 1,    //  用户
        post: 2,    //  帖子
        ad: 3,      //  广告
        news: 4,    //  新闻
        service: 5  //  服务号
      },
      uploadImgPositionMap: {
        userHead: 1,          //  用户头像
        postList: 2,          //  帖子列表
        postReply: 3,         //  帖子回复
        createGroupHead: 4,   //  创建群头像
        editGroupHead: 5,     //  编辑群头像
        ad: 6,                //  广告
        systemNotice: 7,      //  系统通知
        news: 8,              //  新闻
        userReport: 9,        //  用户举报
        serviceBg: 10,        //  服务号背景图
        service: 11           //  服务号
      },
      // 表格高度
      tableHeight: '',
      // 当前操作是新增还是编辑
      currDialog: 'add',
      // 主弹出框的显示隐藏
      dialogShow: false,
      // 主弹出框是否正在提交数据
      dialogSubmitLoading: false,
      // 删除行的key
      delRowKey: 'id',
      // 需不需要传id
      needId: false,
      // 新增时不需要传的key数组
      notNeedKeys: [],
      // 按钮文字map
      label: {
        'edit': '编辑',
        'add': '添加',
        'clear': '清空',
        'submit': '提交',
        'delete': '删除',
        'search': '搜索',
        'debugging': '调试',
        'sure': '确定',
        'close': '关闭',
        'cancle': '取消',
        'uploadImg': '上传图片',
        'uploadExcel': '导入Excel',
        'clearCache': '清除缓存',
        'wait': '功能正在研发中，请稍后,谢谢...',
        'getError': '获取失败，请刷新重试或联系开发人员',
      },
      mixinPager: {
        'url': '',
        'current': 1,
        'method': 'post',
        'size': 10,
        'total': 0,
        'data': [],
      },
      mixinSearchPager: {
        'url': '',
        'current': 1,
        'method': 'post',
        'size': 10,
        'total': 0,
        'data': [],
      },
      // 是否处于搜索状态
      isSearchStatus: false,
      currentPager: {},
      map: {
        'sex': {
          '1': '男',
          '2': '女',
          '3': '保密'
        },
        'userType': {
          '1': '管理员',
          '2': '用户'
        },
        'status': {
          '1': '正常',
          '2': '停用'
        },
        'openClose': {
          '1': '打开',
          '2': '关闭'
        }
      },
      defaultUploadImgSrc: "static/images/img-upload-default.png",
      imgRequiredTxt: '单张图片大小小于3Mb；图片尺寸可大于规定尺寸，但是比例必须按照规定尺寸的比例；banner图长宽要求750*422，其他地方只上传一张图片：长宽要求690*345；上传三张图片：主图长宽要求456*344,两张次级图片：长宽要求222*166;上传3张图片时要求第一张作为主图，后两张作为次级图片',
      imgRequiredSize: {
        banner: {
          width: 750,
          height: 422
        },
        one: {
          width: 690,
          height: 345
        },
        main: {
          width: 456,
          height: 344
        },
        secondary: {
          width: 222,
          height: 166
        }
      },
      requiredSize: {
        banner: '750 * 422',
        one: '690 * 345',
        main: '456 * 344',
        secondary: '222 * 166',
      },
      imgUploadFormat: ['jpg','jpeg','png','gif'],
      typeErrorTxt: '请选择jpg、jpeg、png或gif格式的文件',
      pageLoading: false,
      // 裁剪
      cropperDialogShow: false,
      cropperImgSrc: '',
      myCropper: null,
      which: '',
      selfWidth: 100,
      selfHeight: 50,
      useSelf: false, // 使用自定义宽高
      // 裁剪  end
    }
  },
  methods: {
    getValByMap(key, map){
      var txt = ''
      txt = map[key] ? map[key] : key
      return txt
    },
    getImageUrl(url){
      var str = ''
      if(url){
        if(url.indexOf('http') == -1){
          str = sessionStorage.imageHost + url
        }else{
          str = '' + url
        }
      }
      return str
    },
    hasPerm(permStr){
      // 关闭权限
      // return true
      if(typeof permStr != 'string')return false
      var vm=this,str = '' + permStr,has=false
      // 处理中文冒号
      if(str.indexOf('：') != -1){
        str = str.replace(/：/g,':')
      }
      var _str = vm.util.trimArray(str.split(':')).join(':')
      var permissionList = vm.$store.state.permissionList
      if(permissionList.indexOf(_str) != -1){
        has = true
      }
      return has
    },
    // 清除缓存
    clearCache(txt){
      var vm = this
      var _txt = typeof(txt) == 'string' ? txt : ''
      var params = {
        url: vm.url.clearCache,
        method: 'get'
      }
      vm.$http(params).then(res=>{
        if(res&&res.status==200){
          if(res.data.code==1){
            vm.$message({
              showClose: true,
              type: 'success',
              message: _txt + '缓存清除成功'
            });
          }else{
            vm.$message({
              showClose: true,
              message: res.data.message || '清除失败，请稍后再试'
            });
          }
        }
      })
    },
     // 裁剪
     resetCropperDialog(){
      var vm = this
      vm.cropperDialogShow = false
      vm.cropperImgSrc = ''
      vm.resetCropper()
    },
    beforeUpload(file){
      var vm = this,fileType = file.type.split('/')[1]
      if(fileType&&vm.imgUploadFormat.indexOf(fileType) != -1){
        vm.resetCropper()
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          vm.cropperImgSrc = reader.result
        }
      }else{
        vm.$message({
          showClose: true,
          message: vm.typeErrorTxt
        });
      }
      return false
    },
    setProportion(){
      var vm = this
      if(vm.selfWidth&&vm.selfHeight){
        vm.useSelf = true
        var proportion = vm.selfWidth / vm.selfHeight
        vm.initCropper('',proportion)
      }else{
        vm.$message({
          showClose: true,
          message: '使用自定义比例时，请设置有效的宽高值'
        });
      }
    },
    // 初始化裁剪插件
    initCropper(which,self){
      var vm = this,proportion=''
      which = which
      vm.which = which
      var aspectRatio = {
        banner: 750 / 422,
        one: 690 / 345,
        main: 456 / 344,
        secondary: 222 / 166
      }
      if(self){
        // 比例
        proportion = self
        vm.useSelf = true
      }else{
        proportion = aspectRatio[which]
        vm.useSelf = false
      }
      if(vm.myCropper){
        vm.myCropper.cropper('destroy').cropper({aspectRatio: proportion});
      }else{
        vm.myCropper =  $("#myImg").cropper({
          aspectRatio: proportion,
          crop: function(event) {}
        })
      }
    },
    resetCropper(){
      var vm = this
      if(vm.myCropper){
        vm.myCropper.cropper('destroy')
        vm.which = ''
        vm.cropperImgSrc = ''
        vm.useSelf = false
      }
    },
    resetCropper2(){
      var vm = this
      if(vm.myCropper){
        vm.myCropper.cropper('destroy')
        vm.which = ''
        vm.useSelf = false
      }
    },
    // 确定裁剪
    beSureCropper(){
      var vm = this
      if(!vm.myCropper){
        vm.$message({
          showClose: true,
          message: '请先选择要生成什么图片'
        });
        return
      }
      var requiredSize = vm.requiredSize,which=vm.which,width=0,height=0
      if(vm.useSelf){
        width = vm.selfWidth
        height = vm.selfHeight
      }else{
        if(requiredSize[which]){
          width = Number(requiredSize[which].split('*')[0])
          height = Number(requiredSize[which].split('*')[1])
        }else{
          vm.$message({
            showClose: true,
            message: '请先选择要生成什么图片'
          });
          return
        }
      }
      // var imgData =  vm.myCropper.cropper('getCroppedCanvas',{width:width,height:height}).toDataURL('image/jpeg', 0.7)
      var imgData =  vm.myCropper.cropper('getCroppedCanvas',{width:width,height:height}).toDataURL('image/png')
      var fileName = "file" + Math.random().toString().slice(-10) + '.png'
      var file = vm.util.dataURLtoFile(imgData,fileName)
      var imgTestResult = vm.imgTest(file)
      if(!imgTestResult.code){
        vm.$message({
          showClose: true,
          type: 'error',
          message: '您裁剪后的图片不符合要求'
        });
      }else{
        vm.myBeforeUpload(file)
        vm.resetCropper()
      }
    },
    // 裁剪  end
    // 添加行
    addRow () {
      this.currDialog = 'add'
      this.dialogShow = true
    },
    // 搜索提交
    submitSearch () {
      let vm = this
      vm.isSearchStatus=true
      vm.paging(1)
    },
    // 新增/编辑主弹出框的提交
    submitDialogForm (name) {
      let vm = this
      vm.$refs[name].validate(function (valid) {
        if (valid) {
          if (vm.initPostDialog) {
            vm.initPostDialog(vm.formDialog)
          }
          var pager = vm.pager,currDialog=vm.currDialog
          let ajaxUrl = vm.url[currDialog]
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
            vm.dialogSubmitLoading = false
          })
        }
      })
    },
    // 更新页面的数据
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
      params = {
        url: pager.url,
        method: method,
      }
      if(method=='get'){
        params.params = ajaxData
      }else{
        params.data = ajaxData
      }
      vm.pageLoading = true
      vm.$http2(params,config).then(res => {
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
    // 分页改变
    changePager (data) {
      let vm = this
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
    // 过滤提交的数据
    pagingFiltData(object) {
      let obj = deepcopy(object)
      for (let key in obj) {
        if (typeof obj[key] === 'string' && obj[key].trim() === '') {
          delete obj[key]
        }
      }
      if (typeof obj.data != 'undefined') {
        delete obj.data
      }
      if (typeof obj.url != 'undefined') {
        delete obj.url
      }
      if (typeof obj.method != 'undefined') {
        delete obj.method
      }
      if (typeof obj.total != 'undefined') {
        delete obj.total
      }
      if (typeof obj.addMethod != 'undefined') {
        delete obj.addMethod
      }
      if (typeof obj.deleteMethod != 'undefined') {
        delete obj.deleteMethod
      }
      if (typeof obj.editMethod != 'undefined') {
        delete obj.editMethod
      }
      if (typeof obj.searchMethod != 'undefined') {
        delete obj.searchMethod
      }
      return obj
    },
    // 新增时不提交id
    editAddAjaxData (currDialog) {
      let vm = this
      let ajaxData = {},notNeedKeys = vm.notNeedKeys
      // var _id=vm.formDialog.id
      var len = notNeedKeys.length,item
      if (currDialog === 'add' && !vm.needId) {
        for (let key in vm.formDialog) {
          if (key != 'id') {
            ajaxData[key] = vm.formDialog[key]
          }
        }
        for(let i=0;i<len;i++){
          item = notNeedKeys[i]
          if(typeof ajaxData[item] != 'undefined'){
            delete ajaxData[item]
          }
        }
      }else{
        for (let key in vm.formDialog) {
          // 不对id的数据类型进行转换：数字类型的ID超过16位就会出现后两位四舍五入的问题
          ajaxData[key] = vm.formDialog[key]
          // if(key=='id'&&!isNaN(Number(_id))){
          //   ajaxData[key] = Number(_id)
          // }else{
          //   ajaxData[key] = vm.formDialog[key]
          // }
        }
      }
      return ajaxData
    },
    // 创建自定义按钮
    createBtn(create,params,txt){
      var createParams={},defaultParams = {
        props: {
          type: 'primary',
          size: 'small'
        },
        style: {
          marginRight: '5px'
        },
      }
      for(var key in params){
        createParams[key] = params[key]
      }
      createParams.props = typeof(params.props) != 'undefined' ? params.props : defaultParams.props
      createParams.style = typeof(params.style) != 'undefined' ? params.style : defaultParams.style
      return create('Button',createParams,txt)
    },
    // 创建编辑按钮
    createEditBtn (create, data, callback) {
      let vm = this
      return create('Button', {
        props: {
          type: 'primary',
          size: 'small'
        },
        style: {
          marginRight: '5px'
        },
        on: {
          click: () => {
            if(typeof callback == 'function'){
              callback(data)
            }else{
              vm.editRow(data)
            }
          }
        }
      }, '编辑')
    },
    editRow (data) {
      let vm = this
      let _data = {}
      for (let key in vm.formDialog) {
        _data[key] = data[key]
      }
      vm.formDialog = _data
      // initDialog不得改变原始数据
      if (typeof vm.initDialog === 'function') {
        vm.initDialog(data)
      }
      vm.currDialog = 'edit'
      vm.dialogShow = true
    },
    // 创建删除按钮
    createDelBtn (create, data, callback) {
      let vm = this
      return create('Button', {
        props: {
          type: 'error',
          size: 'small'
        },
        on: {
          click: () => {
            vm.$Modal.confirm({
              title: '确认',
              content: '确认删除这条数据吗？',
              onOk: function () {
                let idObj = {}
                let key = vm.delRowKey || id
                let idData = null
                if (typeof data === 'object' && typeof vm.delResult === 'function'){
                  idData = vm.delResult(data)
                } else if (typeof data === 'string' || typeof data === 'number') {
                  idData = data
                }
                idObj[key] = idData
                if(typeof callback == 'function'){
                  callback(idObj)
                }else{
                  vm.delRow(idObj)
                }
              }
            })
          }
        }
      }, '删除')
    },
    // 点击删除按钮
    delBtnClick(id,callback){
      var vm = this
      vm.$confirm('确认删除这条数据吗？', '确认').then(() => {
        var obj = {
          id: id
        }
        if(typeof callback == 'function'){
          callback(obj)
        }else{
          vm.delRow(obj)
        }
      })
    },
    delRow (data) {
      var vm = this
      var deleteMethod = vm.pager.deleteMethod
      var method = deleteMethod ? deleteMethod : (vm.pager.addMethod ? vm.pager.addMethod : vm.pager.method)
      var params = {
        url: vm.url.delete,
        method: method
      }
      if(method=='get' || method=='delete'){
        params.params = data
      }else{
        params.data = data
      }
      vm.$http2(params).then(res => {
        var resData = res.data
        if(resData.code==1){
          vm.$message({
            showClose: true,
            type: 'success',
            message: '删除成功！'
          });
          vm.paging()
        }else{
          vm.$message({
            showClose: true,
            type: 'error',
            message: resData.message || '删除失败！'
          });
        }
      }).catch(err=>{

      })
    },
    // 创建预览按钮
    createPreviewBtn(create, data, callback){
      let vm = this
      return create('Button', {
        props: {
          type: 'success',
          size: 'small'
        },
        style: {
          marginRight: '5px'
        },
        on: {
          click: () => {
            if(typeof callback == 'function'){
              callback(data)
            }else{
              vm.$message({
                showClose: true,
                type: 'error',
                message: '预览请传回调函数'
              });
            }
          }
        }
      }, '预览')
    },
    // 初始化pager   组件中pager的键覆盖mixinPager的键
    initPager () {
      let vm = this
      let pager = deepcopy(vm.pager)
      let mixinPager = deepcopy(vm.mixinPager)
      for(let key in pager) {
        mixinPager[key] = pager[key]
      }
      var searchPager = deepcopy(vm.searchPager) || {}
      var mixinSearchPager = vm.mixinSearchPager
      for(let key in searchPager){
        mixinSearchPager[key] = searchPager[key]
      }
      vm.searchPager = mixinSearchPager
      vm.pager = mixinPager
      // 默认是刷新列表的pager
      vm.currentPager = mixinPager
    },
    initImageHost(){
      var vm = this
      var imageHost = sessionStorage.imageHost
      if(!imageHost){
        vm.$http({
          url: vm.imgServer,
          method: 'get'
        }).then(res=>{
          sessionStorage.imageHost = res.data
          vm.imageHost = res.data
        }).catch(error=>{})
      }
    },
    initChinaDataAndJson(){
      var vm = this
      if (!sessionStorage.chinaJson || !sessionStorage.chinaData) {
        vm.$http.post(vm.addressServer).then(res => {
          if(!res){
            vm.$message({
              showClose: true,
              type: 'error',
              message: '省市区基础数据获取失败，请在需要使用前按F5刷新页面重试'
            });
          }else{
            var resData = res && res.data
            if(resData.code==1){
              let chinaData = resData.data
              let chinaJson = vm.util.getChinaJsonByData(chinaData)
              sessionStorage.chinaJson = JSON.stringify(chinaJson)
              sessionStorage.chinaData = JSON.stringify(chinaData)
            }
          }
        })
      }
    },
    initTableHeight(){
      // 目前翻页时会有无法滚动的bug，需要点一下切换每页显示数量的地方才能滚动（不需要切换每页显示的数量）
      var vm = this
      var formSearch = document.getElementById('search-wrapper'),
        single = document.getElementById('single-box')
      if(formSearch&&single){
        var h = single.offsetHeight,
          _h = formSearch.offsetHeight
          // 62 分页高度   25 父容器上下边距
        var noPaging = vm.noPaging
        var tableHeight = noPaging ? h - _h -25 : h - 62 - _h -25
        vm.tableHeight = tableHeight
      }
    }
  },
  watch: {
    dialogShow(val){
      if(!val && typeof this.resetDialogForm == 'function'){
        this.resetDialogForm()
      }
    }
  },
  created () {
    let vm = this
    if (typeof vm.initData === 'function') {
      vm.initData()
    }
    // 在这里修改pager会触发一次页面加载函数，所以不需要在下边再请求一次
    // 为什么dev的时候有时候会不进行数据初始化
    vm.initPager()
    vm.paging()
    vm.initImageHost()
    vm.initChinaDataAndJson()
  },
  mounted(){
    window.addEventListener('resize', this.initTableHeight)
    this.initTableHeight()
  }
}
export default page