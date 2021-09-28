<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods()">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="105px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="商品创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.goods_id)"></el-button>
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
            :current-page.sync="currentpage">
        </el-pagination>
      </el-row>
    </el-card>
  </div>

</template>

<script>
import add from "@/views/goods/add";

export default {
  name: "list",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodList: [],
      total: 0,
      //当前页
      currentpage: 1,
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    async getGoodList() {
      const {data: res} = await this.$http.get(`goods`, {params: this.queryInfo})
      if (res.meta.status != 200) {
        return this.$message.error("获取商品列表失败")
      }
      this.total = res.data.total
      this.goodList = res.data.goods
    },
    //展示数据条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    // 展示数据页数
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    async remove(id) {
      //确认是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error("删除商品失败")
      this.$message.success('删除商品成功')
      let total = this.total - 1
      if (total % this.queryInfo.pagesize === 0) {
        this.queryInfo.pagenum = this.queryInfo.pagenum - 1
      }
      await this.getGoodList()
    },
    addGoods() {
      this.$router.push({name:"add",params:{type:"1"}})
    },
    editGoods(id){
      console.log(id)
      this.$router.push({name:"add",params:{type:"2",goods_id:id}})
    }
  }
}
</script>

<style scoped lang="less">

</style>