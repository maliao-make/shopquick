<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" ></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="edite(scope.row.id)"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="getLocation"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-row>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5,10,30,50]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :current-page.sync = "currentpage">
        </el-pagination>
      </el-row>
    </el-card>

    <!--修改的对话框-->
    <el-dialog
        title="修改"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeDialog">
      <el-form :model="addressForm" ref="addressFormRef" rules="addressFormRul" label-width="100px" class="demo-ruleForm">
        <el-form-item
            label="省市县/区"
            prop="address1">
          <el-cascader placeholder="请选择" :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item
            label="详细地址"
            prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>

    <!--展示物流进度-->
    <el-dialog
        title="物流进度"
        :visible.sync="progressDialogVisible"
        width="50%">
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: "order",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      orderList : [],
      total: 0,
      //当前页
      currentpage:1,
      editDialogVisible:false,
      progressDialogVisible:false,
      addressForm:{
        address1:[],
        address2:''
      },
      addressFormRul:{
        address1: [{required: true, message: "请选择省市区/县", trigger: 'blur'}],
        address2: [{required: true, message: "请填写详细地址", trigger: 'blur'}],
      },
      cityData,
      progressInfo:[],
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const {data: res} = await this.$http.get(`orders`, {params: this.queryInfo})
      if (res.meta.status != 200) {
        return this.$message.error("获取商品列表失败")
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    //展示数据条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 展示数据页数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    edite(){
      this.editDialogVisible = true
    },
    confirmEdit(){

    },
    closeDialog(){
      this.$refs.addressFormRef.resetFields()
    },
    async getLocation(){
      const {data:res} =await this.$http.get('/kuaidi/9881425427277')
      console.log(res)
      if (res.meta.status !== 200){
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style scoped>

</style>