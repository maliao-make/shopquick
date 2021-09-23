<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 添加分类-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>

      <!--  分类列表-->
      <el-row style="margin-top: 15px">
        <tree-table
            :data="categoryList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index index-text="#" border
            :show-row-hover="false">
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted = true"
               style="color: lightgreen"></i>
            <i class="el-icon-error" v-else
               style="color: red"></i>
          </template>
          <template slot="level" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
          <template slot="operation" slot-scope="scope">
            <el-button type="primary" size="mini" @click="showEditDialogVisible(scope.row.cat_id)">
              <i class="el-icon-edit">编辑</i>
            </el-button>
            <el-button type="danger" size="mini" @click="deleteCategory(scope.row.cat_id)">
              <i class="el-icon-delete">删除</i>
            </el-button>
          </template>
        </tree-table>
      </el-row>

      <!--分页-->
      <el-row>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="categoryInfo.pagenum"
            :page-sizes="[3,5,10,30,50]"
            :page-size="categoryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 添加分类对话框  -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCategoryDialog"
        width="50%"
        center
        @close="addCategoryClosed">
      <el-form :model="addCategoryForm" status-icon :rules="addCategoryFormRules" ref="addCategoryFormRef"
               label-width="70px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
              clearable
              :options="parentCateList"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
            <el-button @click="addCategoryDialog = false">取 消</el-button>
            <el-button type="primary" @click="addCategory">确 定</el-button>
          </span>
    </el-dialog>

    <!-- 修改分类对话框  -->
    <el-dialog
        title="修改分类"
        :visible.sync="affirmAddCategoryDialog"
        width="50%"
        >
      <el-form :model="editCategoryForm" status-icon :rules="editCategoryFormrules" ref="editCategoryFormref" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editCategoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
            <el-button @click="affirmAddCategoryDialog = false">取 消</el-button>
            <el-button type="primary" @click="editCategory(editCategoryForm.cat_name)">修 改</el-button>
          </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      addCategoryDialog: false,
      affirmAddCategoryDialog: false,
      categoryList: [],
      parentCateList: [],
      editCategoryForm:{},
      categoryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        }, {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addCategoryForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      addCategoryFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      editCategoryFormrules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      selectedKeys: []
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const {data: res} = await this.$http.get('categories', {params: this.categoryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }

      this.categoryList = res.data.result
      this.total = res.data.total

    },
    // 展示数据条数
    handleSizeChange(newSize) {
      this.categoryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 展示数据页数
    handleCurrentChange(newPage) {
      this.categoryInfo.pagenum = newPage
      this.getCategoryList()
    },
    //展示添加对话框
    showDialogVisible() {
      this.getParentCateList()
      this.addCategoryDialog = true
    },
    //点击按钮添加新的分类
    addCategory() {
      this.$refs.addCategoryFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('categories', this.addCategoryForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        await this.getCategoryList()
        this.addCategoryDialog = false
      })
    },
    //  获取父级分类列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if (res.meta.status !== 200) {
        this.$message.error("获取父级分类列表失败！")
      }
      this.parentCateList = res.data
    },
    //选择框发生变化
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCategoryForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCategoryForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    addCategoryClosed() {
      this.$refs.addCategoryFormRef.resetFields()
      this.selectedKeys = []
    },
    async showEditDialogVisible(id){
      const {data: res} = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editCategoryForm = res.data
      this.affirmAddCategoryDialog = true
    },
  //  修改分类
    editCategory() {
      this.$refs.editCategoryFormref.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put('categories/' + this.editCategoryForm.cat_id,this.editCategoryForm)
        if (res.meta.status !== 200) {
          console.log(this.editCategoryForm)
          return this.$message.error('更新用户信息失败')
        }
        console.log(this.editCategoryForm)
        //  关闭对话框
        this.modify = false
        //  刷新数据列表
        await this.getCategoryList()
        //  提示修改成功
        this.$message.success('更新用户信息成功')
        this.affirmAddCategoryDialog = false
      })
    },
    //根据id进行删除
    async deleteCategory(id) {
      //确认是否删除
      const confirmResult = await this.$confirm('你即将删除此分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error("删除分类失败")
      this.$message.success('删除分类成功')
      let total = this.total-1
      if (total%this.categoryInfo.pagesize===0){
        this.categoryInfo.pagenum = this.categoryInfo.pagenum-1
      }
      await this.getCategoryList()
    }
  }
}
</script>
<style scoped>

</style>