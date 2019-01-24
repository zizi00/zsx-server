<template>
  <div class="easypaper">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
        
        <!-- <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" size="small">{{label.search}}</Button> -->
        <Button v-if="hasPerm('easypaper:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
        <Button v-if="hasPerm('easypaper:delete')" type="error" :disabled="batchIdArr.length==0" style="margin: 5px 8px 24px 0;" @click="batchDelete" size="small">批量删除</Button>
        <!-- <Button type="primary" style="margin: 5px 8px 24px 0;" @click="classifyLoading=true;classifyPaging();classifyShow=true;" :loading="classifyLoading" size="small">简报分类</Button> -->
      </Form>
    </div>
    <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelect" :height="tableHeight" :loading="pageLoading"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current" :loading="pageLoading"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" @on-cancel="resetDialogForm('formDialog')" :styles="{width: '1400px',top: '30px'}" inline>
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="90">
        <Row>
          <Col span="5">
            <FormItem label="发布时间">
              <!-- format="yyyy-MM-dd HH:mm" -->
              <DatePicker type="date" :options="timeOptions" placeholder="点击选择时间" @on-change="timeChange" v-model="paperTime" :clearable="false" transfer></DatePicker>
            </FormItem>
          </Col>
          <Col span="3">
            <FormItem label="是否立即发布">
              <Select v-model="ajaxBriefingType" placeholder="请选择" style="width:150px;" :disabled="isDisabled" >
                <Option v-for="item in briefingType" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <template v-if="currDialog=='add'">
          <div style="margin-bottom: 15px;">
              <Button type="success" @click="previewContent=true">编辑</Button>
              <Button type="primary" @click="initAddPreviewData">预览</Button>
              <Button type="default" @click="clearAllSelect">清空已选</Button>
              <!-- 接口的没url 暂不显示 -->
              <Select v-model="selfTypeVal" style="width: 200px;" placeholder="请选择从那个接口获取数据">
                <Option v-for="item in selfType" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
              <!-- <template v-for="(val,key) in transferClassifyMap"> -->
              <template v-for="(val,key) in myTypeMap">
                <Button style="margin-left: 5px;" :type="currentClassifyId == key ? 'primary' : 'default'" :disabled="dataLoading" @click="initPagerData(key)">{{val}}</Button>
              </template>
          </div>
          <!-- <mainTable :columns="transferColumns" :data="transferData" @updateSelect="updateSelectTransfer"></mainTable> -->
          <Row>
            <Col span="8">
              <div>
                <span>简报内容：最多选择12条，多选按最先选择的12条为准</span><br>
                <Checkbox
                  :indeterminate="indeterminate"
                  :value="checkAll"
                  @click.prevent.native="handleCheckAll">
                  <strong>全选</strong>
                </Checkbox>
              </div>
              <CheckboxGroup v-model="selectContents" @on-change="checkAllGroupChange">
                <template v-for="item in transferData">
                  <Checkbox :label="item"></Checkbox><br />
                  <!-- 现在每个item是一个数组,数组第一个是title,第二个是url -->
                  <!-- <Checkbox :label="item[0]"></Checkbox><br /> -->
                </template>
              </CheckboxGroup>
            </Col>
            <Col span="16">
              <div>
                <span>请选择： </span>
                <Select v-model="selectedClassify" @on-change="selectedClassifyChange" multiple style="width:300px;" placeholder="请选择心语分类">
                  <Option v-for="item in chickenSoupClassify" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </div>
              <template v-if="selectedClassify.length">
                <Row>
                    <template v-if="selectedClassify.length==1">
                      <Col span="12">
                        <p>{{chickenSoupClassifyMap[selectedClassify[0]]}}</p>
                          <template v-if="chickenSoupData.length">
                            <RadioGroup v-model="formDialog.utterance1" vertical>
                              <template v-for="item in chickenSoupData">
                                <Radio :label="item.content">
                                  <span>{{item.content}}</span>
                                </Radio>
                              </template>
                            </RadioGroup>
                          </template>
                          <Input v-else v-model="formDialog.utterance1" :placeholder="'请输入' + chickenSoupClassifyMap[selectedClassify[0]]"></Input>
                      </Col>
                    </template>
                    <template v-else>
                      <Col span="12">
                        <p>{{chickenSoupClassifyMap[selectedClassify[selectedClassify.length-2]]}}</p>
                          <template v-if="chickenSoupData.length">
                            <RadioGroup v-model="formDialog.utterance1" vertical>
                              <template v-for="item in chickenSoupData">
                                <Radio :label="item.content">
                                  <span>{{item.content}}</span>
                                </Radio>
                              </template>
                            </RadioGroup>
                          </template>
                          <Input v-else v-model="formDialog.utterance1" :placeholder="'请输入' + chickenSoupClassifyMap[selectedClassify[selectedClassify.length-2]]"></Input>
                      </Col>
                      <Col span="12">
                        <p>{{chickenSoupClassifyMap[selectedClassify[selectedClassify.length-1]]}}</p>
                          <template v-if="healthCareData.length">
                            <RadioGroup v-model="formDialog.utterance2" vertical>
                              <template v-for="item in healthCareData">
                                <Radio :label="item.content">
                                  <span>{{item.content}}</span>
                                </Radio>
                              </template>
                            </RadioGroup>
                          </template>
                          <Input v-else v-model="formDialog.utterance2" :placeholder="'请输入' + chickenSoupClassifyMap[selectedClassify[selectedClassify.length-1]]"></Input>
                      </Col>
                    </template>
                  <!-- <Col span="12">
                    <p>养生常识</p>
                    <template v-if="healthCareData.length">
                      <RadioGroup v-model="formDialog.utterance2" vertical>
                        <template v-for="item in healthCareData">
                          <Radio :label="item.content">
                            <span>{{item.content}}</span>
                          </Radio>
                        </template>
                      </RadioGroup>
                    </template>
                    <Input v-else v-model="formDialog.utterance2" placeholder="数据库无数据，请手动输入"></Input>
                  </Col> -->
                </Row>
              </template>
            </Col>
          </Row>
        </template>
        <template v-if="currDialog=='edit'">
         <!-- formDialog.content： {{formDialog.content}} <br>
         editBindData： {{editBindData}} <br> -->
          <p>简报内容：</p>
          <Row v-for="(val,key) in editBindData" :key="key" style="margin-bottom:15px;">
            <Input v-model="editBindData[key]"></Input>
          </Row>
          <Row style="margin-bottom:15px;">
            <Col span="4">
              <Select v-model="formDialog.utteranceClass1" placeholder="请选择心语分类" style="width:200px;">
                <Option v-for="item in chickenSoupClassifyWords" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Col>
            <Col span="20">
              <Input v-model="formDialog.utterance1" placeholder="请手动输入内容"></Input>
            </Col>
          </Row>
          <Row>
            <Col span="4">
              <Select v-model="formDialog.utteranceClass2" placeholder="请选择心语分类" style="width:200px;">
                <Option v-for="item in chickenSoupClassifyWords" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Col>
            <Col span="20">
              <Input v-model="formDialog.utterance2" placeholder="请手动输入内容"></Input>
            </Col>
          </Row>
        </template>
      </Form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>

    <!-- 选中编辑 -->
    <Modal v-model="previewContent" :mask-closable="false" title="编辑内容" width="1200">
      <!-- formDialog.content： {{formDialog.content}} <br>
      storageAllContentsBindData： {{storageAllContentsBindData}} <br>
      storageAllContents: {{storageAllContents}} -->
      <div class="preview-content">
        <template v-if="storageAllContents.length<titleMaxNumber">
          <Row style="margin-bottom:15px;">
            <!-- 新增一条只能从已选的添一条空的数据 -->
            <Button type="primary" @click="selectContents.push('')">新增内容</Button>
          </Row>
        </template>
        <Row style="margin-bottom:15px;" v-for="(val,key) in storageAllContentsBindData" :key="key">
          <Col span="21">
            <Row>
              <Col span="2">
                <div style="line-height:32px;">
                  <span>第</span>
                  <span>{{Number(key) + 1}}</span>
                  <span>条：</span>
                </div>
              </Col>
              <Col span="22">
                <Input v-model="storageAllContentsBindData[key]"></Input>
              </Col>
            </Row>
          </Col>
          <Col span="3">
            <Button type="error" style="float: right;" @click="removeContent(key)">删除</Button>
          </Col>
        </Row>
        
        <Row style="margin-bottom:15px;">
          <Col span="4">
            <Select v-model="formDialog.utteranceClass1" placeholder="请选择心语分类" style="width:160px;">
              <Option v-for="item in chickenSoupClassifyWords" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </Col>
          <Col span="20">
            <Input v-model="formDialog.utterance1" placeholder="请手动输入内容"></Input>
          </Col>
        </Row>
        <Row>
          <Col span="4">
            <Select v-model="formDialog.utteranceClass2" placeholder="请选择心语分类" style="width:160px;">
              <Option v-for="item in chickenSoupClassifyWords" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </Col>
          <Col span="20">
            <Input v-model="formDialog.utterance2" placeholder="请手动输入内容"></Input>
          </Col>
        </Row>
        <!-- <div v-if="formDialog.utteranceClass1">
          <span>【</span>
          <span>{{formDialog.utteranceClass1}}</span>
          <span>】</span>
          <Input v-model="formDialog.utterance1" :placeholder="'请输入' + formDialog.utteranceClass1"></Input>
        </div>
        <div v-if="formDialog.utteranceClass2">
          <span>【</span>
          <span>{{formDialog.utteranceClass2}}</span>
          <span>】</span>
          <Input v-model="formDialog.utterance2" :placeholder="'请输入' + formDialog.utteranceClass2"></Input>
        </div> -->
      </div>
      <div slot="footer">
        <Button type="default" @click="clearAllSelect">清空已选</Button>
        <Button type="primary" @click="previewContent=false">关闭</Button>
      </div>
    </Modal>

    <!-- 不需要手动输入，所有的内容由点击按钮获取内容，选择内容后拼装、拼装时去除首尾空格，并在每条后边接上  \n  换行符   -->
    <Modal v-model="previewShow" title="预览">
      <div class="preview-content">
        <h2>{{previewData.title}}</h2>
        <h3>{{previewData.time}}</h3>
        <template v-if="previewData.content&&previewData.content.length">
          <div v-for="(item,index) in previewData.content">{{item}}</div>
        </template>
        <div v-if="previewData.utteranceClass1">
          <span>{{'【' + previewData.utteranceClass1 + '】'}}</span>
          <span>{{previewData.utterance1}}</span>
        </div>
        <div v-if="previewData.utteranceClass2">
          <span>{{'【' + previewData.utteranceClass2 + '】'}}</span>
          <span>{{previewData.utterance2}}</span>
        </div>
      </div>
      <div style="margin-top:15px;">【注】此预览仅展示数据，实际展示效果以APP为准</div>
      <div slot="footer">
        <Button @click="previewShow=false;previewData={}">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'easypaper',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        titleMaxNumber: 12,
        url: {
          // 增删改查
          add: 'web/briefing/add/',
          delete: 'web/briefing/delete',
          edit: 'web/briefing/update/',
          search: '',
          sysUser: 'web/sys/user/dataGrid',
          // 通过接口还是rss调用
          newsTitle: 'web/utterance/getTitle',
          newsTitle2: 'web/utterance/rss',
          // 根据简报分类id获取简报数据
          utterance: 'web/utterance/class/',
          // 根据类名获取
          chickenSoup: 'web/utterance/class_name/早安心语',
          healthCare: 'web/utterance/class_name/养生常识',
          // 通过汉字name获取鸡汤数据
          getByName: 'web/utterance/class_name/',
          // 获取心语分类
          name: 'web/utterance/class/dataGrid',
          // 发布简报
          release: '',
          // 简报分类
          classify: {
            _name: 'web/utterance/class/dataGrid/name',
            init: 'web/utterance/class/dataGrid',
            add: 'web/utterance/class/add',
            edit: '',
            delete: '',
          }
        },
        // 不能切换至立即发布
        isDisabled: false,
        pager: {
          // 页面初始化
          url: 'web/briefing/dataGrid',
          // 主区域表格数据
          data: [],
          addMethod: 'post',
          editMethod: 'post',
          method: 'get'
        },
        paperTime: '',
        timeOptions: {
          disabledDate (date) {
            return date && date.valueOf() < Date.now().valueOf() - 86400000;
          }
        },
        // 全选
        checkAll: false,
        indeterminate: false,
        // checkAllGroup: [],
        // 全选  end
        // 鸡汤、养生
        // chickenSoup: '',
        chickenSoupClassify: [], // 存放鸡汤、养生等的分类，用于根据分类名称获取数据
        // value和label都是汉字的分类数组，因为需要将分类的汉字存储到数据库给APP那边展示
        chickenSoupClassifyWords: [],
        // 已经选择的分类
        selectedClassify: [],
        chickenSoupData: [],
        // healthCare: '',
        healthCareData: [],
        // 当前分类id
        currentClassifyId: '',
        batchClassifyIdArr: [],
        classifyFormShow: false,
        classifySubmitLoading: false,
        // 获取的心语分类是使用英文分号隔开的字符串
        chickenSoupDelimiter: ';',
        delimiter: '、',
        period: '。',
        semicolon: '；',
        brStr: '\n \n',
        batchIdArr: [],
        previewContent: false,
        previewShow: false,
        classifyShow: false,
        createBy: [],
        createByMap: {},
        previewData: {},
        // 简报内容
        transferData: [],
        maxLength: 12,
        // 当前选中的内容数组
        selectContents: [],
        // 切换分类时用于缓存已勾选的内容数组
        storageContents: [],
        // 编辑时用于绑定保存数据
        editBindData: {},
        previewBindData: {},
        // 简报分类
        transferClassify: [],
        transferClassifyMap: {},
        // 搜索表单
        formSearch: {
          
        },
        selfType: [
          {
            value: 1,
            label: '接口'
          },
          {
            value: 2,
            label: 'RSS订阅'
          }
        ],
        selfTypeVal: 1,
        myTypeMap: {},
        dataLoading: false,
        storageAllContentsBindData: {},
        // 新闻标题
        type: [
          {
            value: 'top',
            label: '头条',
          },
          {
            value: 'shehui',
            label: '社会',
          },
          {
            value: 'guonei',
            label: '国内',
          },
          {
            value: 'guoji',
            label: '国际',
          },
          {
            value: 'yule',
            label: '娱乐',
          },
          {
            value: 'tiyu',
            label: '体育',
          },
          {
            value: 'junshi',
            label: '军事',
          },
          {
            value: 'keji',
            label: '科技',
          },
          {
            value: 'caijing',
            label: '财经',
          },
          {
            value: 'shishang',
            label: '时尚',
          },
        ],
        typeMap: {
          'top': '头条',
          'shehui': '社会',
          'guonei': '国内',
          'guoji': '国际',
          'yule': '娱乐',
          'tiyu': '体育',
          'junshi': '军事',
          'keji': '科技',
          'caijing': '财经',
          'shishang': '时尚',
        },
        // rss标题
        type2: [
          {
            value: 'guonei',
            label: '国内'
          },
          {
            value: 'guoji',
            label: '国际'
          },
          {
            value: 'yule',
            label: '娱乐'
          },
          {
            value: 'tiyu',
            label: '体育'
          },
          {
            value: 'junshi',
            label: '军事'
          },
          {
            value: 'jingji',
            label: '经济'
          },
          {
            value: 'keji',
            label: '科技'
          },
          {
            value: 'jiaoyu',
            label: '教育'
          },
          {
            value: 'lishi',
            label: '历史'
          },
          {
            value: 'dushu',
            label: '读书'
          },
          {
            value: 'shipin',
            label: '食品'
          },
          {
            value: 'jiankang',
            label: '健康'
          },
          {
            value: 'renda',
            label: '中国人大'
          },
        ],
        type2Map: {
          'guonei': '国内',
          'guoji': '国际',
          'yule': '娱乐',
          'tiyu': '体育',
          'junshi': '军事',
          'jingji': '经济',
          'keji': '科技',
          'jiaoyu': '教育',
          'lishi': '历史',
          'dushu': '读书',
          'shipin': '食品',
          'jiankang': '健康',
          'renda': '中国人大',
        },
        briefingType: [
          {
            value: 1,
            label: '保存内容，定时发布'
          },
          {
            value: 2,
            label: '立即发布'
          }
        ],
        briefingTypeMap: {
          1: '保存内容，定时发布',
          2: '立即发布',
        },
        // 1：保存 2：立即发布
        ajaxBriefingType: 1,
        // 新增/编辑表单
        formDialog: {
          id: '',
          // title: '锵锵简报 | 60秒知天下',
          createBy: '',
          briefingDate: '',
          content: '',
          // 鸡汤
          utterance1: '',
          // 养生
          utterance2: '',
          utteranceClass1: '',
          utteranceClass2: '',
          // url: []
        },
        columns: [
          {
            type: 'selection',
            width: 80,
            fixed: 'left',
            align: 'center'
          },
          {
            'title': '标题',
            'key': 'title',
            'width': 200,
          },
          {
            'title': '时间',
            'key': 'time',
            'width': 250,
          },
          {
            'title': '发布时间',
            'key': 'briefingDate',
            'width': 250,
          },
          {
            'title': '是否发布',
            'key': 'isSend',
            'width': 250,
            render: (create, params) => {
              var key=params.row.isSend,map={
                '0': '未发送',
                '1': '已发送'
              }
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          // utteranceClass1  utterance1
          {
            'title': '分类一',
            'key': 'utteranceClass1',
            'width': 300,
            'ellipsis': true,
            render: (create, params) => {
              var classify = params.row.utteranceClass1,content=params.row.utterance1,map=this.transferClassifyMap,txt='无'
              if(classify){
                txt = classify + ': ' + content
              }
              return create('span',txt)
            }
          },
          {
            'title': '分类二',
            'key': 'utteranceClass2',
            'width': 300,
            'ellipsis': true,
            render: (create, params) => {
              var classify = params.row.utteranceClass2,content=params.row.utterance2,map=this.transferClassifyMap,txt='无'
              if(classify){
                txt = classify + ': ' + content
              }
              return create('span',txt)
            }
          },
          {
            'title': '链接',
            'key': 'url',
            'width': 300,
          },
          {
            title: '创建人',
            key: 'createBy',
            sortable: true,
            'width': 150,
            render: (create,params)=>{
              var key=params.row.createBy,map=this.createByMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            title: '创建时间',
            key: 'createTime',
            sortable: true,
            'width': 200,
            render: (create,params)=>{
              var key=params.row.createTime,txt=key
              if(key&&typeof key == 'number'){
                txt=this.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          {
            title: '修改时间',
            key: 'modifyTime',
            sortable: true,
            'width': 200,
            render: (create,params)=>{
              var key=params.row.modifyTime,txt=key
              if(key&&typeof key == 'number'){
                txt=this.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 250,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[]
              if(vm.hasPerm('easypaper:preview')){
                arr.push(vm.createPreviewBtn(create, params.row,vm.previewPaper))
              }
              if(vm.hasPerm('easypaper:edit')){
                arr.push(vm.createEditBtn(create, params.row))
              }
              if(vm.hasPerm('easypaper:delete')){
                arr.push(vm.createDelBtn(create, params.row.id))
              }
              return create('div',arr)
            }
          }
        ],
        rules: {
          name: [
            { required: true, message: '分类名称不能为空', trigger: 'blur' },
            { required: true, message: '分类名称不能为空', trigger: 'change' },
          ]
        }
      }
    },
    methods: {
      timeChange(time){
        this.formDialog.briefingDate = time
      },
      // 添加时进行预览
      initAddPreviewData(){
        var vm = this
        var briefingDate = vm.formDialog.briefingDate
        var date = briefingDate ? vm.util.getNongLi(briefingDate) : ''
        var data={},_data=vm.storageAllContentsBindData,_key,arr=[],_item,i=1,delimiter=vm.delimiter
        var title = '锵锵简报 | 60秒知天下',content=''
        data.title = title
        for(var key in vm.formDialog){
          if(key=='title'){
            data[key] = title
          }else if(key=='content'){
            for(_key in _data){
              _item = i + delimiter + _data[_key]
              arr.push(_item)
              i++
            }
            data[key] = arr
          }else{
            data[key] = vm.formDialog[key]
          }
        }
        data.time = date
        vm.previewData = data
        vm.previewShow = true
      },
      // 发布简报
      releaseEasyPaper(id){
        var vm = this
        
      },
      // 复选框全选
      handleCheckAll(){
        var vm = this
        if (vm.indeterminate) {
          vm.checkAll = false;
        } else {
          vm.checkAll = !vm.checkAll;
        }
        vm.indeterminate = false;
        if (vm.checkAll) {
          var allData = [],i,item
          var len = vm.transferData.length
          for(i=0;i<len;i++){
            item = vm.transferData[i]
            allData.push(item)
          }
          vm.selectContents = allData;
        } else {
          vm.selectContents = [];
        }
      },
      checkAllGroupChange(data){
        var vm = this
        var len = vm.transferData.length
        if (data.length === len) {
          this.indeterminate = false;
          this.checkAll = true;
        } else if (data.length > 0) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          this.checkAll = false;
        }
        // 处理当前选中
        vm.selectContents = data
      },
      // 复选框全选  end
      // 多选改变时
      selectedClassifyChange(val){
        var vm=this,len=val.length
        if(!len){
          return
        }else if(len==1){
          // 先清空已选，再获取新数据
          vm.formDialog.utterance1 = ''
          vm.initChickenSoupData(val[0])
        }else if(len==2){
          vm.formDialog.utterance1 = ''
          vm.formDialog.utterance2 = ''
          vm.initChickenSoupData(val[len-2])
          vm.initHealthCareDataData(val[len-1])
        }else{
          vm.formDialog.utterance1 = ''
          vm.formDialog.utterance2 = ''
          var arr = [].concat(val)
          arr.shift()
          vm.initChickenSoupData(arr[0])
          vm.initHealthCareDataData(arr[1])
          vm.selectedClassify = arr
        }
      },
      addRow () {
        var vm = this
        vm.selfTypeVal = 2
        vm.initPagerData('guonei')
        vm.currDialog = 'add'
        vm.dialogShow = true
        // vm.paperTime = vm.util.timestampToTime((new Date()).valueOf()+86400000)
        // vm.initChickenSoupData()
        // vm.initHealthCareDataData()
      },
      editRow(data){
        var vm = this,key,_data={}
        for(key in vm.formDialog){
          _data[key] = data[key]
        }
        vm.formDialog = _data
        vm.editBindData = vm.initEditBindData(data.content)
        vm.paperTime = data.briefingDate
        vm.currDialog = 'edit'
        vm.dialogShow = true
      },
      initEditBindData(content){
        var content = '' + content,vm=this,editBindData={}
        var brStr = vm.brStr,delimiter=vm.delimiter
        var arr = content.split(brStr),_arr=[],i,item,_item,ind
        var len = arr.length
        for(i=0;i<len;i++){
          item = arr[i]
          if(item.trim()!=''){
            ind = item.indexOf(delimiter)
            _item = item.slice(ind+1)
            _arr.push(_item)
          }
        }
        var editBindData = {},_key,_val,j
        for(j=0;j<_arr.length;j++){
          _key = j+1
          _val = _arr[j]
          editBindData[_key] = _val
        }
        return editBindData
      },
      // 新增时，从storageAllContentsBindData对象里获取数据
      getAddContent(){
        var vm = this
        var data = vm.storageAllContentsBindData,key,delimiter = vm.delimiter,i=1,str='',brStr=vm.brStr
        for(key in data){
          str += i + delimiter + data[key] + brStr
          i++
        }
        return str
      },
      // 编辑时从editBindData对象里获取content的值
      getContent(){
        var vm =this,key,val
        var delimiter = vm.delimiter,i=1,str='',brStr=vm.brStr
        for(key in vm.editBindData){
          val = vm.editBindData[key]
          str += i + delimiter + val + brStr
          i++ 
        }
        return str
      },
      submitDialogForm (name) {
        let vm = this
        if(vm.currDialog=='edit'){
          vm.formDialog.content = vm.getContent()
        }
        if(vm.currDialog=='add'){
          if(vm.ajaxBriefingType==1&&!vm.formDialog.briefingDate){
            vm.$Message.info('请先选择发布时间')
            return
          }
          var str = vm.getAddContent()
          if(str){
            vm.formDialog.content = str
          }else{
            vm.$Message.info('请选择或编辑简报内容')
            return
          }
          if(vm.formDialog.utteranceClass1==''){
            vm.$Message.info('请选择心语分类1')
            return
          }
          if(vm.formDialog.utterance1==''){
            vm.$Message.info('请选择或填写心语分类1的内容')
            return
          }
          if(vm.formDialog.utteranceClass2==''){
            vm.$Message.info('请选择心语分类2')
            return
          }
          if(vm.formDialog.utterance2==''){
            vm.$Message.info('请选择或填写心语分类2的内容')
            return
          }
        }
        var pager = vm.pager
        let ajaxData = vm.editAddAjaxData(vm.currDialog),currDialog=vm.currDialog
        let ajaxUrl = vm.url[currDialog]  + vm.ajaxBriefingType
        var method =  pager.method
        if(currDialog=='add' && typeof pager.addMethod != 'undefined'){
          method = pager.addMethod
        }
        if(currDialog=='edit' && typeof pager.editMethod != 'undefined'){
          method = pager.editMethod
        }
        vm.dialogSubmitLoading = true
        var params = {
          url: ajaxUrl,
          method: method,
        }
        if(method=='post'){
          params.data = ajaxData
        }else if(method=='get'){
          params.params = ajaxData
        }
        vm.$http(params).then(res => {
          vm.dialogSubmitLoading = false
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success(vm.label[vm.currDialog]+'成功!')
            if(vm.currDialog=='add'){
              vm.paging(1);
            }else{
              vm.paging();
            }
            vm.dialogShow = false
            if(typeof vm.resetDialogForm == 'function'){
              vm.resetDialogForm()
            }
          }else{
            vm.$Message.error(vm.label[vm.currDialog]+'失败: ' + resData.message)
          }
        }).catch(err=>{
  
        })
      },
      // 移除已勾选的
      removeContent(index){
        var vm=this
        var len = vm.selectContents.length,len2 = vm.storageContents.length
        if(len2){
          // 已经存有历史记录
          if(index>len2-1){
            // 在当前选中里边
            vm.selectContents.splice(index-len2,1)
          }else{
            // 在历史里边
            vm.storageContents.splice(index,1)
          }
        }else{
          vm.selectContents.splice(index,1)
        }
      },
      // 移除所有勾选
      clearAllSelect(){
        var vm = this
        vm.selectContents = []
        vm.storageContents = []
        vm.formDialog.utterance1 =  ''
        vm.formDialog.utterance2 =  ''
        vm.formDialog.utteranceClass1 =  ''
        vm.formDialog.utteranceClass2 =  ''
        vm.$Message.success('清除成功')
      },
      // 数据勾选
      updateSelectTransfer(selection){
        var vm =this,selectContents=[],len=selection.length,i,item
        for(i=0;i<len;i++){
          item=selection[i]
          selectContents.push(item.content)
        }
        vm.selectContents = selectContents
      },
      // 数据勾选  end
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
        vm.paging(1)
        // vm.submitSearch(name)
      },
      // 重置新增/编辑表单
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.transferData = []
        vm.selectContents = []
        vm.indeterminate = false
        vm.selectedClassify = []
        vm.currentClassifyId = ''
        vm.selfTypeVal = 2
        vm.editBindData = {}
        vm.formDialog.utterance1 = ''
        vm.formDialog.utterance2 = ''
        vm.paperTime = ''
        vm.ajaxBriefingType = 1
        vm.$refs[name].resetFields()
      },
      // 行内简报预览
      previewPaper(data){
        var vm = this,key,obj={}
        var map = vm.createByMap,brStr = vm.brStr
        for(key in data){
          if(key=='content'){
            var arr = data.content.split(brStr)
            obj[key] = arr
          }else if(key=='createBy'){
            obj[key] = map[key] ? map[key] : key
          }else{
            obj[key] = data[key]
          }
        }
        vm.previewData = obj
        vm.previewShow=true
      },
      delRow (data) {
        var vm = this
        var parmas = {
          method: 'post',
          url: vm.url.delete,
          data: {
            ids: [data.id]
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
      batchoperation(parmas,paging){
        var vm = this
        parmas.method = parmas.method || 'post'
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          // 现在成功直接返回true
          if(resData){
            vm.$Message.success('操作成功');
            if(typeof paging == 'function'){
              paging()
            }else{
              vm.paging()
            }
            vm.batchIdArr=[]
          }else{
            vm.$Message.error('请求错误')
          }
          return
          if(resData.code==1){
            vm.$Message.success('操作成功');
            vm.paging()
          }else{
            vm.$Message.error(resData.message);
          }
        }).catch(err=>{})
      },
      initChickenSoupData(id){
        var vm = this
        var url = vm.url.utterance + id,
        method = 'get',
        params = {
          url: url,
          method: method
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.chickenSoupData = resData.result || resData.data
          }
        }).catch(err=>{})
      },
      initHealthCareDataData(id){
        var vm = this
        var url = vm.url.utterance + id,
        method = 'get',
        params = {
          url: url,
          method: method
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.healthCareData = resData.result || resData.data
          }
        }).catch(err=>{})
      },
      initCreateBy(){
        var vm = this
        var params = {
          url: vm.url.sysUser,
          method: 'post'
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var data = resData.data,item,arr=[],map={},key,val
            var len = data.length
            for(var i=0;i<len;i++){
              item = data[i],key=item.id,val=item.loginName
              arr.push({
                value: key,
                label: val || key
              })
              map[key] = val
            }
            vm.createBy = arr
            vm.createByMap = map
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      initTransferClassify(){
        var vm = this
        var params = {
          url: vm.url.classify.init,
          method: 'get'
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var data = resData.data,item,arr=[],map={},key,val
            var len = data.length
            for(var i=0;i<len;i++){
              item = data[i];
              key=item.id,val=item.name
              arr.push({
                value: key,
                label: val || key
              })
              map[key] = val
            }
            vm.transferClassify = arr
            vm.transferClassifyMap = map
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 简报切换分类时传入分类的id
      initPagerData(type){
        // 点击添加按钮时初始化，可以保证分类id已经获取过了
        var vm = this,url=''
        type = type || ''
        // 切换分类或再次点击分类时进行的数据处理
        vm.resultData(type)
        if(vm.selfTypeVal==1){
          url = vm.url.newsTitle
        }else if(vm.selfTypeVal==2){
          url = vm.url.newsTitle2
        }
        var ajaxData = {
          type: type
        }
        var method = 'get'
        var params = {
          url: url,
          method: method
        }
        if(method=='get'){
          params.params = ajaxData
        }else{
          params.data = ajaxData
        }
        vm.dataLoading = true
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var data = resData.data || resData.result
            vm.transferData = data
          }else{
            vm.$Message.error(resData.message)
          }
          vm.dataLoading = false
        }).catch(err=>{})
      },
      // 切换分类时的数据处理
      resultData(type){
        var vm = this
        // 为什么先请求数据后调用函数？
        vm.currentClassifyId = type
        var storageContents = vm.storageContents
        var selectContents = vm.selectContents
        vm.checkAll = false
        vm.indeterminate = false
        storageContents = storageContents.concat(selectContents)
        vm.storageContents = storageContents
        vm.selectContents = []
      },
      // 初始化心语分类 
      initChickenSoupClassify(){
        var vm = this
        var params = {
          url: vm.url.name,
          method: 'get'
        },
        delimiter = vm.chickenSoupDelimiter
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var data = resData.data,arr=[],item,map={},arr2=[]
            for(var i=0;i<data.length;i++){
              item = data[i]
              arr.push({
                value: item.id,
                label: item.name
              })
              arr2.push({
                value: item.name,
                label: item.name
              })
              map[item.id] = item.name
            }
            // var arr = resData.data.split(delimiter),_arr=[]
            // for(var i=0;i<arr.length;i++){
            //   if(arr[i].trim()){
            //     _arr.push(arr[i])
            //   }
            // }
            vm.chickenSoupClassify = arr
            vm.chickenSoupClassifyMap = map
            vm.chickenSoupClassifyWords = arr2
          }
        })
      },
      initData(){
        var vm = this
        if(vm.hasPerm('systemUser:dataGrid')){
          vm.initCreateBy()
        }
        // vm.initTransferClassify()
        vm.initChickenSoupClassify()
        // 在点击添加按钮时进行数据初始化
        // vm.initPagerData()
        var sysUser = JSON.parse(sessionStorage.sysUser)
        var createBy = sysUser.id || ''
        vm.formDialog.createBy = createBy
      },
    },
    watch: {
      selectContents(val){
        if(!val.length)this.checkAll=false
      },
      storageAllContents(val){
        var vm = this
        var arr = val,delimiter=vm.delimiter,brStr=vm.brStr,bindData={}
        var len = arr.length,str='',i,item,titleMaxNumber=vm.titleMaxNumber
        if(len>titleMaxNumber)len=titleMaxNumber
        if(len){
          for(i=0;i<len;i++){
            item=arr[i]
            // if(i==len-1){
            //   str += i + 1 + delimiter + item
            // }else{
            //   str += i + 1 + delimiter + item + brStr
            // }
            bindData[i] = item
          }
        }
        vm.storageAllContentsBindData = bindData
        // formDialog.content的数据在添加时进行获取
        // vm.formDialog.content = str
      },
      // storageAllContentsBindData(obj){
      //   var vm = this
      //   var delimiter=vm.delimiter,brStr=vm.brStr,i=1,str='',key
      //   for(key in obj){
      //     str += i + delimiter + obj[key] + brStr
      //     i++
      //   }
      //   vm.formDialog.content = str
      // },
      selectedClassify(val){
        var vm=this,len=val.length
        var map = vm.chickenSoupClassifyMap
        if(len){
          if(len==1){
            vm.formDialog.utteranceClass1 = map[val[0]]
            vm.formDialog.utteranceClass2 = ''  
          }else{
            vm.formDialog.utteranceClass1 = map[val[len-2]]
            vm.formDialog.utteranceClass2 = map[val[len-1]]
          }
        }else{
          vm.formDialog.utteranceClass1 = ''
          vm.formDialog.utteranceClass2 = ''
        }
      },
      selfTypeVal(val){
        var vm = this
        if(val==1){
          vm.myTypeMap = vm.typeMap
          vm.initPagerData('top')
        }else if(val==2){
          vm.myTypeMap = vm.type2Map
          vm.initPagerData('guonei')
        }
      }
    },
    computed: {
      storageAllContents(){
        return this.storageContents.concat(this.selectContents)
      },
    }
  }
</script>
