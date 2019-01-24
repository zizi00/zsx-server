<template>
  <div class="role">
    <el-form :model="formSearch" ref="formSearch" inline label-width="60px">
      
      <el-button v-if="hasPerm('role:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
    </el-form>
    
    <el-table
      :data="pager.data"
      border
      style="width: 100%">
      <el-table-column
        prop="roleValue"
        label="角色编码"
        width="180">
      </el-table-column>
      <el-table-column
        prop="roleName"
        label="角色名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="roleDesc"
        label="角色描述">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间">
      </el-table-column>
      <el-table-column
        prop="modifyTime"
        label="修改时间">
      </el-table-column>
      <el-table-column
        prop="action"
        fixed="right"
        label="操作"
        width="250">
        <template slot-scope="scope">
          <el-button v-if="hasPerm('role:perm')" type="success" @click="previewPerm(scope.row.id)" size="mini">权限</el-button>
          <el-button v-if="hasPerm('role:edit')" type="primary" @click="editRow(scope.row)" size="mini">编辑</el-button>
          <el-button v-if="hasPerm('role:delete')" type="danger" @click="delBtnClick(scope.row.id)" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>

    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" width="750px" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="roleValue">
              <el-input :disabled="currDialog=='edit'" v-model="formDialog.roleValue" placeholder="请输入角色值" size="small"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="formDialog.roleName" placeholder="请输入角色名称" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="formDialog.roleDesc" placeholder="请输入角色描述" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')" size="small">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading" size="small">{{label.submit}}</el-button>
      </div>
    </el-dialog>

    <!-- 查看权限 -->
    <el-dialog :visible.sync="permShow" title="权限" width="500px" top="50px" @closed="resetPerm">
      <div>
        <el-checkbox :indeterminate="indeterminate" v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
      </div>
      <el-tree
        :data="permTreeData"
        show-checkbox
        node-key="id"
        ref="permTree"
        @check-change="permCheckChange"
        highlight-current>
      </el-tree>
      <div slot="footer">
        <el-button @click="resetPerm()" size="small">清空</el-button>
        <el-button type="primary" @click="submitPerm()" size="small" :loading="permSubmitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'role',
    mixins: [page],
    components: {
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/sys/role/add',
          delete: 'web/sys/role/delete',
          edit: 'web/sys/role/update',
          search: '',
          allRole: 'web/sys/role/dataAllGrid',
          // 根据角色id查权限
          perm: 'web/sys/role/perm/searchByRole',
          // 角色修改该权限 传选中的id数组，后端会先删除角色的权限，再新增此次传的所有id的权限
          addPerm: 'web/sys/role/perm/add',
          allPerm: 'web/sys/perm/dataAllGrid',
        },
        pager: {
          // 页面初始化
          url: 'web/sys/role/dataGrid',
          // 主区域表格数据
          data: [],
          method: 'get',
          addMethod: 'post',
          editMethod: 'post',
          deleteMethod: 'delete',
        },
        currRoleId: '',
        // 权限选择
        allPermIds: [],
        // 所有父级的id
        allParentIds: [],
        checkAll: false,
        indeterminate: false,
        permsArr: [], //选中的权限id数组
        permTreeData: [],
        permSubmitLoading:false,
        // 权限选择end
        needId: true,
        permShow: false,
        allPermData: [],
        permMap: {
          add: '添加',
          edit: '编辑',
          delete: '删除',
          search: '搜索',
          dataGrid: '列表',
        },
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {
          id: '',
          roleName: ''
        },
        role: [],
        roleMap: {},
        rules: {
          roleName: [
            { required: true, message: "角色名称不能为空", trigger: "blur" }
          ],
          roleValue: [
            { required: true, message: "角色值不能为空", trigger: "blur" }
          ]
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
      // 全选权限
      handleCheckAll(val){
        var vm = this
        if(val){
          vm.$refs['permTree'].setCheckedKeys(vm.allPermIds)
          vm.permsArr = vm.allPermIds
          vm.checkAll = true
        }else{
          vm.$refs['permTree'].setCheckedKeys([])
          vm.permsArr = []
          vm.checkAll = false
        }
        vm.indeterminate = false
      },
      // 查看权限
      previewPerm(id){
        var vm=this
        vm.currRoleId=id;
        var params = {
          url: vm.url.perm,
          method: 'post',
          data:{
            id: id
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.data){
            var resData = res.data
            if(resData.code==1){
              vm.permShow = true
              var data = resData.data,arr=[]
              data.forEach(item=>{
                if(typeof item.permId != 'undefined'){
                  arr.push(item.permId)
                }
              })
              var len = arr.length,len2=vm.allPermIds.length
              if(len==len2){
                vm.checkAll = true
                vm.indeterminate = false
              }else if(len==0){
                vm.checkAll = false
                vm.indeterminate = false
              }else{
                vm.checkAll = false
                vm.indeterminate = true
              }
              // 因为返回的数组中提交的数组中含有父菜单的id，在这里设置选中状态时需要将父级的去掉，否则状态为全部选中
              var arr2 = []
              arr.forEach(function(item){
                // id不在父级中时才设置
                if(vm.allParentIds.indexOf(item)==-1){
                  arr2.push(item)
                }
              })
              setTimeout(function(){
                vm.$refs['permTree'].setCheckedKeys(arr2)
                vm.permsArr = arr
              },50)
            }
          }
        })
      },
      // 权限选择变化
      permCheckChange(){
        var vm = this,arr=[],arr2=[]
        arr = vm.$refs['permTree'].getCheckedKeys()
        arr2 = vm.$refs['permTree'].getHalfCheckedKeys()
        var all = arr.concat(arr2)
        vm.permsArr = all
        var len = all.length,len2=vm.allPermIds.length
        if(len==len2){
          vm.checkAll = true
          vm.indeterminate = false
        }else if(len==0){
          vm.checkAll = false
          vm.indeterminate = false
        }else{
          vm.checkAll = false
          vm.indeterminate = true
        }
      },
      resetPerm(){
        var vm = this
        vm.permsArr = []
        vm.$refs['permTree'].setCheckedKeys([])
      },
      // 提交选中权限
      submitPerm(){
        var vm = this
        var ajaxData = {
          roleId: vm.currRoleId,
          permIds: vm.permsArr
        }
        var params = {
          url: vm.url.addPerm,
          method: 'post',
          data: ajaxData
        }
        vm.permSubmitLoading = true
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var resData = res.data
            if(resData.code==1){
              vm.permSubmitLoading = false
              vm.permShow = false
              vm.$message({
                showClose: true,
                type: 'success',
                message: '权限修改成功！'
              });
            }
          }
        })
      },
      initOther(data){
        if(!data) return
        var vm = this
        var item,len=data.length,i,role=[],roleMap={},arr=[]
        for(i=0;i<len;i++){
          item = data[i]
          arr.push(item.roleValue)
        }
        arr = Array.from(new Set(arr))
        for(i=0;i<arr.length;i++){
          role.push({
            value: arr[i],
            label: arr[i]
          })
        }
        // 对相同的value值怎么去处理
        vm.role = role
        // vm.roleMap = roleMap
      },
      resultPermData(data){
        var vm = this,arr=[],map={},parentMenuArr=[],childrenMenuArr=[],otherArr=[],allPermIds=[],allParentIds=[],treeItem={}
        // permType 1  菜单  2  按钮
        data.forEach(item=>{
          allPermIds.push(item.id)
          treeItem = {
            id: item.id,
            permValue: item.permValue,
            permName: item.permName,
            title:item.permName,
            // label:item.permName + item.id,
            label:item.permName,
            parentValue: item.parentValue,
            parentName: item.parentName,
            children: []
          }
          if(item.permType==1){
            if(item.isLeaf==0){
              parentMenuArr.push(treeItem)
            }else{
              childrenMenuArr.push(treeItem)
            }
            allParentIds.push(item.id)
          }else{
            otherArr.push(treeItem)
          }
        })
        var treeData = [],treeChildrenData=[]
        childrenMenuArr.forEach(item=>{
          otherArr.forEach(child=>{
            if(child.parentValue==item.permValue){
              item.children.push(child)
            }
          })
        })
        parentMenuArr.forEach(item=>{
          childrenMenuArr.forEach(child=>{
            if(child.parentValue==item.permValue){
              item.children.push(child)
            }
          })
        })
        vm.allParentIds = allParentIds
        vm.allPermIds = allPermIds
        vm.permTreeData = parentMenuArr
      },
      initAllPerm(){
        var vm = this
        var params = {
          url: vm.url.allPerm,
          method: 'get'
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            var resData = res.data
            if(resData.code==1){
              var allPermData = resData.data
              vm.allPermData = allPermData
              vm.resultPermData(allPermData)
            }
          }
        })
      },
      initData(){
        this.initAllPerm()
      }
    }
  }
</script>
<style scoped>

</style>
