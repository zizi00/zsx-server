<template>
  <div class="work-matter">
    <!-- 高级搜索 -->
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="70">
        <template v-if="hasPerm('workMatter:import')">
          <Upload name="file"
                  :action="url.importMatter"
                  accept=".xlsx"
                  :on-success="upExeclSuccess2"
                  :format="['xlsx']"
                  :on-format-error="handleFormatError2"
                  :show-upload-list="false"
                  style="display:inline-block;float:left;">
            <Button type="primary" size="small" style="margin-top:5px;">导入办事事项</Button>
          </Upload>
          <Upload name="file"
                  :action="url.importMatterAddress"
                  accept=".xlsx"
                  :on-success="upExeclSuccess3"
                  :format="['xlsx']"
                  :on-format-error="handleFormatError2"
                  :show-upload-list="false"
                  style="display:inline-block;float:left;">
            <Button type="primary" size="small" style="margin-top:5px;margin-left:10px;">导入办事地址</Button>
          </Upload>
        </template>
        <template v-if="hasPerm('workMatter:search')">
          <FormItem label="事项名称" prop="matterName">
            <Input v-model="formSearch.matterName" placeholder="事项名称" size="small" style="width: 120px" @keydown.native.enter.prevent="submitSearch(true)"></Input>
          </FormItem>
          <FormItem label="关联地区">
              <Cascader :data="derail_address_arr_ss" v-model="derail_address_obj_s" @on-change="searchAddrChange" placeholder="请选择" filterable size="small" style="margin-top: 5px;"></Cascader>
          </FormItem>
          <!-- <FormItem label="所属分类" prop="workClassId">
            <Select v-model="formSearch.workClassId" size="small" clearable filterable>
              <Option v-for="item in searchWorkClassId" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem> -->
          <FormItem label="所属分类" prop="workMatterClassName">
            <el-select v-model="formSearch.workMatterClassName" placeholder="请选择" filterable size="mini">
              <el-option
                v-for="item in workMatterClassName"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <!-- <Select v-model="formSearch.workMatterClassName" size="small" clearable filterable>
              <Option v-for="item in workMatterClassName" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select> -->
          </FormItem>
          <FormItem label="状态" prop="matterStatus">
            <Select v-model="formSearch.matterStatus" placeholder="请选择" style="width: 80px;" size="small" clearable>
              <Option v-for="item in matterStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin:5px 8px 24px 0;" @click="submitSearch(true)" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <Button v-if="hasPerm('workMatter:add')" type="primary" style="margin:5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <Button v-if="hasPerm('workMatter:clearCache')" type="warning" style="margin:5px 8px 24px 0;" @click="clearCache('办事事项')" size="small">{{label.clearCache}}</Button>
      </Form>
    </div>
    <mainTable :columns="columns" :data="pager.data" :height="tableHeight" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.nowpage" :currPageKey="'nowpage'" :pageSizeKey="'pagesize'" :loading="pageLoading"></paging>
    <!-- 弹出框 -->
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="950" @on-cancel="resetDialogForm('formDialog')" :styles="{top:'30px'}">
      <div style="max-height: 700px;overflow-y: auto;">
        <el-form :model="formDialog" ref="formDialog" :rules="rules" label-width="100px">
          <Row>
            <Col span="12">
              <el-form-item label="事项名称" prop="matterName">
                <Input v-model="formDialog.matterName" placeholder="请输入事项名称" @on-blur="onBlur"></Input>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="服务对象" prop="serviceObject">
                <Input v-model="formDialog.serviceObject" placeholder="请输入服务对象"></Input>
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="事项来源" prop="matterSoucreName">
                <Input v-model="formDialog.matterSoucreName" placeholder="请输入事项来源"></Input>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="收费标准" prop="chargingStandard">
                <Input v-model="formDialog.chargingStandard" placeholder="请输入收费标准"></Input>
              </el-form-item>
            </Col>
            <!-- <Col span="12">
              <el-form-item label="发布时间" prop="matterCreateTime">
                <DatePicker type="date" v-model="matterCreateTime" @on-change="createTimeChange" :editable="false" placeholder="请选择日期"></DatePicker>
              </el-form-item>
            </Col> -->
          </Row>
          <Row>
            <Col span="12">
              <!-- <el-form-item label="所属分类" prop="workClassId">
                <Select v-model="formDialog.workClassId" placeholder="请选择所属分类" clearable filterable>
                  <Option v-for="item in workClassId" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </el-form-item> -->
              <el-form-item label="所属分类" prop="workMatterClassName">
                <el-select v-model="formDialog.workMatterClassName" placeholder="请选择所属分类" filterable size="small">
                  <el-option v-for="item in workMatterClassName" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="分类关联省市">
                <Cascader :data="derail_address_arr" v-model="addrDialog.derail_address_obj" placeholder="无数据时，请先添加分类关联省市数据" clearabled></Cascader>
                <!-- <Cascader :data="derail_address_arr" @on-change="addrChange" v-model="addrDialog.derail_address_obj" filterable placeholder="无数据时，请先添加分类关联省市数据" clearabled></Cascader> -->
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="办理条件" prop="requiredConditions">
                <Input v-model="formDialog.requiredConditions" :rows="8" type="textarea" placeholder="请添加办理条件"></Input>
                <!-- <Row>
                  <Col span="18">
                    <Input v-model="formDialog.requiredConditions" disabled placeholder="请添加办理条件"></Input>
                  </Col>
                  <Col span="6" style="text-align: right;">
                    <Button size="small" type="primary" @click="showHandleDialog('handleModal','requiredConditions')">{{label[currDialog]}}</Button>
                  </Col>
                </Row> -->
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="办理依据" prop="managementBasis">
                <Input :rows="8" type="textarea" v-model="formDialog.managementBasis" placeholder="请输入办理依据"></Input>
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="所需材料" prop="materialRequested">
                <Input v-model="formDialog.materialRequested" :rows="8" type="textarea" placeholder="请添加所需材料"></Input>
                <!-- <Row>
                  <Col span="18">
                    <Input v-model="formDialog.materialRequested" disabled placeholder="请添加所需材料"></Input>
                  </Col>
                  <Col span="6" style="text-align: right;">
                    <Button size="small" type="primary" @click="showHandleDialog('handleModal','materialRequested')">{{label[currDialog]}}</Button>
                  </Col>
                </Row> -->
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="限时说明" prop="timeLimitExplanation">
                <Input :rows="8" type="textarea" v-model="formDialog.timeLimitExplanation" placeholder="请输入限时说明"></Input>
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="网上流程" prop="onlineManagement">
                <Input v-model="formDialog.onlineManagement" :rows="8" type="textarea" placeholder="请添加网上流程"></Input>
                <!-- <Row>
                  <Col span="18">
                    <Input v-model="formDialog.onlineManagement" disabled placeholder="请添加网上流程"></Input>
                  </Col>
                  <Col span="6" style="text-align: right;">
                    <Button size="small" type="primary" @click="showHandleDialog('handleModal','onlineManagement')">{{label[currDialog]}}</Button>
                  </Col>
                </Row> -->
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="窗口流程" prop="windowManagement">
                <Input v-model="formDialog.windowManagement" :rows="8" type="textarea" placeholder="请添加窗口流程"></Input>
                <!-- <Row>
                  <Col span="18">
                    <Input v-model="formDialog.windowManagement" disabled placeholder="请添加窗口流程"></Input>
                  </Col>
                  <Col span="6" style="text-align: right;">
                    <Button size="small" type="primary" @click="showHandleDialog('handleModal','windowManagement')">{{label[currDialog]}}</Button>
                  </Col>
                </Row> -->
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="工作电话" prop="workPhone">
                <Input v-model="formDialog.workPhone" placeholder='请填工作电话'></Input>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="监督电话" prop="complaintPhone">
                <Input v-model="formDialog.complaintPhone" placeholder='请填写监督电话'></Input>
              </el-form-item>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <el-form-item label="事项图标">
                <!-- <Row>
                  <Col span="12">
                    <div style="width:130px;height:130px;border:1px solid #eee;">
                      <img v-if="formDialog.matterIcon" style="max-width:100%;" :src="formDialog.matterIcon" />
                      <img v-else style="max-width:100%;" src="static/images/img-upload-default.png"/>
                    </div>
                  </Col>
                  <Col span="12" style="text-align:right;">
                    <Upload name="upfile"
                            action="ueditor/upload.do"
                            :on-success="handleSuccess"
                            :show-upload-list="false"
                            :format="['jpg','jpeg','png']"
                            :on-format-error="handleFormatError">
                      <Button type="default" icon="ios-cloud-upload-outline">{{label.uploadImg}}</Button>
                    </Upload>
                  </Col>
                </Row> -->
                <Row>
                  <Col span="12">
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
                  <Col span="12">
                    <Row v-if="fileUrl.length">
                      <Col span="8" v-for="(item, index) in fileUrl" :key="item">
                        <div class="image-box">
                          <img :src="item" class="ad-img">
                          <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div v-show="!fileUrl.length" class="image-box">
                      <img :src="defaultUploadImgSrc" class="ad-img">
                    </div>
                  </Col>
                </Row>
              </el-form-item>
            </Col>
            <Col span="12">
              <el-form-item label="事件状态">
                <Select v-model="formDialog.matterStatus" placeholder="请选择事件状态" style="width:150px;">
                  <Option v-for="item in matterStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </el-form-item>
            </Col>
          </Row>
          <!-- <Row>
            <Col span="12">
              <el-form-item label="事项级别">
                <Select v-model="workerLevel" placeholder="请选择" style="width:150px;">
                  <Option v-for="item in level" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </el-form-item>
            </Col>
          </Row> -->
          <!-- <Row v-if="workerLevel==2"> -->
          <Row>
            <Col span="12">
              <el-form-item label="办事地址">
                <Button @click="addAddrBtn">添加地址</Button>
              </el-form-item>
            </Col>
          </Row>
          <Row v-for="(item,index) in addrDialog.addressArr.slice(0,2)" :key="index" style="margin-bottom: 8px;">
            <Col span="18">
              办事地址{{index+1}}:  {{item}}
            </Col>   
            <Col span="6">
              <Button size="small" type="primary" @click="editAddrBtn(index)">编辑</Button>
              <Button size="small" type="error" @click="delAddr(index)" style="margin-left:8px;">删除</Button>
            </Col>
          </Row>
          <Button v-if="addrDialog.addressArr.length>2" size="small" type="primary" @click="isPreview=false;seeAddress(formDialog)">查看更多</Button>
        </el-form>
      </div>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 地址列表 -->
    <Modal v-model="addressList" title="地址列表" :mask-closable="false" @on-cancel="closeAddrList" width="1100" :styles="{'top': '30px'}">
      <!-- 后期这里还要做搜索功能 -->
      <Row>
          <Col span="12" v-for="(item,index) in addrDialog.addressArr" :key="index" style="margin-bottom: 8px;"> 
              <Row v-if="!isPreview">
                  <Col span="18">
                      办事地址{{index+1}}:  {{item}}
                  </Col>   
                  <Col span="5" offset="1" >
                      <Button size="small" type="primary" @click="editAddrBtn(index)">编辑</Button>
                      <Button size="small" type="error" @click="delAddr(index)" style="margin-left:8px;">删除</Button>
                  </Col>
              </Row>
              <div v-else>
                办事地址{{index+1}}:  {{item}}
              </div>
          </Col>                
      </Row>
      <div slot="footer">
        <Button type="primary" @click="closeAddrList">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 地址弹出框 -->
    <Modal v-model="addrModal" :title="addEdit ? label.add : label.edit" :mask-closable="false" width="750" @on-cancel="resetAddr('addrDialog')">
        <Form :model="addrDialog" ref="addrDialog" :rules="rules" :label-width="100"> 
          <Row>
            <Col span="12">
                <FormItem label="区">
                    <Select v-model="addrDialog.areasId" placeholder="请选择所属区">
                        <Option v-for="item in areasId" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
            </Col>
            <Col span="12">
                <FormItem label="工作时间" prop="workDate">    
                    <Input v-model="addrDialog.workDate" placeholder='请填工作时间'></Input>
                </FormItem>
            </Col>
          </Row>           
          <Row>
            <Col span="24">
                <FormItem label="窗口单位名称" prop="companyName">                             
                    <Input v-model="addrDialog.companyName" placeholder='请填写窗口单位名称'></Input>
                </FormItem>
            </Col>
          </Row>
          <Row>                
            <Col span="24">
                <FormItem label="详细地址" prop="workAddress"> 
                    <Input v-model="addrDialog.workAddress" placeholder='请填写详细地址'></Input>
                </FormItem>
            </Col>                
          </Row>    
          <Row>
            <Col span="12">
                <FormItem label="事项链接" prop="matterSoucreUrl">
                    <Input v-model="addrDialog.matterSoucreUrl" placeholder="请输入事项链接"></Input>
                </FormItem>
            </Col>
          </Row>      
      </Form>
      <div slot="footer">
        <Button @click="resetAddr('addrDialog')">取消</Button>
        <Button type="primary" @click="beSure('addrDialog')">确定</Button>
      </div>
    </Modal>
    <!-- 预览 -->
    <Modal v-model="previewModal" title="预览" id="preview-modal" :mask-closable="false" :styles="{top:'30px'}" width="750" @on-cancel="resetPreview">
      <Row>
          <Col span="24" class="title">事项基本信息:</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
          <Col span="12">事项名称:  {{previewData.matterName}}</Col>
          <Col span="12" id="service-object">服务对象:  {{previewData.serviceObject}}</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
          <Col span="12">事项来源:  {{previewData.matterSoucreName}}</Col>
          <Col span="12">事项图标:  <img style="max-width: 100px;" :src="previewData.matterIcon" /></Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
          <!-- <Col span="12">所属分类:  {{previewData.workClassId}}</Col> -->
          <Col span="12">所属分类:  {{previewData.workMatterClassName}}</Col>
          <Col span="12">发布时间:  {{previewData.matterCreateTime}}</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
          <Col span="12">限时说明:  {{previewData.timeLimitExplanation}}</Col>
          <Col span="12">收费标准:  {{previewData.chargingStandard}}</Col>
      </Row>
      <Row :gutter="16" class-name="preview-row">
          <Col span="12">关联省市:  {{previewData.provinceCity}}</Col>
          <Col span="12">事项状态:  {{previewData.matterStatus}}</Col>
      </Row>        
      <Row :gutter="16" class-name="preview-row" style="border-bottom: .5px solid #e9eaec;padding-bottom: 5px;">
          <Col span="12">工作电话:  {{previewData.workPhone}}</Col>
          <Col span="12">监督电话:  {{previewData.complaintPhone}}</Col>
      </Row>        
      <Row class-name="preview-row">
          <Col span="24">                
              <div class="title">办理条件:</div>
              <div class="preview-txt">{{previewData.requiredConditions}}</div>
          </Col>
      </Row>
      <Row class-name="preview-row">
          <Col span="24">                
              <div class="title">所需材料:</div>
              <div class="preview-txt">{{previewData.materialRequested}}</div>
          </Col>
      </Row>
      <Row class-name="preview-row">
          <Col span="24">                
              <div class="title">网上流程:</div>
              <div class="preview-txt">{{previewData.onlineManagement}}</div>
          </Col>
      </Row>
      <Row class-name="preview-row">
          <Col span="24">                
              <div class="title">窗口流程:</div>
              <div class="preview-txt">{{previewData.windowManagement}}</div>
          </Col>
      </Row>
      <Row class-name="preview-row">
          <Col span="24">
              <div class="title">办理依据:</div>
              <div class="preview-txt">{{previewData.managementBasis}}</div>
          </Col>
      </Row>
      <div slot="footer">
        <Button type="primary" @click="resetPreview">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 2 -->
    <Modal v-model="handleModal" :title="label[currDialog] + handleTitleText" :mask-closable="false" @on-cancel="handleCancle">
        <Row style="margin-bottom: 10px;">
            <Button type="primary" @click="showHandleDialog('addHandleModal')" size="small">{{label.add}}</Button>
        </Row>
        <Row v-for="(item,index) in handleData" :key="index" style="margin-bottom: 10px;">
            <Col span="18">
                <Input :value="item" disabled size="small"></Input>
            </Col>
            <Col span="6">
                <Button type="primary" @click="editHandle(index)" size="small" style="margin-left: 10px;margin-right: 10px;">{{label.edit}}</Button>
                <Button type="error" @click="deleteHandle(index)" size="small">{{label.delete}}</Button>
            </Col>
        </Row>
        <div slot="footer">
            <Button @click="handleCancle">取消</Button>            
            <Button type="primary" @click="handleBesure">确定</Button>
        </div>
    </Modal>
    <!-- 3 -->
    <Modal v-model="addHandleModal" :title="label[currDialog]" :mask-closable="false" @on-cancel="addHandleCancle">
        <Form :model="addHandleDialog" ref="addHandleDialog" :rules="rules" :label-width="80">
            <FormItem :label="handleTitleText" prop="addHandleText">                             
                <Input v-model="addHandleDialog.addHandleText" placeholder='添加内容'></Input>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button @click="addHandleCancle">取消</Button>
            <Button type="primary" @click="addHandleBesure">确定</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'workMatter',
    components: {
      mainTable,
      paging
    },
    mixins: [page],
    data () {
      return {
        url: {
          add: 'web/work/matter/add',
          edit: 'web/work/matter/edit',
          delete: 'web/work/matter/delete',
          workclass: 'web/work/class/dataGrid',
          check: '',
          upload: 'file/',
          sId: 'id/id',
          importMatter: process.env.NODE_ENV == 'production' ? 'fwmp/api/web/work/matter/excel/file' : 'api/fwmp/api/web/work/matter/excel/file',
          importMatterAddress: process.env.NODE_ENV == 'production' ?  'fwmp/api/web/work/address/excel/file' : 'api/fwmp/api/web/work/address/excel/file',
          address: {
            add: 'web/work/address/add',
            delete: 'web/work/address/delete',
            edit: 'web/work/address/edit'
          },
          clearCache: 'web/cache/work'
        },
        pager: {
          data: [],
          url: 'web/work/matter/dataGrid',
          method: 'post',
          addMethod: 'post',
          editMethod: 'post',
          searchMethod: 'post',
          nowpage: 1,
          pagesize: 10,
        },
        // 是不是预览状态  预览状态不显示编辑删除按钮
        isPreview: false,
        fileUrl: [],
        uploadImgArr: [],
        uploadLoading: false,
        // 是否通过事项名称重复的检查
        checking: true,
        addressList: false,
        searchWorkClassId: [],
        allWorkClassId: [],
        allWorkClassIdMap: {
          // 市code : [ 该市的所有分类 ]
        },
        workClassIdCitiesIdMap: {
          //  办事分类id:  [该分类对应的所有市]
        },
        workClassId: [],
        workClassIdMap: {}, // 全部分类的map
        workMatterClassName: [],
        workerLevel: 2,
        level: [
          {
            value: 1,
            label: '全国'
          },
          {
            value: 2,
            label: '区域'
          }
        ],
        levelMap: {
          1: '全国',
          2: '地区'
        },
        matterStatus: [
          {
            value: 0,
            label: '无效'
          },
          {
            value: 1,
            label: '有效'
          }
        ],
        editIndex: 0, // 编辑地址的索引
        previewData: {},
        // 区数据
        areasId: [],
        addrModal: false,
        previewModal: false,
        handleModal: false,
        addHandleModal: false,
        handleTitleText: '',
        addEdit: true, //默认是新增
        derail_address_arr: [],
        // 操作数据
        handleData: [], //存储操作数据  在取消或确定时清空 例子: ["办理条件1","办理条件2","办理条件3"],属于回显数据，还需要一个用于提交的数据 needSubmitData
        addHandleDialog: {
          addHandleText: ""
        },
        handleTitle: {
          requiredConditions: "办理条件",
          materialRequested: "所需材料",
          onlineManagement: "网上流程",
          windowManagement: '窗口流程'
        },
        handleValue: {
          requiredConditions: [],
          materialRequested: [],
          onlineManagement: [],
          windowManagement: []
        },
        handleIndex: null,
        handleAddEdit: true,//true表示新增，false表示编辑
        handleVar: "",//存储添加或编辑的是哪个数据 值为handleTitle的某个key
        handleObj: '',
        delimiter: '、',
        editAddrData: [], //编辑地址时点击过编辑按钮的数据  ，在提交表单或取消提交时重置
        // 操作数据 end
        addrDialog: {
          areasId: "",             
          workMatterId: "",//事项ID
          matterSoucreUrl: "",//事项链接
          derail_address_obj: [],//省市id数组
          workAddress: "",//详细地址
          address: {},//省市区+具体地址
          addressArr:[],//详细地址数组
          workDate: "",//工作时间                
          companyName: ""//窗口单位名称
        },
        chinaJson: {},
        derail_address_obj_s: [],
        derail_address_arr_ss: [],
        provinceCityData: [],
        provinceCity: [],
        formSearch: {
          matterName: '',
          // workClassId: '',
          workMatterClassName: '',
          matterStatus: '',
          // areaId: '',
          citiesId: '',
        },
        matterCreateTime: '',
        formDialog: {
          id: '',
          provincesId: '',
          citiesId: '',
          cityCodes: [],
          matterName: '', // 事项名称
          matterSoucreName: '', // 事项来源
          matterIcon: '',
          // workClassId: '', // 所属分类  变成workMatterClassId
          workMatterClassName: '', // 所属分类名称
          matterCreateTime: '',// 发布时间
          matterStatus: 1, // 事件状态
          requiredConditions: '', // 办理条件
          materialRequested: '', // 所需材料
          onlineManagement: '', // 网上流程
          windowManagement: '', // 窗口流程
          timeLimitExplanation: '', // 限时说明
          chargingStandard: '', // 收费标准
          managementBasis: '', // 办理依据
          serviceObject: '', // 服务对象
          workPhone: '', // 工作电话
          workMatterAddressesList: [], // 编辑时至少有一个值
          complaintPhone: '' // 监督电话
        },
        // 全国性的事项地址默认值
        defaultWorkerWindow: {
          areasId: 1,
          companyName: '',
          matterSoucreUrl: '',
          workAddress: '',
          workDate: '',
        },
        columns: [
          {
            title: 'ID',
            key: 'id',
            fixed: 'left',
            width: 180
          },
          {
            title: '事项名称',
            key: 'matterName',
            width: 180
          },
          {
            title: '服务对象',
            key: 'serviceObject',
            width: 200,
            ellipsis: true
          },
          {
            title: '事项来源',
            key: 'matterSoucreName',
            width: 220
          },
          {
            title: '所属分类',
            // key: 'workClassId',
            key: 'workMatterClassName',
            width: 100,
            // render: (create, params) => {
            //   var key = params.row.workClassId,map=this.workClassIdMap
            //   var txt = map[key] ? map[key] : key
            //   return create('span',txt)
            // }
          },
          {
            title: '事项区域',
            key: 'workerRegion',
            width: 220,
            render: (create, params) => {
              let vm = this,provincesId=params.row.provincesId,citiesId=params.row.citiesId,txt='无'
              if(provincesId==1&&citiesId==1){
                txt = '全国'
              }else if(provincesId&&citiesId){
                txt = vm.util.getProvinceCityArea([provincesId, citiesId],vm.chinaJson, true)
              }
              return create('span', txt)
            }
          },
          {
            title: '办事地址',
            key: 'workAddress',
            width: 150,
            render: (create, params) => {
              let vm = this,provincesId=params.row.provincesId,citiesId=params.row.citiesId
              // if(provincesId==1&&citiesId==1){
              //   return create('span','全国事项')
              // }else{
                return create('Button', {
                  props: { type: 'primary', size: 'small' },
                  on: {
                    click: function () {
                      vm.isPreview = true
                      vm.seeAddress(params.row)
                    }
                  }
                }, '查看地址列表')
              // }
            }
          },
          // {
          //   title: '发布时间',
          //   key: 'matterCreateTime',
          //   width: 180
          // },
          {
            title: '办理条件',
            key: 'requiredConditions',
            width: 500,
            ellipsis: true,
            render: (create, params) => {
              let vm = this,txt=params.row.requiredConditions
              if (txt) {
                let hasNbsp = !!txt.indexOf('&nbsp;')
                txt = hasNbsp ? (txt + '').split("&nbsp;").join(" ") : txt
              }
              return create('span',txt)
            }
          },
          {
            title: '所需材料',
            key: 'materialRequested',
            width: 350,
            ellipsis: true,
            render: (create, params) => {
              let vm = this,txt=params.row.materialRequested
              if (txt) {
                let hasNbsp = !!txt.indexOf('&nbsp;')
                txt = hasNbsp ? (txt + '').split("&nbsp;").join(" ") : txt
              }
              return create('span',txt)
            }
          },
          {
            title: '网上流程',
            key: 'onlineManagement',
            width: 500,
            ellipsis: true,
            render: (create, params) => {
              let vm = this,txt=params.row.onlineManagement
              if (txt) {
                let hasNbsp = !!txt.indexOf('&nbsp;')
                txt = hasNbsp ? (txt + '').split("&nbsp;").join(" ") : txt
              }
              return create('span',txt)
            }
          },
          {
            title: '窗口流程',
            key: 'windowManagement',
            width: 500,
            ellipsis: true,
            render: (create, params) => {
              let vm = this,txt=params.row.windowManagement
              if (txt) {
                let hasNbsp = !!txt.indexOf('&nbsp;')
                txt = hasNbsp ? (txt + '').split("&nbsp;").join(" ") : txt
              }
              return create('span',txt)
            }
          },
          {
            title: '限时说明',
            key: 'timeLimitExplanation',
            width: 200,
            ellipsis: true,
            render: function(create, params){
              var txt = params.row.timeLimitExplanation
              return create('span',{
                props: {
                  alt: txt
                }
              },txt)
            }
          },
          {
            title: '办理依据',
            key: 'managementBasis',
            width: 200,
            ellipsis: true
          },
          {
            title: '收费标准',
            key: 'chargingStandard',
            width: 150
          },
          {
            title: '工作电话',
            key: 'workPhone',
            width: 150
          },
          {
            title: '监督电话',
            key: 'complaintPhone',
            width: 150
          },
          {
            title: '事项图标',
            key: 'matterIcon',
            width: 180,
            render: (create, params) => {
              var imageHost=this.imageHost || sessionStorage.imageHost,url=params.row.matterIcon
              if (!url) {
                return create('span', '暂无图标')
              } else {
                if(url.indexOf('http')==-1){
                  url = imageHost + url
                }
                return create('a',{
                  attrs: {
                    href: url,
                    target: '_blank'
                  },
                },[create('img', {
                  style: {
                    maxWidth: '100px',
                    margin: '10px'
                  },
                  attrs: {
                    src: url,
                    alt: url
                  }
                })])
              }
            }
          },
          {
            title: '事件状态',
            key: 'matterStatus',
            width: 150,
            render: function (create, params) {
              var map = {
                0: '无效',
                1: '有效'
              }
              return create('span', map[params.row.matterStatus])
            }
          },
          {
            title: '创建时间',
            key: 'createTime',
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
              var previewBtn = create('Button', {
                props: { type: 'success', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: function () {
                    vm.workMatterPreview(params.row)
                  }
                }
              }, '预览')
              if(vm.hasPerm('workMatter:preview')){
                arr.push(previewBtn)
              }
              if(vm.hasPerm('workMatter:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('workMatter:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div', arr)
            }
          }
        ],
        rules: {
          workMatterClassName: [
            { required: true,message: '请选择所属分类',trigger: 'blur' }
          ],
          matterName: [
            { required: true,message: '事件名称不能为空',trigger: 'blur' }
          ],
          workAddress: [
            { required: true,message: '详细地址不能为空',trigger: 'blur' }
          ],
          companyName: [
            { required: true,message: '窗口单位名称不能为空',trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      upExeclSuccess2(res){
        var vm = this
        if(res.code==1){
          vm.$Message.success('办事事项上传成功')
          vm.paging()
        }else{
          vm.$Message.error('办事事项上传失败,请核对上传数据')
        }
      },
      upExeclSuccess3(res){
        var vm = this
        if(res.code==1){
          vm.$Message.success('办事地址上传成功')
          vm.paging()
        }else{
          vm.$Message.error('办事地址上传失败,请核对上传数据')
        }
      },
      handleFormatError2(){
        this.$Message.error('请选择xlsx格式的文件进行上传！')
      },
       // 上传图片
      imgTest(fileObj){
        var vm = this,obj = {},
        code = 1,
        message = '',
        type = fileObj.type.split('/')[1],
        size = fileObj.size
        var fileUrl = vm.fileUrl,
          imgUploadFormat = vm.imgUploadFormat || ['jpg','jpeg','png','gif'],
          imgMaxSize = vm.imgMaxSize || 3,
          imgMinSize = vm.imgMinSize || 10
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
        if(imgMaxSize&&size/1000/1000>imgMaxSize){
          obj.code = 0
          obj.message = `请选择小于${imgMaxSize}Mb的文件`
          return obj
        }
        if(imgMinSize&&size/1000<imgMinSize){
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
          vm.fileUrl = [reader.result]
          vm.uploadImgArr = [file]
        }
        return false
      },
      handleFormatError(){},
      handleMaxSize(){},
      myUpload(){
        // 确认上传
        var vm = this
        if(!vm.uploadImgArr.length){
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
        vm.uploadImgArr.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        params.append('s',3)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像  6广告
        params.append('p',6)
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
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr = [];
            vm.$Message.success('上传图片成功！');
            var arr = [rd.data[0]]
            vm.formDialog.matterIcon = arr[0] || '';
            vm.uploadLoading = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleRemove(index){
        var vm = this
        vm.fileUrl.splice(index,1)
        vm.uploadImgArr.splice(index,1)
        vm.formDialog.matterIcon = ''
      },
      // 上传图片  end
      createTimeChange(time){
        this.formDialog.matterCreateTime = time
      },
      onBlur(){
        var vm = this
        if(!vm.formDialog.matterName.trim())return
        var ajaxData = {
          "name": vm.formDialog.matterName
        }
        var params={
          url: vm.url.check,
          method: 'post',
          data: ajaxData
        }
        return
        vm.$http(params).then(res=>{
          
        }).catch(err=>{})
      },
      resetSearch (name) {
        var vm = this
        vm.derail_address_obj_s = []
        vm.formSearch.areaId = ''
        vm.formSearch.citiesId = ''
        // vm.searchWorkClassId = vm.allWorkClassId
        vm.$refs[name].resetFields()
        vm.submitSearch(false)
        // vm.paging(1)
      },
      submitSearch(check){
        // 为什么使用 clearable 清空选择框的值，值就成了 undefined
        var vm = this,item
        for(let key in vm.formSearch){
          item = vm.formSearch[key]
          if(typeof(item) == 'undefined'){
            vm.formSearch[key] = ''
          }
        }
        var obj = $.extend({}, vm.pager, vm.formSearch);
        $.each(obj, function (key, val) {
          if (val instanceof String && val == '') {
            delete obj[key];
          }
        });
        // 
        if(check){
          if(obj.citiesId && !obj.workMatterClassName || !obj.citiesId && obj.workMatterClassName){
            vm.$Message.info({
              content: '关联地区和事项分类必须同时选择！',
              duration: 3
            })
            return
          }
        }
        vm.pager = obj;
        vm.paging(1);
      },
      // 不同的分页键名
      pagingFiltData(object) {
        let obj = this.util.deepcopy(object)
        for (let key in obj) {
          if (typeof obj[key] === 'string' && obj[key].trim() === '') {
            delete obj[key]
          }
        }
        if (typeof obj.data != 'undefined') {
          delete obj.data
        }
        if (typeof obj.url != 'undefined') {
          delete obj.url
        }
        if (typeof obj.method != 'undefined') {
          delete obj.method
        }
        if (typeof obj.total != 'undefined') {
          delete obj.total
        }
        if (typeof obj.addMethod != 'undefined') {
          delete obj.addMethod
        }
        if (typeof obj.deleteMethod != 'undefined') {
          delete obj.deleteMethod
        }
        if (typeof obj.editMethod != 'undefined') {
          delete obj.editMethod
        }
        if (typeof obj.searchMethod != 'undefined') {
          delete obj.searchMethod
        }
        if (typeof obj.current != 'undefined') {
          delete obj.current
        }
        if (typeof obj.size != 'undefined') {
          delete obj.size
        }
        return obj
      },
      paging (current) {
        let vm = this
        if (current && Number(current)) {
          vm.changePager(current)
          return
        }
        var pager = vm.pager
        var method = pager.method
        var params = {
          url: pager.url,
          method: method,
        }
        var ajaxData = vm.pagingFiltData(pager),_ajaxData = {}
        _ajaxData.pageInfo={}
        for(let key in ajaxData){
          if(key=='nowpage' || key=='pagesize'){
            _ajaxData.pageInfo[key] = ajaxData[key]
          }else{
            _ajaxData[key] = ajaxData[key]
          }
        }
        if(method=='get'){
          params.params = _ajaxData
        }else{
          params.data = _ajaxData
        }
        vm.pageLoading = true
        vm.$http(params).then(res => {
          vm.pageLoading = false
          let resData = res.data
          if (resData.code == 1) {
            if (typeof vm.pagerResult == 'function') {
              // 返回数据预处理
              resData.data = vm.pagerResult(resData.data)
            }
            // vm.$nextTick(function(){
            //   pager.data = resData.data
            //   pager.total = resData.total
            // })
            setTimeout(function(){
              pager.data = resData.data
              pager.total = resData.total
            },100)
          }
        }).catch(err=>{
          vm.pageLoading = false
        })
      },
      changePager (data) {
        let vm = this
        var pager = vm.pager
        if (typeof data === 'object') {
          for (let key in data) {
            pager[key] = data[key]
          }
        } else {
          pager.nowpage = data
        }
        vm.paging()
      },
      //  不同的分页键名 
      upExeclSuccess (res) {
        
      },
      handleFormatError () {
        
      },
      // 编辑行
      editRow (data) {
        let vm = this
        let _data = vm.util.deepcopy(data)
        for (let key in vm.formDialog) {
          if (key == 'workMatterAddressesList' && typeof _data[key] == 'string') {
            // 这里的值什么时字符串类型
            vm.formDialog[key] = JSON.parse(_data[key])
          } else {
            vm.formDialog[key] = _data[key]
          }
        }
        vm.addrDialog.addressArr = vm.getAddressArr(vm.formDialog.workMatterAddressesList)
        // 对 handleValue 赋值                
        vm.handleValue = {
            requiredConditions: vm.formDialog.requiredConditions,
            materialRequested: vm.formDialog.materialRequested,
            onlineManagement: vm.formDialog.onlineManagement,
            windowManagement: vm.formDialog.windowManagement
        }
        setTimeout(function(){
          vm.addrDialog.derail_address_obj = [data.provincesId, data.citiesId]
          // vm.formDialog.workClassId = data.workClassId
        },200)
        vm.currDialog = 'edit'
        vm.dialogShow = true
      },
      resetDialogForm (name) {
        name = name || 'formDialog'
        let vm = this
        vm.workerLevel = 2
        vm.workClassId = vm.allWorkClassId
        // vm.formDialog.workMatterClassName = ''
        vm.isPreview = false
        vm.formDialog.provincesId = ''
        vm.formDialog.citiesId = ''
        vm.formDialog.matterIcon = ''
        vm.formDialog.matterStatus = 1
        // vm.matterCreateTime = ''
        vm.formDialog.workMatterAddressesList = []
        vm.addrDialog.derail_address_obj = []
        vm.addrDialog.addressArr = []
        vm.handleValue = {
          requiredConditions: [],
          materialRequested: [],
          onlineManagement: [],
          windowManagement: []
        };
        if(vm.currDialog=="add"){
          vm.formDialog.workMatterAddressesList = [];
          vm.addrDialog.addressArr = [];
        }
        vm.editAddrData = []
        vm.$refs[name].resetFields()
      },
      submitDialogForm (name) {
        let vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            if(!vm.checking){
              vm.$Message.info({
                content: '当前事项已添加，请勿重复添加！',
                duration: 3
              })
              return
            }
            if(!vm.formDialog.workMatterClassName){
              vm.$Message.error('请选择办事分类')
              return
            }
            if(!vm.formDialog.provincesId || !vm.formDialog.citiesId){
            // if (!vm.addrDialog.derail_address_obj.length) {
              vm.$Message.error('请选择分类关联省市，并添加办事地址')
              return
            }
            if (!vm.formDialog.workMatterAddressesList.length) {
              vm.$Message.error('请至少添加一个办事地址')
              return
            }
            let ajaxData = {
              'workMatter': '',
              'workMatterAddressesList': ''
            }
            let workMatter = {}
            let workMatterAddressesList = []
            if (vm.currDialog === 'add') {
              for (let key in vm.formDialog) {
                if (key !='id') {
                  workMatter[key] = vm.formDialog[key]
                }
              }
              workMatterAddressesList = vm.util.deepcopy(vm.formDialog.workMatterAddressesList)
            } else if (vm.currDialog === 'edit') {
              for (let key in vm.formDialog) {
                workMatter[key] = vm.formDialog[key]
              }
              // 编辑时提交的地址数据是地址列表中点过编辑按钮的数据，如果都没点过编辑，则提交第一个
              if (vm.editAddrData.length==0) {
                vm.editAddrData.push(vm.formDialog.workMatterAddressesList[0])
              }
              workMatterAddressesList = vm.editAddrData
            }
            ajaxData.workMatter = JSON.stringify(workMatter)
            ajaxData.workMatterAddressesList = JSON.stringify(workMatterAddressesList)
            // 不转成字符串传给后台
            if(vm.currDialog=='add'){
              ajaxData = {}
              for(let key in vm.formDialog){
                if(key!='id'){
                  ajaxData[key] = vm.formDialog[key]
                }
              }
            }else if(vm.currDialog=='edit'){
              ajaxData = vm.formDialog
            }
            // 不转成字符串传给后台  end
            var currDialog = vm.currDialog,pager=vm.pager
            var url = vm.url[currDialog]
            var method =  pager.method
            if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
              method = pager.addMethod
            }
            if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
              method = pager.editMethod
            }
            var params = {
              url: url,
              method: method
            }
            if(method=='get'){
              params.params = ajaxData
            }else{
              params.data = ajaxData
            }
            vm.dialogSubmitLoading = true
            vm.$http(params).then(res=>{
              vm.dialogSubmitLoading = false
              var resData = res.data
              if(resData.code==1){
                // 因为新增之后可能会增加分类
                vm.initWorkclass2()
                vm.dialogShow = false
                vm.$Message.success(vm.label[vm.currDialog]+'成功!')
                if(vm.currDialog=='add'){
                  vm.paging(1);
                }else{
                  vm.paging();
                }
                if(typeof vm.resetDialogForm == 'function'){
                  vm.resetDialogForm(name)
                }
              }else{
                vm.$Message.error(resData.message)
              }
            }).catch(err=>{
              vm.dialogSubmitLoading = false
            })
            // vm.editAddrData = [] //提交数据后清除
          }
        })
      },
      // 预览
      workMatterPreview (data) {
        let vm = this
        let _data = vm.util.deepcopy(data)
        let status = {
          0: '无效',
          1: '有效'
        }
        _data.matterStatus = status[_data.matterStatus]
        // if(_data.requiredConditions.indexOf("&nbsp;")){
        //   // 原数据直接展示  有  &nbsp; 的数据去掉 &nbsp;
        //   _data.requiredConditions = _data.requiredConditions.split("&nbsp;").join(" ");
        // }
        // if(_data.materialRequested.indexOf("&nbsp;")){
        //   _data.materialRequested = _data.materialRequested.split("&nbsp;").join(" ");
        // }
        // if(_data.onlineManagement.indexOf("&nbsp;")){
        //   _data.onlineManagement = _data.onlineManagement.split("&nbsp;").join(" ");
        // }
        // if(_data.windowManagement.indexOf("&nbsp;")){
        //   _data.windowManagement = _data.windowManagement.split("&nbsp;").join(" ");
        // }
        vm.previewData = _data
        vm.previewData.provinceCity = vm.util.getProvinceCityArea([_data.provincesId,_data.citiesId],vm.chinaJson,true)
        vm.previewModal = true
      },
      // 重置预览内容
      resetPreview: function(){
        this.previewModal = false
        this.previewData = {}
      },
      searchAddrChange (value) {
        // 开启filterable  返回的数组中值为字符串
        var vm = this
        vm.formSearch.citiesId = value ? value[1] : ''
        // vm.formSearch.areaId = value ? value[2] : ''
        // vm.formSearch.workClassId = ''
        if(value){
          // vm.searchWorkClassId = vm.allWorkClassIdMap[value[1]]
          // vm.derail_address_obj_s = [Number(value[0]),Number(value[1]),Number(value[2])]
          vm.derail_address_obj_s = [Number(value[0]),Number(value[1])]
        }
      },
      addrChange (value) {
        var vm = this,provincesId=value[0],citiesId=value[1],workClassId=[]
        if(value){
          vm.addrDialog.derail_address_obj = [Number(value[0]),Number(value[1])]
        }
        vm.formDialog.provincesId = provincesId
        vm.formDialog.citiesId = citiesId
        // if(citiesId){
        //   workClassId = vm.allWorkClassIdMap[citiesId]
        //   if(value&&value[0]!=1&&!workClassId){
        //     vm.$Message.info('当前选区无分类数据，请先添加当前选区的分类数据')
        //   }
        // }
        // vm.workClassId = workClassId
      },
      classifyChange(id){
        var vm = this,arr=[],provinceCode,provinceTxt='',cityTxt='',provincesId=[]
        vm.addrDialog.derail_address_obj = []
        // citiesId示例数据 [1,410400,430300,430400,321700,321800,211000,210800]
        var citiesId = vm.workClassIdCitiesIdMap[id] || []
        citiesId.forEach(function(item){
          if(item==1){
            provincesId.push(item)
          }else{
            provincesId.push(parseInt(item/10000)*10000)
          }
        })
        provincesId = [...new Set(provincesId)]
        provincesId.forEach(function(item){
          if(item==1){
            arr.push({
              value: 1,
              label: '全国',
              children: [{
                value: 1,
                label: '全国',
              }]
            })
          }else{
            provinceCode = parseInt(item/10000)*10000
            provinceTxt = vm.chinaJson[100000][provinceCode]
            arr.push({
              value: provinceCode,
              label: provinceTxt,
              children: []
            })
          }
        })
        arr.forEach(function(item){
          citiesId.forEach(function(cityCode){
            provinceCode = parseInt(cityCode/10000)*10000
            if(cityCode != 1 && provinceCode == item.value){
              cityTxt = vm.chinaJson[provinceCode][cityCode]
              item.children.push({
                value: cityCode,
                label: cityTxt
              })
            }
          })
        })
        if(id && !arr.length){
          vm.$Message.info({
              content: '当前分类没有关联区域,请联系管理员进行添加！',
              duration: 3
            })
          // vm.dialogShow = false
        }
        vm.derail_address_arr = arr
      },
      handleSuccess (res) {
        if(res.state=="SUCCESS"){
          this.$Message.success("上传成功！");
          this.formDialog.matterIcon = res.url;
        }
      },
      handleImageFormatError () {
        this.$Message.error('文件格式错误，请选择jpg,jpeg或png格式的文件')
      },
      addAddrBtn () {
        var vm = this
        var arr = vm.addrDialog.derail_address_obj
        if (arr.length) {
          vm.areasId = vm.getArea(arr[1])
          vm.addrModal = true
        }else{
          vm.$Message.error("请先选择分类关联省市")
        }
      },
      getArea (cityId) {
        let vm = this
        let areaJson = vm.chinaJson[cityId]
        let areasId = []
        for (let key in areaJson) {
          // 从json中取到的key是string类型，需要转换成number类型
          areasId.push({
            'value': Number(key),
            'label': areaJson[key]
          })
        }
        return areasId
      },
      // 重置添加地址弹出框
      resetAddr (name) {
        var vm = this
        vm.addrDialog.areasId = ''
        vm.$refs[name].resetFields()
        vm.areasId = []
        vm.addEdit = true
        vm.addrModal = false
      },
      // 确定添加、编辑地址
      beSure (name) {
        var vm = this;
        vm.$refs[name].validate(function (valid) {
          var areasId = vm.addrDialog.areasId
          if(!areasId){
            vm.$Message.info('请先选择区！')
            return
          }
          if(vm.currDialog=="edit"){
            // 这个时候传状态，因为请求发送完的时候新增或编辑的状态就已经发生变化了
            vm.addAddrAjax(areasId,vm.addEdit)
          }else{
            // 新增时 修改地址数据不进行提交，所有数据一起提交
            if (vm.addEdit) {
              // 如果是新增时的地址新增确定
              vm.formDialog.workMatterAddressesList.push({
                workMatterId: vm.formDialog.id,
                areasId: vm.addrDialog.areasId,
                workAddress: vm.addrDialog.workAddress,
                workDate: vm.addrDialog.workDate,
                companyName: vm.addrDialog.companyName,
                matterSoucreUrl: vm.addrDialog.matterSoucreUrl
              })
            } else {
              // 如果是编辑时的地址新增确定
              for (let key in vm.formDialog.workMatterAddressesList[vm.editIndex]) {
                vm.formDialog.workMatterAddressesList[vm.editIndex][key] = vm.addrDialog[key]
              }
            }
          }
          vm.addrDialog.addressArr = vm.getAddressArr(vm.formDialog.workMatterAddressesList)
          vm.resetAddr(name)
        })
      },
      addAddrAjax (areasId,isAddStatus) {
        // 编辑时编辑地址，确认请求
        var vm = this;
        var ajaxData = {
            workMatterId: vm.formDialog.id,
            // provincesId: vm.addrDialog.derail_address_obj[0],
            // citiesId: vm.addrDialog.derail_address_obj[1],                    
            areasId: areasId,
            workAddress: vm.addrDialog.workAddress,
            workDate: vm.addrDialog.workDate,                    
            companyName: vm.addrDialog.companyName,
            matterSoucreUrl: vm.addrDialog.matterSoucreUrl,
        };
        if(!isAddStatus){
          // 编辑地址
          var id = vm.formDialog.workMatterAddressesList[vm.editIndex].id
          ajaxData.id = id
        }
        var url = isAddStatus ? vm.url.address.add : vm.url.address.edit
        var params = {
          url: url,
          method: 'post',
          data: ajaxData
        }
        vm.$http(params).then(res=>{
          if(res&&res.data){
            var resData = res.data
            if(resData.code==1){
              vm.$Message.success((isAddStatus ? '新增' : '编辑') + '地址成功！')
              if(isAddStatus){
                var addressId = resData.data
                vm.formDialog.workMatterAddressesList.push({
                  id: addressId,
                  workMatterId: vm.formDialog.id,
                  areasId: vm.addrDialog.areasId,
                  workAddress: vm.addrDialog.workAddress,
                  workDate: vm.addrDialog.workDate,
                  companyName: vm.addrDialog.companyName,
                  matterSoucreUrl: vm.addrDialog.matterSoucreUrl
                })
                vm.addrDialog.addressArr.push(ajaxData.workAddress)
              }else{
                for (let key in vm.formDialog.workMatterAddressesList[vm.editIndex]) {
                  // 需同时修改用于提交和用于展示的数据
                  vm.formDialog.workMatterAddressesList[vm.editIndex][key] = ajaxData[key]
                  vm.addrDialog[key] = ajaxData[key]
                }
                vm.addrDialog.addressArr[vm.editIndex] = ajaxData.workAddress
              }
            }
          }
        })
      },
      // 获取详细地址数据
      getAddressArr (addressArr) {
        if(!addressArr) return []
        let arr = []
        if (addressArr.length) {
          for(var i=0;i<addressArr.length;i++){
            arr.push(addressArr[i].workAddress)
          }
        }
        return arr
      },
      // 编辑地址
      editAddrBtn (index) {
        let vm = this,areasId=''
        vm.addEdit = false
        vm.editIndex = index
        vm.areasId = vm.getArea(vm.addrDialog.derail_address_obj[1])
        let data = vm.formDialog.workMatterAddressesList[index]
        for (let key in data) {
          if(key=='areasId'){
            areasId = data[key]
          }
          vm.addrDialog[key] = data[key]
        }
        vm.editAddrData.push(vm.formDialog.workMatterAddressesList[index])
        setTimeout(function(){
          vm.addrDialog.areasId = areasId
        },50)
        vm.addrModal = true
      },
      // 删除地址
      delAddr (index) {
        let vm = this
        vm.$Modal.confirm({
          title: '确定',
          content: '确定删除这条数据？',
          onOk: function () {
            if(vm.formDialog.workMatterAddressesList.length<=1){
              vm.$Message.error("至少保留一个地址")
            }else{
              if (vm.currDialog == 'add') {
                vm.addrDialog.addressArr.splice(index,1)
                vm.formDialog.workMatterAddressesList.splice(index,1)
              } else if (vm.currDialog == 'edit') {
                // 发送删除请求
                var ajaxId = vm.formDialog.workMatterAddressesList[index].id
                if(ajaxId){
                  var ajaxData = {
                    "id": ajaxId
                  }
                  var params = {
                    url: vm.url.address.delete,
                    method: 'delete',
                    params: ajaxData
                  }
                  vm.$http(params).then(res=>{
                    if(res&&res.data){
                      var resData = res.data
                      if(resData.code==1){
                        vm.addrDialog.addressArr.splice(index,1)
                        vm.formDialog.workMatterAddressesList.splice(index,1)
                        vm.$Message.success("删除成功！")
                      }
                    }
                  })
                } else {
                  vm.$Message.error("区id不存在");
                }
              }
            }
          }
        })
      },
      // 查看地址列表
      seeAddress (data) {
        let vm = this
        if(data.workMatterAddressesList&&data.workMatterAddressesList.length){
          
          vm.addrDialog.derail_address_obj = [
              data.provincesId,
              data.citiesId
          ]
          var addressArr = data.workMatterAddressesList
          vm.formDialog.workMatterAddressesList = addressArr
          vm.addrDialog.addressArr = vm.getAddressArr(addressArr)
          vm.addressList = true
        }else{
          vm.$Message.info('该事项暂无地址')
        }
      },
      closeAddrList: function(){
        let vm = this
        vm.isPreview = false
        // vm.addrDialog.derail_address_obj = []
        // vm.formDialog.workMatterAddressesList = []
        // vm.addrDialog.addressArr = []
        vm.addressList = false
      },
      // 操作
      dataFilterArr: function(data,delimiter){
        // 第一次传的是 string   之后传的是 array
        let vm = this
        var arr = []
        if(typeof(data) == "string"){
          var str = "" + data
          if(str.trim()=="")return []
          arr = str.split("&nbsp;")
          if (arr.length>1){
            for(var i =0;i<arr.length;i++){
              arr[i] = arr[i].split(delimiter).slice(1).join("")
            }
          }
        }else{
          arr = vm.util.deepcopy(data)
        }
        return arr
      },
      // 将存字符串的数组转成带序号的字符串，并以&nbsp;分割（length>1）,其他时候不处理  返回序列化后的字符串            
      formatData: function(arrData,delimiter){
        if(delimiter=="undefined")delimiter = "、"
        var str = ""
        if(arrData.length==0){
          str = ""
        }else if(arrData.length==1){
          str = arrData[0].trim()
        }else{
          for(var i=0;i<arrData.length;i++){
            if(i==arrData.length-1){//最后一个不加&nbsp;                            
              str += (i + 1) + delimiter + arrData[i].trim()
            }else{
              str += (i + 1) + delimiter + arrData[i].trim() + "&nbsp;"
            }
          }
        }
        return str
      },
      handleCancle () {
        this.handleData = []
        this.handleModal = false
      },
      handleBesure () {
        var vm = this;
        // 确认添加、编辑操作                     
        if(vm.handleVar=="requiredConditions"){
          // 处理的是办理条件
          vm.formDialog.requiredConditions = vm.formatData(vm.handleData,vm.delimiter);//数据显示                    
          vm.handleValue.requiredConditions = [].concat(vm.handleData);// 确认时保存数据，保存的是原始数据，没有进行过字符串拼接操作                    
        }else if(vm.handleVar=="materialRequested"){
          // 处理的是所需材料
          vm.formDialog.materialRequested = vm.formatData(vm.handleData,vm.delimiter);
          vm.handleValue.materialRequested = [].concat(vm.handleData);
        }else if(vm.handleVar=="onlineManagement"){
          // 处理的是网上流程
          vm.formDialog.onlineManagement = vm.formatData(vm.handleData,vm.delimiter);
          vm.handleValue.onlineManagement = [].concat(vm.handleData);
        }else if (vm.handleVar=="windowManagement") {
          vm.formDialog.windowManagement = vm.formatData(vm.handleData,vm.delimiter);
          vm.handleValue.windowManagement = [].concat(vm.handleData);
        }
        vm.handleAddEdit = true;
        vm.handleModal = false;
      },
      showHandleDialog (name, which) {
        let vm = this
        vm[name] = true
        if(which){// 用于控制更改添加或编辑操作弹出框的title
            vm.handleTitleText = vm.handleTitle[which];
            // 区分变量赋值
            vm.handleVar = which;
        }else{
          return
        } 
        // 先处理 vm.handleValue   vm.currDialog=="edit"
        // 新增、编辑的是哪个字段 // "requiredConditions","materialRequested","onlineManagement"                
        // if(which=="requiredConditions"){
        //   vm.handleData = vm.dataFilterArr(vm.handleValue.requiredConditions,vm.delimiter)
        // }else if(which=="materialRequested"){
        //   vm.handleData = vm.dataFilterArr(vm.handleValue.materialRequested,vm.delimiter)
        // }else if(which=="onlineManagement"){
        //   vm.handleData = vm.dataFilterArr(vm.handleValue.onlineManagement,vm.delimiter)
        // }
        vm.handleData = vm.dataFilterArr(vm.handleValue[which],vm.delimiter)
      },
      editHandle (index) {
        var vm = this
        vm.addHandleModal = true
        vm.addHandleDialog.addHandleText = vm.handleData[index]
        vm.handleAddEdit = false
        vm.handleIndex = index
      },
      deleteHandle (index) {
        var vm = this
        vm.$Modal.confirm({
            type: 'confirm',
            title: '确认',
            content: '确认删除这条数据吗？',
            onOk: function () {
              vm.handleData.splice(index,1)
            }
        })
      },
      addHandleCancle () {
        var vm = this
        vm.addHandleDialog.addHandleText = ""
        vm.addHandleModal = false
        vm.handleAddEdit = true
        vm.handleIndex = null
      },
      addHandleBesure () {
        var vm = this
        var _data = vm.util.deepcopy(vm.handleData)
        if(vm.handleAddEdit){
          // 新增
          vm.handleData.push(vm.addHandleDialog.addHandleText)
        }else{
            // 编辑
          vm.handleData[vm.handleIndex] = vm.addHandleDialog.addHandleText
        }
        vm.addHandleCancle()
      },
      // 初始化所属分类
      initWorkclass(){
        var vm = this
        // 初始化省市区
        let chinaJson = JSON.parse(sessionStorage.chinaJson)
        let chinaData = JSON.parse(sessionStorage.chinaData)
        let _chinaData = [
          {
            'value': 1,
            'label': '全国',
            children: [
              {
                'value': 1,
                'label': '全国',
              }
            ]
          }
        ]
        chinaData.forEach(item => {
          let childArr = []
          item.children.forEach(child => {
            childArr.push({
              'value': child.value,
              'label': child.label
            })
          })
          _chinaData.push({
            'value': item.value,
            'label': item.label,
            'children': childArr
          })
        })
        vm.derail_address_arr_ss = [{
            'value': 1,
            'label': '全国',
            children: [
              {
                'value': 1,
                'label': '全国',
                children: [{
                  'value': 1,
                  'label': '全国',
                }]
              }
            ]
          }].concat(chinaData)
        vm.derail_address_arr = _chinaData
        // 自定义全国类型的json数据
        chinaJson['100000'][1] = '全国'
        chinaJson[1] = {}
        chinaJson[1][1] = '全国'
        vm.chinaJson = chinaJson
        var params = {
          url: vm.url.workclass,
          method: 'post',
          data: {}
        }
        vm.$http(params).then(res => {
          var arr = [],workClassIdMap={},allWorkClassIdMap={},cityCode,provinceCode,_item,txt = '',label=''
          if(res.data&&res.data.code==1){
            var data = res.data.data
            data.forEach(item => {
              cityCode = item.cityCode
              if(cityCode==1){
                provinceCode = 1
                txt = '全国'
              }else{
                provinceCode = parseInt(cityCode/10000)*10000
                if(provinceCode&&cityCode){
                  txt = vm.util.getProvinceCityArea([provinceCode,cityCode],chinaJson,true)
                }
              }
              label = txt ? (item.className + '  -  ' + txt) : item.className
              _item = {
                'value': item.id,
                'label': label
              }
              arr.push(_item)
              if(allWorkClassIdMap[cityCode]){
                allWorkClassIdMap[cityCode].push(_item)
              }else{
                allWorkClassIdMap[cityCode] = [_item]
              }
              workClassIdMap[item.id] = item.className
            })
          }
          vm.allWorkClassIdMap = allWorkClassIdMap
          vm.allWorkClassId = arr
          vm.searchWorkClassId = arr
          vm.workClassIdMap = workClassIdMap
        })
      },
      initWorkclass2(){
        var vm = this
        var params = {
          url: vm.url.workclass,
          method: 'post',
          data: {}
        }
        vm.$http(params).then(res=>{
          if(res&&res.status==200){
            var resData = res.data
            if(resData.code==1){
              var data = resData.data,arr=[],_arr=[],arr2=[],map={}
              data.forEach(item=>{
                // 传分类名称给后台
                // map[item.id] = item.cityIds
                map[item.className] = item.cityIds
                arr.push(item.className)
                arr2.push({
                  value: item.id,
                  label: item.className
                })
              })
              arr = [...new Set(arr)]
              arr.forEach(item=>{
                _arr.push({
                  value: item,
                  label: item
                })
              })
              vm.workClassIdCitiesIdMap = map
              vm.searchWorkClassId = arr2
              // vm.workMatterClassName = arr2
              vm.workMatterClassName = _arr
            }
          }
        })
      },
      // 操作 end
      initData () {
        let vm = this
        // 初始化省市区
        let chinaJson = JSON.parse(sessionStorage.chinaJson)
        let chinaData = JSON.parse(sessionStorage.chinaData)
        let _chinaData = [
          {
            'value': 1,
            'label': '全国',
            children: [
              {
                'value': 1,
                'label': '全国',
              }
            ]
          }
        ]
        chinaData.forEach(item => {
          let childArr = []
          item.children.forEach(child => {
            childArr.push({
              'value': child.value,
              'label': child.label
            })
          })
          _chinaData.push({
            'value': item.value,
            'label': item.label,
            'children': childArr
          })
        })
        vm.derail_address_arr_ss = _chinaData
        // vm.derail_address_arr = _chinaData
        vm.derail_address_arr = []
        // 自定义全国类型的json数据
        chinaJson['100000'][1] = '全国'
        chinaJson[1] = {}
        chinaJson[1][1] = '全国'
        vm.chinaJson = chinaJson
        // vm.initWorkclass()
        vm.initWorkclass2()
      },
    },
    watch: {
      derail_address_obj_s (val) {
        if (val.length) {
          this.formSearch.areaId = val[2]
        } else {
          this.formSearch.areaId = ''
        }
      },
      'addrDialog.derail_address_obj': function(val){
        if(val&&val.length){
          var vm=this,cityCode = val[1],provincesId=val[0]
          vm.workClassId = vm.allWorkClassIdMap[cityCode]
          vm.formDialog.cityCodes = [val[1]]
          vm.formDialog.provincesId = provincesId
          vm.formDialog.citiesId = cityCode

        }
      },
      'formDialog.workMatterClassName': function(id){
        var vm = this,arr=[],provinceCode,provinceTxt='',cityTxt='',provincesId=[]
        vm.addrDialog.derail_address_obj = []
        // citiesId示例数据 [1,410400,430300,430400,321700,321800,211000,210800]
        var citiesId = vm.workClassIdCitiesIdMap[id] || []
        citiesId.forEach(function(item){
          if(item==1){
            provincesId.push(item)
          }else{
            provincesId.push(parseInt(item/10000)*10000)
          }
        })
        provincesId = [...new Set(provincesId)]
        provincesId.forEach(function(item){
          if(item==1){
            arr.push({
              value: 1,
              label: '全国',
              children: [{
                value: 1,
                label: '全国',
              }]
            })
          }else{
            provinceCode = parseInt(item/10000)*10000
            provinceTxt = vm.chinaJson[100000][provinceCode]
            arr.push({
              value: provinceCode,
              label: provinceTxt,
              children: []
            })
          }
        })
        arr.forEach(function(item){
          citiesId.forEach(function(cityCode){
            provinceCode = parseInt(cityCode/10000)*10000
            if(cityCode != 1 && provinceCode == item.value){
              cityTxt = vm.chinaJson[provinceCode][cityCode]
              item.children.push({
                value: cityCode,
                label: cityTxt
              })
            }
          })
        })
        if(id && !arr.length){
          vm.$Message.info({
              content: '当前分类没有关联区域,请联系管理员进行添加！',
              duration: 3
            })
          // vm.dialogShow = false
        }
        vm.derail_address_arr = arr
      }
      // workerLevel(val){
      //   var vm = this
      //   if(val==1){
      //     // vm.addrDialog.derail_address_obj = [1,1]
      //     vm.formDialog.provincesId = 1
      //     vm.formDialog.citiesId = 1
      //     vm.formDialog.workMatterAddressesList = [vm.defaultWorkerWindow]
      //   // }else if(val==2){
      //   }else{
      //     vm.formDialog.provincesId = ''
      //     vm.formDialog.citiesId = ''
      //     vm.formDialog.workMatterAddressesList = []
      //     vm.addrDialog.derail_address_obj = []
      //   }
      //   vm.addrDialog.addressArr = []
      // }
    },
  }
</script>

<style scoped>
#preview-modal .ivu-col{
  font-size: 14px;
  word-wrap:break-word;
}
#preview-modal .title{
  font-size: 15px;
  font-weight: 700;
}
.preview-row{
    margin: 4px 0;
}
.preview-txt{
  max-height: 165px;
  overflow-y: auto;    
  text-indent: 28px;
}
</style>
