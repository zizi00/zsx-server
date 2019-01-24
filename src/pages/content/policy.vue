<template>
  <div class="policy">
    <!-- 高级搜索 -->
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
        <template v-if="hasPerm('policy:search')">
          <FormItem label="标题" prop="title">
            <Input v-model="formSearch.title" placeholder="标题" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <!-- <FormItem label="关联地区">
            <Cascader :data="derail_address_arr" v-model="derail_address_obj_s" filterable size="small" style="margin-top: 5px;"></Cascader>
          </FormItem>
          <FormItem label="状态" prop="status">
            <Select v-model="formSearch.status" placeholder="请选择" style="width: 80px;" size="small" clearable>
              <Option value="0">未发布</Option>
              <Option value="1">已发布</Option>
            </Select>
          </FormItem> -->
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <Button v-if="hasPerm('policy:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <Button v-if="hasPerm('policy:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
        <Button v-if="hasPerm('policy:clearCache')" type="warning" style="margin: 5px 8px 24px 0;" @click="clearCache('招商')" size="small">{{label.clearCache}}</Button>
      </Form>
    </div>

    <!-- <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :height="tableHeight"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :currPage="pager.currPage"></paging> -->

    <main-table :columns="columns" :data="currentPager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :loading="pageLoading"></paging>

    <!-- 弹出框 -->
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="950" @on-cancel="resetDialogForm('formDialog')" :styles="{top:'25px'}">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80" style="max-width: 900px;">
        <Row>
          <Col span="12">
            <FormItem label="标题" prop="title">
              <Input v-model="formDialog.title" placeholder="请输入标题"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="所属地区">
              <Cascader :data="derail_address_arr" v-model="derail_address_obj_sub" @on-change="subAddrChange" filterable style="margin-top: 5px"></Cascader>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="招商来源" prop="policySoucre">
              <Input v-model="formDialog.policySoucre" placeholder="请输入政策来源"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="来源地址" prop="sourceUrl">
              <Input v-model="formDialog.sourceUrl" placeholder="请输入来源地址URL"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="招商时间" prop="policyDate">
              <DatePicker type="date" v-model="formDialog.policyDate" @on-change='policyDateChange' :editable="false" placeholder="请选择日期" transfer></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="时间规则" prop="dateRule">
              <Input v-model="formDialog.dateRule" placeholder="请输入时间规则"></Input>
            </FormItem>
          </Col>
        </Row>
        <!-- 上传图片 -->
        <Row>
          <Col span="12">
            <FormItem label="图片" prop="image">
              <Row>
                <Col span="12">
                  <div v-if="fileUrl.length" class="image-box">
                    <img :src="fileUrl[0]" class="ad-img">
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemove"></Icon>
                    </div>
                  </div>
                  <div v-else class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
                <Col span="12" style="text-align:right;">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload"
                      accept=".jpg,.jpeg,.png,.gif"
                      :format="['jpg','jpeg','png','gif']"
                      :on-format-error="handleFormatError"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize">
                    <Button type="default" icon="ios-cloud-upload-outline">选择图片</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">确定上传</Button>
                </Col>
              </Row>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="状态" prop="status">
              <Select v-model="formDialog.status" placeholder="请选择招商状态" clearable style="width: 150px;">
                <Option value="0">未发布</Option>
                <Option value="1">已发布</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <FormItem label="内容" prop="content">
              <ueditor v-model="formDialog.content" :config="myConfig"></ueditor>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 预览 -->
    <Modal v-model="previewModal" title="预览" id="preview-modal" :styles="{top:'50px'}" width="850" @on-cancel="resetPreview">
    	<Row>
    		<Col span="24" class="title">招商基本信息:</Col>
    	</Row>
    	<Row :gutter="16" class-name="preview-row">
        <Col span="12">标题:  {{previewData.title}}</Col>
        <Col span="12" id="preview-image">
          <span>图片:   </span>
          <template v-if="previewData.image">
            <img :src="previewData.image">
          </template>
          <span v-else>无</span>
        </Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
        <Col span="12">来源地址:  <a :href="previewData.sourceUrl" target="_blank">{{previewData.sourceUrl}}</a></Col>
        <Col span="12">所属地区:  {{previewData.provinceCityarea}}</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
        <Col span="12">政策来源:  {{previewData.policySoucre}}</Col>
        <Col span="12">政策时间:  {{previewData.policyDate}}</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row" style="border-bottom: .5px solid #e9eaec;padding-bottom: 5px;">
        <Col span="12">时间规则:  {{previewData.dateRule}}</Col>
        <Col span="12">状态:  {{previewData.status}}</Col>
      </Row>  
      <Row class-name="preview-row">
        <Col span="24">
          <div class="title">招商内容:</div>
          <div class="preview-txt" v-html="previewData.content"></div>
        </Col>
      </Row>      
    	<div slot="footer">            
        <Button type="primary" @click="resetPreview">{{label.close}}</Button>
      </div>
	  </Modal>
  </div>
</template>

<script>
import mainTable from "@/components/mainTable";
import paging from "@/components/paging";
import page from "@/mixins/page";
import ueditor from '@/components/ueditor'
export default {
  name: "policy_index",
  components: {
    mainTable,
    paging,
    ueditor
  },
  mixins: [page],
  data: function() {
    return {
      url: {
        add: "web/policy/add",
        edit: "web/policy/update",
        delete: "web/policy/delete",
        search: "web/policy/search",
        upload: "file/",
        sId: "id/id",
        imgServer: "web/server/get",
        clearCache: 'web/cache/policy'
      },
      needId: true,
      pager: {
        url: "web/policy/dataGrid",
        data: [],
        method: "get",
        addMethod: "post",
        editMethod: 'post',
      },
      searchPager: {
        url: 'web/policy/search',
        method: 'get',
      },
      previewModal: false,
      previewData: {},
      chinaJson: {},
      derail_address_arr: [],
      derail_address_obj_sub: [],
      derail_address_obj_s: [],
      batchIdArr: [],
      // 上传图片
      fileUrl: [],
      uploadImgArr: [],
      uploadLoading: false,
      // imageHost: "",
      formSearch: {
        title: ""
        // status: '',
        // areaId: ''
      },
      formDialog: {
        id: "",
        title: "",
        provinceId: "",
        image: "",
        cityId: "",
        areaId: "",
        content: "", // 富文本内容
        sourceUrl: "",
        policySoucre: "",
        policyDate: "",
        dateRule: "",
        status: ""
      },
      columns: [
        {
          type: "selection",
          width: 80,
          align: "center",
          fixed: "left"
        },
        {
          title: "标题",
          key: "title",
          width: 200,
          sortable: true
        },
        {
          title: "图片",
          key: "image",
          width: 120,
          render: (create, params) => {
            var url=params.row.image,imageHost=this.imageHost || sessionStorage.imageHost;
            if (!url) {
              return create("span", "无");
            } else {
              if (url.indexOf("http") == -1) {
                url = imageHost + url;
              }
              return create('a',{
                attrs: {
                  href: url,
                  target: '_blank'
                },
              },[create("img", {
                style: {
                  maxWidth: "100px",
                  maxHeight: "120px",
                  margin: "10px"
                },
                attrs: {
                  src: url,
                  alt: url
                }
              })]);
            }
          }
        },
        {
          title: "所属区域",
          key: "detailsAddress",
          width: 280,
          sortable: true,
          render: (create, params) => {
            var vm = this,
              arr = [],
              provinceId = params.row.provinceId,
              cityId = params.row.cityId,
              areaId = params.row.areaId;
            if (areaId) {
              arr = [provinceId, cityId, areaId];
            } else if (cityId) {
              arr = [provinceId, cityId];
            } else if (areaId) {
              arr = [areaId];
            }
            var txt = vm.util.getProvinceCityArea(arr, vm.chinaJson, true);
            txt = txt ? txt : "无";
            return create("span", txt);
          }
        },
        {
          title: "政策来源",
          key: "policySoucre",
          width: 120,
          sortable: true
        },
        {
          title: "来源地址",
          key: "sourceUrl",
          width: 250,
          render: (create, params) => {
            var vm = this;
            return create(
              "a",
              {
                style: {},
                attrs: {
                  href: params.row.sourceUrl,
                  target: "_blank"
                }
              },
              params.row.sourceUrl
            );
          }
        },
        {
          title: "政策时间",
          key: "policyDate",
          width: 180,
          sortable: true
        },
        {
          title: "时间规则",
          key: "dateRule",
          width: 180,
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          width: 120,
          render: function(create, params) {
            var map = {
              0: "未发布",
              1: "已发布"
            };
            return create("span", map[params.row.status]);
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 180,
          sortable: true
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          align: "center",
          fixed: "right",
          render: (create, params) => {
            var vm = this,arr=[];
            var previewBtn = create(
              "Button",
              {
                props: { type: "success", size: "small" },
                style: { marginRight: "5px" },
                on: {
                  click: function() {
                    vm.preview(params.row);
                  }
                }
              },
              "预览"
            )
            if(vm.hasPerm('policy:preview')){
              arr.push(previewBtn)
            }
            if(vm.hasPerm('policy:edit')){
              arr.push(vm.createEditBtn(create, params.row))
            }
            if(vm.hasPerm('policy:delete')){
              arr.push(vm.createDelBtn(create, params.row.id))
            }
            return create("div", arr)
          }
        }
      ],
      rules: {
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        policySoucre: [
          { required: true, message: "招商来源不能为空", trigger: "blur" }
        ],
        sourceUrl: [
          { required: true, message: "来源地址不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    updateSelect(selection) {
      var vm = this,
        batchIdArr = [],
        len = selection.length,
        i,
        item;
      if (len) {
        for (i = 0; i < len; i++) {
          item = selection[i];
          batchIdArr.push(item.id);
        }
      }
      vm.batchIdArr = batchIdArr;
    },
    // 上传图片
    myBeforeUpload(file) {
      var vm = this;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function(e) {
        vm.fileUrl = [reader.result];
        vm.uploadImgArr = [file];
      };
      return false;
    },
    handleFormatError() {
      this.$Message.error("文件格式错误，请选择jpg,jpeg或png格式的文件");
    },
    handleMaxSize() {},
    myUpload() {
      // 确认上传
      var vm = this;
      if (!vm.uploadImgArr.length) {
        vm.$Message.error("请先选择上传的图片");
        return;
      }
      vm.uploadLoading = true;
      if (vm.currDialog == "add" && !vm.formDialog.id) {
        vm.$http
          .post(vm.url.sId)
          .then(res => {
            var resData = res.data;
            if (resData.code == 1) {
              var sId = resData.data;
              vm.formDialog.id = sId;
              vm.uploadFile(sId);
            }
          })
          .catch(err => {});
      } else {
        var sId = vm.formDialog.id;
        vm.uploadFile(sId);
      }
    },
    uploadFile(sId, userId) {
      var vm = this;
      let params = new FormData();
      vm.uploadImgArr.forEach(file => {
        params.append("file", file);
      });
      params.append("sId", sId);
      // s  1:用户 2:帖子 3:广告 4:新闻 
      params.append("s", 3);
      // p  1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 6:广告 7:系统通知 8:新闻 
      params.append("p", 6);
      var config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      var systemUserId = null
      if(sessionStorage.sysUser){
        systemUserId = JSON.parse(sessionStorage.sysUser).id
      }
      userId = userId || systemUserId || sId
      vm.$http
        .post(vm.url.upload + userId, params, config)
        .then(res => {
          let resData = res.data;
          if (resData.code == 1) {
            // 清空已上传数组
            vm.uploadImgArr = [];
            vm.fileUrl = [];
            vm.$Message.success("上传图片成功！");
            vm.formDialog.image = resData.data[0] || "";
            vm.uploadLoading = false;
          } else {
            vm.$Message.error(resData.message);
          }
        })
        .catch(err => {});
    },
    handleRemove() {
      var vm = this;
      vm.fileUrl = [];
      vm.uploadImgArr = [];
      vm.formDialog.image = "";
    },
    // 上传图片  end
    submitDialogForm(name) {
      let vm = this;
      vm.$refs[name].validate(function(valid) {
        if (valid) {
          if(!vm.derail_address_obj_sub.length){
            vm.$Message.info('请选择所属地区')
            return
          }
          var currDialog = vm.currDialog,pager=vm.pager
          let ajaxUrl = vm.url[currDialog];
          var method =  pager.method
          if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
            method = pager.addMethod
          }
          if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
            method = pager.editMethod
          }
          vm.dialogSubmitLoading = true;
          var params = {
            url: ajaxUrl,
            method: method
          };
          let ajaxData = vm.editAddAjaxData(vm.currDialog);
          var id = ajaxData.id;
          if (vm.currDialog == "add" && !id) {
            vm.$http.post(vm.url.sId).then(res => {
              var resData = res.data;
              if (resData.code == 1) {
                var sId = resData.data;
                ajaxData.id = sId;
                if (method == "post") {
                  params.data = ajaxData;
                } else if (method == "get") {
                  params.params = ajaxData;
                }
                vm.selfSubmit(params);
              }
            });
          } else {
            if (method == "post") {
              params.data = ajaxData;
            } else if (method == "get") {
              params.params = ajaxData;
            }
            vm.selfSubmit(params);
          }
        }
      });
    },
    selfSubmit(params) {
      var vm = this;
      vm
        .$http(params)
        .then(res => {
          vm.dialogSubmitLoading = false;
          var resData = res.data;
          if (resData.code == 1) {
            vm.$Message.success(vm.label[vm.currDialog] + "成功!");
            vm.paging();
            vm.dialogShow = false;
            if (typeof vm.resetDialogForm == "function") {
              vm.resetDialogForm();
            }
          } else {
            vm.$Message.error(
              vm.label[vm.currDialog] + "失败: " + resData.message
            );
          }
        })
        .catch(err => {});
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
    batchDelete() {
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
    batchoperation(parmas, paging) {
      var vm = this;
      parmas.method = parmas.method || "post";
      vm
        .$http2(parmas)
        .then(res => {
          var resData = res.data;
          // 现在成功直接返回true
          if (resData) {
            vm.$Message.success("操作成功");
            if (typeof paging == "function") {
              paging();
            } else {
              vm.paging();
            }
            vm.batchIdArr = [];
          } else {
            vm.$Message.error("请求错误");
          }
          return;
          if (resData.code == 1) {
            vm.$Message.success("操作成功");
            vm.paging();
          } else {
            vm.$Message.error(resData.message);
          }
        })
        .catch(err => {});
    },
    policyDateChange(date) {
      this.formDialog.policyDate = date;
    },
    resetDialogForm(name) {
      name = name || "formDialog";
      let vm = this;
      vm.formDialog.image = "";
      vm.formDialog.id = "";
      vm.formDialog.content = "";
      vm.derail_address_obj_sub = [];
      vm.uploadLoading = false;
      vm.fileUrl = [];
      vm.uploadImgArr = [];
      vm.$refs[name].resetFields();
    },
    resetSearch(name) {
      let vm = this;
      vm.$refs[name].resetFields();
      vm.derail_address_obj_s = [];
      // vm.submitSearch(name)
      vm.paging(1);
    },
    subAddrChange(value) {
      var vm = this;
      vm.formDialog.provinceId = value[0];
      vm.formDialog.cityId = value[1];
      vm.formDialog.areaId = value[2];
    },
    resetPreview() {
      this.previewModal = false;
      this.previewData = {};
    },
    preview: function(data) {
      var vm = this,
        provinceId = data.provinceId,
        cityId = data.cityId,
        areaId = data.areaId,
        arr = [];
      var _data = vm.util.deepcopy(data);
      if (_data.status == "0") {
        _data.status = "未发布";
      } else {
        _data.status = "已发布";
      }
      if (areaId) {
        arr = [provinceId, cityId, areaId];
      } else if (cityId) {
        arr = [provinceId, cityId];
      } else if (provinceId) {
        arr = [provinceId];
      }
      var txt = vm.util.getProvinceCityArea(arr, vm.chinaJson, true);
      _data.provinceCityarea = txt ? txt : "无";
      _data.image = (_data.image.indexOf('http') != -1) ? _data.image : (vm.imageHost + _data.image)
      vm.previewData = _data;
      vm.previewModal = true;
    },
    updateContent(content) {
      this.formDialog.content = content;
    },
    initDialog(data) {
      let vm = this,
        provinceId = data.provinceId,
        cityId = data.cityId,
        areaId = data.areaId,
        arr = [];
      if (areaId) {
        arr = [provinceId, cityId, areaId];
      } else if (cityId) {
        arr = [provinceId, cityId];
      } else if (provinceId) {
        arr = [provinceId];
      }
      var url = data.image;
      if (url) {
        if (url.indexOf("http") == -1) {
          url = vm.imageHost + url;
        }
        vm.fileUrl = [url];
      }
      vm.derail_address_obj_sub = arr;
      vm.formDialog.status = typeof data.status == "number" ? data.status.toString() : data.status;
    },
    initData() {
      let vm = this;
      vm.chinaJson = JSON.parse(sessionStorage.chinaJson);
      vm.derail_address_arr = JSON.parse(sessionStorage.chinaData);
    }
  },
  watch: {
    derail_address_obj_s(val) {
      if (val[val.length - 1] == null) return;
      this.formSearch.areaId = val[val.length - 1];
    },
    derail_address_obj_sub(val) {
      let vm = this;
      if (val.length) {
        vm.formDialog.provinceId = val[0];
        vm.formDialog.cityId = val[1];
        vm.formDialog.areaId = val[2];
      } else {
        vm.formDialog.provinceId = "";
        vm.formDialog.cityId = "";
        vm.formDialog.areaId = "";
      }
    }
  }
};
</script>

<style>
.preview-txt img {
  max-width: 100%;
}
</style>


<style scoped>
#preview-modal .ivu-col {
  font-size: 14px;
  word-wrap: break-word;
}
#preview-modal .ivu-modal-header-inner {
  font-size: 20px;
}
#preview-modal .title {
  font-size: 15px;
  font-weight: 700;
}
.preview-row {
  margin: 4px 0;
}
#preview-image img {
  max-width: 150px;
  max-height: 150px;
}
.preview-txt {
  max-height: 450px;
  overflow-y: auto;
}
</style>
