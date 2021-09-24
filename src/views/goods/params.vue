<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意：只能为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <div>
        <label>选择商品分类：</label>
        <el-cascader style="width: 200px" clearable :options="categoryList" :props="cascaderProps"
                     v-model="selectedKeys" @change="handleChange"></el-cascader>
      </div>
      <el-tabs tab-position="top" v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <el-table :data="manyTabData" stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(scope.row,index)">{{item}}</el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  <i class="el-icon-edit">编辑</i>
                </el-button>
                <el-button type="danger" size="mini" @click="deleteC(scope.row.attr_id)">
                  <i class="el-icon-delete">删除</i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <el-table :data="onlyTabData" stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(scope.row,index)">{{item}}</el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  <i class="el-icon-edit">编辑</i>
                </el-button>
                <el-button type="danger" size="mini" @click="deleteC(scope.row.attr_id)">
                  <i class="el-icon-delete">删除</i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--  添加的对话框  -->
    <el-dialog
        :title="'添加'+title"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClose">
      <el-form :model="cForm" ref="numberValidateForm" label-width="100px" class="demo-ruleForm">
        <el-form-item
            :label="title+'名'"
            prop="name"
            :rules="[
              { required: true, message: this.title+'不能为空'},
            ]">
          <el-input type="age" v-model.number="cForm.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改的对话框-->
    <el-dialog
        :title="'修改'+title"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClose">
      <el-form :model="editForm" ref="editForm" label-width="100px" class="demo-ruleForm">
        <el-form-item
            :label="title+'名'"
            prop="attr_name"
            :rules="[
              { required: true, message: this.title+'不能为空'},
            ]">
          <el-input type="age" v-model.number="editForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "params",
  data() {
    return {
      cForm: [],
      editForm: [],
      selectedKeys: [],
      categoryList: [], /** 商品分类列表 */
      activeName: 'many',
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      manyTabData: [],
      onlyTabData: [],
      addDialogVisible: false,
      editDialogVisible: false,
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.categoryList = res.data
    },

    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },

    handleChange() {
      this.getParamsData()
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
    },

    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制tag文本框的显示与隐藏
        item.inputVisible = false
        // 文本框的值
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    //重置添加对话框
    addDialogClose() {
      this.$refs.numberValidateForm.resetFields()
    },

    //添加属性或参数
    addParams() {
      this.$refs.numberValidateForm.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.cForm.name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        await this.getParamsData()
      })
    },

    //展示修改对话框
    async showEditDialog(attr_id) {
      //查询当前参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
      if (res.meta.status != 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    //关闭修改对话框
    editDialogClose() {
      //重置修改表单
      this.$refs.editForm.resetFields()
    },

    //修改属性或参数
    editParams() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return
        const {data: res} =
            await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                {
                  attr_name: this.editForm.attr_name,
                  attr_sel: this.activeName
                })
        if (res.meta.status != 200) {
          return this.$message.error("修改数据失败")
        }
        this.$message.success("修改数据成功")
        this.editDialogVisible = false
        await this.getParamsData()
      })
    },

    //删除属性或参数
    async deleteC(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除参数，是否继续', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status != 200) {
        this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      await this.getParamsData()
    },

    handleInputConfirm(row){
      if (row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrValues(row)
    },
    showInput(row){
      row.inputVisible = true
      //文本框自动获取焦点
      //$nextTick当页面被重新渲染才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async saveAttrValues(row){
      console.log(row.attr_vals.join(' '))
      const {data : res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {attr_name: row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(' '),})
      if (res.meta.status != 200){
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功')
    },
    handleClose(row,index){
      console.log(row)
      row.attr_vals.splice(index,1)
      this.saveAttrValues(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedKeys.length != 3) {
        return true
      } else {
        return false
      }
    },
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    title() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped lang="less">

.el-tag{
  margin:10px
}

.input-new-tag{
  width: 120px;
}
</style>