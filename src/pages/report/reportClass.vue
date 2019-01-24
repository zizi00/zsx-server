<template>
  <div class="report-class">
    <Form :model="formSearch" ref="formSearch" inline :label-width="60">
      
      <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button> -->
      <Button v-if="hasPerm('reportClass:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
    </Form>
    <mainTable :columns="columns" :data="pager.data" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="分类名称" prop="className">
              <Input v-model="formDialog.className" placeholder="请输入分类名称"></Input>
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
    name: 'reportClass',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/report/class/add',
          delete: 'web/report/class/delete/',
          edit: 'web/report/class/update',
          search: '',
        },
        pager: {
          // 页面初始化
          url: 'web/report/class/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
        },
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          className: '',
        },
        columns: [
          {
            'title': 'ID',
            'key': 'id',
          },
          {
            'title': '分类名称',
            'key': 'className',
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
              if(vm.hasPerm('reportClass:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('reportClass:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          },
        ],
        rules: {
          className: [
            { required: true, message: "分类名称不能为空", trigger: "blur" }
          ],
        }
      }
    },
    methods: {
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
          url: vm.url.delete + data.id,
        }
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success('操作成功');
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

</style>
