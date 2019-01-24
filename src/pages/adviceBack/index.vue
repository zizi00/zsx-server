<template>
  <div class="adviceBack">
    <div id="search-wrapper">
      <el-form :model="formSearch" ref="formSearch" inline label-width="70px">
          
        <el-button v-if="hasPerm('adviceBack_index:delete')" type="danger" style="margin: 5px 8px 24px 0" :disabled="batchIdArr.length==0" @click="batchDel" size="mini">批量删除</el-button>
        <el-button v-if="hasPerm('adviceBack_index:add')" type="primary" style="margin:5px 8px 24px 0;" @click="addRow()" size="mini">{{label.add}}</el-button>
        <el-button type="primary" style="margin:5px 8px 24px 0;" @click="initEcahrs(defaultEchartsData)" size="mini">重置图表</el-button>
      </el-form>
    </div>
    
    <div class="advice-content-wrapper">
      <div style="width: 500px;">
        <!-- <Tree 
          :data="pageTreeData" 
          show-checkbox 
          multiple 
          :load-data="loadData" 
          @on-select-change="treeSelectChange" 
          @on-check-change="treeCheckChange" 
          :multiple="false"></Tree> -->
        <el-tree
          :data="pageTreeData"
          show-checkbox
          node-key="id"
          ref="permTree"
          lazy
          :load="loadData"
          @check-change="treeCheckChange"
          @node-click="treeSelectChange"
          highlight-current>
        </el-tree>
      </div>
      <div class="my-echarts-wrapper">
        <div v-if="!myEcharts" style="text-align: center;">意见反馈统计图</div>
        <div id="my-echarts" style="height:600px;"></div>
      </div>
    </div>

    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" :mask-closable="false" width="750px" @closed="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="90px">
        <el-row>
          <el-col span="12">
            <el-form-item label="模块名称" prop="text">
              <el-input v-model="formDialog.text" size="small" placeholder="请输入模块名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col span="12">
            <el-form-item label="父级" prop="parentId">
              <el-select v-model="formDialog.parentId" placeholder="请选择/输入关键字搜索" filterable>
                <el-option v-for="item in parentId" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="12">
            <el-form-item label="是否跳转" prop="isSkip">
              <el-select v-model="formDialog.isSkip" placeholder="请选择">
                <el-option v-for="item in isSkip" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formDialog.status" placeholder="请选择">
                <el-option v-for="item in status" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="formDialog.isSkip==1">
          <el-col span="12">
            <el-form-item label="跳转方式" prop="skipType">
              <el-select v-model="formDialog.skipType" placeholder="请选择">
                <el-option v-for="item in skipType" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col span="12">
            <el-form-item label="跳转URL" prop="skipUrl">
              <el-input v-model="formDialog.skipUrl" size="small" placeholder="请输入跳转URL"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')" size="small">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" size="small" :loading="dialogSubmitLoading">{{label.submit}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import page from "@/mixins/page";
export default {
  name: "adviceBack_index",
  mixins: [page],
  data() {
    return {
      url: {
        add: "feedback/add",
        edit: "feedback/update",
        delete: "feedback/delete",
        search: "feedback/dataSearch",
        all: 'feedback/dataGrid',
        count: 'web/user/feedback/count/statistics',
        getCountByParentId: 'web/user/feedback/count/parent/'
      },
      myEcharts: null,
      defaultEchartsData: [],
      noPaging: true,
      initialData: [],
      pageTreeData: [],
      pager: {
        data: [],
        url: "feedback/parent"
      },
      parentId: [],
      parentIdMap: {},
      status: [
        {
          value: "0",
          label: "启用"
        },
        {
          value: "1",
          label: "禁用"
        }
      ],
      statusMap: {
        "0": "启用",
        "1": "禁用"
      },
      isSkip: [
        {
          value: "0",
          label: "否"
        },
        {
          value: "1",
          label: "是"
        }
      ],
      isSkipMap: {
        "1": "是",
        "0": "否"
      },
      skipType: [
        {
          value: "0",
          label: "内部"
        },
        {
          value: "1",
          label: "外部"
        }
      ],
      skipTypeMap: {
        "0": "内部",
        "1": "外部"
      },
      batchIdArr: [],
      formSearch: {
        st: "",
        et: "",
        key: "",
        phone: "",
        userId: ""
      },
      formDialog: {
        id: "",
        text: "",
        parentId: '0', //  上一级
        status: "0", // 0 起用  1禁用
        isSkip: "1", //是否可以跳转  0否   1 是
        skipType: "", //  0  内部   1外部
        skipUrl: "" //  跳转路径
      },
      rules: {
        text: [{ required: true, message: "模块名称不能为空", trigger: "blur" }]
      }
    };
  },
  methods: {
    addRow (id) {
      this.currDialog = 'add'
      this.dialogShow = true
      if(typeof(id) != 'undefined'){
        id = id.toString()
        this.formDialog.parentId = id
      }
    },
    paging() {
      var vm = this;
      var pager = vm.pager;
      var method = pager.method;
      var params = {
        url: pager.url,
        method: method
      };
      var ajaxData = {
        id: 0
      };
      if (method == "get") {
        params.params = ajaxData;
      } else {
        params.data = ajaxData;
      }
      vm.$http2(params).then(res => {
        let resData = res.data;
        if (resData.code == 1) {
          pager.data = resData.data;
          if (typeof vm.initOther == "function") {
            vm.initOther(resData.data);
          }
        }
      }).catch(err => {});
    },
    initOther(data) {
      var vm = this;
      var _data = vm.util.deepcopy(data),
        pageTreeData = [],
        item = {},
        key;
      for (var i = 0; i < _data.length; i++) {
        item = _data[i];
        item.label = item.text || item.id;
        item.children = [];
        item['render-content'] = vm.treeRowRender
        pageTreeData.push(item);
      }
      vm.pageTreeData = pageTreeData;
      vm.initialData = _data;
    },
    // 树形
    loadData(item, callback) {
      console.log('item: ',item)
      var vm = this;
      var id = item.id,
        checked = item.checked;
      var pager = vm.pager,
        ajaxData = {
          id: id || 0
        };
      var method = pager.method;
      var params = {
        url: pager.url,
        method: method
      };
      if (method == "get") {
        params.params = ajaxData;
      } else {
        params.data = ajaxData;
      }
      vm.$http2(params).then(res => {
        let resData = res.data;
        if (resData.code == 1) {
          var childrenData = resData.data,
            key,
            item,
            i,
            _data = [],
            arr = [];
          var len = childrenData.length;
          if (len) {
            for (i = 0; i < childrenData.length; i++) {
              item = childrenData[i];
              item.label = item.text || item.id;
              item.children = [];
              item['render-content'] = vm.treeRowRender
              if (checked) {
                arr.push(item.id);
              }
              item.loading = false;
              _data.push(item);
            }
            vm.batchIdArr = vm.batchIdArr.concat(arr);
          } else {
            vm.$message({
              showClose: true,
              message: '没有子集了'
            });
          }
          callback(_data);
        }
      }).catch(err => {});
    },
    treeSelectChange(data) {
      if (data.length) {
        this.editRow(data[0]);
      }
    },
    treeCheckChange(data) {
      var vm = this,
        arr = [],
        len = data.length,
        i,
        item;
      for (i = 0; i < len; i++) {
        item = data[i];
        arr.push(item.id);
      }
      vm.batchIdArr = arr;
    },
    initEcharts(id,txt){
      var vm = this
      var params = {
        url: vm.url.getCountByParentId + id,
        method: 'get'
      }
      vm.$http(params).then(res=>{
        if(res&&res.status==200){
          var resData = res.data
          if(resData.code==1){
            var echartsData = resData.data.children,total=resData.data.value
            if(total){
              vm.initEcahrs(echartsData,txt)
            }else{
              vm.$message({
                showClose: true,
                message: txt + '暂无数据'
              });
            }
          }else{
            vm.$message({
              showClose: true,
              message: resData.message || '暂无数据'
            });
          }
        }
      })
    },
    treeRowRender(h, { node, data, store }) {
      var vm = this,arr=[]
      var addBtn = h("el-button", {
        props: {
          icon: "el-icon-circle-plus",
          type: "primary",
          size: 'mini',
        },
        style: {
          width: "52px",
          marginRight: '10px'
        },
        on: {
          click: () => {
            vm.addRow(data.id);
          }
        }
      })
      var editBtn = h("el-button", {
        props: {
          icon: "el-icon-remove",
          type: "primary",
          size: 'mini',
        },
        style: {
          width: "52px",
          marginRight: '10px'
        },
        on: {
          click: () => {
            vm.editRow(data);
          }
        }
      })
      var deleteBtn = h("el-button", {
        props: {
          icon: "el-icon-circle-close",
          type: "danger",
          size: 'mini',
        },
        style: {
          width: "52px",
          marginRight: '10px'
        },
        on: {
          click: () => {
            vm.$confirm('确认删除这条数据吗？', '确认', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              vm.delRow(data)
            })
          }
        }
      })
      if(vm.hasPerm('adviceBack_index:add')){
        arr.push(addBtn)
      }
      if(vm.hasPerm('adviceBack_index:edit')){
        arr.push(editBtn)
      }
      if(vm.hasPerm('adviceBack_index:delete')){
        arr.push(deleteBtn)
      }
      return h("span",
        [
          h('el-button',{
            props: {
              type: "text",
              size: 'small',
            },
            on: {
                click: () => {
                  vm.initEcharts(data.id,data.title)
                }
              }
          },data.label),
          h("span",{
            style: {
              float: 'right'
            }
          },arr)
        ]
      );
    },
    // 树形  end
    resetSearch(name) {
      this.$refs[name].resetFields();
      this.paging(1);
    },
    initDialog(data) {
      var vm = this;
      if (typeof data.status == "number") {
        // data.status = data.status.toString();
        vm.formDialog.status = data.status.toString()
      }
      if (typeof data.isSkip == "number") {
        // data.isSkip = data.isSkip.toString();
        vm.formDialog.isSkip = data.isSkip.toString()
      }
      if (typeof data.skipType == "number") {
        // data.skipType = data.skipType.toString();
        vm.formDialog.skipType = data.skipType.toString()
      }
      if (typeof data.parentId == "number") {
        // data.parentId = data.parentId.toString();
        vm.formDialog.parentId = data.parentId.toString()
      }
    },
    resetDialogForm(name) {
      name = name || "formDialog";
      let vm = this;
      vm.formDialog.parentId = ''
      vm.$refs[name].resetFields();
    },
    // 批量操作
    batchoperation(parmas) {
      var vm = this;
      parmas.method = parmas.method || "post";
      vm.$http2(parmas).then(res => {
        var resData = res.data;
        if (resData.code == 1) {
          vm.$message({
            showClose: true,
            type: 'success',
            message: '操作成功'
          });
          vm.batchIdArr = [];
          vm.paging();
        } else {
          vm.$message({
            showClose: true,
            type: 'error',
            message: resData.message || '操作失败'
          });
        }
      }).catch(err => {});
    },
    delRow(data) {
      var vm = this;
      var parmas = {
        method: "post",
        url: vm.url.delete,
        data: {
          ids: [data.id]
        }
      };
      vm.batchoperation(parmas);
    },
    batchDel() {
      var vm = this;
      vm.$Modal.confirm({
        title: "确认",
        content: "确认删除这些数据吗？",
        onOk: function() {
          var parmas = {
            method: "post",
            url: vm.url.delete,
            data: {
              ids: vm.batchIdArr
            }
          };
          vm.batchoperation(parmas);
        }
      });
    },
    initEcahrs(data,txt){
      var vm = this
      var xData=[],_txt=txt||'锵锵意见反馈统计图'
      data.forEach(item=>{
        xData.push(item.name)
      })
      var option = {
          title: {
            text: _txt,
            left: "center",
            top: '20px',
            textStyle: {
              fontSize: 14,
              align: 'center'
            },
          },
          xAxis: {
            data: xData,
          },
          yAxis: {
            show: true,
            minInterval: 1
          },
          tooltip: {
          trigger: "item"
        },
        series: [
          {
            name: '反馈数量',
            type: 'bar',  
            roam: true,
            left: 'center',
            top: 'center',
            label: {  
              normal: {  
                show: true,
              },  
              emphasis: {  
                show: false  
              }  
            },
            data:data  //数据
          },
        ],
      };
      if(!vm.myEcharts){
        vm.$nextTick(function(){
          var dom = document.getElementById("my-echarts");
          var myChart = echarts.init(dom);
          myChart.on('click',function(params){
            var _data = params.data.children
            if(_data.length){
              vm.initEcahrs(_data, params.data.name)
            }else{
              vm.$message({
                showClose: true,
                message: '没有子集了'
              });
            }
          });
          window.addEventListener("resize", function () {
              myChart.resize();
          });
          myChart.setOption(option, true);
          vm.myEcharts = myChart
        })
      }else{
        vm.myEcharts.setOption(option, true)
      }
    },
    initAllAdviceBack(){
      var vm = this
      vm.$http.post(vm.url.all).then(res=>{
        var resData = res.data
        if(resData.code==1){
          var data = resData.data,i,item,arr=[{value: '0',label: '顶级菜单'}],map={'0': '顶级菜单'}
          for(i=0;i<data.length;i++){
            item=data[i]
            map[item.id] = item.text
          }
          for(i=0;i<data.length;i++){
            item=data[i]
            arr.push({
              value: item.id.toString(),
              label: item.parentId == 0 ? item.text : map[item.parentId] + ' > ' + item.text
            })
          }
          vm.parentId = arr
          vm.parentIdMap = map
        }
      }).catch(err=>{})
    },
    initCount(){
      var vm = this
      vm.$http.get(vm.url.count).then(res=>{
        if(res&&res.data){
          var resData = res.data
          if(resData.code == 1){
            vm.defaultEchartsData = resData.data
            vm.initEcahrs(resData.data)
          }else{
            vm.$message({
              showClose: true,
              message: resData.message
            });
          }
        }
      })
    },
    initData(){
      this.initAllAdviceBack()
      this.initCount()
    }
  },
  watch: {
    ["formDialog.isSkip"](val) {
      this.formDialog.skipType = "";
      this.formDialog.skipUrl = "";
    }
  }
};
</script>

<style scoped>
.advice-content-wrapper{
  position: relative;
}
.my-echarts-wrapper{
  position: absolute;
  left: 500px;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
