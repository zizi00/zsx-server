<template>
  <div class="message">
    <div id="search-wrapper">
      <Form :model="formSearch" ref="formSearch" inline :label-width="70">
        <template v-if="hasPerm('message:search')">
          <FormItem label="发送人" prop="sendUser">
              <Input v-model="formSearch.sendUser" placeholder="发送人账号/昵称" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <FormItem label="接收人" prop="receiveUser">
              <Input v-model="formSearch.receiveUser" placeholder="接收人账号/昵称" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <FormItem label="发送标题" prop="sendTitle">
              <Input v-model="formSearch.sendTitle" placeholder="发送标题" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <FormItem label="发送内容" prop="sendContent">
              <Input v-model="formSearch.sendContent" placeholder="发送内容" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
      </Form>
    </div>
    
    <!-- <mainTable :columns="columns" :data="pager.data" :height="tableHeight"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :currPage="pager.currPage"></paging> -->

    <main-table :columns="columns" :data="currentPager.data" :height="tableHeight" :loading="pageLoading"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :loading="pageLoading"></paging>

    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="900" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="90">
        <Row>
          <Col span="12">
            <FormItem label="发送人" prop="sendUserId">
              <el-select v-model="formDialog.sendUserId" placeholder="请选择/输入关键字搜索" filterable size="small">
                <el-option
                  v-for="item in allUser"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.sendUserId" placeholder="请选择/输入关键字搜索" filterable clearable>
                <Option v-for="item in allUser" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="接收人" prop="receiveUserId">
              <el-select v-model="formDialog.receiveUserId" placeholder="请选择/输入关键字搜索" filterable size="small">
                <el-option
                  v-for="item in allUser"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.receiveUserId" placeholder="请选择/输入关键字搜索" filterable clearable>
                <Option v-for="item in allUser" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="消息标题" prop="sendTitle">
              <Input v-model="formDialog.sendTitle" placeholder="请输入消息标题"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="消息内容" prop="sendContent">
              <Input v-model="formDialog.sendContent" placeholder="请输入消息内容"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="消息类型" prop="messageType">
              <el-select v-model="formDialog.messageType" placeholder="请选择" filterable size="small">
                <el-option
                  v-for="item in messageType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.messageType" placeholder="请选择" filterable>
                <Option v-for="item in messageType" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
            </FormItem>
          </Col>
          <Col span="12" v-show="formDialog.messageType==2 || formDialog.messageType ==3">
            <FormItem label="eventId" prop="eventId">
              <Input v-model="formDialog.eventId" placeholder="请输入消息内容"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row v-show="currDialog=='edit'">
          <Col span="12">
            <FormItem label="消息发送状态" prop="privateLetterStatus">
              <el-select v-model="formDialog.privateLetterStatus" placeholder="请选择" filterable size="small">
                <el-option
                  v-for="item in privateLetterStatus"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.privateLetterStatus" placeholder="请选择" filterable clearable>
                <Option v-for="item in privateLetterStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="添加好友状态" prop="addFriendsStatus">
              <el-select v-model="formDialog.addFriendsStatus" placeholder="请选择" filterable size="small">
                <el-option
                  v-for="item in addFriendsStatus"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.addFriendsStatus" placeholder="请选择" filterable clearable>
                <Option v-for="item in addFriendsStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
            </FormItem>
          </Col>
        </Row>
        <Row v-show="currDialog=='edit'">
          <Col span="12">
            <FormItem label="消息状态" prop="messageStatus">
              <el-select v-model="formDialog.messageStatus" placeholder="请选择" filterable size="small">
                <el-option
                  v-for="item in messageStatus"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <Select v-model="formDialog.messageStatus" placeholder="请选择" filterable clearable>
                <Option v-for="item in messageStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select> -->
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
    name: 'message',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        url: {
          add: 'web/message/add',
          edit: 'web/message/update',
          delete: 'web/message/delete',
          search: 'web/message/search',
          allUser: 'user/all/user',
        },
        searchPager: {
          url: 'web/message/search'
        },
        pager: {
          url: 'web/message/dataGrid',
          data: [],
          addMethod: 'post', // 新增编辑请求方式与页面初始化的请求方法不一致时使用
          searchMethod: 'get', // 指定搜索请求方式
          method: 'get'
        },
        allUser: [],
        allUserMap: {},
        messageType: [
          {
            value: '1',
            label: '好友'
          },
          {
            value: '2',
            label: '帖子点赞'
          },
          {
            value: '3',
            label: '帖子评论'
          },
          {
            value: '4',
            label: '私信'
          },
          {
            value: '5',
            label: '群通知'
          },
        ],
        messageTypeMap: {
          '1': '好友',
          '2': '帖子点赞',
          '3': '帖子评论',
          '4': '私信',
          '5': '群通知',
        },
        privateLetterStatus: [
          {
            value: '0',
            label: '未发送'
          },
          {
            value: '1',
            label: '已发送'
          }
        ],
        privateLetterStatusMap: {
          '0': '未发送',
          '1': '已发送'
        },
        addFriendsStatus: [
          {
            value: '0',
            label: '已拒绝'
          },
          {
            value: '1',
            label: '已同意'
          },
          {
            value: '2',
            label: '未同意'
          }
        ],
        addFriendsStatusMap: {
          '0': '已拒绝',
          '1': '已同意',
          '2': '未同意',
        },
        messageStatus: [
          {
            value: '0',
            label: '未读'
          },
          {
            value: '1',
            label: '已读'
          },
          {
            value: '2',
            label: '已删除'
          }
        ],
        messageStatusMap: {
          '0': '未读',
          '1': '已读',
          '2': '已删除',
        },
        batchIdArr: [],
        formSearch: {
          sendUser: '',
          receiveUser: '',
          sendTitle: '',
          sendContent: '',
        },
        formDialog: {
          id: '',
          sendUserId: '',
          receiveUserId: '',
          sendTitle: '',
          sendContent: '',
          messageType: '',
          eventId: '',
          privateLetterStatus: '',
          addFriendsStatus: '',
          messageStatus: '',
        },
        columns: [
          // {
          //   title: 'ID',
          //   key: 'id',
          //   width: 200,
          //   sortable: true
          // },
          {
            title: '发送人',
            key: 'sendUserId',
            width: 150,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.sendUserId != 'undefined'){
                txt = this.getValByMap(params.row.sendUserId,this.allUserMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '接收人',
            key: 'receiveUserId',
            width: 150,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.receiveUserId != 'undefined'){
                txt = this.getValByMap(params.row.receiveUserId,this.allUserMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '标题',
            key: 'sendTitle',
            width: 200,
            sortable: true
          },
          {
            title: '内容',
            key: 'sendContent',
            width: 200,
            sortable: true
          },
          {
            title: '消息类型',
            key: 'messageType',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.messageType != 'undefined'){
                txt = this.getValByMap(params.row.messageType,this.messageTypeMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '事件ID',
            key: 'eventId',
            width: 200,
            sortable: true,
          },
          {
            title: '发送结果',
            key: 'privateLetterStatus',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.privateLetterStatus != 'undefined'){
                txt = this.getValByMap(params.row.privateLetterStatus,this.privateLetterStatusMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '添加好友状态',
            key: 'addFriendsStatus',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.addFriendsStatus != 'undefined'){
                txt = this.getValByMap(params.row.addFriendsStatus,this.addFriendsStatusMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '消息状态',
            key: 'messageStatus',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.messageStatus != 'undefined'){
                txt = this.getValByMap(params.row.messageStatus,this.messageStatusMap)
              }
              return create('span', txt)
            }
          },
          {
            title: '创建时间',
            key: 'createTime',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var txt = '无',key = params.row.createTime
              if(key){
                txt = typeof(key) == 'number' ? this.util.timestampToTime(key) : key
              }
              return create('span', txt)
            }
          },
        ],
        rules: {}
      }
    },
    methods: {
      // submitSearch (name) {
      //   let vm = this
      //   // 搜索操作
      //   vm.$http2({
      //     url: vm.url.search,
      //     method: 'post',
      //     data: vm.formSearch
      //   }).then(res => {
      //     var resData = res.data
      //     if(resData.code==1){
      //       vm.pager.data = resData.data.records
      //     }else{
      //       vm.$Message.error('搜索失败: ' + resData.message)
      //     }
      //   }).catch(err=>{})
      // },
      getValByMap(val,map){
        var txt = '',_val = val
        if(typeof val=='number'){
          _val = '' + val          
        }
        txt = map[_val]
        if(typeof txt == 'undefined'){
          // 未匹配到，返回原始数据
          txt = val
        }
        return txt
      },
      resetSearch(name){
        name = name || 'formSearch'
        var vm = this
        vm.$refs[name].resetFields()
        vm.paging(1)
        // vm.submitSearch(name)
      },
      resetDialogForm(name){
        name = name || 'formDialog'
        var vm = this
        vm.$refs[name].resetFields()
      },
      updateContent (content) {
        this.formDialog.content = content
      },
      initDialog(data){
        if(typeof data.messageType == 'number'){
          data.messageType = data.messageType.toString()
        }
        if(typeof data.addFriendsStatus == 'number'){
          data.addFriendsStatus = data.addFriendsStatus.toString()
        }
        if(typeof data.messageStatus == 'number'){
          data.messageStatus = data.messageStatus.toString()
        }
        if(typeof data.privateLetterStatus == 'number'){
          data.privateLetterStatus = data.privateLetterStatus.toString()
        }
      },
      initAllUserMap(){
        var vm = this
        vm.$http({
          method: 'get',
          url: vm.url.allUser,
        }).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var userData = resData.data
            var len = userData.length,i,item,allUserMap={},allUser=[];
            for(i=0;i<len;i++){
              item = userData[i]
              allUserMap[item.id] = item.nickName
              allUser.push({
                value: item.id,
                label: item.nickName || item.id
              })
            }
            vm.allUserMap = allUserMap
            vm.allUser = allUser
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      initData(){
        this.initAllUserMap()
      }
    }
  }
</script>
<style scoped>

</style>
