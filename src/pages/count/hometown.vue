<template>
  <div class="hometown">
    <div>
      <!-- <Button @click="initMap()">百度地图</Button> -->
    </div>
    <div id="main-echarts" style="height:700px;"></div>
    <!-- <Row style="margin-top:10px;">
      <Col span="8">
        <div id="ages-echarts" style="height: 400px;margin-right:10px;"></div>
      </Col>
      <Col span="16">
        <div id="interest-echarts" style="height: 400px;"></div>
      </Col>
    </Row> -->

    <Modal v-model="cityShow" title="市" width="1000">
      <div id="province-echarts" style="height: 400px;"></div>
      <div slot="footer">
        <Button @click="cityShow=false;provinceEchatData=[]">{{label.close}}</Button>
      </div>
    </Modal>

    <Modal v-model="areaShow" title="区" width="1000">
      <div id="area-echarts" style="height: 400px;"></div>
      <div slot="footer">
        <Button @click="areaShow=false;areaEchatData=[]">{{label.close}}</Button>
      </div>
    </Modal>

    <Modal v-model="mapShow" title="百度地图" width="1000" :styles="{top: '50px'}">
      <div id="myMap" style="height: 700px;"></div>
      <div slot="footer">
        <Button @click="resetMap()">{{label.close}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import page from '@/mixins/page'
export default {
  name: "hometown",
  mixins: [page],
  data() {
    return {
      url: {
        map: 'user/drawMap',
        provinceMap: 'user/drawMap',
        // provinceMap: 'user/province/drawMap',
      },
      cityShow: false,
      areaShow: false,
      mapShow: false,
      requestData: [],
      // 当前展示的市、区的图表数据
      provinceEchatData: [],
      provinceEchart: null,
      areaEchart: null,
      areaEchatData: [],
      mainEcharts: null,
      agesEcharts: null,
      interestEcharts: null,
      provinceMap: {
        '北京': '北京',
        '天津': '天津',
        '上海': '上海',
        '重庆': '重庆',
        '香港': '香港',
        '澳门': '澳门',
        '河北省': '河北',
        '山西省': '山西',
        '辽宁省': '辽宁',
        '吉林省': '吉林',
        '黑龙江省': '黑龙江',
        '江苏省': '江苏',
        '浙江省': '江苏',
        '安徽省': '安徽',
        '浙江省': '浙江',
        '福建省': '福建',
        '江西省': '江西',
        '山东省': '山东',
        '河南省': '河南',
        '湖北省': '湖北',
        '湖南省': '湖南',
        '广东省': '广东',
        '海南省': '海南',
        '四川省': '四川',
        '贵州省': '贵州',
        '云南省': '云南',
        '陕西省': '陕西',
        '甘肃省': '甘肃',
        '青海省': '青海',
        '台湾省': '台湾',
        '广西壮族自治区': '广西',
        '内蒙古自治区': '内蒙古',
        '西藏自治区': '西藏',
        '宁夏回族自治区': '宁夏',
        '新疆维吾尔自治区': '新疆',
      }
    };
  },
  methods: {
    paging(){
      var vm = this
      vm.$http.get(vm.url.provinceMap).then(res=>{
        if(res&&res.status==200){
          var resData = res.data
          if(resData.code==1){
            var _data = vm.util.deepcopy(resData.data)
            _data.forEach(item=>{
              item.name = vm.provinceMap[item.name]
            })
            vm.requestData = _data
            vm.initEcahrs(_data)
          }
        }
      }).catch(err=>{})
    },
    initCityEcharts(data,txt){
      data = data || []
      var vm = this,_txt=(txt || '市') + '用户统计'
      var xData = []
      data.forEach(item=>{
        // xData.push(item.name)
        // 只取前两个字
        xData.push(item.name.slice(0,2))
      })
      var option = {
        backgroundColor: "#eee",
        title: {
          text: _txt,
          subtext: "",
          left: "center",
          top: '20px',
          textStyle: {
            color: "#000"
          }
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
            name: '用户数量',
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
      }
      if(vm.provinceEchart){
        vm.provinceEchart.setOption(option,true)
      }else{
        vm.$nextTick(function(){
          var dom = document.getElementById("province-echarts");
          var myChart = echarts.init(dom);
          myChart.on('click',function(param){
            if(param.value){
              vm.previewAreaEcharts(param.data,param.name)
            }else{
              vm.$Message.info('该市暂无数据')
            }
          })
          window.addEventListener("resize", function () {
            myChart.resize();
          });
          myChart.setOption(option, true);
          vm.provinceEchart = myChart
        })
      }
    },
    initAreaEcharts(data,txt){
      data = data || []
      var vm = this,_txt=(txt || '区') + '用户统计'
      var xData = []
      data.forEach(item=>{
        // xData.push(item.name)
        // 只取前两个字
        xData.push(item.name.slice(0,2))
      })
      var option = {
        backgroundColor: "#eee",
        title: {
          text: _txt,
          subtext: "",
          left: "center",
          top: '20px',
          textStyle: {
            color: "#000"
          }
        },
        xAxis: {
          data: xData,
        },
        yAxis: {
          show: true
        },
        tooltip: {
          trigger: "item"
        },
        series: [
          {
            name: '用户数量',
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
      }
      if(vm.areaEchart){
        vm.areaEchart.setOption(option,true)
      }else{
        vm.$nextTick(function(){
          var dom = document.getElementById("area-echarts");
          var myChart = echarts.init(dom);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
          myChart.setOption(option, true);
          vm.areaEchart = myChart
        })
      }
    },
    previewCityEcharts(data,txt){
      var vm = this,code = data.code,key,item,provinceEchatData=[]
      var requestData = vm.requestData
      for(key in requestData){
        item = requestData[key]
        if(item.code==code){
          provinceEchatData = item.children
        }
      }
      vm.provinceEchatData = provinceEchatData
      vm.cityShow = true
      // vm.$nextTick(function(){
        vm.initCityEcharts(provinceEchatData,txt)
      // })
    },
    previewAreaEcharts(data,txt){
      var vm = this,code = data.code,key,item,areaEchatData=[]
      var provinceEchatData = vm.provinceEchatData
      for(key in provinceEchatData){
        item = provinceEchatData[key]
        if(item.code==code){
          areaEchatData = item.children
        }
      }
      vm.areaEchatData = areaEchatData
      vm.areaShow = true
      // vm.$nextTick(function(){
        vm.initAreaEcharts(areaEchatData,txt)
      // })
    },
    initEcahrs(data) {
      var vm = this;
      var mapData = data
      var option = {
        // 背景色
        // backgroundColor: "#404a59",
        backgroundColor: "#eee",
        title: {
          text: "锵锵用户家乡分布",
          subtext: "",
          left: "center",
          top: '20px',
          textStyle: {
            color: "#000"
          }
        },
        tooltip: {
          trigger: "item"
        },
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data:['家乡数据','所在地数据']
        // },
        // visualMap: {
        //   min: 0,
        //   max: 50000,
        //   text:['50000','0'],
        //   color: ['orangered','yellow','lightskyblue'],
        //   left: '20px',
        //   bottom: '20px',
        //   // calculable : true
        // },
        visualMap: {
          left: '20px',
          bottom: '20px',
          pieces: [{
              gt: 0,
              lte: 100,
              color: '#FFE7BA'
          }, {
              gt: 100,
              lte: 500,
              color: '#FFBBFF'
          }, {
              gt: 500,
              lte: 1000,
              color: '#FF8C69'
          }, {
              gt: 1000,
              lte: 5000,
              color: '#FF7256'
          }, {
              gt: 5000,
              lte: 10000,
              color: '#FF34B3'
          }, {
              gt: 10000,
              color: '#FF0000'
          }],
          outOfRange: {
            color: '#FFFFF0'
          }
        },
        // 工具栏
        toolbox: {
            show: true,
            orient : 'horizontal',
            left: '20px',
            top: '20px',
            // 4.0共有一下6个工具
            feature : {
                // mark : {show: true}, // 4.0版本无此工具
                dataView : {show: true, readOnly: false},
                restore : {show: true},
                // saveAsImage : {show: true},
                // 缩放
                // dataZoom: {show: true},
                // 转换为其他图表表现形式
                // magicType: {
                //   show: true,
                //   type: ['line', 'bar', 'stack', 'tiled']
                // },
                // 不规则选择框
                // brush: {show: true}
            }
        },
        // 配置属性
        series: [
          {
            name: '用户数量',
            type: 'map',  
            mapType: 'china',
            roam: true,
            left: 'center',
            top: 'center',
            // 是否开启鼠标滚动缩放或平移  默认为true 同时开启，设为'scale'或'move'开启单项
            roam: false,
            // 最大最小缩放范围
            // scaleLimit: {
            //   // min: 0.5,
            //   // max: 1.5,
            //   min: 1,
            //   max: 1,
            // },
            label: {  
                normal: {  
                  show: true,  //省份名称  
                  // show: false,
                },  
                emphasis: {  
                  show: false  
                }  
            },
            data:mapData  //数据
          },
        ],
      };
      if(!vm.mainEcharts){
        vm.$nextTick(function(){
          var dom = document.getElementById("main-echarts");
          var myChart = echarts.init(dom);
          myChart.on('click',function(param){
            if(param.value){
              vm.previewCityEcharts(param.data,param.name)
            }else{
              var infoTxt = ''
              if(param.name){
                infoTxt = param.name + '暂无数据'
              }else{
                infoTxt = '该省暂无数据'
              }
              vm.$Message.info(infoTxt)
            }
          })
          window.addEventListener("resize", function () {
              myChart.resize();
          });
          myChart.setOption(option, true);
          vm.mainEcharts = myChart
        })
      }else{
        vm.mainEcharts.setOption(option, true)
      }
    },
    initAgesEcharts(data){
      var vm = this
      var agesData = data || [
        {
          name: '70后',
          value: '85'
        },
        {
          name: '80后',
          value: '50'
        },
        {
          name: '90后',
          value: '115'
        },
        {
          name: '00后',
          value: '23'
        },
        {
          name: '其他',
          value: '56'
        },
      ]
      var option = {
        title: {
          text: '锵锵用户年龄统计',
          left: 'center',
          top: '20px',
        },
        backgroundColor: "#eee",
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: true,
          orient : 'horizontal',
          left: '20px',
          top: '20px',
          feature: {
            dataView : {show: true, readOnly: false},
            restore : {show: true},
            // saveAsImage : {show: true},
          }
        },
        legend: {
          bottom: 10,
          left: 'center',
          data: ['70后','80后','90后','00后','其他']
        },
        series: [
          {
            name: '数量(占比)',
            type: 'pie',
            // radius : '65%',
            // center: ['50%', '50%'],
            // selectedMode: 'single',
            // roseType: 'area',
            // roseType: 'radius',
            data: agesData,
            // data: agesData.sort(function (a, b) { return a.value - b.value; })
          }
        ]
      }
      if(!vm.agesEcharts){
        vm.$nextTick(function(){
          var dom = document.getElementById("ages-echarts");
          var myChart = echarts.init(dom);
          window.addEventListener("resize", function () {
              myChart.resize();
          });
          myChart.setOption(option, true);
          vm.agesEcharts = myChart
        })
      }else{
        vm.agesEcharts.setOption(option, true)
      }
    },
    initInterestEcharts(data){
      var vm = this
      var interestData = data || [
        {
          name: '推荐文章',
          value: '45'
        },
        {
          name: '政务信息',
          value: '30'
        },
        {
          name: '招商咨询',
          value: '25'
        },
        {
          name: '办事指南',
          value: '20'
        },
        {
          name: '本地服务',
          value: '40'
        },
        {
          name: '便民工具',
          value: '26'
        },
        {
          name: '活动组织',
          value: '64'
        },
        {
          name: '话题讨论',
          value: '78'
        },
        {
          name: '有问有答',
          value: '54'
        },
        {
          name: '养生常识',
          value: '68'
        },
        {
          name: '段子',
          value: '88'
        },
      ]
      var xData = [],i,item
      for(i=0;i<interestData.length;i++){
        item = interestData[i]
        xData.push(item.name)
      }
      var option = {
        title: {
          text: '锵锵用户兴趣统计',
          left: 'center',
          top: '20px',
        },
        backgroundColor: "#eee",
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          // show: true,
          data: xData,
          // data: ['推荐文章','政务信息','招商引资','办事指南','本地服务','便民工具','活动组织','话题讨论','有问有答','养生常识','段子']
        },
        yAxis: {
          show: true
        },
        toolbox: {
          show: true,
          orient : 'horizontal',
          left: '20px',
          top: '20px',
          feature: {
            dataView : {show: true, readOnly: false},
            restore : {show: true},
            // saveAsImage : {show: true},
          }
        },
        // legend: {
        //   bottom: 10,
        //   left: 'center',
        //   data: ['推荐文章','政务信息','招商引资','办事指南','本地服务','便民工具','活动组织','话题讨论','有问有答','养生常识','段子']
        // },
        series: [
          {
            name: '数量',
            type: 'bar',
            // center: ['50%', '50%'],
            // selectedMode: 'single',
            data: interestData
          }
        ]
      }
      if(!vm.interestEcharts){
        vm.$nextTick(function(){
          var dom = document.getElementById("interest-echarts");
          var myChart = echarts.init(dom);
          window.addEventListener("resize", function () {
              myChart.resize();
          });
          myChart.setOption(option, true);
          vm.interestEcharts = myChart
        })
      }else{
        vm.interestEcharts.setOption(option, true)
      }
    },
    initTestData(){
      var vm = this
      var map = vm.provinceMap,data=[],num=500000
      for(let key in map){
        data.push({
          name: map[key],
          value: parseInt(Math.random()*num)
        })
      }
      vm.requestData = data
      vm.initEcahrs(data)
    },
    // initData方法在created钩子里调用，此时dom还不存在
    initData(){
      var vm = this
      // vm.initTestData()
      // vm.initAgesEcharts()
      // vm.initInterestEcharts()
    },
    initMap(){
      var vm = this
      var map = new BMap.Map("myMap");
      var point = new BMap.Point(113.947977,22.531861);
			map.centerAndZoom(point, 10);
			// var marker = new BMap.Marker(point);
			// map.addOverlay(marker);
			// map.enableScrollWheelZoom()
      vm.mapShow = true
    },
    resetMap(){
      var vm = this
      vm.mapShow = false
    }
  },
};
</script>
