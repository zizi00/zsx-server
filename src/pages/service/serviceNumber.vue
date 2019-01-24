<template>
  <div class="serviceNumber">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="90">
        <template v-if="hasPerm('serviceNumber:search')">
          <FormItem label="服务所属分类" prop="classId">
            <Select v-model="formSearch.classId" placeholder="请选择" filterable size="small">
              <Option v-for="item in classId" :key="item.value" :label="item.label" :value="item.value"></Option>
            </Select>
          </FormItem>
          <FormItem label="服务名称" prop="name">
            <Input v-model="formSearch.name" placeholder="服务名称" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <!-- <FormItem label="创建者" prop="userId">
            <Select  v-model="formSearch.userId" placeholder="请选择" filterable size="small">
              <Option v-for="item in userId" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem> -->
          <FormItem label="权限范围" prop="authRange">
            <Select  v-model="formSearch.authRange" placeholder="请选择" size="small" style="width: 80px">
              <Option v-for="item in authRange" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="所属地区" v-if="formSearch.authRange==1">
            <Cascader :data="chinaData" v-model="derail_address_arr2" style="margin-top: 5px;" filterable size="small"></Cascader>
          </FormItem>
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <Button v-if="hasPerm('serviceNumber:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <!-- <Button v-if="hasPerm('serviceNumber:submission')" type="primary" style="margin: 5px 8px 24px 0;" @click="addSubmissionRow" size="small">投稿</Button> -->
      </Form>
    </div>
    
    <mainTable :columns="columns" :data="pager.data" :height="tableHeight"></mainTable>
    <!-- <el-table
      :data="pager.data"
      border
      style="width: 100%">
      <el-table-column
        prop="classId"
        label="服务所属分类"
        width="150">
        <template slot-scope="scope">
          {{getVal(scope.row.classId,classIdMap)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="服务名称"
        width="150">
      </el-table-column>
       <el-table-column
        prop="serviceDesc"
        label="服务简介"
        width="300">
      </el-table-column>
      <el-table-column
        prop="authRange"
        label="权限范围"
        width="150">
        <template slot-scope="scope">
          {{getAuthTxt(scope.row)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="headPortrait"
        label="头像"
        width="170">
        <template slot-scope="scope">
          <a :href="getImgSrc(scope.row.headPortrait)" target="_blank">
            <img class="table-image" :src="getImgSrc(scope.row.headPortrait)" :alt="getImgSrc(scope.row.headPortrait)">
          </a>
        </template>
      </el-table-column>
      <el-table-column
        prop="bgPortrait"
        label="封面图"
        width="170">
        <template slot-scope="scope">
          <a :href="getImgSrc(scope.row.headPortrait)" target="_blank">
            <img class="table-image" :src="getImgSrc(scope.row.bgPortrait)" :alt="getImgSrc(scope.row.bgPortrait)">
          </a>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="200">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="320">
        <template slot-scope="scope">
          <el-button v-if="hasPerm('serviceNumber:submission')" type="primary" @click="addSubmissionRow(scope.row.id)" size="small">投稿</el-button>
          <el-button v-if="hasPerm('serviceNumber:preview')" type="primary" @click="previewSubmission(scope.row.id)" size="small">查看投稿</el-button>
          <el-button v-if="hasPerm('serviceNumber:edit')" type="primary" @click="delRow(scope.row)" size="small">编辑</el-button>
          <el-button v-if="hasPerm('serviceNumber:delete')" type="danger" @click="delRow(scope.row.id)" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table> -->

    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="750" @on-cancel="resetDialogForm('formDialog')">
      <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="120px">
        <Row>
          <!-- <Col span="12">
            <el-form-item label="创建者" prop="userId">
              <Select  v-model="formDialog.userId" placeholder="不选时，该服务由系统用户创建" filterable>
                <Option v-for="item in userId" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </el-form-item>
          </Col> -->
          <Col span="12">
            <el-form-item label="服务所属分类" prop="classId">
              <el-select v-model="formDialog.classId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in classId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="服务名称" prop="name">
              <Input v-model="formDialog.name" placeholder="请输入服务名称"></Input>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <el-form-item label="服务简介" prop="serviceDesc">
              <Input type="textarea" :rows="5" v-model="formDialog.serviceDesc" placeholder="请输入服务简介"></Input>
            </el-form-item>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <el-form-item label="权限范围" prop="authRange">
              <Select  v-model="formDialog.authRange" placeholder="请选择">
                <Option v-for="item in authRange" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </el-form-item>
          </Col>
          <Col span="12" v-if="formDialog.authRange==1">
            <el-form-item label="所属地区">
              <Cascader :data="chinaData" v-model="derail_address_arr" filterable></Cascader>
            </el-form-item>
          </Col>
        </Row>
        <Row v-if="formDialog.authRange==1">
          <Col span="12">
            <el-form-item label="系统用户" prop="sysUserId">
              <Select  v-model="formDialog.sysUserId" placeholder="请选择">
                <Option v-for="item in sysUserId" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </el-form-item>
          </Col>
        </Row>
        <!-- 上传图片 -->
        <Row>
          <Col span="12">
            <el-form-item label="头像">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload"
                      :format="['jpg','jpeg','png','gif']"
                      accept=".jpg,.jpeg,.png,.gif"
                      :on-format-error="handleFormatError"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize">
                    <Button type="default" icon="ios-cloud-upload-outline">选择头像</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">确定上传</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileArr.length">
                    <Col span="8" v-for="(item, index) in fileArr" :key="item.base64">
                      <div class="image-box">
                        <img :src="item.base64" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-else class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
          <Col span="12">
            <el-form-item label="封面图">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload2"
                      :format="['jpg','jpeg','png','gif']"
                      accept=".jpg,.jpeg,.png,.gif"
                      :on-format-error="handleFormatError2"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize2">
                    <Button type="default" icon="ios-cloud-upload-outline">选择封面图</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload2" :loading="uploadLoading2">确定上传</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileArr2.length">
                    <Col span="8" v-for="(item, index) in fileArr2" :key="item.base64">
                      <div class="image-box">
                        <img :src="item.base64" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-trash-outline" @click.native="handleRemove2(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-else class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
        </Row>
      </el-form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <!-- 查看投稿 -->
    <Modal v-model="submissionShow" title="投稿" :mask-closable="false" :styles="{'top': '30px'}" width="1000" @on-cancel="closeSubmission">
      <Form :model="submissionformSearch" ref="submissionformSearch" inline :label-width="60">
        <!-- <FormItem label="服务名称" prop="serviceNumberId">
          <Select  v-model="submissionformSearch.serviceNumberId" placeholder="请选择" filterable size="small">
            <Option v-for="item in serviceNumberId" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem> -->
        <!-- <FormItem label="创建者" prop="userId">
          <Select  v-model="submissionformSearch.userId" placeholder="请选择" filterable size="small">
            <Option v-for="item in userId" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem> -->
        <FormItem label="审核状态" prop="status">
          <Select  v-model="submissionformSearch.status" placeholder="请选择" size="small" style="width: 80px">
            <Option v-for="item in status" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSubmissionSearch('submissionformSearch')" :disabled="submissionPageLoading" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSubmissionSearch('submissionformSearch')" :disabled="submissionPageLoading" size="small">{{label.search}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="addSubmissionRow" size="small">{{label.add}}</Button>
      </Form>
      <mainTable :columns="submissionColumns" :data="submissionPager.data" :loading="submissionPageLoading"></mainTable>
      <paging @changePager="submissionChangePager" @paging="submissionPaging" :loading="submissionPageLoading" :total="submissionPager.total" :current="submissionPager.current"></paging>
      <div slot="footer">
        <Button type="primary" @click="closeSubmission">{{label.sure}}</Button>
      </div>
    </Modal>

    <!-- 新增编辑投稿 -->
    <Modal v-model="submissionDialogShow" :title="label[currentSubmissionDialog] + '投稿'" width="750" :mask-closable="false" @on-cancel="resetSubmissionDialogForm('submissionformDialog')">
      <el-form :model="submissionformDialog" ref="submissionformDialog" :rules="rules" label-width="110px">
        <Row>
          <Col span="12">
            <el-form-item label="服务" prop="serviceNumberId">
              <el-select v-model="submissionformDialog.serviceNumberId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in serviceNumberId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col>
          <!-- 后台管理系统新增的投稿不选择投稿人，头端将该字段置空 -->
          <!-- <Col span="12">
            <el-form-item label="投稿人" prop="userId">
              <el-select v-model="submissionformDialog.userId" placeholder="请选择" filterable size="small">
                <el-option v-for="item in userId" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </Col> -->
        </Row>
        <Row>
          <Col span="24">
            <el-form-item label="投稿内容" prop="content">
              <Input type="textarea" :rows="5" v-model="submissionformDialog.content" placeholder="请输入投稿内容"></Input>
            </el-form-item>
          </Col>
        </Row>
        <!-- 上传图片 -->
        <Row>
          <Col span="24">
            <el-form-item label="图片/音频/视频">
              <Row>
                <Col span="6">
                  <Upload name="file"
                      :action="url.upload"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.mp4,.mp3"
                      :before-upload="myBeforeUpload3"
                      :format="postUploadFormat">
                    <Button type="default" icon="ios-cloud-upload-outline">选择文件</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload3" :loading="uploadLoading3">
                    <Tooltip>
                      <span>确定上传</span>
                      <p slot="content"  style="white-space: normal;">{{postRequiredTxt}}</p>
                    </Tooltip>
                  </Button>
                </Col>
                <Col span="18">
                  <div class="drag-container">
                    <template v-if="fileArr3.length">
                      <div :title="item.name" class="drag-box" v-for="(item, index) in fileArr3" :key="item.base64" v-dragging="{item: item, 'list':fileArr3}">
                        <div class="image-box service-item">
                          <video v-if="item.type == videoMark" loop autoplay style="max-width:100%;max-height:100%;">
                            <source :src="item.base64" type='video/mp4'>
                          </video>
                          <div v-else-if="item.type == audioMark">
                            <audio autoplay>
                              <source :src="item.base64" type='audio/mpeg'>
                              您的浏览器不支持音频播放
                            </audio>
                          </div>
                          <img v-else :src="item.base64" class="ad-img">
                          <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleRemove3(index,item.delData)"></Icon>
                          </div>
                        </div>
                        <span>{{item.name | ellipsisFileName}}</span>
                      </div>
                    </template>
                    <div v-else class="image-box service-item">
                      <img :src="defaultUploadImgSrc" class="ad-img">
                    </div>
                  </div>
                </Col>
              </Row>
            </el-form-item>
          </Col>
        </Row>
      </el-form>
      <div slot="footer">
        <Button @click="resetSubmissionDialogForm('submissionformDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitSubmissionDialogForm('submissionformDialog')" :loading="submissiondialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <Modal v-model="imgShow" title="全部图片">
      <div class="clearfix" style="max-height: 600px;overflow: auto;">
        <a v-for="item in imgSrcArr" :href="item" target="_blank" class="preview-img-container">
          <img :src="item" :alt="item" style="max-width: 100%;max-height: 100%;">
        </a>
      </div>
      <div slot="footer">
        <Button @click="imgShow=false;imgSrcArr=[]">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'serviceNumber',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          // 增删改查
          add: 'web/servicenumber/add',
          delete: 'web/servicenumber/delete',
          edit: 'web/servicenumber/update',
          search: 'web/servicenumber/dataGrid',
          all: 'web/servicenumber/dataAllGrid',
          serviceClassify: 'web/servicenumber/class/dataAllGrid', // 服务全部分类
          systemAgent:'web/sys/user/dataAllGrid', // 所有是代理商的系统用户
          upload: 'file/',
          sId: 'id/id',
          allUser: 'user/all/user',
          submission: {
            add: 'web/servicenumber/content/add',
            edit: 'web/servicenumber/content/update',
            search: 'web/servicenumber/content/dataGrid',
            delete: 'web/servicenumber/content/delete',
            examine: 'web/servicenumber/content/confirm/examine'
          }
        },
        postRequiredTxt: '图片最多选择九张，单张图片小于10Mb,mp3格式的音频小于10Mb,mp4格式的视频小于20Mb',
        typeErrorTxt: '请选择jpg、jpeg、png或gif格式的图片、mp3格式的音频或mp4格式的视频',
        postUploadFormat: ['jpg','jpeg','png','gif','mp4','mp3'],
        imgMaxSize: 10,
        videoMaxSize: 20,
        videoMark: 'video',
        audioMaxSize: 10,
        audioMark: 'audio',
        pager: {
          // 页面初始化
          url: 'web/servicenumber/dataGrid',
          // 主区域表格数据
          data: [],
          deleteMethod: 'delete'
        },
        submissionPager: {
          url: 'web/servicenumber/content/dataGrid',
          method: 'post',
          data: [],
          total: 0,
          size: 10,
          current: 1,
        },
        currentServiceNumberId: '',
        submissionformSearch: {
          serviceNumberId: '',
          userId: '',
          status: '',
          areaCode: ''
        },
        submissionPageLoading: false,
        submissionDialogShow: false,
        submissiondialogSubmitLoading: false,
        currentSubmissionDialog: 'add',
        submissionformDialog: {
          id: '',
          serviceNumberId: '',
          userId: '',
          content: '',
          status: 0
        },
        classId: [],
        classIdMap: {},
        serviceNumberId: [],
        serviceNumberIdMap: {},
        status: [
          {
            value: 0,
            label: '未审批'
          },
          {
            value: 1,
            label: '已审批'
          }
        ],
        statusMap: {
          0: '未审批',
          1: '已审批'
        },
        // 预览全部图片
        imgShow: false,
        imgSrcArr: [],
        chinaJson: {},
        chinaData: [],
        derail_address_arr: [],
        derail_address_arr2: [],
        uploadLoading: false,
        uploadLoading2: false,
        uploadLoading3: false,
        fileUrl2: [],
        uploadImgArr2: [],
        // uploadImgArr3: [],
        fileArr: [
          // {
          //   name: '1.mp3',
          //   type: 'audio', //  audio   image   video
          //   type2: 'mp3',
          //   file: '原始文件对象',
          //   base64: '文件转base64数据'
          // }
        ],
        fileArr2: [],
        fileArr3: [],
        authRange: [
          {
            value: 0,
            label: '全国'
          },
          {
            value: 1,
            label: '区域'
          }
        ],
        authRangeMap: {
          0: '全国',
          1: '区域'
        },
        userId: [],
        userIdMap: {},
        // 代理商
        sysUserId: [],
        sysUserIdMap: {},
        // 投稿
        submissionShow: false,
        // 搜索表单
        formSearch: {
          authRange: '',
          userId: '',
          name: '',
        },
        // needId: true,
        // 新增/编辑表单
        formDialog: {
          id: '',
          classId: '',
          name: '',
          serviceDesc: '',
          headPortrait: '',
          bgPortrait: '',
          authRange: 0,
          provincesCode: '',
          cityCode: '',
          areaCode: '',
          userId: '',
          sysUserId: ''
        },
        // 编辑行时用于记录初始有多少张（个）图片（视频、音频）
        originalLength: 0,
        columns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   fixed: 'left',
          //   width: 180
          // },
          {
            'title': '服务所属分类',
            'key': 'classId',
            width: 150,
            render: (create, params) => {
              var key = params.row.classId,map=this.classIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '服务名称',
            'key': 'name',
            width: 200,
          },
          {
            'title': '服务简介',
            'key': 'serviceDesc',
            width: 300
          },
          {
            'title': '创建人',
            'key': 'userId',
            width: 200
          },
          {
            'title': '系统用户',
            'key': 'sysUserId',
            width: 200,
            render: (create, params) => {
              var key = params.row.sysUserId,map=this.sysUserIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '权限范围',
            'key': 'authRange',
            width: 200,
            render: (create, params) => {
              var authRange = params.row.authRange,txt='',provincesCode=params.row.provincesCode,cityCode=params.row.cityCode,areaCode=params.row.areaCode
              if(authRange==0){
                txt = '全国'
              }else if(authRange==1){
                if(provincesCode&&cityCode&&areaCode){
                  txt = '区域： ' + this.util.getProvinceCityArea([provincesCode,cityCode,areaCode],this.chinaJson,true)
                }
              }
              return create('span',txt)
            }
          },
          {
            'title': '头像',
            'key': 'headPortrait',
            width: 200,
            render: (create, params) => {
              var url=params.row.headPortrait,imageHost=sessionStorage.imageHost;
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
            'title': '封面图',
            'key': 'bgPortrait',
            width: 200,
            render: (create, params) => {
              var url=params.row.bgPortrait,imageHost=sessionStorage.imageHost;
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
          // {
          //   //  创建者 暂时不显示，目前不允许用户创建服务，userId传系统用户的id
          //   'title': '创建者',
          //   'key': 'userId',
          //   render: (create, params) => {
          //     var key = params.row.userId,map=this.userIdMap
          //     var txt = map[key] ? map[key] : key
          //     return create('span',txt)
          //   }
          // },
          {
            'title': '创建时间',
            'key': 'createTime',
            width: 200,
          },
          {
            title: '操作',
            key: 'action',
            width: 250,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              // if(vm.hasPerm('serviceNumber:submission')){
              //   arr.push(create('Button',{
              //     props: {
              //       type: 'primary',
              //       size: 'small'
              //     },
              //     style: {
              //       'margin-right': '5px'
              //     },
              //     on: {
              //       click: function(){
              //         vm.addSubmissionRow(params.row.id)
              //       }
              //     }
              //   },'投稿'))
              // }
              // if(vm.hasPerm('serviceNumber:preview')){
              //   arr.push(create('Button',{
              //     props: {
              //       type: 'primary',
              //       size: 'small'
              //     },
              //     style: {
              //       'margin-right': '5px'
              //     },
              //     on: {
              //       click: function(){
              //         vm.currentServiceNumberId = params.row.id
              //         vm.initSubmissionData(params.row.id)
              //         vm.submissionShow = true
              //       }
              //     }
              //   },'查看投稿'))
              // }
              if(vm.hasPerm('serviceNumber:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('serviceNumber:delete')){
                var delBtn = create('Button',{
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      vm.$Modal.confirm({
                        title: '确认',
                        content: '删除服务会同时删除该服务下的所有投稿，确认删除？',
                        onOk: function () {
                          var data = {
                            id: params.row.id
                          }
                          vm.delRow(data)
                        }
                      })
                    }
                  }
                },'删除')
                arr.push(delBtn)
              }
              return create('div',arr)
            }
          },
        ],
        submissionColumns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   fixed: 'left',
          //   width: 180
          // },
          {
            'title': '服务',
            'key': 'serviceNumberId',
            width: 180,
            render: (create, params) => {
              var key = params.row.serviceNumberId,map=this.serviceNumberIdMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            'title': '投稿人',
            'key': 'userNickName',
            width: 180,
          },
          {
            'title': '内容',
            'key': 'content',
            width: 300
          },
          {
            'title': '状态',
            'key': 'status',
            width: 180,
            render: (create, params) => {
              var vm=this,key = params.row.status
              var acceptBtn = create('Button',{
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: function(){
                    vm.$Modal.confirm({
                      title: '确认审核',
                      content: '确认审核改投稿吗？',
                      onOk: function(){
                        vm.accept(params.row.id)
                      }
                    })
                  }
                }
              },'确认审核')
              if(key == 1){
                return create('span','已审核')
              }else{
                // 有审核的权限展示审核按钮，没权限展示未审核
                return acceptBtn
              }
            }
          },
          {
            'title': '图片/视频',
            'key': 'fileManageList',
            width: 400,
            render: (create, params) => {
              var vm = this,arr=[],createArr=[]
              var imgSrcArr = vm.getImgsSrc(params.row.fileManageList)
              if(imgSrcArr.length){
                imgSrcArr.forEach(item=>{
                  if(typeof(item)=='object'){
                    arr.push(create('video',{
                      attrs: {
                        loop: true,
                        controls: true,
                        poster: item.poster,
                      },
                      style: {
                        'max-width': '200px',
                        'max-height': '200px',
                        'margin': '10px 20px' 
                      }
                    },[
                      create('source',{
                        attrs: {
                          src: item.src,
                          type: 'video/mp4'
                        }
                      })
                    ]))
                  }else{
                    arr.push(create('a',{
                      attrs: {
                        href: item,
                        target: '_blank'
                      },
                    },[create('img',{
                      attrs: {
                        src: item,
                        alt: item
                      },
                      style: {
                        'max-width': '100px',
                        'max-height': '100px',
                        'margin': '10px'
                      }
                    })]))
                  }
                })
                if(imgSrcArr.length>3){
                  var previewBtn = create('Button', {
                    props:{
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      'margin-top': '-40px'
                    },
                    on: {
                      click: function(){
                        vm.imgSrcArr = imgSrcArr
                        vm.imgShow = true  
                      }
                    }
                  }, '预览全部')
                  createArr = [arr[0],arr[1],previewBtn]
                }else{
                  createArr = arr
                }
                return create('div', createArr)
              }else{
                return create('span', '无')
              }
            }
          },
          
          {
            'title': '创建时间',
            'key': 'createTime',
            width: 180
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('serviceNumber:edit')){
                arr.push(vm.createEditBtn(create, params.row,vm.editSubmission))
              }
              if(vm.hasPerm('serviceNumber:delete')){
                arr.push(vm.createDelBtn(create, params.row.id,vm.delSubmission))
              }
              return create('div',arr)
            }
          },
        ],
        rules: {
          classId: [
            { required: true, message: '请选择要服务所属分类', trigger: 'change' }
          ],
          name: [
            {required: true, message: '请输入服务名称', trigger: 'blur'}
          ],
          serviceNumberId: [
            { required: true, message: '请选择要投稿的服务', trigger: 'change' }
          ],
          content: [
            { required: true, message: '请输入投稿内容', trigger: 'blur' },
            { max: 500, message: '最多个500个字符', trigger: 'blur' }
          ],
          // 全国的是可以不选投稿人的
          // userId: [
          //   { required: true, message: '请选择要投稿人', trigger: 'change' }
          // ],
        }
      }
    },
    filters: {
      ellipsisFileName(fileName){
        var txt = ''
        if(typeof(fileName) == 'string'){
          txt = fileName + ''
          if(txt.length>15){
            txt =  txt.slice(0,5) + '***' + txt.slice(txt.length-7)
          }
        }else{
          txt =  ''
        }
        return txt
      }
    },
    watch: {
      'formDialog.authRange': function(val){
        if(!val){
          var vm = this
          vm.formDialog.provincesCode = ''
          vm.formDialog.cityCode = ''
          vm.formDialog.areaCode = ''
          vm.derail_address_arr = []
          vm.formDialog.sysUserId = ''
        }
      },
      derail_address_arr(val){
        var vm = this
        if(val instanceof Array && val.length){
          vm.formDialog.provincesCode = val[0]
          vm.formDialog.cityCode = val[1]
          vm.formDialog.areaCode = val[2]
        }else{
          vm.formDialog.provincesCode = ''
          vm.formDialog.cityCode = ''
          vm.formDialog.areaCode = ''
        }
      },
      'formSearch.authRange': function(val){
        if(!val){
          var vm = this
          vm.formSearch.areaCode = ''
        }
      },
      derail_address_arr2(val){
        var vm = this
        if(val instanceof Array && val.length){
          vm.formSearch.areaCode = val[2]
        }else{
          vm.formSearch.areaCode = ''
        }
      },
    },
    methods: {
      // 查看通告
      previewSubmission(id){
        var vm = this
        vm.currentServiceNumberId = id
        vm.initSubmissionData(id)
        vm.submissionShow = true
      },
      getVal(key,map){
        var txt = '' + key
        txt = map[key] ? map[key] : key
        return txt
      },
      getAuthTxt(data){
        var authRange = data.authRange,txt='无',provincesCode=data.provincesCode,cityCode=data.cityCode,areaCode=data.areaCode
        if(authRange==0){
          txt = '全国'
        }else if(authRange==1){
          if(provincesCode&&cityCode&&areaCode){
            txt = '区域： ' + this.util.getProvinceCityArea([provincesCode,cityCode,areaCode],this.chinaJson,true)
          }
        }
        return txt
      },
      getImgSrc(url){
        var src = url + ''
        if(src.indexOf('http') == -1){
          src = sessionStorage.imageHost + src
        }
        return src
      },
      // 上传图片
      myBeforeUpload(file){
        var vm = this;
        var type = file.type.split('/')[0],
          type2 = file.name.split('.')[file.name.split('.').length-1],
          name = file.name
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var item = {
            name: name,
            type: type,
            type2: type2,
            file: file,
            base64: reader.result
          }
          vm.fileArr = [item]
        }
        return false
      },
      handleFormatError(){},
      handleMaxSize(){},
      myUpload(){
        // 确认上传
        var vm = this
        if(!vm.fileArr.length){
          vm.$Message.error('请先选择上传的图片')
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
        vm.fileArr.forEach(item =>{
          params.append('file', item.file)
        });
        params.append('sId',sId)
        var s = vm.uploadImgSourceMap.service,p=vm.uploadImgPositionMap.service
        params.append('s',s)
        params.append('p',p)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          vm.uploadLoading = false
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.fileArr = [];
            vm.$Message.success('上传图片成功！');
            vm.formDialog.headPortrait = rd.data[0] || '';
          }else{
            vm.$Message.error(rd.message || '上传头像失败')
          }
        }).catch(err=>{
          vm.uploadLoading = false
        })
      },
      handleRemove(index){
        var vm = this
        vm.fileArr = []
        vm.formDialog.headPortrait = ''
      },
      // 手动上传头像背景
      myBeforeUpload2(file){
        var vm = this;
        var type = file.type.split('/')[0],
          type2 = file.name.split('.')[file.name.split('.').length-1],
          name = file.name
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var item = {
            name: name,
            type: type,
            type2: type2,
            file: file,
            base64: reader.result
          }
          vm.fileArr2 = [item]
        }
        return false
      },
      myUpload2(){
        var vm = this
        if(!vm.fileArr2.length){
          vm.$Message.error('请先选择上传的图片')
          return
        }
        vm.uploadLoading2 = true
        if(vm.currDialog=='add' && !vm.formDialog.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.formDialog.id = sId;
              vm.uploadFile2(sId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.formDialog.id
          vm.uploadFile2(sId)
        }
      },
      handleFormatError2(){},
      handleMaxSize2(){},
      uploadFile2(sId,userId){
        var vm = this;
        let params = new FormData();
        vm.fileArr2.forEach(item =>{
          params.append('file', item.file)
        });
        params.append('sId',sId)
        params.append('s',vm.uploadImgSourceMap.service)
        params.append('p',vm.uploadImgPositionMap.serviceBg)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          vm.uploadLoading2 = false
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.fileArr2 = [];
            vm.$Message.success('上传图片成功！');
            vm.formDialog.bgPortrait = rd.data[0] || '';
            
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{
          vm.uploadLoading2 = false
        })
      },
      handleRemove2(index){
        var vm = this
        vm.fileArr2 = []
        vm.formDialog.bgPortrait = ''
      },
      // 投稿上传图片、音频、视频
      myBeforeUpload3(file){
        var vm = this;
        var size = file.size,
          // 因为edge,firefox浏览器选择mp3文件，file.type得值是audio/mpeg
          type = file.type.split('/')[0],
          type2 = file.name.split('.')[file.name.split('.').length-1].toLocaleLowerCase(),
          name = file.name,
          imgMaxSize = vm.imgMaxSize,
          videoMaxSize = vm.videoMaxSize,
          audioMaxSize = vm.audioMaxSize,
          typeErrorTxt = vm.typeErrorTxt,
          imgFormat = vm.postUploadImgFormat,
          videoFormat = vm.postUploadVideoFormat,
          postFormat = vm.postUploadFormat,
          typeIsOk = false,
          sizeIsOK = false
        // 先验证类型，再验证大小  大小的单位为b
        for(let i=0;i<postFormat.length;i++){
          if(type2==postFormat[i]){
            typeIsOk = true
            break
          }
        }
        if(!typeIsOk){
          vm.$Message.error({
            content: typeErrorTxt,
            duration: 3
          })
          return false
        }
        if(type2=='mp4'){
          if(size/1000/1000>videoMaxSize){
            vm.$Message.error({
              content: `请选择小于${videoMaxSize}Mb的视频进行上传`,
              duration: 3
            })
            return false
          }
        }else if(type2=='mp3'){
          if(size/1000/1000>audioMaxSize){
            vm.$Message.error({
              content: `请选择小于${audioMaxSize}Mb的音频进行上传`,
              duration: 3
            })
            return false
          }
        }else{
          if(size/1000/1000>imgMaxSize){
            vm.$Message.error({
              content: `请选择小于${imgMaxSize}Mb的图片进行上传`,
              duration: 3
            })
            return false
          }
        }
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var imgMaxLength = 9
          var item = {
            name: name,
            type: type,
            type2: type2,
            file: file,
            base64: reader.result
          }
          if(type==vm.videoMark){
            vm.fileArr3 = [item]
          }else if(type==vm.audioMark){
            vm.fileArr3 = [item]
          }else{
            vm.fileArr3.forEach(item=>{
              if(item.type == vm.videoMark || item.type == vm.audioMark){
                vm.fileArr3 = []
                return
              }
            })
            var len = vm.fileArr3.length
            if(len<imgMaxLength){
              vm.fileArr3.push(item)
            }else{
              var arr = vm.util.deepcopy(vm.fileArr3)
              arr.push(item)
              arr.splice(0,1)
              vm.fileArr3 = arr
            }
          }
        }
        return false
      },
      myUpload3(){
        // 确认上传
        var vm = this
        if(!vm.fileArr3.length){
          vm.$Message.error('请先选择要上传的文件！')
          return
        }
        vm.uploadLoading3 = true
        if(vm.currentSubmissionDialog=='add'&&!vm.submissionformDialog.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.submissionformDialog.id = sId;
              vm.uploadFile3(sId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.submissionformDialog.id
          vm.uploadFile3(sId)
        }
      },
      uploadFile3(sId, userId){
        var vm = this;
        let params = new FormData();
        var uploadArr = []
        if(vm.currentSubmissionDialog=='add'){
          uploadArr = vm.fileArr3
        }else if(vm.currentSubmissionDialog=='edit'){
          uploadArr = vm.fileArr3.slice(vm.originalLength)
        }
        uploadArr.forEach(item=>{
          if(item.type == vm.videoMark || item.type == vm.audioMark){
            // 可以上传多个音频或视频时需要将此提示移除循环
            vm.$Message.info('上传音频或视频耗时较长，请耐心等待')
          }
          params.append('file',item.file)
        })
        params.append('sId',sId)
        var s = vm.uploadImgSourceMap.service,p=vm.uploadImgPositionMap.service
        params.append('s',s)
        params.append('p',p)
        var config =  {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 20000
        };
        var systemUserId = null
        if(sessionStorage.sysUser){
          systemUserId = JSON.parse(sessionStorage.sysUser).id
        }
        userId = userId || systemUserId || sId
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          vm.uploadLoading3 = false
          let rd = res.data;
          if(rd.code==1){
            vm.fileArr3 = []
            vm.$Message.success('上传成功！');
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{
          vm.uploadLoading3 = false
        })
      },
      handleRemove3(index,data){
        var vm = this
        vm.fileArr3.splice(index, 1)
        // if(vm.currentSubmissionDialog == 'add'){
        //   vm.fileArr3.splice(index, 1)
        // }else{
        //   // 编辑时有删除可以提交的数据
        //   console.log(data)
        // }
      },
      // 上传图片  end
      // 投稿
      closeSubmission(){
        this.submissionShow = false
        this.currentServiceNumberId = ''
      },
      resetSubmissionSearch(name){
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitSubmissionSearch(name)
      },
      submitSubmissionSearch(name){
        var vm = this,item
        for(let key in vm.submissionformSearch){
          item = vm.submissionformSearch[key]
          if(typeof(item) == 'undefined'){
            vm.submissionformSearch[key] = ''
          }
        }
        var obj = $.extend(vm.submissionPager, vm.submissionformSearch);
        $.each(obj, function (key, val) {
          // 因为   0 == ''  结果为true
          if (val instanceof String && val == '') {
            delete obj[key];
          }
        });
        vm.submissionPager = obj;
        vm.submissionPaging(1);
      },
      initSubmissionData(id){
        var vm = this,item
        for(let key in vm.submissionformSearch){
          item = vm.submissionformSearch[key]
          if(typeof(item) == 'undefined'){
            vm.submissionformSearch[key] = ''
          }
        }
        vm.submissionformSearch.serviceNumberId = id
        var obj = $.extend(vm.submissionPager, vm.submissionformSearch);
        $.each(obj, function (key, val) {
          // 因为   0 == ''  结果为true
          if (val instanceof String && val == '') {
            delete obj[key];
          }
        });
        vm.submissionPager = obj;
        vm.submissionPaging()
      },
      submissionChangePager(data){
        let vm = this
        var pager = vm.submissionPager
        if (typeof data === 'object') {
          for (let key in data) {
            pager[key] = data[key]
          }
        } else {
          pager.current = data
        }
        vm.submissionPager = pager
        vm.submissionPaging()
      },
      submissionPaging(data){
        let vm = this
        if (Number(data)) {
          vm.submissionChangePager(data)
          return
        }
        var pager = {},method='post',ajaxData = {},params={}
        pager = vm.submissionPager
        method = pager.method || method
        ajaxData = vm.pagingFiltData(pager)
        params = {
          url: pager.url,
          method: method,
        }
        if(method=='get'){
          params.params = ajaxData
        }else{
          params.data = ajaxData
        }
        vm.submissionPageLoading = true
        vm.$http(params).then(res => {
          let resData = res.data,data=[],total=0
          vm.submissionPageLoading = false
          if(resData.records){
            data = resData.records
            total = resData.total
          }else if (resData.code == 1) {
            if(resData.data && typeof(resData.data.records) != 'undefined'){
              data = resData.data.records
              total = resData.data.total
            }else if(resData.data){
              data = resData.data
              total = resData.total
            }
          }
          if(!data)data=[]
          if(!total)total=0
          setTimeout(function(){
            pager.total = total
            pager.data = data
            vm.submissionPager = pager
          },50)
        }).catch(err=>{
          vm.submissionPageLoading = false
        })
      },
      addSubmissionRow(id){
        var vm = this
        vm.submissionDialogShow = true
        vm.currentSubmissionDialog = 'add'
        if(typeof(id) != 'object'){
          vm.submissionformDialog.serviceNumberId = id
        }else if(vm.currentServiceNumberId){
          vm.submissionformDialog.serviceNumberId = vm.currentServiceNumberId
        }
      },
      resetSubmissionDialogForm(name){
        var vm = this
        vm.uploadLoading3 = false
        vm.fileArr3 = []
        vm.submissionformDialog.id = ''
        vm.submissionformDialog.status = 0
        vm.$refs[name].resetFields()
      },
      submitSubmissionDialogForm(name){
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            var pager = vm.submissionPager,currDialog=vm.currentSubmissionDialog
            let ajaxUrl = vm.url.submission[currDialog]
            var method =  pager.method
            if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
              method = pager.addMethod
            }
            if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
              method = pager.editMethod
            }
            let ajaxData = {}
            for(let key in vm.submissionformDialog){
              if(key == 'id'){
                ajaxData[key] = Number(vm.submissionformDialog[key])
              }else{
                ajaxData[key] = vm.submissionformDialog[key]
              }
            }
            var params = {
              url: ajaxUrl,
              method: method,
            }
            if(method=='get'|| method=='delete'){
              params.params = ajaxData
            }else{
              params.data = ajaxData
            }
            vm.submissiondialogSubmitLoading = true
            vm.$http(params).then(res => {
              vm.submissiondialogSubmitLoading = false
              var resData = res.data
              if(resData.code==1){
                vm.$Message.success(vm.label[currDialog]+'成功!')
                if(currDialog=='add'){
                  vm.submissionPaging(1);
                }else{
                  vm.submissionPaging();
                }
                vm.submissionDialogShow = false
                vm.resetSubmissionDialogForm(name)
              }else{
                vm.$Message.error(vm.label[currDialog]+'失败: ' + resData.message)
              }
            }).catch(err=>{
              vm.submissiondialogSubmitLoading = false
            })
          }
        })
      },
      accept(id){
        var vm = this
        // type 通过审核1  不通过审核2
        var params = {
          url: vm.url.submission.examine,
          method: 'post',
          data: {
            id: id
          }
        }
        vm.$http2(params).then(res=>{
          if(res&&res.status==200){
            if(res.data.code==1){
              vm.$Message.success('审核成功！')
              vm.submissionPaging()
            }else{
              vm.$Message.info(res.data.message || '审核失败，请重试')
            }
          }
        }).catch(err=>{})
      },
      editSubmission(data){
        var vm = this
        for(let key in vm.submissionformDialog){
          vm.submissionformDialog[key] = key == 'serviceNumberId' ? Number(data.serviceNumberId) : data[key]
        }
        if(data.fileManageList.length){
          var fileManageList = data.fileManageList[0],imageHost=sessionStorage.imageHost,fileItem = {},fileArr3=[]
          var fileType = fileManageList.fileType,
            filePath = fileManageList.filePath,
            fileList = fileManageList.fileList
          fileList.forEach(item=>{
            var type = vm.imageMark
            if(fileType==1){

            }else if(fileType==2){
              type = vm.videoMark
            }
            fileItem = {
              type: type,
              base64: imageHost + filePath + item.fileName,
              delData: {
                filePath: filePath,
                fileName: item.fileName
              }
            }
            fileArr3.push(fileItem)
          })
          vm.originalLength = fileArr3.length
          vm.fileArr3 = fileArr3
        }
        vm.currentSubmissionDialog = 'edit'
        vm.submissionDialogShow = true
      },
      delSubmission(data){
        var vm = this
        var params = {
          url: vm.url.submission.delete,
          params: data,
          method: 'delete'
        }
        vm.$http2(params).then(res => {
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success("删除成功！")
            vm.submissionPaging()
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{

        })
      },
      // 投稿  end
      getImgsSrc(data){
        var vm=this,arr =[],src=''
        if(data&&data.length){
          var imageHost = sessionStorage.imageHost,
            fileType = data[0].fileType,
            filePath = data[0].filePath,
            fileList = data[0].fileList
          if(fileType==1){
            // 图片
            if(fileList.length){
              fileList.forEach(item=>{
                src = imageHost + filePath + item.fileName
                arr.push(src)
              })
            }
          }else if(fileType==2){
            if(fileList.length){
              fileList.forEach(item=>{
                src = imageHost + filePath + item.fileName
                var poster = imageHost + filePath + item.fileVideoImage
                arr.push({
                  poster: poster,
                  src: src
                })
              })
            }
          }
        }
        return arr
      },
      // 重置搜索表单
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.derail_address_arr2 = []
        vm.$refs[name].resetFields()
        vm.submitSearch(name)
      },
      submitSearch(name){
        var vm = this,item
        for(let key in vm.formSearch){
          item = vm.formSearch[key]
          if(typeof(item) == 'undefined'){
            vm.formSearch[key] = ''
          }
        }
        var obj = $.extend(vm.pager, vm.formSearch);
        $.each(obj, function (key, val) {
          // 因为   0 == ''  结果为true
          if (val instanceof String && val == '') {
            delete obj[key];
          }
        });
        vm.pager = obj;
        vm.paging(1);
      },
      initOther(){
        var vm = this
        vm.$http(vm.url.all).then(res=>{
          if(res&&res.status==200){
            if(res.data.code==1){
              var serviceNumberId = [],serviceNumberIdMap={}
              res.data.data.forEach(item=>{
                serviceNumberId.push({
                  value: item.id,
                  label: item.name || item.id
                })
                serviceNumberIdMap[item.id] = item.name || item.id
              })
              vm.serviceNumberId = serviceNumberId
              vm.serviceNumberIdMap = serviceNumberIdMap
            }else{
              vm.$Message.info(res.data.message || '服务数据初始化失败，请按F5刷新页面重试')
            }
          }
        })
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.formDialog.id=''
        vm.fileArr = []
        vm.fileArr2 = []
        vm.derail_address_arr = []
        vm.$refs[name].resetFields()
      },
      // initPostDialog(data){
      //   var systemUserId = JSON.parse(sessionStorage.sysUser).id || ''
      //   // 没有选择是默认给当前登录的系统用户id
      //   if(this.currDialog=='add' && !data.sysUserId){
      //     this.formDialog.sysUserId = systemUserId
      //   }
      // },
      initDialog(data){
        var vm = this,imageHost=sessionStorage.imageHost
        if(data.areaCode){
          var provincesCode = parseInt(data.areaCode/10000)*10000
          var cityCode = parseInt(data.areaCode/100)*100
          vm.derail_address_arr = [provincesCode,cityCode,data.areaCode]
        }
        if(data.headPortrait){
          var headPortrait = data.headPortrait
          if(headPortrait.indexOf('http' == -1)){
            headPortrait = imageHost + headPortrait
          }
          vm.fileArr = [{
            base64: headPortrait
          }]
        }
        if(data.bgPortrait){
          var bgPortrait = data.bgPortrait
          if(bgPortrait.indexOf('http' == -1)){
            bgPortrait = imageHost + bgPortrait
          }
          vm.fileArr2 = [{
            base64: bgPortrait
          }]
        }
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
        var pager = {},method='post',ajaxData = {},params={}
        // 搜索和列表共用分页，通过状态判断是搜索翻页还是列表翻页  点击搜索进入搜索状态，点击清空退出搜索状态
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
        var ajaxData2 = {}
        for(let key in ajaxData){
          if(key != 'current' && key != 'size'){
            ajaxData2[key] = ajaxData[key]
          }
        }
        var ajaxUrl = pager.url + '?current=' + ajaxData['current'] + '&size=' + ajaxData['size']
        params = {
          url: ajaxUrl,
          method: method,
        }
        if(method=='get'){
          params.params = ajaxData2
        }else{
          params.data = ajaxData2
        }
        vm.pageLoading = true
        vm.$http(params).then(res => {
          let resData = res.data,data=[],total=0
          vm.pageLoading = false
          if(resData.records){
            data = resData.records
            total = resData.total
          }else if (resData.code == 1) {
            if(resData.data && typeof(resData.data.records) != 'undefined'){
              data = resData.data.records
              total = resData.data.total
            }else if(resData.data){
              data = resData.data
              total = resData.total
            }
          }
          if(!data)data=[]
          if(!total)total=0
          if (typeof vm.pagerResult == 'function') {
            // 返回数据预处理
            resData.data = vm.pagerResult(data)
          }
          if(typeof vm.initOther == 'function'){
            vm.initOther(data)
          }
          setTimeout(function(){
            pager.total = total
            pager.data = data
            typeof vm.searchPager == 'undefined' ? vm.pager = pager : vm.currentPager = pager
            // vm.pager = pager
            // vm.currentPager = pager
          },50)
        }).catch(err=>{
          vm.pageLoading = false
        })
      },
      initServiceNumberId(){
        var vm = this
        var params = {
          url: vm.url.serviceClassify
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var classId = [],classIdMap={},key,val
            resData.data.forEach(item=>{
              key = item.id + ''
              val = item.serviceNumberClassName || item.id + ''
              classId.push({
                value: key,
                label: val
              })
              classIdMap[key] = val
            })
            vm.classId = classId
            vm.classIdMap = classIdMap
          }else{
            vm.$Message.info(resData.message || '服务所属分类加载失败，请刷新重试')  
          }
        }).catch(()=>{
          vm.$Message.info('服务所属分类加载失败，请刷新重试')
        })
      },
      initAgent(){
        var vm = this
        var params = {
          method: 'post',
          url: vm.url.systemAgent
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var sysUserId=[],sysUserIdMap={},key,val
            resData.data.forEach(item=>{
              key = item.id
              val = item.nickName || item.id
              sysUserId.push({
                value: key,
                label: val
              })
              sysUserIdMap[key] = val
            })
            vm.sysUserId = sysUserId
            vm.sysUserIdMap = sysUserIdMap
          }
        }).catch(function(){})
      },
      initData(){
        var vm = this
        vm.initServiceNumberId()
        vm.initAgent()
        vm.chinaJson = JSON.parse(sessionStorage.chinaJson)
        vm.chinaData = JSON.parse(sessionStorage.chinaData)
      }
    },
    mounted(){
      var vm = this
      // 图片拖拽
      vm.$dragging.$on('dragged', () => {})
      vm.$dragging.$on('dragend', () => {})
    }
  }
</script>
<style scoped>
  .service-item{
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .preview-img-container{
    display: block;
    float: left;
    width: 210px;
    height: 210px;
    text-align: center;
    line-height: 210px;
    margin: 10px;
    padding: 10px;
    border: 1px solid #eee;
  }
  .table-image{
    max-width: 120px;
    max-height: 120px;
  }
  .drag-box{
    width: 140px;
    height: 140px;
    float: left;
  }
</style>
