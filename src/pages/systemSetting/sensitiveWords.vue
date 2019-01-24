<template>
  <div class="sensitiveWords">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
          <template v-if="hasPerm('sensitiveWords:import')">
            <Upload name="file"
                    :action="url.uploadExcel"
                    accept=".xlsx"
                    :on-success="upExeclSuccess"
                    :format="['xlsx']"
                    :on-format-error="handleFormatError"
                    :show-upload-list="false"
                    style="display:inline-block;float:left;">
              <Button type="primary" size="small" style="margin-top:5px;">{{label.uploadExcel}}</Button>
            </Upload>
          </template>
          <template v-if="hasPerm('sensitiveWords:search')">
            <FormItem label="敏感词">
              <Input v-model="formSearch.word" placeholder="敏感词" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
            </FormItem>
            <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
            <Button type="primary" style="margin: 5px 8px 24px 0;" :disabled='!formSearch.word || pageLoading' @click="submitSearch('formSearch')" size="small">{{label.search}}</Button>
          </template>
          <Button v-if="hasPerm('sensitiveWords:add')" type="error" style="margin: 5px 8px 24px 0;" :disabled="batchIdArr.length==0" @click="batchDelete" size="small">批量删除</Button>
          <Button type="primary" style="margin:5px 8px 24px 0;" @click="refurbish" size="small">敏感词库立即生效</Button>
          <Button v-if="hasPerm('sensitiveWords:delete')" type="primary" style="margin:5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
      </Form>
    </div>

    <!-- <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :height="tableHeight"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :size="pager.size" :page-size-opts="pageSizeOpts"></paging> -->

    <main-table :columns="columns" :data="currentPager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :size="pager.size" :page-size-opts="pageSizeOpts" :loading="pageLoading"></paging>

    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="敏感词" prop="word">
              <Input v-model="formDialog.word" placeholder="请输入敏感词"></Input>
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
    name: 'sensitiveWords',
    components: {
      paging,
      mainTable
    },
    mixins: [page],
    data () {
      return {
        url: {
          add: 'web/sensitive/add',
          edit: 'web/sensitive/update',
          delete: 'web/sensitive/delete',
          search: 'web/sensitive/search',
          refurbish: 'web/sensitive/valid', //词库立即生效
          uploadExcel: process.env.NODE_ENV == 'production' ? 'fwmp/api/web/sensitive/add/excel' : 'api/fwmp/api/web/sensitive/add/excel'
        },
        searchPager: {
          url: 'web/sensitive/search',
          method: 'get'
        },
        pager: {
          data: [],
          url: 'web/sensitive/dataGrid',
          size: 50,
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        // needId: true,
        pageSizeOpts: [50, 100, 150, 200],
        batchIdArr: [],
        formSearch: {
          word: ""
        },
        formDialog: {
          id: '',
          word: ''
        },
        columns: [
          {
            type: 'selection',
            width: 80,
            fixed: 'left',
            align: 'center'
          },
          // {
          //   title: 'ID',
          //   key: 'id',
          //   width: 150,
          // },
          {
            title: '敏感词',
            key: 'word'
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (create, params) => {
              var vm = this,arr=[]
              if(vm.hasPerm('sensitiveWords:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('sensitiveWords:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          }
        ],
        rules: {
          word: [{ required: true, message: '请填写敏感词', trigger: 'blur' }]
        }
      }
    },
    methods: {
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
          method: 'post',
          url: vm.url.delete,
          data: {
            ids: [data.id]
          }
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
      batchoperation(parmas){
        var vm = this
        if(typeof parmas != 'object'){
          vm.$Message.error('传参错误')
          return
        }
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
      resetDialogForm (name) {
        name = name || 'formDialog'
        this.$refs[name].resetFields()
      },
      resetSearch (name) {
        this.formSearch.word = ''
        this.$refs[name].resetFields()
        this.isSearchStatus = false
        this.paging(1)
        // this.submitSearch(name)
      },
      // 敏感词库立即生效
      refurbish () {
        var vm = this
        vm.$http.get(vm.url.refurbish).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success({
              content: '当前词库已生效！',
              duration: 3
            })
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      upExeclSuccess (res) {
        if(res.code==1){
          this.$Message.success("上传成功！")
        }else{
          this.$Message.info(res.message || '上传失败!' + '请确保您上传的Excel文件的第一行第一列的值为name,导入的敏感词均写在第一列内')
        }
      },
      handleFormatError () {
        this.$Message.error('文件格式错误，请选择xlsx格式的文件')
      },
    },
  }
</script>
