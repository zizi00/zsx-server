<template>
  <div class="report">
    <Form :model="formSearch" ref="formSearch" inline :label-width="60">
      
      <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button> -->
      <Button v-if="hasPerm('report_index:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
      <Button v-if="hasPerm('report_index:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
    </Form>
    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <Row>
          <Col span="12">
            <el-form-item label="举报分类" prop="reportClassId">
              <el-select v-model="formDialog.reportClassId" placeholder="请选择" size="small">
                <el-option v-for="item in reportClassId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="举报信息" prop="reportInfo">
              <Input v-model="formDialog.reportInfo" placeholder="请输入举报信息"></Input>
            </el-form-item>
          </Col>
        </Row>
      </el-form>
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
    name: 'report',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/report/add',
          delete: 'web/report/delete',
          edit: 'web/report/update',
          search: '',
          reportClass: 'web/report/class/dataGrid',
        },
        pager: {
          // 页面初始化
          url: 'web/report/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        batchIdArr: [],
        reportClassId: [],
        reportClassIdMap: {},
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          reportClassId: '',
          reportInfo: '',
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
          // },
          {
            'title': '举报分类',
            'key': 'reportClassId',
            render: (create,params)=>{
              var key = params.row.reportClassId,map=this.reportClassIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '举报信息',
            'key': 'reportInfo',
          },
          {
            'title': '创建时间',
            'key': 'createTime',
          },
          {
            'title': '操作',
            'key': 'action',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('report_index:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('report_index:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          },
        ],
        rules: {
          reportClassId: [
            { required: true, message: "请选择举报分类", trigger: "change" }
          ],
          reportInfo: [
            { required: true, message: "举报信息不能为空", trigger: "blur" }
          ],
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
        vm.$refs[name].resetFields()
      },
      delRow(data){
        var vm = this;
        var parmas = {
          method: 'delete',
          url: vm.url.delete + '?ids=' + [data.id],
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
              url: vm.url.delete + '?ids=' + vm.batchIdArr,
            }
            vm.batchoperation(parmas)
          }
        })
      },
      batchoperation(parmas){
        var vm = this
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
      initReportClass(){
        var vm = this
        var params = {
          url: vm.url.reportClass,
          method: 'get'
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var reportClassId=[],reportClassIdMap={},data=res.data.records
            data.forEach(item=>{
              reportClassId.push({
                value: item.id,
                label: item.className || item.id
              })
              reportClassIdMap[item.id] = item.className || item.id
            })
            vm.reportClassId = reportClassId
            vm.reportClassIdMap = reportClassIdMap
          }
        })
      },
      initData(){
        this.initReportClass()
      }
    }
  }
</script>
<style scoped>

</style>
