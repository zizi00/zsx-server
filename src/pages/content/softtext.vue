<template>
  <div class="softtext">
    <!-- 高级搜索 -->
    <div id="search-wrapper">
      <el-form :model="formSearch" ref="formSearch" inline label-width="80px">
        <template v-if="hasPerm('softtext:search')">
          <el-form-item label="标题" prop="title">
            <el-input v-model="formSearch.title" placeholder="标题" size="mini" @keydown.native.enter.prevent="submitSearch('formSearch')"></el-input>
          </el-form-item>
          <el-form-item label="是否发布">
            <el-select v-model="formSearch.newsStatus" placeholder="请选择" clearable style="width:150px;" size="mini">
              <el-option value="0" label="已发布"></el-option>
              <el-option value="1" label="未发布"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker type="date" format="yyyy-MM-dd HH:mm:ss" placeholder="点击选择时间" size="mini" v-model="searchNewsDate" @on-change="searchNewsDateChange" :clearable="false" transfer></el-date-picker>
          </el-form-item>
          <el-button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" size="mini">{{label.clear}}</el-button>
          <el-button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" size="mini">{{label.search}}</el-button>
        </template>
        <el-button v-if="hasPerm('softtext:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="mini">{{label.add}}</el-button>
        <el-button v-if="hasPerm('softtext:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="mini">批量删除</el-button>
        <el-button v-if="hasPerm('softtext:publish')" type="default" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchPublish" size="mini">批量发布</el-button>
        <el-button v-if="hasPerm('softtext:clearCache')" type="warning" style="margin: 5px 8px 24px 0;" @click="clearCache('咨询软文')" size="mini">{{label.clearCache}}</el-button>
      </el-form>
    </div>

    <!-- <main-table :columns="columns" :data="currentPager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></main-table> -->

    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :loading="pageLoading"></paging>

    <el-dialog :visible.sync="dialogShow" :title="label[currDialog]" :mask-closable="false" @closed="resetDialogForm('formDialog')" width="700px" top="30px">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="formDialog.title" size="small" placeholder="请输入标题"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="来源" prop="newsSrc">
              <el-input v-model="formDialog.newsSrc" size="small" placeholder="请输入来源"></el-input>
            </el-form-item>
          </el-col>
           <!-- 从后台管理系统添加，类型值固定为100，因为app显示时会按此倒序排列，目前抓取分类值为1~18 -->
          <!-- <el-col :span="12">
            <el-form-item label="类型" prop="newsType">
              <el-select v-model="formDialog.newsType" placeholder="请选择" filterable clearable>
                <el-option v-for="item in newsType" :value="item.value" :key="item.value">{{ item.label }}</el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否置顶" prop="isUp">
              <el-select v-model="formDialog.isUp" size="small" placeholder="请选择是否置顶">
                <el-option v-for="item in isUp" :value="item.value" :label="item.label" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点击量" prop="pageViews">
              <el-inputNumber :min="0" size="small" v-model="formDialog.pageViews"></el-inputNumber>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否发布" prop="newsStatus">
              <el-select v-model="formDialog.newsStatus" placeholder="请选择" size="small" clearable>
                <el-option v-for="item in newsStatus" :value="item.value" :label="item.label" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formDialog.newsStatus==1">
            <el-form-item label="发布时间">
              <el-date-picker type="date" format="yyyy-MM-dd HH:mm:ss" size="small" :options="timeOptions" placeholder="点击选择时间" v-model="newsDate" @on-change="newsDateChange" :clearable="false" transfer></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 主图 -->
        <el-row>
            <el-col :span="24">
              <strong style="padding-left: 45px;">上传图片的数量必须为一张或三张</strong><br>
              <p v-if="currDialog=='edit'" style="padding-left: 45px;color: red;">编辑图片需要进行重新选择上传</p>
              <el-form-item label="图片">
                <el-row>
                  <el-col :span="6">
                    <el-upload name="file"
                        :action="url.upload"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif"
                        :before-upload="myBeforeUpload"
                        :format="imgUploadFormat"
                        :on-format-error="handleFormatError"
                        :max-size="6000"
                        :on-exceeded-size="handleMaxSize">
                      <el-button type="default" size="small" icon="el-icon-upload">选择图片</el-button>
                    </el-upload>
                    <el-button type="primary" @click="myUpload" size="small" :loading="uploadLoading">
                      <el-tooltip>
                        <span>确定上传</span>
                        <p slot="content"  style="white-space: normal;">{{imgRequiredTxt}}</p>
                      </el-tooltip>
                    </el-button>
                    <br>
                    <el-button type="primary" size="small" @click="cropperDialogShow=true">裁剪图片</el-button>
                  </el-col>
                  <el-col :span="18">
                    <el-row v-if="editFileUrl.length">
                      <el-col :span="8" v-for="(item, index) in editFileUrl" :key="item">
                        <div class="image-box">
                          <img :src="item" class="ad-img">
                        </div>
                      </el-col>
                    </el-row>
                    <el-row v-else-if="fileUrl.length">
                      <el-col :span="8" v-for="(item, index) in fileUrl" :key="item">
                        <div class="image-box">
                          <img :src="item" class="ad-img">
                          <div class="demo-upload-list-cover">
                            <i class="el-icon-delete" @click.native="handleRemove(index)"></i>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                    <div v-else class="image-box">
                      <img :src="defaultUploadImgSrc" class="ad-img">
                    </div>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="内容" prop="content">
              <el-button type="success" @click="previewContent=true" size="small">预览</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="width:520px;margin:0 auto;">
          <ueditor v-model="formDialog.content" :config="myConfig"></ueditor>
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDialogForm('formDialog')">{{label.clear}}</el-button>
        <el-button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</el-button>
      </div>
    </el-dialog>
    <!-- 预览内容 -->
    <el-dialog :visible.sync="previewContent" :mask-closable="false" title="预览内容" top="30px">
        <div class="preview-editor-content" v-html="formDialog.content"></div>
        <br>
        <div slot="footer">
          <el-button type="primary" @click="previewContent=false">关闭</el-button>
        </div>
    </el-dialog>
    <!-- 总体预览 -->
    <el-dialog :visible.sync="previewModal" :mask-closable="false" title="预览" top="30px">
      <div class="preview-editor-content">
        <h2>{{previewData.title}}</h2>
        <div v-html="previewData.content" style="max-height: 600px;overflow: auto;"></div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="previewModal=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 图片裁剪 -->
    <el-dialog :visible.sync="cropperDialogShow" title="裁剪上传" top="30px" :mask-closable="false" @closed="resetCropperDialog" width="750px">
      <div class="cutting">
        <el-upload type="drag" action="" :before-upload="beforeUpload" accept=".jpg,.jpeg,.png,.gif">
          <div style="padding: 20px 0">
              <i class="el-icon-upload" style="color: #3399ff"></i>
              <p>点击或拖拽文件到此处进行裁剪</p>
          </div>
        </el-upload>
        <div style="width:490px;margin: 0 auto;text-align: center;">
          <img id="myImg" :src="cropperImgSrc" alt="" style="max-width: 100%;max-height:500px;">
        </div>
        <div style="margin-top: 15px;">
          <el-button :type="which == 'banner' ? 'primary' : 'default'" @click="initCropper('banner')" size="small">
            <el-tooltip>
              <span>banner</span>
              <p slot="content"  style="white-space: normal;">{{requiredSize['banner']}}</p>
            </el-tooltip>
          </el-button>
          <el-button :type="which == 'one' ? 'primary' : 'default'" @click="initCropper('one')" size="small">
            <el-tooltip>
              <span>单图</span>
              <p slot="content"  style="white-space: normal;">{{requiredSize['one']}}</p>
            </el-tooltip>
          </el-button>
          <el-button :type="which == 'main' ? 'primary' : 'default'" @click="initCropper('main')" size="small">
            <el-tooltip>
              <span>主图</span>
              <p slot="content"  style="white-space: normal;">{{requiredSize['main']}}</p>
            </el-tooltip>
          </el-button>
          <el-button :type="which == 'secondary' ? 'primary' : 'default'" @click="initCropper('secondary')" size="small">
            <el-tooltip>
              <span>次级图片</span>
              <p slot="content"  style="white-space: normal;">{{requiredSize['secondary']}}</p>
            </el-tooltip>
          </el-button>
        </div>
        <el-form inline label-width="120px" style="margin-top: 15px;">
          <el-form-item label="自定义宽度(px)">
            <el-inputNumber :min="100" v-model="selfWidth" placeholder="自定义宽度" size="small"></el-inputNumber>
          </el-form-item>
          <el-form-item label="自定义高度(px)">
            <el-inputNumber :min="50" v-model="selfHeight" placeholder="自定义高度" size="small"></el-inputNumber>
          </el-form-item>
          <el-button type="primary" @click="setProportion" size="small">设置自定义宽高</el-button>
          <div>
            <el-button type="primary" @click="resetCropper2" style="margin-right: 15px;" size="small">重置裁剪</el-button>
            <el-button type="primary" @click="beSureCropper" style="margin-right: 15px;" size="small">确定裁剪</el-button>
            <el-button type="primary" @click="myUpload" :loading="uploadLoading" size="small" style="margin-right: 15px;">
              <el-tooltip>
                <span>确定上传</span>
                <p slot="content"  style="white-space: normal;">{{imgRequiredTxt}}</p>
              </el-tooltip>
            </el-button>
          </div>
        </el-form>
        <el-form label-width="100px" style="margin-top: 15px;">
          <el-form-item label="上传的图片">
            <el-row v-if="fileUrl.length">
              <el-col :span="8" v-for="(item, index) in fileUrl" :key="item">
                <div class="image-box">
                  <img :src="item" class="ad-img">
                  <div class="demo-upload-list-cover">
                    <i class="el-icon-delete" @click.native="handleRemove(index)"></i>
                  </div>
                </div>
              </el-col>
            </el-row>
            <div v-show="!fileUrl.length" class="image-box">
              <img :src="defaultUploadImgSrc" class="ad-img">
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="resetCropperDialog">{{label.close}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  import ueditor from '@/components/ueditor'
  export default {
    name: 'softtext',
    components: {
      mainTable,
      paging,
      ueditor
    },
    mixins: [page],
    data: function () {
      return {
        imgRequiredTxt: '单张图片大小小于3Mb；图片尺寸可大于规定尺寸，但是比例必须按照规定尺寸的比例；只上传一张图片：长宽要求690*345；上传三张图片：主图长宽要求456*344,两张次级图片：长宽要求222*166;上传3张图片时要求第一张作为主图，后两张作为次级图片',
        imgMaxSize: 3, // 最大 3Mb
        imgMinSize: 4, // 最小10kb
        uploadImgMax: 3, // 最多3张
        imgUploadFormat: ['jpg','jpeg','png','gif'],
        url: {
          imgServer: 'web/server/get',
          add: 'web/news/add',
          edit: 'web/news/update',
          delete: 'web/news/delete',  //  {ids: [放需要删除的id]}
          search: 'web/news/dataSearch',
          batchPublish: 'web/news/release',
          newsType: 'web/news/information/class/dataGrid',
          upload: 'file/',
          sId: 'id/id',
          clearCache: 'web/cache/news'
        },
        pager: {
          data: [],
          url: 'web/news/dataGrid',
        },
        searchPager: {
          url: 'web/news/dataSearch'
        },
        isUp: [
          {
            value: '1',
            label: '否'
          },
          {
            value: '2',
            label: '是'
          },
        ],
        isUpMap: {
          '1': '否',
          '2': '是',
        },
        // 编辑时用于回显
        editFileUrl: [],
        fileUrl: [],
        uploadImgArr: [],
        uploadLoading: false,
        previewModal: false,
        previewContent: false,
        derail_address_arr: [],
        derail_address_obj_s: [],
        batchIdArr: [],
        newsDate: '',
        newsStatus: [
          {
            value: 0,
            label: '立即发布'
          },
          {
            value: 1,
            label: '保存，定时发布'
          },
        ],
        newsStatusMap: {
          0: "已发布",
          1: "未发布"
        },
        // 1:时尚、2:旅游、3:母婴、4:科技、5:教育、6:健康、7:美食、8:文化、9:历史、10:星座、11:动漫、12:游戏  13:娱乐、14:军事、15:社会、16:宏观、17:理财、18:财经
        newsType: [
          {
            value: 1,
            label: '时尚'
          },
          {
            value: 2,
            label: '旅游'
          },
          {
            value: 3,
            label: '母婴'
          },
          {
            value: 4,
            label: '科技'
          },
          {
            value: 5,
            label: '教育'
          },
          {
            value: 6,
            label: '健康'
          },
          {
            value: 7,
            label: '美食'
          },
          {
            value: 8,
            label: '文化'
          },
          {
            value: 9,
            label: '历史'
          },
          {
            value: 10,
            label: '星座'
          },
          {
            value: 11,
            label: '动漫'
          },
          {
            value: 12,
            label: '游戏'
          },
          {
            value: 13,
            label: '娱乐'
          },
          {
            value: 14,
            label: '军事'
          },
          {
            value: 15,
            label: '社会'
          },
          {
            value: 16,
            label: '宏观'
          },
          {
            value: 17,
            label: '理财'
          },
          {
            value: 18,
            label: '财经'
          },
          {
            value: 100,
            label: '后台系统'
          },
        ],
        newsTypeMap: {
          1: '时尚',
          2: '旅游',
          3: '母婴',
          4: '科技',
          5: '教育',
          6: '健康',
          7: '美食',
          8: '文化',
          9: '历史',
          10: '星座',
          11: '动漫',
          12: '游戏',
          13: '娱乐',
          14: '军事',
          15: '社会',
          16: '宏观',
          17: '理财',
          18: '财经',
          100: '后台系统',
        },
        previewData: {
          title: '',
          newsSrc: '',
          date: '',
          content: '',
        },
        // 86400000  一天的valueOf只差，即1000*60*60*24
        timeOptions: {
          disabledDate (date) {
            return date && date.valueOf() < Date.now().valueOf()
            // return date && date.valueOf() < (Date.now().valueOf() - 86400000)
          }
        },
        searchNewsDate: '',
        formSearch: {
          title: '',
          newsStatus: '',
          newsDate: '',
        },
        formDialog: {
          id: '',
          title: '',
          newsType: 100,
          newsDate: '',
          content: '',
          newsStatus: 1,
          newsSrc: '和鸣锵锵', // 来源
          pageViews: 0, // 点击量
          isUp: '1',
          newsImage: '', // 主图，多张使用英文逗号隔开
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
          //   'width': 150,
          // },
          {
            'title': '标题',
            'key': 'title',
            'width': 350,
            render: (create, params) => {
              var vm=this,title=params.row.title
              return create('el-button',{
                props: {
                  type: 'text'
                },
                on:{
                  click: function(){
                    for (let key in vm.previewData) {
                      vm.previewData[key] = params.row[key]
                    }
                    vm.previewModal = true
                  }
                }
              },title)
            }
          },
          {
            'title': '图片',
            'key': 'newsImage',
            'width': 370,
            render: (create, params) => {
              var url = params.row.newsImage,imageHost=this.imageHost || sessionStorage.imageHost
              if(url){
                var urlArr = url.split(','),showArr=[],item
                for(var i=0;i<urlArr.length;i++){
                  item=urlArr[i]
                  if(item&&item.indexOf('http') == -1){
                    showArr.push(imageHost + item)
                  }else{
                    showArr.push(item)
                  }
                }
                var len = showArr.length
                var style = {
                  'border': '1px solid transparent',
                  'border-radius': '4px',
                  'margin': '10px 5px',
                  'max-width': '100px',
                  'max-height': '100px'
                }
                var arr = [],src=''
                for(var j=0;j<len;j++){
                  if(j>2){break}
                  src = showArr[j]
                  if(src){
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
                      style: style
                    })]))
                  }else{
                    arr.push(create('span','此图url为空'))
                  }
                }
                return create('div',arr)
              }else{
                return create('span','无')
              }
            }
          },
          {
            'title': '类型',
            'key': 'newsType',
            'width': 100,
            render: (create, params)=>{
              var key=params.row.newsType,map=this.newsTypeMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '来源',
            'key': 'newsSrc',
            'width': 100,
          },
          {
            'title': '状态',
            'key': 'newsStatus',
            'width': 130,
            render: (create, params) => {
              var map=this.newsStatusMap,key = params.row.newsStatus
              if(typeof status == 'number'){
                status = status.toString()
              }
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            'title': '是否置顶',
            'key': 'isUp',
            'width': 150,
            render: (create, params) => {
              var key = params.row.isUp,map=this.isUpMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '点击量',
            'key': 'pageViews',
            'width': 150,
            'sortable': true,
          },
          {
            'title': '发布时间',
            'key': 'newsDate',
            'width': 200,
            'sortable': true,
            render: (create, params)=>{
              var key=params.row.newsDate,txt=key
              if(typeof key == 'number'){
                txt=this.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          // {
          //   title: "创建时间",
          //   key: "createTime",
          //   width: 180,
          //   sortable: true
          // },
          {
            title: '操作',
            key: 'action',
            width: 250,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              var disabled = params.row.newsStatus == 1 ? false : true
              var previewBtn = create('el-button', {
                props: {
                  type: 'success',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    for (let key in vm.previewData) {
                      vm.previewData[key] = params.row[key]
                    }
                    vm.previewModal = true
                  }
                }
              }, '预览')
              var publishBtn = create('el-button', {
                props: {
                  size: 'small',
                  disabled: disabled
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    vm.$Modal.confirm({
                      title: '确认',
                      content: '确认发布这条数据吗？',
                      onOk: function () {
                        vm.newsPublish(params.row.id)    
                      }
                    })
                  }
                }
              }, '发布')
              if(vm.hasPerm('softtext:preview')){
                arr.push(previewBtn)
              }
              if(vm.hasPerm('softtext:publish')){
                arr.push(publishBtn)
              }
              if(vm.hasPerm('softtext:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('softtext:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          }
        ],
        rules: {
          newsSrc: [
            { required: true, message: '来源不能为空', trigger: 'blur' },
          ],
          title: [
            { required: true, message: '标题不能为空', trigger: 'blur' },
          ],
          // newsStatus: [
          //   { required: true, message: '状态不能为空', trigger: 'change' },
          // ]
        }
      }
    },
    methods: {
      submitSearch () {
        let vm = this
        vm.isSearchStatus=true
        var config =  {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          }
        };
        vm.paging(config)
      },
      paging (data) {
        let vm = this,config={}
        // 对象类型的传参为修改此次请求的config;  number类型的传参为翻页翻到第几页
        if(typeof data == 'object'){
          config = data
        }else if (Number(data)) {
          vm.changePager(data)
          return
        }
        vm.pageLoading = true
        var pager = {},method='post',ajaxData = {},params={}
        // 搜索和列表共用分页，通过状态判断是搜索翻页还是列表翻页
        if(vm.isSearchStatus){
          // 是搜索
          pager = vm.searchPager
          method = pager.method || (typeof(vm.pager.searchMethod) != 'undefined' ? vm.pager.searchMethod : method)
          var _ajaxData = vm.pagingFiltData(pager),_formSearch={},formSearch=vm.formSearch
          for(let key in _ajaxData){
            _formSearch[key] = _ajaxData[key]
          }
          for(let key in formSearch){
            if(formSearch[key] != ''){
              _formSearch[key] = formSearch[key]
            }
          }
          ajaxData = _formSearch
        }else{
          // 不是搜索
          pager = vm.pager
          method = pager.method || method
          ajaxData = vm.pagingFiltData(pager)
        }
        params = {
          url: pager.url,
          method: method,
        }
        if(method=='get'){
          params.params = ajaxData
        }else{
          for(let key in ajaxData){
            if(key=='current'||key=='size'){
              if(!params.params){
                params.params = {}
              }
              params.params[key] = ajaxData[key]
            }else{
              if(!params.data){
                params.data = {}
              }
              params.data[key] = ajaxData[key]
            }
          }
        }
        (function(){
          if(vm.isSearchStatus){
            return vm.$http(params,config)
          }else{
            return vm.$http2(params)
          }
        })().then(res => {
          let resData = res.data
          if (resData.code == 1) {
            vm.pageLoading = false
            if (typeof vm.pagerResult == 'function') {
              // 返回数据预处理
              resData.data = vm.pagerResult(resData.data)
            }
            setTimeout(function(){
              pager.total = resData.total
              pager.data = resData.data
              vm.currentPager = pager
            },50)
          }
        }).catch(err=>{})
      },
      // 上传图片
      imgTest(fileObj){
        var vm = this,obj = {},
        code = 1,
        message = '',
        type = fileObj.type.split('/')[1],
        size = fileObj.size
        var uploadImgMax = vm.uploadImgMax,
          imgMaxSize = vm.imgMaxSize,
          imgMinSize = vm.imgMinSize,
          // 用于展示的数组
          fileUrl = vm.fileUrl,
          imgUploadFormat = vm.imgUploadFormat
        var len = fileUrl.length,len2 = imgUploadFormat.length,typeIsOk = false,sizeIsOk = false,typeTxt=''
        if(!type){
          code = 0
          message = '文件格式未知，请重新选择'
        }else{
          type = type.toLocaleLowerCase()
        }
        for(let i=0;i<len2;i++){
          typeTxt += i==len2-1 ? imgUploadFormat[i] : imgUploadFormat[i] + '、' 
          if(type==imgUploadFormat[i]){
            typeIsOk = true
            break
          }
        }
        if(!typeIsOk){
          obj.code = 0
          obj.message = `请选择${typeTxt}格式的文件`
          return obj
        }
        if(size/1000/1000>imgMaxSize){
          obj.code = 0
          obj.message = `请选择小于${imgMaxSize}Mb的文件`
          return obj
        }
        if(size/1000<imgMinSize){
          obj.code = 0
          obj.message = `请选择大于${imgMinSize}Kb的文件`
          return obj
        }
        obj.code = code
        obj.message = message
        return obj
      },
      myBeforeUpload(file){
        var vm = this;
        var imgTestResult = vm.imgTest(file)
        if(!imgTestResult.code){
          vm.$Message.error({
            content: imgTestResult.message,
            duration: 3
          })
          return false
        }
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var len = vm.fileUrl.length
          if(len<3){
            vm.fileUrl.push(reader.result)
            vm.uploadImgArr.push(file)
          }else{
            var arr = vm.fileUrl,arr2 = vm.uploadImgArr
            arr.push(reader.result)
            arr2.push(file)
            arr.splice(0,1)
            arr2.splice(0,1)
            vm.fileUrl = arr
            vm.uploadImgArr = arr2
          }
        }
        return false
      },
      handleFormatError(){},
      handleMaxSize(){},
      myUpload(){
        // 确认上传
        var vm = this
        var len = vm.uploadImgArr.length
        if(!len){
          vm.$Message.error('请先选择上传的图片')
          return
        }else if(len==2){
          vm.$Message.error('主图数量必须为一张或三张')
          return
        }
        vm.uploadLoading = true
        if(vm.currDialog=='add' && !vm.formDialog.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.formDialog.id = sId;
              vm.uploadFile(sId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.formDialog.id
          vm.uploadFile(sId)
        }
      },
      uploadFile(sId,userId){
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告  4  资讯软文
        params.append('s',4)
        // 使用位置 p1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 6:广告 7:系统通知 8:资讯（原新闻）
        params.append('p',8)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        // 使用传入的userI或者当前系统用户id或者sId
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.fileUrl = [];
            vm.uploadImgArr = [];
            vm.$Message.success('上传图片成功！');
            var arr = [],data=rd.data
            for(let key in data){
              if(key!='server'){
                arr.push(rd.data[key])
              }
            }
            vm.formDialog.newsImage = arr.join(',');
            vm.uploadLoading = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleRemove(index){
        var vm = this
        if(vm.currDialog=='edit'){
          vm.fileUrl = []
          vm.uploadImgArr = []
        }else{
          vm.fileUrl.splice(index,1)
          vm.uploadImgArr.splice(index,1)
        }
      },
      // 上传图片  end

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
      // 批量操作
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
      newsDateChange(date){
        this.formDialog.newsDate = date
      },
      searchNewsDateChange(date){
        this.formSearch.newsDate = date
      },
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
      resetSearch (name) {
        var vm = this
        vm.searchNewsDate = ''
        vm.formSearch.newsDate = ''
        vm.formSearch.newsStatus = ''
        vm.$refs[name].resetFields()
        vm.isSearchStatus = false
        vm.paging(1)
        // vm.submitSearch(name)
      },
      newsPublish(id){
        var vm = this;
        if(!id){
          vm.$Message.error('id获取失败')
          return
        }
        var parmas = {
          method: 'post',
          url: vm.url.batchPublish,
          data: {
            ids: [id]
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
      batchPublish () {
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认发布这些数据吗？',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.batchPublish,
              data: {
                ids: vm.batchIdArr
              }
            }
            vm.batchoperation(parmas)
          }
        })
      },
      handleSuccess () {},
      resetDialogForm (name) {
        name = name || 'formDialog'
        let vm = this
        vm.fileUrl = [];
        vm.uploadImgArr = [];
        vm.editFileUrl = []
        vm.uploadLoading = false
        vm.formDialog.content = ''
        vm.formDialog.newsImage = ''
        vm.newsDate = ''
        vm.formDialog.newsDate = ''
        vm.$refs[name].resetFields()
      },
      initDialog (data) {
        let vm = this
        vm.newsDate = data.newsDate
        var arr=[],item,fileUrl=[],imageHost=vm.imageHost,i
        if(data.newsImage){
          arr=data.newsImage.split(',')
        }
        for(i=0;i<arr.length;i++){
          item=arr[i]
          if(item.indexOf('http')==-1){
            fileUrl.push(imageHost+item)
          }else{
            fileUrl.push(item)
          }
        }
        // 编辑时回显
        vm.editFileUrl = fileUrl
      },
    },
    watch: {
      fileUrl(val){
        if(val.length){
          this.editFileUrl=[]
        }
      },
      'formDialog.newsStatus': function(val){
        this.newsDate = ''
        this.formDialog.newsDate = ''
      }
    }
  }
</script>

