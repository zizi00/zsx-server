<template>
  <div class="post">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
        <template v-if="hasPerm('post_index:search')">

          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <Button v-if="hasPerm('post_index:delete')" type="warning" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete2" size="small">批量状态删除</Button>
        <Button v-if="hasPerm('post_index:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
      </Form>
    </div>

    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="900" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80">
        
      </Form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <!-- 所有的图片 -->
    <Modal v-model="imgShow" title="所有的图片" :mask-closable="false">
      <div class="preview-editor-content clearfix">
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
    name: 'post',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: '',
          delete: 'post/delete', // 物理删除
          statusDelete: 'post/delete/vartual',  // 状态删除
          edit: '',
          search: '',
        },
        pager: {
          // 页面初始化
          url: 'post/dataGrid',
          // 主区域表格数据
          data: [],
        },
        // 搜索表单
        formSearch: {
          
        },
        postStatusMap: {
          '0':"正常",
          '1':"已删除"
        },
        // 新增/编辑表单
        formDialog: {

        },
        imgShow: false,
        imgSrcArr: [],
        batchIdArr: [],
        columns: [
          {
            'type': 'selection',
            'width': 80,
            'fixed': 'left',
            'align': 'center'
          },
          {
            'title': '发帖用户',
            'key': 'userNickName',
            'width': 200,
          },
          {
            'title': '帖子内容',
            'key': 'postContent',
            'width': 400,
          },
          {
            'title': '图片/视频',
            'key': 'fileManageList',
            'width': 400,
            render: (create, params) => {
              var vm=this,arr=[],createArr=[]
              var imgSrcArr = vm.getSrcArr(params.row.fileManageList)
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
              if(imgSrcArr.length){
                if(typeof(imgSrcArr[0])=='object'){
                  // 视频
                }else{
                  // 图片
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
                }
                return create('div', createArr)
              }else{
                return create('span', '无')
              }
            }
          },
          {
            'title': '帖子状态',
            'key': 'postStatus',
            'width': 150,
            'sortable': true,
            render: (create, params) => {
              var vm = this,key = params.row.postStatus,map = vm.postStatusMap,style={}
              var txt = map[key] ? map[key] : key
              if(key==1){
                style = {color: 'red'}
              }
              return create('span',{style},txt)
            }
          },
          {
            'title': '点赞数量',
            'key': 'postThumbCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '收藏数量',
            'key': 'postCollectionCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '评论数量',
            'key': 'postCommentsCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '分享数量',
            'key': 'postTransmitCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '发帖时间',
            'key': 'postTime',
            'width': 150,
            'sortable': true,
            render: (create, params)=>{
              var vm = this,key = params.row.postTime,txt=key
              if(typeof key == 'number'){
                txt = vm.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          {
            'title': '操作',
            'key': 'action',
            'width': 200,
            'align': 'center',
            'fixed': 'right',
            render: (create, params) => {
             let vm = this,arr = [],status = params.row.postStatus
             var statusDeleteBtn = create('Button',{
               props: {
                type: 'warning',
                size: 'small',
                disabled: status==1
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: function(){
                  vm.statusDel(params.row.postId)
                }
              }
             },'状态删除')
              if(vm.hasPerm('post_index:delete')){
                arr = [
                  statusDeleteBtn,
                  vm.createDelBtn(create, params.row.postId)
                ]
              }
              return create('div',arr)
            }
          }
        ],
        rules: {}
      }
    },
    methods: {
      updateSelect (selection) {
        var vm=this,batchIdArr = [],len=selection.length,i,item
        if(len){
          for(i=0;i<len;i++){
            item=selection[i]
            batchIdArr.push(item.postId)
          }
        }
        vm.batchIdArr = batchIdArr
      },
      // 根据fileManageList生成图片或视频的数组
      getSrcArr(data){
        var vm=this,arr =[],src='',obj={}
        if(data&&data.length){
          var imageHost = vm.imageHost || sessionStorage.imageHost,
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
            // 视频
            arr.push({
              
            })
          }
        }
        return arr
      },
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        // vm.submitSearch(name)
        vm.paging(1)
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.$refs[name].resetFields()
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
      statusDel(id){
        var vm = this;
        vm.$Modal.confirm({
          title: '确认',
          content: '确认状态删除此帖子吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.statusDelete,
              data: {
                ids: [id]
              }
            }
            vm.batchoperation(parmas,vm.paging)    
          }
        })
      },
      batchDelete(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些帖子吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.delete,
              data: {
                ids: vm.batchIdArr
              }
            }
            vm.batchoperation(parmas)
          }
        })
      },
      batchDelete2(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认状态删除这些帖子吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.statusDelete,
              data: {
                ids: vm.batchIdArr
              }
            }
            vm.batchoperation(parmas)
          }
        })
      },
      batchoperation(parmas,refresh){
        var vm = this
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success('操作成功');
            vm.batchIdArr = []
            vm.paging()
          }else{
            vm.$Message.error(resData.message);
          }
        }).catch(err=>{})
      },
    }
  }
</script>
<style scoped>
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
