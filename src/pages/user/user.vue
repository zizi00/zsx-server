<template>
  <div class="user">
    <div id="search-wrapper">
      <!-- <div>
        <Button :type="currentSourceWeb ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="switchSource('web')">发帖用户</Button>
        <Button :type="!currentSourceWeb ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="switchSource('app')">app用户</Button>
      </div> -->
      <Form :model="formSearch" ref="formSearch" inline :label-width="60">
        <template v-if="hasPerm('app:search')">
          <FormItem label="用户">
              <Input v-model="formSearch.name" placeholder="用户名/账号/手机号" size="small" @keydown.native.enter.prevent="submitSearch('formSearch')"></Input>
          </FormItem>
          <!-- <FormItem label="管理区域">
              <Cascader :data="derail_address_arr" v-model="derail_address_obj_s" filterable size="small" style="margin-top: 5px"></Cascader>
          </FormItem>
          <FormItem label="创建时间">
              <FormItem prop="createdateStart">
                  <DatePicker type="datetime" placeholder="点击选择时间" style="width: 160px;" v-model="formSearch.createdateStart" size="small" :clearable="false"></DatePicker>
              </FormItem>
              <FormItem>至</FormItem>
              <FormItem prop="createdateEnd">
                  <DatePicker type="datetime" placeholder="点击选择时间" style="width: 160px;" v-model="formSearch.createdateEnd" size="small" :clearable="false"></DatePicker>
              </FormItem>
          </FormItem> -->
          <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" :disabled="pageLoading" size="small">{{label.clear}}</Button>
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" :disabled="pageLoading" size="small">{{label.search}}</Button>
        </template>
        <!-- <Button v-if="hasPerm('app:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">添加发帖用户</Button>
        <Button v-if="hasPerm('post_index:add')" type="primary" style="margin: 5px 8px 24px 0;" @click="postAddRow(false)" size="small">发帖用户发帖</Button> -->
        <!-- <Button v-if="hasPerm('app:delete')" type="error" style="margin: 5px 8px 24px 0;" :disabled="batchUserArr.length==0 || !currentSourceWeb" @click="batchDelWebUser" size="small">批量删除web用户</Button> -->
      </Form>
    </div>
    <!-- 用户数据展示表格 -->
    <!-- <mainTable :columns="columns" :data="pager.data" @updateSelect="updateSelectUser" :height="tableHeight"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging> -->

    <main-table :columns="columns" :data="currentPager.data" @updateSelect="updateSelectUser" :height="tableHeight" :loading="pageLoading"></main-table>
    <paging @changePager="changePager" @paging="paging" :total="currentPager.total" :current="currentPager.current" :loading="pageLoading"></paging>

    <!-- 添加/编辑用户弹窗 -->
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="750" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="85">
        <Row v-if="currDialog=='add'">
          <Col span="12">
            <FormItem label="账号" prop="loginUsername">
              <Input v-model="formDialog.loginUsername" placeholder="请输入11位数字账号"></Input>
            </FormItem>
          </Col>
          <Col span="12" >
            <FormItem label="密码" prop="loginPassword">
              <Input v-model="loginPassword" placeholder="请输入密码" type="password"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="昵称" prop="nickName">
                <Input v-model="formDialog.nickName" placeholder="请输入昵称"></Input>
            </FormItem>
          </Col>
           <Col span="12">
            <FormItem label="性别" prop="sex">
                <Select v-model="formDialog.sex">
                    <Option v-for="item in sex" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
         <!-- <Col span="12" v-show="currDialog=='edit'">
            <FormItem label="用户状态" prop="userStatus">
                <Select v-model="formDialog.userStatus">
                  <Option v-for="item in userStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </FormItem>
          </Col> -->
          <Col span="12">
            <FormItem label="出生日期" prop="birthday">
              <DatePicker type="date" :options="birthdayOptions" :start-date="birthdayStartTime" placeholder="点击选择出生日期" @on-change="birthChange" v-model="birthday" :clearable="false"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <!-- 上传图片 -->
        <Row>
          <Col span="12">
            <FormItem label="头像" prop="headPortrait">
              <!-- <Input v-model="formDialog.headPortrait"></Input> -->
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload"
                      :format="['jpg','jpeg','png','gif']"
                      :on-format-error="handleFormatError"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize">
                    <Button type="default" icon="ios-cloud-upload-outline">选择头像</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload" :loading="uploadLoading">确定上传</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileUrl.length">
                    <Col span="8" v-for="(item, index) in fileUrl" :key="item">
                      <div class="image-box">
                        <img :src="item" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <!-- <Icon type="ios-eye-outline" @click.native="handleView(index)"></Icon> -->
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
            </FormItem>
          </Col>
          <Col span="12" v-show="currDialog=='edit'">
            <FormItem label="头像背景" prop="bgPortrait">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload2"
                      :format="['jpg','jpeg','png','gif']"
                      :on-format-error="handleFormatError2"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize2">
                    <Button type="default" icon="ios-cloud-upload-outline">选择头像背景</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload2" :loading="uploadLoading2">确定上传</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileUrl2.length">
                    <Col span="8" v-for="(item, index) in fileUrl2" :key="item">
                      <div class="image-box">
                        <img :src="item" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <!-- <Icon type="ios-eye-outline" @click.native="handleView2(index)"></Icon> -->
                          <Icon type="ios-trash-outline" @click.native="handleRemove2(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-show="!fileUrl2.length" class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <!-- <Row v-show="currDialog=='edit'">
          <Col span="12">
            <FormItem label="所在地">
              <Cascader :data="derail_address_arr" v-model="location_address" filterable></Cascader>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="家乡">
              <Cascader :data="derail_address_arr" v-model="hometown_address" filterable></Cascader>
            </FormItem>
          </Col>
        </Row> -->
      </Form>
      <div slot="footer">
        <Button v-if="currDialog=='add'" @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 预览用户数据 -->
    <Modal v-model="previewShow" title="用户预览">
      <Row>
        <Col span="4" class="rightt"><strong>账号:</strong></Col>
        <Col span="19"><p>{{previewData.loginUsername}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>用户昵称:</strong></Col>
        <Col span="19" ><p>{{previewData.nickName}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>appSoucre:</strong></Col>
        <Col span="19" ><p>{{appSoucreMap[previewData.appSoucre]}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>出生日期:</strong></Col>
        <Col span="19" ><p>{{previewData.birthday}}</p></Col>
      </Row>

      <Row>
        <Col span="4" class="rightt"><strong>年龄:</strong></Col>
        <Col span="19" ><p>{{previewData.age}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>性别:</strong></Col>
        <Col span="19" ><p>{{sexMap[previewData.sex]}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>用户头像:</strong></Col>
        <Col span="19" >
          <div class="preview-img-box">
            <template v-if="previewData.headPortrait && previewData.headPortrait.indexOf('http')==-1">
              <img :src="imageHost + previewData.headPortrait" :alt="imageHost + previewData.headPortrait">  
            </template>
            <img  v-else :src="previewData.headPortrait" :alt="previewData.headPortrait">
          </div>
        </Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>头像背景:</strong></Col>
        <Col span="19" >
          <div class="preview-img-box">
            <template v-if="previewData.bgPortrait && previewData.bgPortrait.indexOf('http')==-1">
              <img :src="imageHost + previewData.bgPortrait" :alt="imageHost + previewData.bgPortrait">  
            </template>
            <img v-else :src="previewData.bgPortrait" :alt="previewData.bgPortrait">
          </div>
        </Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>所在地:</strong></Col>
        <Col span="19" ><p>{{previewData.location}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>家乡:</strong></Col>
        <Col span="19" ><p>{{previewData.home}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>是否认证:</strong></Col>
        <Col span="19" ><p>{{isAuthMap[previewData.isAuth]}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>是否完善资料:</strong></Col>
        <Col span="19" ><p>{{isConsummateMap[previewData.isConsummate]}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>用户状态:</strong></Col>
        <Col span="19" ><p>{{userStatusMap[previewData.userStatus]}}</p></Col>
      </Row>
      <Row>
        <Col span="4" class="rightt"><strong>创建时间:</strong></Col>
        <Col span="19" ><p>{{previewData.createTime}}</p></Col>
      </Row>
      <div slot="footer">
        <Button type="primary" size="large"  @click="previewShow = false">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 根据userId获取的帖子数据 -->
    <Modal v-model="postShow" title="帖子" :mask-closable="false" width="1000">
      <Form :model="postFormSearch" ref="postFormSearch" inline :label-width="60">
        <FormItem label="帖子内容" prop="key">
          <Input v-model="postFormSearch.key" placeholder="请输入要搜索的帖子内容" size="small" @keyup.enter.native="postSubmitSearch('postFormSearch')"></Input>
        </FormItem>
        <Button type="default" style="margin:5px 8px 24px 0;" @click="postResetSearch('postFormSearch')" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="postSubmitSearch('postFormSearch')" size="small">{{label.search}}</Button>
        <Button type="error" style="margin: 5px 8px 24px 0" :disabled="batchIdArr.length==0" @click="batchDel" size="small">批量删除</Button> 
        <!-- 在帖子列表里加发帖按钮需要知道当前用户并且设置给用户选择框设置disabled -->
        <!-- <Button type="primary" style="margin: 5px 8px 24px 0;" @click="postAddRow(false)" size="small">发帖</Button> -->
      </Form>
      <mainTable :columns="postColumns" :data="postPager.data" @updateSelect="updateSelect" :loading="postLoading"></mainTable>
      <paging @changePager="postChangePager" @paging="postPaging" :total="postPager.total" :currPage="postPager.current" :loading="postLoading"></paging>
      <div slot="footer">
        <Button size="large"  @click="postShow = false">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 当前用户发帖 -->
    <Modal v-model="postDialogShow" :title="label[postCurrDialog] + '帖子'" :mask-closable="false" width="750" @on-cancel="postResetDialogForm('postFormDialog')">
        <Form :model="postFormDialog" ref="postFormDialog" :rules="rules" :label-width="80">
          <Row>
            <Col span="12">
              <FormItem label="用户" prop="userId">
                <el-select v-model="postFormDialog.userId" placeholder="请选择/输入关键字筛选用户" :disabled="userSelectDisabled" filterable size="small">
                  <el-option
                    v-for="item in webUserId"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <!-- <Select v-model="postFormDialog.userId" placeholder="请选择/输入关键字筛选用户" :disabled="userSelectDisabled" filterable>
                  <Option v-for="item in webUserId" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select> -->
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="帖子状态" prop="postStatus">
                <Select v-model="postFormDialog.postStatus" placeholder="请选择" :disabled="postCurrDialog=='add'">
                  <Option v-for="item in postStatus" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="24">
              <FormItem label="帖子内容" prop="postContent">
                <Input type="textarea" :rows="4" v-model="postFormDialog.postContent" placeholder="请输入帖子内容"></Input>
              </FormItem>
            </Col>
          </Row>
          <!-- 上传图片 -->
          <Row>
            <Col span="24">
              <FormItem label="图片/视频">
                <Row>
                  <Col span="6">
                    <Upload name="file"
                        :action="url.upload"
                        multiple
                        :before-upload="myBeforeUpload3"
                        :format="postUploadFormat"
                        :on-format-error="handleFormatError3"
                        :max-size="20000"
                        :on-exceeded-size="handleMaxSize3">
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
                    <!-- <Row v-if="editFileUrl3.length">
                      <Col span="8" v-for="(item, index) in editFileUrl3" :key="item">
                        <div class="image-box">
                          <video :src="item" v-if="isVideo(item)" controls="controls" @click="toggle(index)"></video>
                          <img :src="item" v-else class="ad-img">
                        </div>
                      </Col>
                    </Row> -->
                    <Row v-if="fileUrl3.length">
                      <Col span="8" v-for="(item, index) in fileUrl3" :key="item">
                        <div class="image-box">
                          <video v-if="isVideo(item)" loop autoplay style="max-width:100%;max-height:100%;">
                            <source :src="item" type='video/mp4'>
                          </video>
                          <img :src="item" v-else class="ad-img">
                          <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleRemove3(index)"></Icon>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div v-show="!fileUrl3.length" class="image-box">
                      <img :src="defaultUploadImgSrc" class="ad-img">
                    </div>
                  </Col>
                </Row>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div slot="footer">
          <Button @click="postResetDialogForm2('postFormDialog')">{{label.clear}}</Button>
          <Button type="primary" @click="postSubmitDialogForm('postFormDialog')" :disabled="uploadLoading3" :loading="postDialogSubmitLoading">{{label.submit}}</Button>
        </div>
    </Modal>
    <!-- 预览帖子内容 表现形式同APP -->
    <Modal v-model="postPreviewShow" title="帖子预览" width="800">
      <div class="post-content">
        <div class="post-preview-header clearfix">
          <div class="head-portrait">
            <img :src="userData.headPortrait" alt="头像">
          </div>
          <div class="post-user-info">
            <div class="info-header">
              <span class="user-name">{{userData.nickName}}</span>
              <img class="user-sex" :src="sexImgSrcMap[userData.sex]" alt="">
            </div>
            <div class="info-footer">
              <span>{{postPreviewData.postTime}}</span>
              <!-- <span>5分钟前</span> -->
            </div>
          </div>
        </div>
        <div class="post-preview-conntent">{{postPreviewData.postContent}}</div>

        <div class="post-preview-media clearfix" v-if="postPreviewData.postImagesSrc && postPreviewData.postImagesSrc.length">
          <template v-if="postPreviewData.postImagesSrc.length==1">
            <template v-for="item in postPreviewData.postImagesSrc">
              <template v-if="typeof item == 'object'">
                <video id="myvideo" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" 
                style="max-width: 100%;max-height: 10rem;" :poster="item.poster">
                  <source :src="item.src" type='video/mp4'>
                </video>
              </template>
              <template v-else>
                <img style="max-width: 100%;max-height: 225px;" :src="item" :alt="item">
              </template>
            </template>
          </template>
          <template v-else-if="postPreviewData.postImagesSrc.length==4">
            <template v-for="item in postPreviewData.postImagesSrc">
              <div class="post-img-item">
                <img :src="item" :alt="item">
              </div>
            </template>
          </template>
          <template v-else>
            <template v-for="(item,index) in postPreviewData.postImagesSrc">
              <div v-if="(index+1)%3==0" style="margin-right: 0;" class="post-img-item">
                <img :src="item" alt="">
              </div>
              <div v-else class="post-img-item">
                <img :src="item" alt="">
              </div>
            </template>
          </template>
        </div>
      </div>
      <div slot="footer">
        <Button size="large"  @click="postPreviewShow = false">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 公共预览 -->
    <Modal v-model="commonShow" :title="commonTitle" :width="commonWidth" @on-cancel="resetCommonModal">
      <mainTable :columns="commonColumns" :data="commonPager.data" :loading="commonLoading"></mainTable>
      <paging @changePager="commonchangePager" @paging="commonpaging" :total="commonPager.total" :currPage="commonPager.current" :loading="commonLoading"></paging>
      <div slot="footer">
        <Button size="large"  @click="resetCommonModal">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 有分类的预览 -->
    <Modal v-model="commonClassifyShow" :title="commonClassifyTitle" :width="commonClassifyWidth" @on-cancel="resetClassifyDialog">
      <Form :model="commonClassifyDialog" ref="commonClassifyDialog" :rules="rules" :label-width="80" inline>
        <!-- <FormItem label="关键词">
            <Input v-model="commonClassifyDialog.name" placeholder="" size="small"></Input>
        </FormItem>
        <Button type="default" style="margin:5px 8px 24px 0;" @click="resetCommonClassifySearch('commonClassifyDialog')" size="small">{{label.clear}}</Button>
        <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitCommonClassifySearch('commonClassifyDialog')" size="small">{{label.search}}</Button> -->
        <template v-if="currentCommonShow=='post'">
          <Button :type="currentClassify=='news' ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData('news','post')" size="small">新闻</Button>
          <Button :type="currentClassify=='post' ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData('post','post')" size="small">帖子</Button>
        </template>
        <template v-if="currentCommonShow=='collection'">
          <Button :type="currentClassify==1 ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData(1,'collection')" size="small">新闻</Button>
          <Button :type="currentClassify==2 ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData(2,'collection')" size="small">政务</Button>
          <Button :type="currentClassify==3 ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData(3,'collection')" size="small">招商</Button>
          <Button :type="currentClassify==4 ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData(4,'collection')" size="small">办事</Button>
          <Button :type="currentClassify==5 ? 'primary' : 'default'" style="margin: 5px 8px 24px 0;" @click="previewClassifyData(5,'collection')" size="small">帖子</Button>
        </template>
        <!-- <template v-if="currentCommonShow=='group'">
          <Button type="primary" style="margin: 5px 8px 24px 0;" @click="addGroup" size="small">新增群组</Button>
        </template> -->
      </Form>
      <mainTable :columns="commonClassifyColumns" :data="commonClassifyPager.data" :loading="classifyLoading"></mainTable>
      <paging @changePager="commonClassifychangePager" @paging="commonClassifypaging" :total="commonClassifyPager.total" :currPage="commonClassifyPager.current" :loading="classifyLoading"></paging>
      <div slot="footer">
        <Button size="large"  @click="resetClassifyDialog">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 名片 -->
    <Modal v-model="cardShow" title="名片">
      <template v-if="isNullObj(cardData)">
        该用户暂无名片
      </template>
      <template v-else>
        <card>
          <Row type="flex" class="user-infor">
            <Col span="6">
              <Row class-name="made-child-con-middle" type="flex" align="middle">
                <template v-if="!cardData.headPortrait">
                  暂无头像
                </template>
                <template v-else>
                  <template v-if="cardData.headPortrait.indexOf('http') != -1">
                    <img class="avator-img" style="width:50px;height:50px" :src="cardData.headPortrait"/>
                  </template>
                  <template v-else>
                    <img class="avator-img" style="width:50px;height:50px" :src="imageHost+cardData.headPortrait"/>
                  </template>
                </template>
              </Row>  
            </Col>
            <Col span="10" style="padding-left:6px;">
              <Row class-name="made-child-con-middle" type="flex" align="middle">
                <div>
                  <b class="card-user-infor-name">{{cardData.name}}</b>
                  <template v-if="typeof(cardData.sex) == 'undefined'">
                   性别无数据
                  </template>
                  <template v-else>
                    <img style="width:10px;height:10px" :src="sexImgSrcMap[cardData.sex]" />
                  </template>
                   <p>{{cardData.age}}岁</p>
                </div>
              </Row>
            </Col>
          </Row>   
          <Row class="margin-top-8">  
            <Col span="6"><p class="notwrap">职位:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.job}}</Col>
          </Row>       
          <Row class="margin-top-8">  
            <Col span="6"><p class="notwrap">公司名称:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.companyName}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">手机号码:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.phone}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">QQ:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.qq}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">微信:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.wechat}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">地区:</p></Col>
            <Col span="16" class="padding-left-8">{{util.getProvinceCityArea([cardData.provincesCode,cardData.cityCode,cardData.areaCode],chinaJson,true)}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">是否公开:</p></Col>
            <Col span="16" class="padding-left-8">{{authMap[cardData.auth]}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">创建时间:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.createTime}}</Col>
          </Row>
          <Row class="margin-top-8">
            <Col span="6"><p class="notwrap">修改时间:</p></Col>
            <Col span="16" class="padding-left-8">{{cardData.modifyTime}}</Col>
          </Row>
        </card >
      </template>
      <div slot="footer">
        <Button size="large"  @click="cardShow=false;cardData={}">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 新增/编辑群组 -->
    <Modal v-model="groupShow" :title="label[groupCurrDialog]" width="800">
      <Form :model="groupForm" ref="groupForm" :rules="rules" :label-width="85">
        <Row>
          <Col span="12">
            <FormItem label="群头像">
              <Row>
                <Col span="12">
                  <Upload name="file"
                      :action="url.upload"
                      :before-upload="myBeforeUpload4"
                      :format="['jpg','jpeg','png','gif']"
                      :on-format-error="handleFormatError4"
                      :max-size="3000"
                      :on-exceeded-size="handleMaxSize4">
                    <Button type="default" icon="ios-cloud-upload-outline">选择群头像</Button>
                  </Upload>
                  <Button type="primary" @click="myUpload4" :loading="uploadLoading4">上传头像</Button>
                </Col>
                <Col span="12">
                  <Row v-if="fileUrl4.length">
                    <Col span="8" v-for="(item, index) in fileUrl4" :key="item">
                      <div class="image-box">
                        <img :src="item" class="ad-img">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-trash-outline" @click.native="handleRemove4(index)"></Icon>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div v-show="!fileUrl4.length" class="image-box">
                    <img :src="defaultUploadImgSrc" class="ad-img">
                  </div>
                </Col>
              </Row>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="群名称" prop="groupName">
              <Input v-model="groupForm.groupName" placeholder="请输入11位数字账号"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="是否公开" prop="groupIsPublic">
              <Select v-model="groupForm.groupIsPublic" placeholder="请选择"  clearable>
                <Option v-for="item in groupIsPublic" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="是否需要审批" prop="groupMembersOnly">
              <Select v-model="groupForm.groupMembersOnly" placeholder="请选择"  clearable>
                <Option v-for="item in groupMembersOnly" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
          </Col>
          <!-- <Col span="12">
            <FormItem label="最大人数" prop="groupMaxusers">
              
            </FormItem>
          </Col> -->
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="允许成员邀请" prop="groupAllowinvites">
              <Select v-model="groupForm.groupAllowinvites" placeholder="请选择"  clearable>
                <Option v-for="item in groupAllowinvites" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <FormItem label="邀请成员" prop="members">
              <Select v-model="selectedFriends" @on-change='friendSelectChange' placeholder="请选择" multiple>
                <Option v-for="item in allFriends" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <!-- <Button v-if="currDialog=='add'" @click="resetGroupModal('groupForm')">{{label.clear}}</Button> -->
        <Button type="primary" @click="submitGroupForm('groupForm')" :loading="groupSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 群详情 -->
    <Modal v-model="groupDetailShow" title="群详情">
      <!-- todo -->
      <div slot="footer">
        <Button size="large"  @click="cardShow=false;cardData={}">{{label.close}}</Button>
      </div>
    </Modal>
    <!-- 预览评论的帖子或新闻及此条评论 -->
    <Modal v-model="commentPostNewsShow" :title="postNewsTitle">
      <!-- 我的评论  评论的新闻或帖子  展示优化 -->
      <!-- 评论的新闻 -->
      <div v-if="commentPostNewsData.news">
        <h3>
          <span>新闻：</span>
        </h3>
        <div v-for="(val,key) in commentPostNewsData.news">{{key + ': ' + val}}</div>

      </div>
      <!-- 评论的帖子 -->
      <div v-if="commentPostNewsData.post">
        <h3>
          <span>帖子：</span>
        </h3>
        <!-- <div v-for="(val,key) in commentPostNewsData.post">{{key + ': ' + val}}</div> -->
        <Row>
          <Col span="6"><p class="middle-font">用户id：</p></Col>
          <Col span="14">{{commentPostNewsData.post.userId}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">id：</p></Col>
          <Col span="16">{{commentPostNewsData.post.id}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">帖子内容：</p></Col>
          <template v-if="!commentPostNewsData.post.postContent">
            <Col span="16">此帖子文字内容为空</Col>
          </template>
          <template v-else>
            <Col span="16">{{commentPostNewsData.post.postContent}}</Col>
          </template>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">评论状态：</p></Col>
          <Col span="16">{{postStatusMap[commentPostNewsData.post.postStatus]}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">帖子位置：</p></Col>
          <template v-if="!commentPostNewsData.post.postAddress">
            <Col span="16"><p>无</p></Col>
          </template>
          <template v-else>
            <Col span="16">{{commentPostNewsData.post.postAddress}}</Col>
          </template>
          
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">发帖时间：</p></Col>
          <Col span="16">{{commentPostNewsData.post.createTime}}</Col>
        </Row>
      </div>
      <h3 v-else>您评论的新闻或帖子已被删除</h3>
      <!-- 评论的内容 -->
      <div>
        <h3>
          <span style="margin-top:20px;display:block">评论：</span>
        </h3>
        <!-- <div v-for="(val,key) in commentPostNewsData.comment">{{key + ': ' + val}}</div> -->
        <Row>
          <Col span="6"><p class="middle-font">用户id：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.userId}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">id：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.id}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">评论者：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.userNickName}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font" style="margin-top:15px">评论头像：</p></Col>
          <template v-if="!commentPostNewsData.comment.userheadPortrait">
            暂无头像
          </template>
          <template v-else>
            <template v-if="commentPostNewsData.comment.userheadPortrait.indexOf('http') != -1">
              <img style="width:50px;height:50px" :src="commentPostNewsData.comment.userheadPortrait"/>
            </template> 
            <template v-else>
              <img style="width:50px;height:50px" :src="imageHost+commentPostNewsData.comment.userheadPortrait"/>
            </template>
          </template>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">commentId：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.commentId}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">评论时间：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.commentTime}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">评论内容：</p></Col>
          <Col span="16">{{commentPostNewsData.comment.commentContent}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">帖子内容：</p></Col>
          <template v-if="!commentPostNewsData.comment.content">
            <Col span="16">此帖子文字内容为空</Col>
          </template>
          <template>
            <Col span="16">{{commentPostNewsData.comment.content}}</Col>
          </template>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">性别：</p></Col>
          <Col span="16">{{sexMap[commentPostNewsData.comment.userSex]}}</Col>
        </Row>
        <Row>
          <Col span="6"><p class="middle-font">是否认证：</p></Col>
          <Col span="16">{{isAuthMap[commentPostNewsData.comment.userIsAuth]}}</Col>
        </Row> 
        <Row>
          <Col span="6"><p class="middle-font">帖子图片/视频：</p></Col>
          <!-- 帖子图片展示 -->
          <!-- <Col span="16">{{commentPostNewsData.comment.fileManageList}}</Col> -->
        </Row>
      </div>
      <div slot="footer">
        <Button size="large"  @click="closeCommentModal">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  export default {
    name: 'user',
    components: {
      mainTable,
      paging
    },
    mixins: [page],
    data () {
      return {
        url: {
          imgServer: 'web/server/get',
          add: 'user/add',
          edit: 'user/update',
          delete: 'user/delete',
          search: 'user/dataSearch',
          allUser: 'user/all/user',
          upload: 'file/',
          sId: 'id/id',
          post: {
            init: 'post/search/userId/',
            add: 'post/add',
            edit: 'post/update',
            // delete: 'post/delete',  // 物理删除
            delete: 'post/delete/vartual',  // 状态删除
            search: 'post/dataSearch'
          },
          friend: 'user/friend/',
          // 水军加好友 web/friend/add/{userId}/{owerId} 
          addFriend: 'web/friend/add/',
          // 查看帖子评论
          comment: 'web/user/comment/post/',
          // 查看新闻评论
          commentNews: 'web/user/comment/news/',
          // get 根据id和type查评论的新闻或帖子
          postNews: 'web/user/comment/search/type',
          group: {
            'all': 'web/group/dataGrid',
            'add': 'web/group/add',
            'edit': 'web/group/update',
            'delete': 'web/group/delGroup',
            'init': 'web/user/group/',
            'member': 'web/group/',
            'detail': 'web/group/get/',
          },
          zan: 'web/user/thumbup/',
          collection: 'web/user/collection/',
          message: 'web/message/',
          card: 'web/user/card/',
        },
        postRequiredTxt: '图片最多选择九张，单张图片小于3Mb;视频只能单个，最大20Mb',
        imgMaxSize: 3,
        videoMaxSize: 20,
        // 帖子图片最多9张
        postImgMaxLength: 9,
        // 加载中
        postLoading: false, //帖子
        commonLoading: false, // 公共
        classifyLoading: false, // 有分类的
        // 当前时间减去
        age15: 473385600000,
        age18: 567993600000,
        // 发帖用户选择出生日期的起始日期  默认大于15岁
        birthdayStartTime: new Date(this.util.timestampToTime(Date.now().valueOf() -473385600000)),
        birthdayOptions: {
          disabledDate (date) {
            var age15 = 473385600000
            // var _date = new Date()
            // var Y = _date.getFullYear()
            // var M = _date.getMonth()+1
            // var D = _date.getDate()
            // _date = new Date(Y + '-' + M + '-' + D)
            // var date18 = new Date('2000-7-13')
            // var date15 = new Date('2003-7-13')
            // var age15 = _date.valueOf()-date15.valueOf(),
            //   age18 = _date.valueOf()-date18.valueOf()
            return date && date.valueOf() > Date.now().valueOf() - age15;
          }
        },
        // 新增时不需要的key数组
        notNeedKeys: ['hxId'],
        // 选择发帖用户
        userId: [],
        webUserId: [],
        appUserId: [],
        // 点击的发帖按钮是在上边
        userSelectDisabled: false,
        pager: {
          data: [],
          url: 'user/dataGrid',
          source: 'app', //  web  显示web用户    app  显示ios和安卓用户   ios  显示ios   android  显示安卓用户
        },
        currentSourceWeb: true,
        postCurrDialog: 'add',
        groupCurrDialog: 'add',
        postShow: false,
        postPager: {
          data: [],
          url: '',
          method: 'post',
          current: 1,
          size: 10,
          total: 0
        },
        postUploadFormat: ['jpg','jpeg','png','gif','mp4'],
        postUploadImgFormat: ['jpg','jpeg','png','gif'],
        imgTypeErrorTxt: '图片请选择jpg、jpeg、png或gif格式的文件',
        videoTypeErrorTxt: '视频请选择mp4格式的文件',
        postUploadVideoFormat: ['mp4'],
        commonTitle: '预览',
        commonClassifyTitle: '预览',
        commonWidth: 750,
        commonClassifyWidth: 750,
        commonPager: {
          url: '',
          data: [],
          method: 'post',
          current: 1,
          size: 10,
          total: 0
        },
        commonClassifyPager: {
          url: '',
          data: [],
          method: 'get',
          c: 1,
          s: 10,
          total: 0
        },
        // 当前操作的用户id
        currentUserId: '',
        // 当前公共展示的是什么
        currentCommonShow: 'post',
        postStatus: [
          {
            value: '0',
            label: '正常'
          },
          {
            value: '1',
            label: '已删除'
          }
        ],
        postStatusMap: {
          "0": "正常",
          "1": "已删除"
        },
        authMap:{
          "1":"完全公开",
          "2":"好友公开",
          "3":"仅自己可见"
        },
        // 查看评论的帖子或新闻
        commentPostNewsShow: false,
        postNewsTitle: '',
        commentPostNewsData: {
          post: {},
          news: {},
          comment: {}
        },
        // 查看评论的帖子或新闻  end
        // 用户帖子
        postColumns: [
          {
            'type': 'selection',
            'width': 80,
            'fixed': 'left',
            'align': 'center'
          },
          {
            'title': '帖子内容',
            'key': 'postContent',
            'width': 400,
            'ellipsis': true,
            'sortable': true
          },
          {
            'title': '帖子状态',
            'key': 'postStatus',
            'width': 150,
            'sortable': true,
            render: (create, params) => {
              var vm = this,key = params.row.postStatus,map = vm.postStatusMap,style={}
              if(key==1){
                style = {
                  color: 'red'
                }
              }
              var txt = map[key] ? map[key] : key
              return create('span',{style},txt)
            }
          },
          {
            'title': '创建时间',
            'key': 'postTime',
            'width': 150,
            'sortable': true,
            render: (create, params)=>{
              var vm = this,key = params.row.postTime,txt=key
              if(typeof key == 'number'){
                txt = vm.util.timestampToTime(key)
              }
              return create('span',txt)
            }
          },
          {
            'title': '点赞数量',
            'key': 'postThumbCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '收藏数量',
            'key': 'postCollectionCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '评论数量',
            'key': 'postCommentsCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '分享数量',
            'key': 'postTransmitCount',
            'width': 130,
            'sortable': true
          },
          {
            'title': '操作',
            'key': 'action',
            'width': 200,
            'align': 'center',
            'fixed': 'right',
            render: (create, params) => {
              var vm = this,createArr=[]
              var arr = [vm.createPreviewBtn(create, params.row, vm.postPreview)]
              var arr2 = [
                vm.createEditBtn(create, params.row, vm.postEditRow),
                vm.createDelBtn(create, params.row.postId, vm.postDelRow)
              ]
              if(vm.currentSourceWeb){
                createArr = arr.concat(arr2)
              }else{
                createArr = arr
              }
              return create('div',createArr)
            }
          }
        ],
        needId: true,
        postDialogShow: false,
        previewShow: false,
        postPreviewShow: false,
        commonShow: false,
        commonClassifyShow: false,
        uploadLoading: false,
        uploadLoading2: false,
        uploadLoading3: false,
        uploadLoading4: false,
        postDialogSubmitLoading: false,
        groupSubmitLoading: false,
        cardShow: false,
        groupShow: false,
        groupDetailShow: false,
        groupDetailData: {},
        selectedFriends: [],
        cardData: {},
        // 头像
        fileUrl: [],
        uploadImgArr: [],
        // 头像背景
        fileUrl2: [],
        uploadImgArr2: [],
        // 帖子
        editFileUrl3: [], // 编辑时回显
        fileUrl3: [],
        uploadImgArr3: [],
        // 群头像
        fileUrl4: [],
        uploadImgArr4: [],
        derail_address_arr: [],
        derail_address_obj_s: [],
        // hometown_address: [], // 家乡
        // location_address: [], //  所在地
        chinaJson: {},
        appSoucreMap: {
          "1": 'IOS',
          "2": "Android",
          "3": "Web"
        },
        userStatus: [{label:'正常', value:'1'}, {label:"禁用", value:'2'}, {label:"封号", value:'3'}],
        userStatusMap: {
          "1": "正常",
          "2": "禁用",
          "3": "封号"
        },
        isAuth: [{label:'否', value:'0'}, {label:"是", value:'1'}],
        isAuthMap: {
          '0': '否',
          '1': '是',
        },
        isConsummate: [{label:'否', value:'0'}, {label:"是", value:'1'}],
        isConsummateMap: {
          '0': '否',
          '1': '是',
        },
        sex: [{label:'男', value:'1'}, {label:"女", value:'0'}],
        sexMap: {
          '0': '女',
          '1': '男',
          '': '保密'
        },
        sexImgSrcMap: {
          '0': 'static/images/girl.png',
          '1': 'static/images/boy.png',
        },
        postStatusMap:{
          '0':"正常",
          '1':"已删除"
        },
        thumbUpType: [],
        thumbUpTypeMap: {
          '1': '新闻评论',
          '2': '新闻回复',
          '3': '帖子评论',
          '4': '帖子回复',
          '5': '帖子',
        },
        // 群组公开
        groupIsPublic: [
          {
            value: '0',
            label: '否'
          },
          {
            value: '1',
            label: '是'
          },
        ],
        groupIsPublicMap: {
          '0': '否',
          '1': '是',
        },
        // 是否需要审批
        groupMembersOnly: [
          {
            value: '0',
            label: '否'
          },
          {
            value: '1',
            label: '是'
          },
        ],
        groupMembersOnlyMap: {
          '0': '否',
          '1': '是',
        },
        // 允许成员邀请
        groupAllowinvites: [
          {
            value: '0',
            label: '否'
          },
          {
            value: '1',
            label: '是'
          },
        ],
        groupAllowinvitesMap: {
          '0': '否',
          '1': '是',
        },
        // 查看群组的用户的所有好友
        allFriends: [],
        imageHost: '',
        formSearch: {
          name: '',
          source: 'web',
          // createdateStart: '',
          // createdateEnd: '',
          // areaCode: ''
        },
        searchPager: {
          url: 'user/dataSearch'
        },
        birthday: '',
        loginPassword: '',
        previewData: {},
        postPreviewData: {
          postImagesSrc: []
        },
        // 根据用户查帖子时进行初始化，帖子窗口关闭时清空
        userData: {},
        formDialog: {
          id: '',
          loginUsername: '',
          loginPassword: '',
          nickName: '',
          birthday: '',
          age: '',
          sex: '',
          appSoucre: '3', // 后台管理系统添加的用户appSource永远为3，为了和ios和安卓用户区分
          bgPortrait: '',
          headPortrait: '',
          // provincesCode: '0',
          // cityCode: '0',
          // areaCode: '0',
          // homeProvincesCode: '0',
          // homeCityCode: '0',
          // homeAreaCode: '0',
          isAuth: '1',
          isConsummate: '1',
          userStatus: '1',
          // createTime: '',
        },
        // 新增/编辑群组
        groupForm: {
          id: '',
          ownerId: '',
          groupProvinceCode: '',
          groupCityCode: '',
          groupAreaCode: '',
          groupHeadImage: '',
          groupName: '',
          groupMaxusers: 200,
          groupIsPublic: '1',
          groupMembersOnly: '0',
          groupAllowinvites: '1',
          members: ''
        },
        batchIdArr: [], // 批量帖子id数组
        batchUserArr: [], // 批量用户id数组
        postFormDialog: {
          id: '',
          userId: '',
          postStatus: '0',
          postContent: '',
          imagePath: [],
        },
        commonClassifyDialog: {},
        postFormSearch: {
          id: '',
          userId: '',
          key: '',
        },
        columns: [
          // {
          //   "type": 'selection',
          //   "fixed": 'left',
          //   "width": 80,
          //   "align": 'center'
          // },
          //  {
          //   "title": "ID",
          //   "key": "id",
          //   "width": 150,
          // },
          {
            "title": "账号",
            "key": "loginUsername",
            "width": 150,
            "sortable": true
          },
          {
            "title": "用户昵称",
            "key": "nickName",
            "width": 180,
            "sortable": true
          },
          {
            "title": "用户来源",
            "key": "appSoucre",
            "width": 150,
            "sortable": true,
            render:(create,params)=>{
              var appSoucre = params.row.appSoucre ? params.row.appSoucre : ''
              return create('span',this.appSoucreMap[appSoucre])
            }
          },
          {
            "title": "出生日期",
            "key": "birthday",
            "width": 240,
            "sortable": true
          },
          {
            "title": "年龄",
            "key": "age",
            "width": 100,
            "sortable": true
          },
          {
            "title": "性别",
            "key": "sex",
            "width": 100,
            "sortable": true,
            render: (create, params) => {
              var txt = this.sexMap[params.row.sex]
              return create('span',txt)
            }
          },
          {
            "title": "用户头像",
            "key": "headPortrait",
            "width": 240,
            "sortable": true,
            render: (create, params) => {
              var url = params.row.headPortrait,imageHost=this.imageHost || sessionStorage.imageHost
              if(url){
                if(url.indexOf('http') == -1){
                  url = imageHost + url
                }
                return create('a',{
                  attrs: {
                    href: url,
                    target: '_blank'
                  },
                },[create('img', {
                  attrs: {
                    src: url
                  },
                  style: {
                    'border': '1px solid transparent',
                    'border-radius': '4px',
                    'margin': '10px 0',
                    'max-width': '100px',
                    'max-height': '100px'
                  }
                })])
              }else{
                return create('span','无')
              }
            }
          },
          {
            "title": "头像背景",
            "key": "bgPortrait",
            "width": 240,
            "sortable": true,
            render: (create, params) => {
              var url = params.row.bgPortrait,imageHost=this.imageHost || sessionStorage.imageHost
              if(url){
                if(url.indexOf('http') == -1){
                  url = imageHost + url
                }
                return create('img', {
                  attrs: {
                    src: url
                  },
                  style: {
                    'border': '1px solid transparent',
                    'border-radius': '4px',
                    'margin': '10px 0',
                    'max-width': '100px',
                    'max-height': '100px'
                  }
                })
              }else{
                return create('span','无')
              }
            }
          },
          {
            "title": "家乡",
            "key": "hometown_address",
            "width": 200,
            render: (create, params) => {
              var txt = '',vm=this;
              var homeProvincesCode = params.row.homeProvincesCode,
                homeCityCode = params.row.homeCityCode,
                homeAreaCode = params.row.homeAreaCode;
              if(homeProvincesCode && homeCityCode && homeAreaCode){
                txt = vm.util.getProvinceCityArea([homeProvincesCode, homeCityCode, homeAreaCode], vm.chinaJson, true)
              }
              return create('span',txt)
            }
          },
          {
            "title": "属地",
            "key": "location_address",
            "width": 200,
            render: (create, params) => {
              var txt = '',vm=this;
              var provincesCode = params.row.provincesCode,
                cityCode = params.row.cityCode,
                areaCode = params.row.areaCode;
              if(provincesCode && cityCode && areaCode){
                txt = vm.util.getProvinceCityArea([provincesCode, cityCode, areaCode], vm.chinaJson, true)  
              }
              return create('span',txt)
            }
          },
          {
            "title": "是否认证",
            "key": "isAuth",
            "width": 150,
            "sortable": true,
            render: (create, params) => {
              var row = params.row.isAuth,map=this.isAuthMap
              var key = row.toString()
              var txt = map[key] ? map[key] : key
              return create('span', txt);
            }
          },
          {
            "title": "是否完成资料",
            "key": "isConsummate",
            "width": 150,
            "sortable": true,
            render: (create, params) => {
              var row = params.row.isConsummate,map=this.isConsummateMap
              var key = row.toString()
              var txt = map[key] ? map[key] : key
              return create('span', txt);
            }
          },
          {
            "title": "状态",
            "key": "userStatus",
            "width": 100,
            "sortable": true,
            render: (create, params) => {
              var status = params.row.userStatus ? params.row.userStatus.toString() : '';
              return create('span', this.userStatusMap[status]);
            }
          },
          {
            "title": "创建时间",
            "key": "createTime",
            "width": 200,
            "sortable": true
          },
          {
            title: '操作',
            key: 'action',
            width: 300,
            align: 'center',
            fixed: 'right',
            render: (create, params) => {
              let vm = this,arr=[],arr2=[]
              var messageBtn = vm.createBtn(create,{
                on: {
                  click: function(){
                    vm.previewMessage(params.row.id)
                  }
                }
              },'消息')
              // var deleteBtn = vm.createDelBtn(create, params.row.id)
              // if(vm.hasPerm('app:post')){
              //   arr2.push(vm.createPostBtn(create, params.row.id))
              //   arr.push(vm.createPreviewPostBtn(create,params.row))
              // }
              // if(vm.hasPerm('app:edit')){
              //   arr2.push(vm.createEditBtn(create, params.row))
              // }
              if(vm.hasPerm('app:preview')){
                arr.push(vm.createPreviewBtn(create, params.row,vm.preview))
              }
              if(vm.hasPerm('message:dataGrid')){
                arr.push(messageBtn)
              }
              if(params.row.appSoucre=='3'){
                // if(vm.hasPerm('app:delete')){
                //   arr.push(deleteBtn)
                // }
                // arr = arr2.concat(arr)
              }else{
                if(vm.hasPerm('app:operation')){
                  arr.push(vm.createOperationSelect(create,params.row))
                }
              }
              return create('div',arr)
            }
          }
        ],
        commonColumns: [],
        commonClassifyColumns: [],
        // 默认查看新闻的评论
        currentClassify: 'news',
        // 所有用户id对应的昵称
        userMap: {},
        // 我的好友
        friendColumns: [
          // {
          //   "type": 'selection',
          //   "fixed": 'left',
          //   "width": 80,
          //   "align": 'center'
          // },
          {
            "title": "好友昵称",
            "key": "userNickName",
          },
          {
            "title": "年龄",
            "key": "age",
          },
          {
            "title": "性别",
            "key": "sex",
            render: (create,params)=>{
              var key=params.row.sex,map=this.sexMap
              var txt = map[key] ? map[key] : key
              return create('span',txt)
            }
          },
          {
            "title": "头像",
            "key": "userHeadImage",
            "width": 120,
            render: (create, params) => {
              var url = params.row.userHeadImage
              if(url.indexOf('http') == -1){
                url = this.imageHost + url
              }
              return create('img', {
                attrs: {
                  src: url
                },
                style: {
                  'border': '1px solid transparent',
                  'border-radius': '4px',
                  'margin': '10px 0',
                  'max-width': '100px',
                  'max-height': '100px'
                }
              })
            }
          },
          // {
          //   "title": "好友昵称",
          //   "key": "userId",
          //   "width": 150,
          //   render: (create,params)=>{
          //     var key=params.row.userId,map=this.userMap
          //     var txt = map[key] ? map[key] : key
          //     return create('span',txt)
          //   }
          // },
          // {
          //   title: '操作',
          //   key: 'action',
          //   width: 150,
          //   align: 'center',
          //   fixed: 'right',
          //   render: (create, params) => {
          //     let vm = this
          //     var arr = [
                
          //     ]
          //     return create('div',arr)
          //   }
          // }
        ],
        // 评论的帖子
        commentPostColumns: [
          // {
          //   "title": 'ID',
          //   "key": 'id',
          //   "width": 120,
          // },
          // {
          //   "title": '评论id',
          //   "key": 'commentId',
          //   "width": 120,
          // },
          // {
          //   "title": '用户ID',
          //   "key": 'userId',
          //   "width": 120,
          // },
          {
            "title": '昵称',
            "key": 'userNickName',
            "width": 120,
          },
          {
            "title": '性别',
            "key": 'userSex',
            "width": 120,
            render:(create,params)=>{
              var row = params.row.userSex
              var txt = this.sexMap[row]
              txt = txt ? txt : row
              return create('span',txt)
            }
          },
          {
            "title": '帖子内容',
            "key": 'content',
            "width": 300,
            "ellipsis": true,
          },
          {
            "title": '评论内容',
            "key": 'commentContent',
            "width": 120,
          },
          {
            "title": '评论时间',
            "key": 'commentTime',
            "width": 170,
          },
          // {
          //   "title": '头像',
          //   "key": 'userheadPortrait',
          //   "width": 120,
          // },
          {
            "title": '是否认证',
            "key": 'userIsAuth',
            "width": 120,
            render:(create,params)=>{
              var row = params.row.userIsAuth
              var txt = this.isAuthMap[row]
              txt = txt ? txt : row
              return create('span',txt)
            }
          },
          // {
          //   "title": '图片/视频',
          //   "key": 'fileManageList',
          //   "width": 120,
          // },
          {
            "title": '操作',
            "key": 'action',
            "fixed": 'right',
            "align": 'center',
            "width": 150,
            render: (create, params) => {
              var data = {
                rowData: params.row,
                ajaxData: {
                  id: params.row.id,
                  type: 2
                }
              }
              return this.createPreviewBtn(create, data, this.previewCommentPostNews)
            }
          }
        ],
        // 评论的新闻
        newsColumns: [
          // {
          //   "title": 'ID',
          //   "key": 'commentId',
          //   "width": 80,
          // },
          {
            "title": '昵称',
            "key": 'userNickName',
            "width": 120,
          },
          // {
          //   "title": '用户id',
          //   "key": 'userId',
          //   "width": 80,
          // },
          {
            "title": '性别',
            "key": 'userSex',
            "width": 80,
            render:(create,params)=>{
              var row = params.row.userSex
              var txt = this.sexMap[row]
              txt = txt ? txt : row
              return create('span',txt)
            }
          },
          {
            "title": '评论内容',
            "key": 'commentContent',
            "width": 300,
          },
          {
            "title": '是否认证',
            "key": 'userIsAuth',
            "width": 100,
            render:(create,params)=>{
              var row = params.row.userIsAuth
              var txt = this.isAuthMap[row]
              txt = txt ? txt : row
              return create('span',txt)
            }
          },
          {
            "title": '评论时间',
            "key": 'commentTime',
            "width": 170,
          },
          // {
          //   "title": '图片/视频',
          //   "key": 'fileManageList',
          //   "width": 80,
          // },
          {
            "title": '操作',
            "key": 'action',
            "fixed": 'right',
            "align": 'center',
            "width": 150,
            render: (create, params) => {
              var data = {
                rowData: params.row,
                ajaxData: {
                  id: params.row.id,
                  type: 1
                }
              }
              return this.createPreviewBtn(create, data, this.previewCommentPostNews)
            }
          },
        ],
        // 我的收藏
        collectionNews: [
          {
            "title": '标题',
            "key": 'title',
            "width": 150,
          },
          {
            "title": '图片',
            "key": 'imageUrl',
            "width": 120,
            render: (create, params) => {
              var urlStr = params.row.imageUrl,url=''
              if(!urlStr){
                return create('span','无')
              }else{
                url = urlStr.split(',')[0]
              }
              return create('img', {
                attrs: {
                  src: url
                },
                style: {
                  'border': '1px solid transparent',
                  'border-radius': '4px',
                  'margin': '10px 0',
                  'max-width': '100px',
                  'max-height': '100px'
                }
              })
            }
          },
          {
            "title": '来源',
            "key": 'soucre',
            // "width": 120,
          },
          // {
          //   "title": '文件',
          //   "key": 'fileManageList',
          //   "width": 120,
          // },
        ],
        collectionPolicy: [],
        collectionGover: [],
        collectionPost: [],
        // 我赞过的
        zanColumns: [
          // {
          //   "title": 'ID',
          //   "key": 'id',
          //   "width": 120,
          // },
          // {
          //   "title": '',
          //   "key": 'postId',
          //   "width": 120,
          // },
          // {
          //   "title": '',
          //   "key": 'sourceId',
          //   "width": 120,
          // },
          {
            "title": '点赞标题',
            "key": 'title',
            "width": 200,
          },
          {
            "title": '点赞内容',
            "key": 'thumbUpOfContent',
            "width": 250,
          },
          {
            "title": '点赞类型',
            "key": 'thumbUpType',
            "width": 120,
            render: (create, params) => {
              var key = params.row.thumbUpType,map=this.thumbUpTypeMap
              var txt = map[key] ? map[key] : key
              return create('span', txt)
            }
          },
          {
            "title": '点赞时间',
            "key": 'thumbUpCreateTime',
            // "width": 150,
            render: (create, params) => {
              var key = params.row.thumbUpCreateTime,txt=key
              if(typeof key == 'number'){
                txt = this.util.timestampToTime(key)
              }
              return create('span', txt)
            }
          },
          // {
          //   "title": '点赞人',
          //   "key": 'thumbUpOfUserId',
          //   "width": 120,
          // },
          // {
          //   "title": '',
          //   "key": 'userId',
          //   "width": 120,
          // },
          // {
          //   "title": '操作',
          //   "key": 'action',
          //   "fixed": 'right',
          //   "align": 'center',
          //   "width": 150,
          // },
        ],
        // 我的群组
        groupColumns: [
          {
            "title": '群组ID',
            "key": 'groupId',
            "width": 200,
          },
          {
            "title": '环信ID',
            "key": 'hxId',
            "width": 200,
          },
          {
            "title": '群组名称',
            "key": 'groupName',
            "width": 200,
          },
          {
            "title": '群组图片',
            "key": 'groupImage',
            "width": 200,
            render: (create, params) => {
              var url = params.row.groupImage
              if(!url){
                return create('span','无')
              }
              if(url.indexOf('http')==-1){
                url = this.imageHost + url
              }
              return create('img', {
                attrs: {
                  src: url
                },
                style: {
                  'border': '1px solid transparent',
                  'border-radius': '4px',
                  'margin': '10px 0',
                  'max-width': '180px',
                  'max-height': '120px'
                }
              })
            }
          },
          {
            "title": '群身份',
            "key": 'groupMemberDto',
            "width": 200,
            render: function(create,params){
              var isAdmin = params.row.groupMemberDto.isAdmin,
                isOwner = params.row.groupMemberDto.isOwner,
                txt=''
              if(!isAdmin&&!isOwner){
                txt = '群成员'
              }else if(isAdmin){
                txt = '管理员'
              }else if(isOwner){
                txt = '群主'
              }
              return create('span',txt)
            }
          },
          // {
          //   "title": '操作',
          //   "key": 'action',
          //   "fixed": 'right',
          //   "align": 'center',
          //   "width": 250,
          //   render: (create,params)=>{
          //     var vm=this
          //     var arr = [
          //       vm.createBtn(create,{
          //         on: {
          //           click: function(){
          //             vm.editGroup(params)
          //           }
          //         }
          //       },'编辑'),
          //       vm.createGroupSelect(create,params.row),
          //       vm.createBtn(create,{
          //         props: {
          //           type: 'error',
          //           size: 'small'
          //         },
          //         on: {
          //           click: function(){
          //             vm.delGroup(params)
          //           }
          //         }
          //       },'删除'),
          //     ]
          //     return create('div',arr)
          //   }
          // },
        ],
        // 我的消息
        messageTypeMap: {
          '1': '好友',
          '2': '帖子点赞',
          '3': '帖子评论',
          '4': '私信',
          '5': '群通知',
        },
        privateLetterStatusMap: {
          '0': '未发送',
          '1': '已发送'
        },
        addFriendsStatusMap: {
          '0': '已拒绝',
          '1': '已同意',
          '2': '未同意',
        },
        messageStatusMap: {
          '0': '未读',
          '1': '已读',
          '2': '已删除',
        },
        messageColumns: [
          {
            title: '发送人',
            key: 'sendUserId',
            width: 150,
            sortable: true,
            render: (create, params) => {
              var txt = '无'
              if(typeof params.row.sendUserId != 'undefined'){
                txt = this.getValByMap(params.row.sendUserId,this.userMap)
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
                txt = this.getValByMap(params.row.receiveUserId,this.userMap)
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
            title: '添加好友状态',
            key: 'addFriendsStatus',
            width: 200,
            sortable: true,
            render: (create, params) => {
              var vm=this,messageType = params.row.messageType,addFriendsStatus=params.row.addFriendsStatus
              // 消息类型是“好友”，添加好友状态是未同意才显示加好友按钮
              if(messageType==1 && addFriendsStatus==2 && vm.currentSourceWeb){
                return create('Button',{
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: function(){
                      var userId = params.row.sendUserId,
                        owerId = params.row.receiveUserId,
                        mid = params.row.id
                      var url = vm.url.addFriend + userId + '/' + owerId
                      var ajaxParams = {
                        url: url,
                        method: 'post',
                        data: {
                          mid: mid
                        }
                      }
                      vm.$http2(ajaxParams).then(res=>{
                        if(res&&res.data){
                          var resData = res.data
                          if(resData.code==1){
                            vm.$Message.success('添加好友成功！')
                            vm.commonShow = false
                          }else{
                            vm.$Message.info(resData.message)
                          }
                        }
                      })
                    }
                  }
                },'同意加好友')
              }else{
                var txt = '无'
                if(typeof addFriendsStatus != 'undefined'){
                  txt = vm.getValByMap(addFriendsStatus,vm.addFriendsStatusMap)
                }
                return create('span', txt)
              }
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
          }
        ],
        rules: {
          loginUsername: [
            { required: true, message: '账户不能为空', trigger: 'blur' },
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if(typeof Number(value) != 'number' || typeof Number(value) == 'number' && Number(value).toString().length != 11){
                  callback('账户必须为11位数字');
                }
                callback(errors);
              }
            }
          ],
          nickName: [
            { required: true, message: '昵称不能为空', trigger: 'blur' }
          ],
          loginPassword: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ],
          groupName: [
            { required: true, message: '群名称不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 我的消息
      previewMessage(userId){
        var vm=this
        var pager = vm.commonPager
        pager.url = vm.url.message + userId
        var params = {
          url: pager.url,
          method: 'get',
          params: {
            t: 1,
            c: 1,
            s: 10
          }
        }
        var modalParams = {
          columns: vm.messageColumns,
          title: '我的消息',
          width: 1200
        }
        vm.commonPreview(params,modalParams,pager)
      },
      // 群组
      createGroupSelect(create,data){
        var vm = this,arr = [],key,item
        var selectMap = {
          '1': '群详情',
          '2': '群成员',
          '3': '转让群',
          '4': '添加成员',
          '5': '移除成员',
          '6': '设置管理员',
          '7': '移除管理员',
          '8': '',
          '9': '',
        }
        for(key in selectMap){
          item = selectMap[key]
          arr.push(create('Option',{
            attrs: {
              value: key,
              label: item
            }
          }))
        }
        return create('Select',{
          style: {
            width: '100px',
            marginRight: '5px',
            zIndex: 999
          },
          attrs: {
            size: 'small',
            clearable: true,
            transfer: true,
          },
          props: {
            placeholder: '请选择操作',
            size: 'small'
          },
          on: {
            ["on-change"]: function(val){
              if(val==1){
                // 群详情

              }
              vm.$Message.info(vm.label.wait)
            }
          }
        },arr)
      },
      // 查看所有群组
      allGroup(){
        var vm = this
        vm.$http({
          url:vm.url.group.all,
          method: 'get',
        }).then(res=>{
          console.log('res: ',res)
        }).catch(err=>{})
      },
      addGroup(data){
        var vm = this
        vm.groupForm.id = '' 
        vm.groupForm.groupHeadImage = ''
        vm.groupForm.groupName = ''
        vm.fileUrl4 = []
        vm.uploadImgArr4 = []
        vm.groupCurrDialog = 'add'
        vm.groupShow = true
      },
      editGroup(data){
        let vm = this
        console.log('编辑群组原始数据：',data)
      },
      groupDetail(data){

      },
      groupMember(data){

      },
      delGroup(data){
        let vm = this
        console.log('删除群组原始数据: ',data)
      },
      resetGroupModal(name){
        var vm = this
        vm.$refs[name].resetFields()
      },
      initGroupForm(data){
        var vm = this
        vm.groupForm.ownerId = data.id
        // 传家乡
        vm.groupForm.groupProvinceCode = data.homeProvincesCode
        vm.groupForm.groupCityCode = data.homeCityCode
        vm.groupForm.groupAreaCode = data.homeAreaCode
        // 传所在地
        // vm.groupForm.groupProvinceCode = data.provincesCode
        // vm.groupForm.groupCityCode = data.cityCode
        // vm.groupForm.groupAreaCode = data.areaCode
      },
      submitGroupForm(name){
        var vm = this
        console.log(vm.groupForm)
        // 群成员字段完善后可进行测试
        return
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            let ajaxData = vm.groupForm
            let ajaxUrl = vm.url.group[vm.groupCurrDialog]
            var method = 'post'
            vm.groupSubmitLoading = true
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
              vm.groupSubmitLoading = false
              var resData = res.data
              if(resData.code==1){
                vm.$Message.success(vm.label[vm.groupCurrDialog]+'成功!')
                vm.paging();
                vm.groupShow = false
              }else{
                vm.$Message.error(vm.label[vm.groupCurrDialog]+'失败: ' + resData.message)
              }
            }).catch(err=>{
      
            })
          }
        })
      },
      // 选择好友变化
      friendSelectChange(selection){
        var len = selection.length,vm=this
        if(!len){
          vm.groupForm.members = ''
        }else if(len==1){
          vm.groupForm.members = '' + selection[0]
        }else{
          vm.groupForm.members = selection.join(',')
        }
      },
      // 初始化所有好友
      initAllFriends(userId){
        var vm = this
        var method = vm.commonPager.method
        var params = {
          url: vm.url.friend + userId,
          method: method
        }
        var ajaxData = {
          isEntire: 'all'
        }
        if(method=='get'){
          params.parmas = ajaxData
        }else{
          params.data = ajaxData
        }
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var data = resData.data,allFriends=[],item
            var len = data.length
            for(var i=0;i<len;i++){
              item=data[i]
              allFriends.push({
                value: item.userId,
                label: item.userNickName || item.userId
              })
            }
            vm.allFriends = allFriends
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 群组  end
      // 查看评论的帖子或新闻
      previewCommentPostNews(data){
        var vm=this,ajaxData = data.ajaxData
        var params = {
          url: vm.url.postNews,
          method: 'get',
          params: ajaxData
        }
        var type = ajaxData.type,rowData=data.rowData,_data = {},title=''
        _data.comment = rowData
        if(type==1){
          title = '评论的新闻'
        }else if(type==2){
          title = '评论的帖子'
        }
        if(ajaxData.id){
          // id存在
          // data.type   1  新闻   2 帖子
          vm.$http(params).then(res=>{
            var resData = res.data
            if(type==1){
              _data.news = resData.data
            }else if(type==2){
              _data.post = resData.data
            }
            vm.postNewsTitle = title
            vm.commentPostNewsData = _data
            vm.commentPostNewsShow = true
          }).catch(err=>{})
        }else{
          vm.postNewsTitle = title
          vm.commentPostNewsData = _data
          vm.commentPostNewsShow = true
        }
      },
      closeCommentModal(){
        var vm = this
        vm.commentPostNewsShow=false;
        vm.commentPostNewsData={
          post: {},
          news: {},
          comment: {}
        };
        vm.postNewsTitle=''
      },
      isNullObj(obj){
        if(typeof obj != 'object') return false
        if(typeof obj.length == 'undefined'){
          for(var key in obj){
            return false
          }
          return true
        }else{
          return obj.length == 0 ? true : false
        }
      },
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
      // 切换用户种类
      switchSource(source){
        var vm = this
        if(source=='web'){
          vm.currentSourceWeb=true
        }else if(source=='app'){
          vm.currentSourceWeb=false
        }
        vm.pager.source=source;
        vm.batchUserArr = []
        vm.paging();
      },
      // 帖子批量操作
      updateSelect (selection) {
        var vm = this,batchIdArr = [],len=selection.length;
        if(len){
          for(var i=0;i<len;i++){
            batchIdArr.push(selection[i].postId)
          }
        }
        vm.batchIdArr = batchIdArr
      },
      // 用户批量操作
      updateSelectUser(selection){
        var vm = this,batchIdArr = [],len=selection.length;
        if(!vm.currentSourceWeb){
          // 不得获取app用户id
          vm.batchUserArr = []
          return  
        }
        if(len){
          for(var i=0;i<len;i++){
            batchIdArr.push(selection[i].id)
          }
        }
        vm.batchUserArr = batchIdArr
      },
      // 编辑帖子
      postEditRow(data){
        var vm = this
        // 编辑帖子时，用户无法更改
        vm.userSelectDisabled=true
        let _data = {}
        for (let key in vm.postFormDialog) {
          _data[key] = data[key]
        }
        if(typeof _data.postStatus == 'number'){
          _data.postStatus = _data.postStatus.toString()
        }
        // 图片回显  todo 视频回显
        // vm.fileUrl3 = 
        var imageHost = vm.imageHost,imagesArr=[]
        var fileManageList = data.fileManageList,fileList=[],fileType,filePath,imageUrl
        if(fileManageList.length){
          filePath = fileManageList[0].filePath
          fileList = fileManageList[0].fileList
          fileType = fileManageList[0].fileType
          if(fileType==1){
            for(var i=0;i<fileList.length;i++){
              imageUrl = imageHost + filePath + fileList[i].fileName
              imagesArr.push(imageUrl)
            }
          }
        }
        // vm.editFileUrl3 = imagesArr
        vm.fileUrl3 = imagesArr
        vm.postFormDialog.imagePath = imagesArr
        vm.postFormDialog = _data
        vm.postFormDialog.id = data.postId
        vm.postCurrDialog = 'edit'
        vm.postDialogShow = true
      },
      postDelRow(data){
        var vm = this;
        if(!data.id){
          vm.$Message.error('id获取失败')
          return
        }
        var parmas = {
          method: vm.postPager.method,
          url: vm.url.post.delete,
          data: {
            ids: [data.id]
          }
        }
        vm.batchoperation(parmas)
      },
      // 预览帖子
      postPreview(data){
        var vm = this
        var postPreviewData = {}
        var createTime = data.postTime
        if(typeof createTime=='number'){
         createTime = vm.util.timestampToTime(createTime)
        }
        postPreviewData.postTime = createTime
        postPreviewData.postContent = data.postContent
        postPreviewData.postImagesSrc = vm.getPostImagesSrc(data.fileManageList)
        vm.postPreviewData = postPreviewData
        vm.postPreviewShow = true
      },
      getPostImagesSrc(data){ 
        var arr = [],vm=this;
        if(!data)return arr
        var len = data.length,i,j,item;
        if(len){
          var imageHost = vm.imageHost
          var filePath = data[0].filePath
          var fileList = data[0].fileList
          if(data[0].fileType==2){
            for(j=0;j<fileList.length;j++){
              item = fileList[j]
              arr.push({
                src: imageHost + filePath +  item.fileName,
                poster: imageHost + filePath +  item.fileVideoImage
              })
            }
          }else if (data[0].fileType==1){
            for(j=0;j<fileList.length;j++){
              item = fileList[j]
              arr.push(imageHost + filePath + item.fileName)
            }
          }
        }
        return arr
      },
      // 发帖按钮
      postAddRow(disabled){
        var vm = this
        vm.postCurrDialog = 'add'
        vm.userSelectDisabled = disabled
        vm.postDialogShow = true
      },
      // 重置帖子搜索
      postResetSearch(name){
        var vm =this
        vm.$refs[name].resetFields()
        vm.postPaging(1)
        // vm.postSubmitSearch(name)
      },
      postSubmitSearch(name){
        let vm = this
        // 搜索操作
        vm.$http2({
          url: vm.url.post.search,
          method: vm.postPager.method,
          data: vm.postFormSearch
        }).then(res => {
          var resData = res.data
          if(resData.code==1){
            vm.postPager.data = resData.data.records
          }else{
            vm.$Message.error('搜索失败: ' + resData.message)
          }
        }).catch(err=>{})
      },
      delRow (data) {
        var vm = this;
        if(!data.id){
          vm.$Message.error('id获取失败')
          return
        }
        var parmas = {
          method: 'post',
          url: vm.url.delete,
          data: {
            ids: [data.id]
          }
        }
        vm.batchoperation(parmas,vm.paging)
      },
      batchDel(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些数据吗？',
          onOk: function () {
            var parmas = {
              method: vm.postPager.method,
              url: vm.url.post.delete,
              data: {
                ids: vm.batchIdArr
              }
            }
            vm.batchoperation(parmas)
          }
        })
      },
      // 批量操作
      batchoperation(parmas,refresh){
        var vm = this
        if(typeof parmas != 'object'){
          vm.$Message.error('传参错误')
          return
        }
        parmas.method = parmas.method || 'post'
        vm.$http2(parmas).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success('操作成功');
            vm.batchIdArr = []
            if(typeof refresh == 'function'){
              refresh()
            }else{
              vm.postPaging()
            }
          }else{
            vm.$Message.error(resData.message);
          }
        }).catch(err=>{})
      },
      // 批量删除web用户
      batchDelWebUser(){
        var vm = this
        vm.$Modal.confirm({
          title: '确认',
          content: '确认删除这些web用户吗？请考虑清楚，谨慎操作！！！',
          onOk: function () {
            var parmas = {
              method: 'post',
              url: vm.url.delete,
              data: {
                ids: vm.batchUserArr
              }
            }
            vm.batchoperation(parmas, vm.paging)
          }
        })
      },
      // 有分类的公共弹窗翻页
      commonClassifychangePager(data){
        let vm = this
        if (typeof data === 'object') {
          for (let key in data) {
            vm.commonClassifyPager[key] = data[key]
          }
        } else {
          vm.commonClassifyPager.c = data
        }
        vm.commonClassifypaging()
      },
      commonClassifypaging(current){
        let vm = this
        if (current && Number(current)) {
          vm.commonClassifychangePager(current)
          return
        }
        var pager = vm.commonClassifyPager
        var params = {
          url: pager.url,
          method: pager.method,
        }
        var method = pager.method
        if(method=='get'){
          params.params = vm.pagingFiltData(pager)
        }else{
          params.data = vm.pagingFiltData(pager)
        }
        vm.classifyLoading = true
        vm.$http2(params).then(res => {
          vm.classifyLoading = false
          let resData = res.data
          if (resData.code == 1) {
            pager.data = resData.data
            pager.total = resData.total
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 无分类的公共弹窗翻页
      commonchangePager(data){
        let vm = this
        if (typeof data === 'object') {
          for (let key in data) {
            vm.commonPager[key] = data[key]
          }
        } else {
          vm.commonPager.current = data
        }
        vm.commonpaging()
      },
      commonpaging(current){
        let vm = this
        if (current && Number(current)) {
          vm.commonchangePager(current)
          return
        }
        var pager = vm.commonPager
        var params = {
          url: pager.url,
          method: pager.method,
        }
        var method = pager.method
        if(method=='get'){
          params.params = vm.pagingFiltData(pager)
        }else{
          params.data = vm.pagingFiltData(pager)
        }
        vm.commonLoading = true
        vm.$http2(params).then(res => {
          vm.commonLoading = false
          let resData = res.data
          if (resData.code == 1) {
            if(typeof resData.records == 'undefined'){
              pager.data = resData.data
              pager.total = resData.total
            }else{
              pager.data = resData.data.records
              pager.total = resData.data.total
            }
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 公共预览
      commonPreview(params,modalParams,pager){
        var vm = this
        var columns = modalParams.columns,
          title = modalParams.title,
          width = modalParams.width || 750
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.commonTitle = title
            vm.commonWidth = width
            vm.commonColumns = columns
            pager.data = resData.data
            pager.total = resData.total
            vm.commonShow = true
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 带分类的公共预览
      commonClassifyPreview(params,modalParams,pager){
        var vm = this
        if(typeof(params)!='object' || typeof(modalParams)!='object' || typeof(pager)!='object'){
          console.log('预览传参错误')
          return
        }
        var columns = modalParams.columns,
          title = modalParams.title,
          width = modalParams.width || 750
        // 点击时给pager.url赋值，用于翻页刷新数据
        pager.url = params.url
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            vm.commonClassifyTitle = title
            vm.commonClassifyWidth = width
            vm.commonClassifyColumns = columns
            pager.data = resData.data
            vm.commonClassifyShow = true
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 切换分类
      previewClassifyData(classify,which){
        var vm =this
        // 当前查看的是什么
        vm.currentClassify = classify
        vm.currentCommonShow = which
        var url = vm.url,pager = vm.commonClassifyPager,userId = vm.currentUserId
        if(which=='post'){ // 查看评论
          if(typeof pager.t != 'undefined'){
            delete pager.t
          }
          if(classify=='news'){
            pager.url = url.commentNews + userId
            vm.commonClassifyColumns = vm.newsColumns
          }else if(classify=='post'){
            pager.url = url.comment + userId
            vm.commonClassifyColumns = vm.commentPostColumns
          }
        }else if(which=='collection'){ //  查看收藏
          // 查看收藏
          pager.url = url.collection + userId
          // 查看的分类 1 新闻 2 政务  3 招商  4 帖子
          pager.t = classify
        }else if(which=='zan'){  //  查看点赞
          
        }
        
        vm.commonClassifypaging(1)
      },
      // 公共搜索 重置与提交
      resetCommonClassifySearch(name){
        var vm = this
        vm.$refs[name].resetFields()
        vm.submitCommonClassifySearch(name)
      },
      submitCommonClassifySearch(name){
        var vm = this
        vm.$Message.info(vm.label.wait)
        return
        vm.$http2({
          url: vm.url.search,
          method: method,
          data: vm.formSearch
        }).then(res => {
          var resData = res.data
          if(resData.code==1){
            vm.pager.data = resData.data
          }else{
            vm.$Message.error('搜索失败: ' + resData.message)
          }
        }).catch(err=>{})
      },
      // 重置公共预览
      resetCommonModal(){
        var vm = this
        vm.commonShow = false
        vm.commonColumns = []
        vm.commonPager.data = []
        vm.commonWidth = 750
      },
      // 预览用户
      preview(rowData){
        var vm = this;
        var previewData = {};
        for(var key in rowData){
          previewData[key] = rowData[key]
        }
        var provincesCode = rowData.provincesCode,
            cityCode = rowData.cityCode,
            areaCode = rowData.areaCode,
            homeProvincesCode = rowData.homeProvincesCode,
            homeCityCode = rowData.homeCityCode,
            homeAreaCode = rowData.homeAreaCode;
        if(provincesCode && cityCode && areaCode){
          previewData.location = vm.util.getProvinceCityArea([provincesCode,cityCode,areaCode], vm.chinaJson, true)
        }else{
          previewData.location = '无'
        }
        if(homeProvincesCode && homeCityCode && homeAreaCode){
          previewData.home = vm.util.getProvinceCityArea([homeProvincesCode,homeCityCode,homeAreaCode], vm.chinaJson, true)
        }else{
          previewData.home = '无'
        }
        vm.previewData = previewData
        vm.previewShow = true
      },
      // 重置带分类
      resetClassifyDialog(){
        var vm = this
        vm.currentClassify = 'news'
        vm.commonClassifyShow = false
        vm.commonClassifyColumns = []
        vm.commonClassifyPager.data = []
        vm.commonClassifyWidth = 750
      },
      // 用户模块下拉菜单
      createOperationSelect(create, rowData){
        var vm = this,arr = [],key,item
        // 添加选项时，修改selectMap,并在on-change函数中调用选中时触发的函数即可
        var selectMap = {
          // '1': '发帖',
          // '2': '查看帖子',
          '3': '好友',
          '4': '评论',
          '5': '群组',
          '6': '我赞过的',
          '7': '我的收藏',
          // '8': '我的消息',
          '9': '我的名片',
          // '10': '',
          // '11': '',
        }
        for(key in selectMap){
          item = selectMap[key]
          arr.push(create('Option',{
            attrs: {
              value: key,
              label: item
            }
          }))
        }
        return create('Select',{
          style: {
            width: '100px',
            marginRight: '5px',
            zIndex: 999
          },
          attrs: {
            size: 'small',
            clearable: true,
            transfer: true,
          },
          props: {
            placeholder: '请选择操作',
            size: 'small'
          },
          on: {
            // 这样的话只能变化时触发，同一个操作无法多次
            ["on-change"]: function(val){
              var userId = rowData.id,params={},modalParams={}
              // 当前操作的用户id
              vm.currentUserId = userId
              if(val==1){
                // 发帖
                vm.postFormDialog.userId = userId
                vm.postAddRow(true)
              }else if(val==2){
                // 预览帖子
                // 查看用户帖子时，对搜索的userId进行初始化
                vm.postFormSearch.userId = userId
                // 对 userData 初始化
                var userData = {}
                userData.sex = rowData.sex
                userData.nickName = rowData.nickName
                userData.headPortrait = rowData.headPortrait
                vm.userData = userData
                vm.initPostData(userId)
              }else if(val==3){
                // 好友
                var pager = vm.commonPager
                params = {
                  url: vm.url.friend + userId,
                  method: vm.commonPager.method,
                }
                modalParams = {
                  columns: vm.friendColumns,
                  title: '我的好友',
                  width: 750
                }
                vm.commonPreview(params,modalParams,pager)
              }else if(val==4){
                // 评论 默认显示对新闻的评论
                var pager = vm.commonClassifyPager
                if(typeof pager.t != 'undefined'){
                  delete pager.t
                }
                params = {
                  url: vm.url.commentNews + userId,
                  method: pager.method,
                  params: vm.pagingFiltData(pager)
                }
                modalParams = {
                  columns: vm.newsColumns,
                  title: '我的评论',
                  width: 750
                }
                vm.currentCommonShow = 'post'
                vm.currentClassify = 'news'
                vm.commonClassifyPreview(params,modalParams,pager)
              }else if(val==5){
                // 群组
                var pager = vm.commonClassifyPager
                params = {
                  url: vm.url.group.init + userId,
                  method: 'get',
                }
                modalParams = {
                  columns: vm.groupColumns,
                  title: '我的群组',
                  width: 1000
                }
                vm.currentCommonShow = 'group'
                vm.commonClassifyPreview(params,modalParams,pager)
                // 初始化群组隐藏信息：省市区等
                vm.initGroupForm(rowData)
                // 初始化所有好友
                vm.initAllFriends(userId)
              }else if(val==6){
                // '6': '我赞过的',
                var pager = vm.commonPager
                params = {
                  url: vm.url.zan + userId,
                  method: 'get',
                }
                modalParams = {
                  columns: vm.zanColumns,
                  title: '我赞过的',
                  width: 900
                }
                vm.commonPreview(params,modalParams,pager)
              }else if(val==7){
                // '7': '我的收藏',  默认显示收藏的新闻
                var pager = vm.commonClassifyPager
                pager.t = 1
                params = {
                  url: vm.url.collection + userId,
                  method: 'get',
                  params: vm.pagingFiltData(pager)
                }
                modalParams = {
                  columns: vm.collectionNews,
                  title: '我的收藏',
                  width: 750
                }
                vm.currentCommonShow = 'collection'
                vm.currentClassify = 1
                vm.commonClassifyPreview(params,modalParams,pager)
              }else if(val==8){
                // '8': '我的消息',
                var pager = vm.commonPager
                params = {
                  url: vm.url.message,
                  method: vm.commonPager.method,
                  data: {
                    receiveUser: vm.userMap[userId]
                  }
                }
                modalParams = {
                  columns: vm.messageColumns,
                  title: '我的消息',
                  width: 900
                }
                vm.commonPreview2(params,modalParams,pager)
              }else if(val==9){
                // '9': '我的名片',
                params = {
                  url: vm.url.card + userId,
                  method: 'get',
                }
                vm.showCard(params,rowData)
              }
            }
          }
        },arr)
      },
      // 查看名片
      showCard(params,rowData){
        var vm = this
        vm.$http(params).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var cardData = resData.data
            if(!vm.isNullObj(cardData)){
              cardData.headPortrait = rowData.headPortrait
              cardData.sex = rowData.sex
              cardData.age = rowData.age
            }
            vm.cardData = cardData
            vm.cardShow = true
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      // 查看用户帖子按钮
      createPreviewPostBtn(create, rowData){
        var vm = this;
        return create('Button',{
          props: {
            type: 'primary',
            size: 'small',
          },
          style: {
            'margin-right': '5px'
          },
          on: {
            click(){
              var userId = rowData.id
              // 查看用户帖子时，对搜索的userId进行初始化
              vm.postFormSearch.userId = userId
              // 对 userData 初始化
              var userData = {}
              userData.sex = rowData.sex
              userData.nickName = rowData.nickName
              var headPortrait = rowData.headPortrait
              headPortrait = headPortrait.indexOf('http') == -1 ? vm.imageHost + headPortrait : headPortrait
              userData.headPortrait = headPortrait
              vm.userData = userData
              vm.initPostData(userId)
            }
          }
        },'查看帖子')
      },
      // 创建发帖按钮
      createPostBtn(create, userId){
        var vm = this;
        return create('Button',{
          props: {
            type: 'primary',
            size: 'small',
            // loading: false // 绑定上传loading效果
          },
          style: {
            'margin-right': '5px'
          },
          on: {
            click(){
              vm.postFormDialog.userId = userId
              vm.postPager.url = vm.url.post.init + userId
              // 点击的不是顶部发帖
              vm.postAddRow(true)
            }
          }
        },'发帖')
      },
      // 根据userId查帖子
      initPostData(userId){
        var vm = this;
        vm.postPager.url = vm.url.post.init + userId
        vm.postPaging()
        vm.postShow = true
      },
      postChangePager(data){
        let vm = this
        if (typeof data === 'object') {
          for (let key in data) {
            vm.postPager[key] = data[key]
          }
        } else {
          vm.postPager.current = data
        }
        vm.postPaging()
      },
      postPaging(current,id){
        let vm = this
        if (current && Number(current)) {
          vm.changePager(current)
          return
        }
        vm.postLoading = true
        vm.$http2({
          url: vm.postPager.url,
          method: vm.postPager.method,
          data: vm.pagingFiltData(vm.postPager)
        }).then(res => {
          vm.postLoading = false
          let resData = res.data
          if (resData.code == 1) {
            if (typeof vm.postPagerResult == 'function') {
              // 返回数据预处理   为什么执行这个函数会导致下边的函数不执行
              // resData.data = vm.postPagerResult(resData.data)
            }
            setTimeout(function(){
              vm.postPager.data = resData.data.records
              vm.postPager.total = resData.data.total
            },50)
          } else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      postPagerResult(data){
        var result = vm.util.deepcopy(data)
        var len = result.length,item;
        for(var i=0;i<len;i++){
          item = result[i]
          if(typeof item.createTime == 'number'){
            item.createTime = vm.util.timestampToTime(item.createTime);
          }
          if(typeof item.postStatus == 'number'){
            item.postStatus = item.postStatus.toString()
          }
        }
        return result
      },
      // 上传图片
      // 手动上传头像
      myBeforeUpload(file){
        var vm = this;
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
      uploadFile(sId){
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        params.append('s',1)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 
        params.append('p',1)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        vm.$http.post(vm.url.upload + sId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr = [];
            vm.$Message.success('上传图片成功！');
            var arr = [rd.data[0]]
            vm.formDialog.headPortrait = arr[0] || '';
            vm.uploadLoading = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleView(index){},
      handleRemove(index){
        var vm = this
        vm.fileUrl.splice(index,1)
        vm.uploadImgArr.splice(index,1)
        vm.formDialog.headPortrait = ''
      },
      // 手动上传头像背景
      myBeforeUpload2(file){
        var vm = this;
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          vm.fileUrl2 = [reader.result]
          vm.uploadImgArr2 = [file]
        }
        return false
      },
      myUpload2(){
        var vm = this
        if(!vm.uploadImgArr2.length){
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
      uploadFile2(sId){
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr2.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        params.append('s',1)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 
        params.append('p',1)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        vm.$http.post(vm.url.upload + sId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr2 = [];
            vm.$Message.success('上传图片成功！');
            var arr = [rd.data[0]]
            vm.formDialog.bgPortrait = arr[0] || '';
            vm.uploadLoading2 = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleView2(index){},
      handleRemove2(index){
        var vm = this
        vm.fileUrl2.splice(index,1)
        vm.uploadImgArr2.splice(index,1)
        vm.formDialog.bgPortrait = ''
      },
      // 发帖发图片/视频
      myBeforeUpload3(file){
        var vm = this;
        var size = file.size,
          type = file.type.split('/')[1],
          imgMaxSize = vm.imgMaxSize,
          videoMaxSize = vm.videoMaxSize,
          imgTypeErrorTxt = vm.imgTypeErrorTxt,
          videoTypeErrorTxt = vm.videoTypeErrorTxt,
          imgErrorTxt = '',
          videoErrorTxt = '',
          imgFormat = vm.postUploadImgFormat,
          videoFormat = vm.postUploadVideoFormat,
          postFormat = vm.postUploadFormat,
          typeIsOk = false,
          sizeIsOK = false
        if(type){
          type = type.toLocaleLowerCase()
        }else{
          vm.$Message.error('未读取到您选择文件的格式,请重新选择！')
          return false
        }
        // 先验证类型，再验证大小  大小的单位为b
        for(let i=0;i<postFormat.length;i++){
          if(type==postFormat[i]){
            typeIsOk = true
            break
          }
        }
        if(!typeIsOk){
          var message = `${imgTypeErrorTxt};${videoTypeErrorTxt}`
          vm.$Message.error({
            content: message,
            duration: 3
          })
          return false
        }
        if(type=='mp4'){
          if(size/1000/1000>videoMaxSize){
            var message = `请选择小于20Mb的视频进行上传`
            vm.$Message.error({
              content: message,
              duration: 3
            })
            return false
          }
        }else{
          if(size/1000/1000>imgMaxSize){
            var message = `请选择小于3Mb的图片进行上传`
            vm.$Message.error({
              content: message,
              duration: 3
            })
            return false
          }
        }
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          var imgMaxLength = vm.postImgMaxLength
          if(type=='mp4'){
            vm.fileUrl3 = [reader.result]
            vm.uploadImgArr3 = [file]
          }else{
            let item,hasVideo = false
            for(let i=0;i<vm.fileUrl3.length;i++){
              item = vm.fileUrl3[i]
              if(vm.isVideo(item)){
                hasVideo = true
                break
              }
            }
            if(hasVideo){
              // 当前数组有视频
              vm.fileUrl3 = [reader.result]
              vm.uploadImgArr3 = [file]
            }else{
              var len = vm.fileUrl3.length
              if(len<imgMaxLength){
                vm.fileUrl3.push(reader.result)
                vm.uploadImgArr3.push(file)
              }else{
                var arr = vm.fileUrl3,arr2 = vm.uploadImgArr3
                arr.push(reader.result)
                arr2.push(file)
                arr.splice(0,1)
                arr2.splice(0,1)
                vm.fileUrl3 = arr
                vm.uploadImgArr3 = arr2
              }
            }
          }
        }
        return false
      },
      handleFormatError3(){},
      handleMaxSize3(){},
      myUpload3(){
        // 确认上传
        var vm = this
        if(!vm.uploadImgArr3.length){
          vm.$Message.error('请先选择上传的图片')
          return
        }
        if(!vm.postFormDialog.userId){
          vm.$Message.error('请先选择发帖用户')
          return
        }
        vm.uploadLoading3 = true
        var userId = vm.postFormDialog.userId
        // 帖子上传图片添加帖子，并且未请求过id时才获取sourceId
        if(vm.postCurrDialog=='add'&&!vm.postFormDialog.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.postFormDialog.id = sId;
              vm.uploadFile3(sId, userId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.postFormDialog.id
          vm.uploadFile3(sId, userId)
        }
      },
      uploadFile3(sId, userId){
        if(!sId){
          vm.$Message.error('请传sId')
          return
        }
        if(!userId){
          vm.$Message.error('请传userId')
          return
        }
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr3.forEach(file =>{
          var _type = file.type
          if(_type.indexOf('mp4')!=-1){
            vm.$Message.loading({
              content: '上传视频中，请耐心等待',
              duration: 3,
            })
          }
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        params.append('s',2)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 
        params.append('p',2)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            // 发帖可能发视频，超时时间设置的大一点
            timeout: 20000
        };
        vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空用于展示和保存文件数据的数组
            vm.uploadImgArr3 = [];
            vm.fileUrl3 = [] // 之前没清空这个数组是想让用户看到上传的是哪几张图片，误导了用户
            vm.$Message.success('上传成功！');
            var arr = [],data=rd.data
            // 发图片，返回对象结构： {0: '图1url',1: '图2url',server: 'imageHost'}
            // 发视频返回对象结构 {image: '第一帧',video: '视频url'}
            for(var key in data){
              if(key=='image'){
                arr = [data[key],data['video']]
                break
              }if(key=='server'){
                continue
              }else{
                arr.push(data[key])
              }
            }
            vm.postFormDialog.imagePath = arr
            vm.uploadLoading3 = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleView3(index){},
      handleRemove3(index){
        var vm = this
        vm.fileUrl3.splice(index,1)
        vm.uploadImgArr3.splice(index,1)
        vm.postFormDialog.imagePath.splice(index,1)
      },
      isVideo(fileUrl){
        var str = ('' + fileUrl).split('base64')[0];
        var isVideo = false
        if(str.indexOf('video/mp4') != -1){
          isVideo = true
        }
        return isVideo
      },
      // 群头像上传
      myBeforeUpload4(file){
        var vm = this;
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          vm.fileUrl4 = [reader.result]
          vm.uploadImgArr4 = [file]
        }
        return false
      },
      handleFormatError4(){},
      handleMaxSize4(){},
      myUpload4(){
        // 确认上传
        var vm = this
        if(!vm.uploadImgArr4.length){
          vm.$Message.error('请先选择上传的图片')
          return
        }
        if(vm.groupCurrDialog=='add' && !vm.groupForm.id){
          vm.$http.post(vm.url.sId).then(res=>{
            var resData = res.data
            if(resData.code==1){
              var sId = resData.data;
              vm.groupForm.id = sId;
              vm.uploadFile4(sId)
            }
          }).catch(err=>{})
        }else{
          var sId = vm.groupForm.id
          vm.uploadFile4(sId)
        }
      },
      uploadFile4(sId){
        var vm = this;
        let params = new FormData();
        vm.uploadImgArr4.forEach(file =>{
          params.append('file', file)
        });
        params.append('sId',sId)
        // s   1  用户  2  帖子  3  广告
        var map = {
          'add': 4,
          'edit': 5
        }
        var s = map[vm.groupCurrDialog]
        params.append('s',s)
        // 使用位置 1：用户头像 2：帖子列表 3：帖子回复 4:创建群头像 5:编辑群头像 
        params.append('p',1)
        var config =  {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        vm.uploadLoading4 = true
        vm.$http.post(vm.url.upload + sId, params, config).then(res=>{
          let rd = res.data;
          if(rd.code==1){
            // 清空已上传数组
            vm.uploadImgArr4 = [];
            vm.$Message.success('上传图片成功！');
            var arr = [rd.data[0]]
            vm.groupForm.groupHeadImage = arr[0] || '';
            vm.uploadLoading4 = false
          }else{
            vm.$Message.error(rd.message)
          }
        }).catch(err=>{})
      },
      handleRemove4(index){
        var vm = this
        vm.fileUrl4=[]
        vm.uploadImgArr4=[]
        vm.groupForm.groupHeadImage = ''
      },
      // 上传图片end
      birthChange(date){
        var vm = this
        if(date.length){
          vm.formDialog.birthday = date
          var now = new Date();
          var arr = date.split('-');
          var year = now.getFullYear(),
              month = now.getMonth() + 1;
          var birthYear = Number(arr[0]),
              birthMonth = Number(arr[1]);
          var a = year-birthYear,
              b = month - birthMonth;
          vm.formDialog.age = b > 0 || b==0 ? a : a-1;
        }else{
          vm.formDialog.birthday = ''
          vm.formDialog.age = 0
        }
      },
      resetSearch (name) {
        let vm = this
        vm.derail_address_obj_s = []
        vm.formSearch.name = ''
        vm.$refs[name].resetFields()
        // 刷新第一页  再次提交搜索分页没有改变返回数据和当前分页对不上
        vm.paging(1)
        // vm.submitSearch(name)
      },
      // submitSearch (name) {
      //   let vm = this
      //   // 搜索操作
      //   vm.$http2({
      //     url: vm.url.search,
      //     method: vm.pager.method,
      //     data: vm.formSearch
      //   }).then(res => {
      //     var resData = res.data
      //     if(resData.code==1){
      //       vm.pager.data = resData.data.records
      //       vm.pager.total = resData.data.total
      //     }else{
      //       vm.$Message.error('搜索失败: ' + resData.message)
      //     }
      //   }).catch(err=>{})
      // },
      // 重置发帖弹窗
      // 关闭窗口的重置
      postResetDialogForm(name){
        name = name || 'postFormDialog'
        var vm = this
        vm.fileUrl3 = []
        vm.uploadImgArr3 = []
        vm.postFormDialog.imagePath = []
        vm.postFormDialog.id = ''
        vm.postDialogSubmitLoading = false
        vm.$refs[name].resetFields()
      },
      // 点击按钮的重置
      postResetDialogForm2(name){
        name = name || 'postFormDialog'
        var vm = this
        vm.uploadLoading3 = false
        vm.fileUrl3 = []
        vm.uploadImgArr3 = []
        vm.postFormDialog.imagePath = []
        vm.postDialogSubmitLoading = false
        vm.postFormDialog.postContent = ''
      },
      // 新增id无值时需要获取
      postSubmitDialogForm(name){
        var vm = this
        vm.$refs[name].validate(function (valid) {
          if (valid) {
            var pager = vm.postPager
            var ajaxData = vm.postFormDialog
            var url = vm.url.post[vm.postCurrDialog]
            var method = pager.method
            var params = {
              url: url,
              method: method
            }
            if(ajaxData.id){
              if(method=='get'){
                params.params = ajaxData
              }else{
                params.data = ajaxData
              }
              vm.postRequest(params)
            }else{
              vm.$http.post(vm.url.sId).then(res=>{
                var resData = res.data
                if(resData.code==1){
                  var sId = resData.data;
                  ajaxData.id = sId
                  if(method=='get'){
                    params.params = ajaxData
                  }else{
                    params.data = ajaxData
                  }
                  vm.postRequest(params)
                }else{
                  vm.$Message.error(resData.message)
                }
              }).catch(err=>{})
            }
          }
        })
      },
      // 帖子新增或编辑的请求
      postRequest(params){
        var vm = this
        vm.postDialogSubmitLoading = true
        vm.$http(params).then(res => {
          vm.postDialogSubmitLoading = false
          var resData = res.data
          if(resData.code==1){
            vm.$Message.success(vm.label[vm.postCurrDialog] + '帖子成功!')
            // 更新当前帖子数据
            vm.postPaging()
            vm.postDialogShow = false
          }else{
            vm.$Message.error(vm.label[vm.postCurrDialog] + '帖子失败: ' + resData.message)
          }
        }).catch(err=>{})
      },

      resetDialogForm (name) {
        name = name || 'formDialog'
        var vm = this;
        vm.formDialog.id=''
        vm.formDialog.birthday = ''
        vm.birthday = ''
        vm.location_address = []
        vm.hometown_address = []
        vm.fileUrl = []
        vm.uploadImgArr = []
        vm.fileUrl2 = []
        vm.uploadImgArr2 = []
        vm.formDialog.appSoucre = '3'
        vm.formDialog.loginUsername = ''
        vm.formDialog.loginPassword = ''
        vm.loginPassword = ''
        vm.$refs[name].resetFields()
      },
      // 新增或编辑成功之后更新数据
      updateOther(){
        this.initUserMap()
      },
      initDialog (data) {
        var vm = this;
        if(typeof data.isAuth=='number'){
          data.isAuth = data.isAuth.toString()
        }
        if(typeof data.isConsummate=='number'){
          data.isConsummate = data.isConsummate.toString()
        }
        if(typeof data.appSoucre=='number'){
          data.appSoucre = data.appSoucre.toString()
        }
        if(typeof data.userStatus=='number'){
          data.userStatus = data.userStatus.toString()
        }
        if(typeof data.sex=='number'){
          data.sex = data.sex.toString()
        }
        var provincesCode = data.provincesCode,
            cityCode = data.cityCode,
            areaCode = data.areaCode,
            homeProvincesCode = data.homeProvincesCode,
            homeCityCode = data.homeCityCode,
            homeAreaCode = data.homeAreaCode;
        if(homeProvincesCode&&homeCityCode&&homeAreaCode){
          vm.hometown_address = [homeProvincesCode, homeCityCode, homeAreaCode]
        }else{
          vm.hometown_address = []
        }
        if(provincesCode&&cityCode&&areaCode){
          vm.location_address = [provincesCode, cityCode, areaCode]
        }else{
          vm.location_address = []
        }
        // 头像，头像背景回显
        if(data.headPortrait){
          if(data.headPortrait.indexOf('http')==-1){
            vm.fileUrl = [vm.imageHost + data.headPortrait]
          }else{
            vm.fileUrl = [data.headPortrait]
          }
        }
        if(data.bgPortrait){
          if(data.bgPortrait.indexOf('http')==-1){
            vm.fileUrl2 = [vm.imageHost + data.bgPortrait]
          }else{
            vm.fileUrl2 = [data.bgPortrait]
          }
        }
        vm.birthday = data.birthday
      },
      initImageHost(){
        var vm = this
        if(!vm.imageHost){
          vm.$http({
            url: vm.url.imgServer,
            method: 'get'
          }).then(res=>{
            vm.imageHost = res.data
          }).catch(error=>{})
        }
      },
      initUserMap(){
        var vm = this
        vm.$http({
          method: 'get',
          url: vm.url.allUser,
        }).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var userId = resData.data
            var len = userId.length,i,item,webUserId=[],appUserId=[],userMap={};
            for(i=0;i<len;i++){
              item = userId[i]
              userMap[item.id] = item.nickName || item.id
              if(item.appSoucre==3){
                webUserId.push({
                  value: item.id,
                  label: item.nickName || item.id
                })
              }else{
                appUserId.push({
                  value: item.id,
                  label: item.nickName || item.id
                })
              }
            }
            // vm.userId = userId;
            vm.webUserId = webUserId;
            vm.appUserId = appUserId;
            vm.userMap = userMap;
          }else{
            vm.$Message.error(resData.message)
          }
        }).catch(err=>{})
      },
      initData () {
        var vm = this
        if(sessionStorage.chinaData){
          vm.derail_address_arr = JSON.parse(sessionStorage.chinaData)
          vm.chinaJson = JSON.parse(sessionStorage.chinaJson)
        }
        vm.initUserMap()
        vm.initImageHost()
      }
    },
    watch: {
      loginPassword(val){
        var vm = this
        if(vm.currDialog == 'add'){
          // 添加用户是进行md5加密，编辑时不用
          vm.formDialog.loginPassword = hex_md5(val)
        }else{
          vm.formDialog.loginPassword = val
        }
      },
      derail_address_obj_s (val) {
        if (val.length) {
          this.formSearch.areaCode = val[2]
        } else {
          this.formSearch.areaCode = ''
        }
      },
      hometown_address(val){
        var vm =this;
        if(val.length){
          vm.formDialog.provincesCode = val[0]
          vm.formDialog.cityCode = val[1]
          vm.formDialog.areaCode = val[2]
        }else{
          vm.formDialog.provincesCode = ''
          vm.formDialog.cityCode = ''
          vm.formDialog.areaCode = ''
        }
      },
      location_address(val){
        var vm =this;
        if(val.length){
          vm.formDialog.homeProvincesCode = val[0]
          vm.formDialog.homeCityCode = val[1]
          vm.formDialog.homeAreaCode = val[2]
        }else{
          vm.formDialog.homeProvincesCode = ''
          vm.formDialog.homeCityCode = ''
          vm.formDialog.homeAreaCode = ''
        }
      },
      postDialogShow(val){
        if(!val){
          this.postResetDialogForm()
        }
      },
      postShow(val){
        if(!val){
          this.postPager.data = []
          // 关闭时清空查询的userId
          if(this.postFormSearch){
            this.postFormSearch.userId = ''
          }
          this.userData = {}
        }
      },
      currentSourceWeb(val){
        this.formSearch.source = val ? 'web' : 'app'
      },
      fileUrl3(val){
        if(val.length){
          this.editFileUrl3 = []
        }
      }
    },
  }
</script>

<style scoped>
.clearfix:after {
    content: ".";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
}
.preview-img-box{
  width: 100px;
  height: 100px;
  border: 1px solid gray;
}
.preview-img-box img{
  max-width: 100%;
  max-height: 100%;
}
/* 帖子预览*/
.post-content{
  /* width: 750px; */
  box-sizing: border-box;
  padding: 15px;
  width: 375px;
  margin: 0 auto;
  border: 2px dotted aqua;

}
.post-preview-header{
  height: 42px;
  margin-bottom: 15px;
}
.head-portrait{
  float: left;
  margin-right: 10px;
  width: 40px;
  height: 40px;
}
.head-portrait img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.post-user-info{
  float: left;
}
.post-user-info .user-name{
  color: #3679DF;
  font-size: 16px;
}
.post-user-info .user-sex{
  height: 12px;
}
.post-user-info .info-footer{
  font-size: 12px;
  color: #999;
}
.post-preview-conntent{
  font-size: 17px;
  line-height: 26px;
  color: #333;
}
.post-preview-media{

}
.post-img-item{
	float: left;
	text-align: center;
	margin-right: 10px;
	margin-top: 10px;
  width: 105px;
  height: 105px;
}
.post-img-item img{
  max-width: 100%;
	max-height: 100%;
}
.middle-font{
  font-size: 14px;
  color:#708090
}
</style>
