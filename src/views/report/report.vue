<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 1680px;height:720px"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'

export default {
  name: "report",
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    let main = document.getElementById('main')
    const myChart = echarts.init(main);

    const {data: res} = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      this.$message.error("获取折线图数据失败")
    }
    const result = _.merge(res.data,this.options)
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
  methods: {}
}
</script>

<style scoped>

</style>