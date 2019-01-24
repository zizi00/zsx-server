<template>
  <div class="chicken-soup">
    <Form :model="formSearch" ref="formSearch" inline :label-width="70">
      <template v-if="hasPerm('chickenSoup:search')">
        <FormItem label="心语分类" prop="className">
          <Select v-model="formSearch.className" placeholder="请选择心语分类"  clearable style="width:160px;">
            <Option v-for="item in classId" :value="item.label" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" size="small" :disabled="!formSearch.className || pageLoading">{{label.search}}</Button>
      </template>
      <Button v-if="hasPerm('chickenSoup:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
      <Button v-if="hasPerm('chickenSoup:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
      <Button v-if="hasPerm('chickenSoup:classify')" type="primary" style="margin: 5px 8px 24px 0;" @click="classifyLoading=true;classifyPaging();classifyShow=true;" :loading="classifyLoading" size="small">简报心语分类</Button>
    </Form>
    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <Row>
          <Col span="12">
            <el-form-item label="心语分类" prop="classId">
              <el-select v-model="formDialog.classId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in classId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <el-form-item label="心语内容" prop="content">
              <el-input v-model="formDialog.content" type="textarea" :rows="7" placeholder="请输入心语内容"></el-input>
            </el-form-item>
          </Col>
        </Row>
      </el-form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 简报分类 -->
    <Modal v-model="classifyShow" title="简报分类" :mask-closable="false" width="750">
      <Form :model="classifyFormSearch" ref="classifyFormSearch" :rules="rules" :label-width="60">
        <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetClassifySearch('classifyFormSearch')" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitClassifySearch('classifyFormSearch')" size="small">{{label.search}}</Button> -->
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="addClassify" size="small">{{label.add}}</Button>
        <Button type="error" :disabled="batchClassifyIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchClassifyDelete" size="small">批量删除</Button>
      </Form>
      <mainTable :columns="classifyColumns" :data="classifyPager.data" @updateSelect="updateSelectClassify"></mainTable>
      <paging @changePager="classifyChangePager" @paging="classifyPaging" :total="classifyPager.total" :current="classifyPager.current"></paging>
      <div slot="footer">
        <Button type="primary" @click="classifyShow=false">{{label.close}}</Button>
      </div>
    </Modal>
    <Modal v-model="classifyFormShow" :title="'简报分类' + label[currClassifyDialog]" :mask-closable="false" @on-cancel="resetClassifyDialogForm('classifyDialog')">
      <Form :model="classifyDialog" ref="classifyDialog" :rules="rules" :label-width="80">
        <FormItem label="分类名称" prop="name">
          <Input v-model="classifyDialog.name" placeholder="请输入分类名称"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="resetClassifyDialogForm('classifyDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitClassifyDialogForm('classifyDialog')" :loading="classifySubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'chickenSoup',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/utterance/add',
          delete: 'web/utterance/delete',
          edit: 'web/utterance/update',
          search: 'web/utterance/search',
          classify: {
            add: 'web/utterance/class/add',
            delete: 'web/utterance/class/delete',
            edit: 'web/utterance/class/update',
            search: '',
          }
        },
        pager: {
          // 页面初始化
          url: 'web/utterance/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        classifyPager: {
          url: 'web/utterance/class/dataGrid',
          data: [],
          method: 'get',
          current: 1,
          size: 10,
          total: 0,
        },
        // 简报分类选择框数据
        classId: [],
        classIdMap: {},
        classifyShow: false,
        classifyFormShow: false,
        classifySubmitLoading: false,
        currClassifyDialog: 'add',
        classifyDialog: {
          id: '',
          name: ''
        },
        batchIdArr: [],
        batchClassifyIdArr: [],
        classifyLoading: false,
        classifyFormSearch: {},
        // 搜索表单
        formSearch: {
          className: ''
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          classId: '',
          content: '',
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
          //   'width': 200,
          // },
          {
            'title': '心语分类',
            'key': 'classId',
            'width': 200,
            'sortable': true,
            render: (create, params) => {
              var key = params.row.classId,map=this.classIdMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '心语内容',
            'key': 'content',
            // 'width': 200,
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr = []
              if(vm.hasPerm('chickenSoup:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('chickenSoup:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div',arr)
            }
          }
        ],
        classifyColumns: [
          {
            type: 'selection',
            width: 80,
            fixed: 'left',
            align: 'center'
          },
          {
            title: 'ID',
            key: 'id',
          },
          {
            title: '分类名称',
            key: 'name',
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this
              var arr = [
                vm.createBtn(create,{
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: function(){
                      vm.classifyEditRow(params.row)
                    }
                  }
                },vm.label.edit),
                vm.createBtn(create,{
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: function(){
                      vm.classifyDeleteRow(params.row.id)
                    }
                  }
                },vm.label.delete),
              ]
              return create('div',arr)
            }
          }
        ],
        rules: {
          classId: [
            { required: true, message: '请选择心语分类', trigger: 'change' },
          ],
          content: [
            { required: true, message: '心语内容不能为空', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '心语分类名称不能为空', trigger: 'blur' },
          ]
        }
      }
    },
    methods: {
      updateSelect(selection){
        var vm=this,batchIdArr = [],len=selection.length,i,item
        if(len){
          for(i=0;i<len;i++){
            item=selection[i]
            batchIdArr.push(item.id)
          }
        }
        vm.batchIdArr = batchIdArr
      },
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
        vm.paging(1)
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.$refs[name].resetFields()
      },
      delRow(data){
        var vm = this
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
      batchoperation(parmas,paging){
        var vm = this
        parmas.method = parmas.method || 'post'
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success('操作成功');
            if(typeof(paging)=='function'){
              paging()
            }else{
              vm.paging()
              vm.batchIdArr=[]
            }
          }else{
            vm.$Message.error(resData.message);
          }
        }).catch(err=>{})
      },
      // 心语分类
      updateSelectClassify(selection){
        var vm = this,arr=[],i,item,len=selection.length
        if(len){
          for(i=0;i<len;i++){
            item=selection[i]
            arr.push(item.id)
          }
        }
        vm.batchClassifyIdArr = arr
      },
      classifyChangePager (data) {
        let vm = this
        var pager = vm.classifyPager
        if (typeof data === 'object') {
          for (let key in data) {
            pager[key] = data[key]
          }
        } else {
          pager.current = data
        }
        vm.classifyPaging()
      },
      classifyPaging(current){
        let vm = this
        if (current && Number(current)) {
          vm.classifyChangePager(current)
          return
        }
        var pager = vm.classifyPager
        var method = pager.method
        var params = {
          url: pager.url,
          method: method,
        }
        if(method=='get'){
          params.params = vm.pagingFiltData(pager)
        }else{
          params.data = vm.pagingFiltData(pager)
        }
        vm.$http2(params).then(res => {
          let resData = res.data
          if (resData.code == 1) {
            vm.classifyLoading = false
            pager.data = resData.data
            pager.total = resData.total
            vm.updateClassId(resData.data)
          }
        }).catch(err=>{})
      },
      batchClassifyDelete(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些数据吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.classify.delete,
              data: {
                ids: vm.batchClassifyIdArr
              }
            }
            vm.batchoperation(parmas,vm.classifyPaging)
          }
        })
      },
      addClassify(){
        this.currClassifyDialog = 'add'
        this.classifyFormShow = true
      },
      classifyEditRow(data){
        var vm=this,obj={}
        for(var key in vm.classifyDialog){
          obj[key] = data[key]
        }
        vm.classifyDialog = obj
        vm.currClassifyDialog = 'edit'
        vm.classifyFormShow = true
      },
      classifyDeleteRow(id){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些数据吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.classify.delete,
              data: {
                ids: id
              }
            }
            vm.batchoperation(parmas,vm.classifyPaging)
          }
        })
      },
      resetClassifySearch(name){},
      submitClassifySearch(name){},
      resetClassifyDialogForm(name){
        name = name || 'classifyDialog'
        this.$refs[name].resetFields()
      },
      submitClassifyDialogForm(name){
        var vm=this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            var currDialog = vm.currClassifyDialog,_ajaxData={}
            // let ajaxData = vm.editAddAjaxData(currDialog)
            for(let key in vm.classifyDialog){
              if(currDialog=='add'&&key=='id'){
                continue
              }
              _ajaxData[key] = vm.classifyDialog[key]
            }
            let ajaxData = _ajaxData
            let ajaxUrl = vm.url.classify[currDialog]
            var method = 'post'
            vm.classifySubmitLoading = true
            var params = {
              url: ajaxUrl,
              method: method,
            }
            if(method=='post'){
              params.data = ajaxData
            }else if(method=='get'){
              params.params = ajaxData
            }
            vm.$http(params).then(res => {
              vm.classifySubmitLoading = false
              var resData = res.data
              if(resData.code==1){
                vm.$Message.success(vm.label[vm.currDialog]+'成功!')
                vm.classifyPaging();
                vm.classifyFormShow = false
                vm.resetClassifyDialogForm(name)
              }else{
                vm.$Message.error(vm.label[vm.currDialog]+'失败: ' + resData.message)
              }
            }).catch(err=>{
      
            })
          }
        })
      },
      // 心语分类  end
      updateClassId(data){
        var vm=this,i,item,classId=[],classIdMap={},len=data.length
        if(len){
          for(i=0;i<len;i++){
            item = data[i]
            classId.push({
              value: item.id,
              label: item.name
            })
            classIdMap[item.id] = item.name
          }
        }
        vm.classId = classId,vm.classIdMap = classIdMap
      },
      initData(){
        this.classifyPaging()
      },
    }
  }
</script>
<style scoped>

</style>
