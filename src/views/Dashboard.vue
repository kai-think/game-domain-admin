<template>
<el-card title="游戏圈活跃度统计">
  <el-row>
    <el-col :span="24">
      游戏圈活跃度统计
    </el-col>
    <el-col :span="24" style="margin-top: 10px">
      <div id="line-chart" style="width: 1200px; height:300px;"></div>
    </el-col>
    <el-col :span="24">
      <div id="main" style="width: 1200px;height:300px;"></div>
    </el-col>
  </el-row>
</el-card>
</template>
<script>
import activationApi from "@/api/sys/other/activationApi"
import * as echarts from 'echarts';
export default {
  data: () =>({
    myChart: null,
    lineChart: null,
    chartData1: [],
    chartData2: [],
    option1: {
      title: {
        text: '各游戏圈活跃度前10统计图'
      },
      tooltip: {},
      xAxis: {
        data: ['地平线', '法环', '地平线2', '法环2']
      },
      yAxis: {},
      series: [
        {
          name: '活跃度',
          type: 'bar',
          data: [120, 160, 100, 145]
        }
      ]
    },
    option2: {
      title: {
        text: '近14天来整体活跃度变化图'
      },
      xAxis: {
        data: ['2022-05-14', '2022-05-15', '2022-05-16', '2022-05-17', '2022-05-18', '2022-05-19', '2022-05-20', '2022-05-21', '2022-05-22', '2022-05-23']
      },
      yAxis: {},
      series: [
        {
          data: [1500, 2200, 2800, 2300, 1900, 1500, 2100, 2500, 3000, 1400],
          type: 'line',
          label: {
            show: true,
            position: 'bottom',
            textStyle: {
              fontSize: 20
            }
          }
        }
      ]
    }
  }),
  methods: {
    init() {
      //获取折线图数据并绘制折
      activationApi.listRecentGlobalActivation(14)
      .then(res => {
        this.chartData1 = res;
        this.option2.xAxis.data = res.map(r => r.recordDate)
        this.option2.series[0].data = res.map(r => r.activation)

        this.lineChart.setOption(this.option2);
      })
      .catch(err => this.$message.error(err))

      //获取柱状图数据并绘制折
      activationApi.listTodayActivationDescByActivation({current: 1, size: 10})
      .then(res => {
        this.chartData2 = res;
        this.option1.xAxis.data = res.map(r => r.name)
        this.option1.series[0].data = res.map(r => r.activation)

        // 绘制柱状图表   
        this.myChart.setOption(this.option1);
      })
      .catch(err => this.$message.error(err))
    },
  },
  created() {
    setTimeout(() => {
      this.myChart = echarts.init(document.getElementById('main'));
      this.lineChart = echarts.init(document.getElementById('line-chart'));
      window.onresize = () => {
        this.myChart.resize();
        this.lineChart.resize();
      }
      this.init()
      
    }, 500);
  }
}
</script>