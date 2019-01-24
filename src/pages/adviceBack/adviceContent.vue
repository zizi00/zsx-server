<template>
  <div class="advice-content">
    <!-- <el-form :model="formSearch" ref="formSearch" inline label-width="80px">
      
      <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" size="small">{{label.clear}}</el-button>
      <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" size="small">{{label.search}}</el-button>
      <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</el-button>
    </el-form> -->

    <el-table
      :data="currentPager.data"
      border
      style="width: 100%">
      <el-table-column
        prop="nickName"
        label="反馈用户"
        width="180">
      </el-table-column>
      <el-table-column
        prop="text"
        label="反馈内容 "
        width="180">
      </el-table-column>
      <el-table-column
        prop="contactInformation"
        label="联系方式">
      </el-table-column>
      <el-table-column
        prop="isOk"
        label="是否解决">
        <template slot-scope="scope">
          <span v-if="scope.row.isOk==1">已解决</span>
          <el-button v-else-if="scope.row.isOk==0" @click="resolveFeedback(scope.row.id)" type="primary" size="mini">确认已解决</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间">
      </el-table-column>
      <el-table-column
        prop="action"
        fixed="right"
        label="操作"
        width="250">
        <template slot-scope="scope">
          <el-button v-if="hasPerm('authority_index:edit')" type="primary" @click="editRow(scope.row)" size="mini">编辑</el-button>
          <el-button v-if="hasPerm('authority_index:delete')" type="danger" @click="delBtnClick(scope.row.id)" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>    

    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" width="750px" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="90px">
        
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'adviceContent',
    mixins: [page],
    components: {
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
          changeAd:'web/user/feedback/txt/slove/',
        },
        pager: {
          // 页面初始化
          url: 'web/user/feedback/txt/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get'
        },
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {

        },
        rules: {},
        isOkMap:{
          "0":"未处理",
          "1":"已解决"
        },
      }
    },
    methods: {
      resolveFeedback(id){
        var vm = this
        vm.$confirm('确认该反馈已解决了吗？', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          vm.changeRow(id)
        })
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
      //修改反馈意见的状态
      changeRow(data){
        var vm = this
        vm.$http2({
          url: vm.url.changeAd+data,
          method: vm.pager.method,
          data: data
        }).then(res => {
          var resData = res.data
          if(resData.code==1){
            vm.$message({
              showClose: true,
              type: 'success',
              message: '操作成功！'
            });
            vm.paging()
          }else{
            vm.$message({
              showClose: true,
              type: 'error',
              message: '操作失败！'
            });
          }
        }).catch(err=>{

        })
      },
    },
  }
</script>
<style scoped>

</style>
