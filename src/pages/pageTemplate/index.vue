<template>
  <div class="page-template">
    <el-form :model="formSearch" ref="formSearch" inline label-width="60px">
      
      <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.clear}}</el-button>
      <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="mini">{{label.search}}</el-button>
      <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
    </el-form>
    <main-table :columns="columns" :data="pager.data"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging>
    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" width="750px" @closed="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        
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
    name: 'page-template',
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
          delete: '',
          edit: '',
          search: '',
        },
        pager: {
          // 页面初始化
          url: '',
          // 主区域表格数据
          data: [],
        },
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {

        },
        columns: [],
        rules: {}
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
      }
    }
  }
</script>
<style scoped>

</style>
