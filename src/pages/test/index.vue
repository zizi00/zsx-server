<template>
  <div class="test">
    <Form :model="formSearch" ref="formSearch" inline :label-width="60">
      
      <Button type="default" style="margin:5px 8px 24px 0;" @click="resetSearch('formSearch')" size="small">{{label.clear}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="submitSearch('formSearch')" size="small">{{label.search}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="addRow" size="small">{{label.add}}</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="cuttingShow=true" size="small">裁剪图片</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="echartsShow=true" size="small">图表</Button>
      <Button type="primary" style="margin: 5px 8px 24px 0;" @click="modifyData()" :loading="modifyLoading" size="small">修改办事事项中分类的数据</Button>
    </Form>
    <mainTable :columns="columns" :data="pager.data"></mainTable>
    <paging @changePager="changePager" @paging="paging" :total="pager.total" :current="pager.current"></paging>
    <Modal v-model="dialogShow" :title="label[currDialog]" :mask-closable="false" width="900" @on-cancel="resetDialogForm('formDialog')">
      <Form :model="formDialog" ref="formDialog" :rules="rules" :label-width="80">
        
      </Form>
      <div slot="footer">
        <Button @click="resetDialogForm('formDialog')">{{label.clear}}</Button>
        <Button type="primary" @click="submitDialogForm('formDialog')" :loading="dialogSubmitLoading">{{label.submit}}</Button>
      </div>
    </Modal>
    <!-- 百度新闻 -->
    <div v-if="false">
      <div class="test">
        <Input v-model="test.formDialog.word" placeholder="关键词"></Input>
        <Button @click="testSubmit">提交</Button>
      </div>
      <div class="test">
        <Select v-model="test.rssDialog.class" placeholder="请选择"  clearable>
          <Option v-for="item in test.rssClassify" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button @click="testSubmit2">提交</Button>
      </div>
    </div>
    
    <Modal v-model="cuttingShow" title="图片裁剪" :mask-closable="false">
      <!-- 上传图片裁剪 -->
      <div class="cutting">
        <Upload
            multiple
            type="drag"
            action=""
            :before-upload="beforeUpload"
            :format="uploadFormat"
            :on-format-error="formatError"
            :max-size="20000"
            :on-exceeded-size="handleMaxSize"
            >
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
        </Upload>
        <div class="img-container">
          <div style="width:490px;margin: 0 auto;">
            <img id="myImg" :src="cropperImgSrc" alt="">
          </div>
        </div>
        <div>
          生成后的图片： <br>
          <img :src="afterSrc" alt="">
        </div>
        <Button :type="which == 'one' ? 'primary' : 'default'" @click="initCropper('one')">
          <Tooltip>
            <span>单图</span>
            <p slot="content"  style="white-space: normal;">690*345</p>
          </Tooltip>
        </Button>
        <Button :type="which == 'main' ? 'primary' : 'default'" @click="initCropper('main')">
          <Tooltip>
            <span>主图</span>
            <p slot="content"  style="white-space: normal;">456*344</p>
          </Tooltip>
        </Button>
        <Button :type="which == 'secondary' ? 'primary' : 'default'" @click="initCropper('secondary')">
          <Tooltip>
            <span>次级图片</span>
            <p slot="content"  style="white-space: normal;">222*166</p>
          </Tooltip>
        </Button>
        <Button type="primary" @click="beSure">确定</Button>
      </div>
      <div slot="footer">
        <Button @click="cuttingShow=false">{{label.close}}</Button>
      </div>
    </Modal>

    <Modal v-model="echartsShow" title="图表" :mask-closable="false">
      <Button @click="initChar">初始化图表</Button>
      <div id="main-char" style="width:400px;height:200px;"></div>
      <div slot="footer">
        <Button @click="echartsShow=false">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import mainTable from '@/components/mainTable'
  import paging from '@/components/paging'
  import page from '@/mixins/page'
  import * as echarts from 'echarts'
  export default {
    name: 'test',
    mixins: [page],
    components: {
      mainTable,
      paging,
    },
    data(){
      return {
        modifyLoading: false,
        // 图表
        echartsShow: false,
        myChart: null,
        charOptions: {
            xAxis: {
                type: 'category',
                data: ['Matcha Latte', 'Milk Tea', 'Cheese Cocoa', 'Walnut Brownie']
            },
            yAxis: {},
            series: [
                {
                    type: 'bar',
                    name: '2015',
                    data: [89.3, 92.1, 94.4, 85.4]
                },
                {
                    type: 'bar',
                    name: '2016',
                    data: [95.8, 89.4, 91.2, 76.9]
                },
                {
                    type: 'bar',
                    name: '2017',
                    data: [97.7, 83.1, 92.5, 78.1]
                }
            ]
        },
        // 拖拽裁剪上传图片
        cuttingShow: false,
        uploadFormat: ['jpg','jpeg','png','gif'],
        cropper: null,
        cropperImgSrc: '',
        // 裁剪后的src
        afterSrc: '',
        which: '',
        test: {
          url: {
            init: 'http://news.baidu.com/ns',
            rss: 'http://news.baidu.com/n',
          },
          formDialog: {
            word: ''
          },
          rssDialog: {
            cmd: 1,
            tn: 'rss',
            class: ''
          },
          rssClassify: [
            {
              value: 'civilnews',
              label: '国内焦点'
            },
            {
              value: 'internews',
              label: '国际焦点'
            },
            {
              value: 'mil',
              label: '军事焦点'
            },
            {
              value: 'finannews',
              label: '财经焦点'
            },
            {
              value: 'internet',
              label: '互联网焦点'
            },
            {
              value: 'housenews',
              label: '房产焦点'
            },
            {
              value: 'autonews',
              label: '汽车焦点'
            },
            {
              value: 'sportnews',
              label: '体育焦点'
            },
          ],
          rssClassifyMap: {
            civilnews: '国内焦点',
            internews: '国际焦点',
            mil: '军事焦点',
            finannews: '财经焦点',
            internet: '互联网焦点',
            housenews: '房产焦点',
            autonews: '汽车焦点',
            sportnews: '体育焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
            // civilnews: '焦点',
          },
        },
        url: {
          // 增删改查
          add: '',
          delete: '',
          edit: '',
          search: '',
          upload: 'file/',
          sId: 'id/id',
        },
        pager: {
          // 页面初始化
          url: '',
          // 主区域表格数据
          data: [],
        },
        // 搜索表单
        formSearch: {
          
        },
        // 新增/编辑表单
        formDialog: {

        },
        columns: [],
        rules: {}
      }
    },
    methods: {
      modifyData(){
        var vm=this
        var url = 'web/test/matter/class'
        var params = {
          url,
          method: 'post'
        }
        vm.modifyLoading=true
        vm.$http(params).then(res=>{
          vm.modifyLoading = false
          if(res&&res.status==200){
            var code = res.data.code
            if(code==1){
              vm.$Message.success('修改成功')
            }else{
              vm.$Message.error(res.data.message || '修改失败，请重试')
            }
          }
        }).catch(err=>{
          vm.modifyLoading = false
        })
      },
      paging(){},
      initChar(){
        var vm = this
        var myChart = echarts.init(document.getElementById('main-char'))
        myChart.on('click',function(params){
          // params.componentType  判断鼠标点击到了什么位置
          console.log(params)
        })
        myChart.showLoading()
        vm.myChart = myChart
        vm.updateChar(vm.charOptions)
      },
      updateChar(option){
        var myChart = this.myChart
        myChart&&myChart.setOption(option),myChart.hideLoading()
      },
      // 拖拽裁剪上传图片
      beforeUpload(file){
        console.log(file)
        var vm = this
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = function (e) {
          console.log('reader: ',reader)
          vm.cropperImgSrc = reader.result
        }
        return false
      },
      formatError(){},
      handleMaxSize(){},
      // 拖拽裁剪上传图片  end
      initCropper(which){
        var vm = this
        which = which || 'one'
        vm.which = which
        var aspectRatio = {
          one: 690 / 345,
          main: 456 / 344,
          secondary: 222 / 166
        }
        if(!vm.cropper){
          vm.cropper =  $("#myImg").cropper({
            // aspectRatio: 16 / 9,
            aspectRatio: aspectRatio[which],
            crop: function(event) {
              console.log('x:', event.detail.x);
              console.log('y: ',event.detail.y);
              console.log('width: ',event.detail.width);
              console.log('height: ',event.detail.height);
              console.log('rotate: ',event.detail.rotate);
              console.log('scaleX: ',event.detail.scaleX);
              console.log('scaleY: ',event.detail.scaleY);
            }
          })
        }else{
          // vm.cropper.reset()
          vm.cropper.cropper('destroy').cropper({aspectRatio: aspectRatio[which]});
        }
      },
      dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
      },
      dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
      },
      // 确定裁剪
      beSure(){
        var vm = this
        if(!vm.cropper){
          vm.$Message.info('请先选择要生成什么图片')
          return
        }
        // var imgData =  $('#myImg').cropper('getCroppedCanvas',{width:690,height:345}).toDataURL('image/jpeg', 0.7)
        var imgData =  $('#myImg').cropper('getCroppedCanvas',{width:690,height:345}).toDataURL('image/png')
        var fileName = "file" + Math.random().toString().slice(-10) + '.png'
        var file = vm.dataURLtoFile(imgData,fileName)
        console.log(file)
        return
        vm.$http.post(vm.url.sId).then(res=>{
          var resData = res.data
          if(resData.code==1){
            var sId = resData.data
            var userId = 5
            var params = new FormData();
            params.append('file', file)
            params.append('sId',sId)
            params.append('s',2)
            params.append('p',2)
            var config =  {
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
            };
            vm.$http.post(vm.url.upload + userId, params, config).then(res=>{
              let rd = res.data;
              if(rd.code==1){
                
              }else{
                vm.$Message.error(rd.message)
              }
            }).catch(err=>{})
          }
        }).catch(err=>{})
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
      // 测试相关
      testSubmit(){
        var vm = this,method='get'
        var ajaxData = vm.test.formDialog
        var params = {
          url: vm.test.url.init,
          method: method
        }
        if(method=='get'){
          params.params = ajaxData
        }else{
          params.data = params
        }
        vm.$http(params).then(res=>{
          console.log(res)
        }).catch(err=>{})
      },
      testSubmit2(){
        var vm = this
        $.ajax({
          url: vm.test.url.rss,
          // type: 'get',
          data: vm.test.rssDialog,
          success: function(data, textStatus, jqXHR){
            console.log(data)
          }
        })

      }
      // 测试相关  end
      
    },
  }
</script>
<style scoped>
.img-container{
  /* height: 200px; */
  width:500px;
  margin-bottom: 10px;
}
.img-container img{
  max-width: 100%;
  max-height: 100%;
}
</style>
