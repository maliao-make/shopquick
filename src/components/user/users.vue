<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 搜索与添加-->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialog = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--  用户列表-->
      <el-row>
        <el-table :data="userList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <!--状态-->
          <el-table-column label="状态" prop="mg_state">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="modifyt(scope.row.id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteInfo(scope.row.id)"></el-button>
              <el-tooltip effect="dark" content="分配角色" placement="top" enterable>
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
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

    <!-- 添加用户对话框  -->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialog"
        width="50%"
        center
        @close="addlogClosed">
      <el-form :model="addForm" status-icon :rules="addFormrules" ref="addFormref" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.number="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框  -->
    <el-dialog
        title="修改用户"
        :visible.sync="modify"
        width="50%"
        @close="modifyClosed">
      <el-form :model="modifyForm" status-icon :rules="modifyFormrules" ref="modifyFormref" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="modifyForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.number="modifyForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="modifyForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modify = false">取 消</el-button>
        <el-button type="primary" @click="modifys">修 改</el-button>
      </span>
    </el-dialog>

    <!--    分配角色对话框-->
    <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed">
      <p>当前的用户：{{ userinfo.username }}</p>
      <p>当前的角色：{{ userinfo.role_name }}</p>
      <p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "users",
  data() {
    let checkEmail = (rule, value, cb) => {
      //验证邮箱
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9])+/
      if (regEmail.test(value)) {
        return cb()
      }

      cb(new Error('您输入邮箱不规范'))
    }

    let checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return cb()

      cb(new Error('您输入的电话不规范'))
    }

    return {
      //当前页
      currentpage:1,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      //需要分配角色的用户信息
      userinfo: {},
      //所有角色的数据列表
      roleList: [],
      selectedRoleId: '',
      //用户列表数据总条数
      total: 0,
      //控制添加用户对话框显示与隐藏
      addDialog: false,
      //控制修改用户对话框显示与隐藏
      modify: false,
      //控制分配角色对话框显示与隐藏
      setRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则
      addFormrules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {max: 8, min: 3, message: '用户名应为3~8个字符', trigger: "blur"}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {max: 16, min: 6, message: '密码应为6~16位', trigger: "blur"}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: "blur"}
        ]
      },
      //查询到的用户信息对象
      modifyForm: {},
      //修改用户信息的验证规则
      modifyFormrules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: "blur"}
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error("数据获取失败")
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
      console.log(this.queryInfo)
    },
    //展示数据条数
    handleSizeChange(newSize) {

      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 展示数据页数
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //关闭对话框清除已输入内容
    addlogClosed() {
      this.$refs.addFormref.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormref.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！")
        }
        this.$message.success("添加用户成功！")
        this.addDialog = false
        await this.getUserList()
      })
    },
    //修改用户信息
    modifys() {
      this.$refs.modifyFormref.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put('users/' + this.modifyForm.id, this.modifyForm)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        //  关闭对话框
        this.modify = false
        //  刷新数据列表
        await this.getUserList()
        //  提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    //监听修改用户对话框的关闭
    modifyClosed() {
      this.$refs.modifyFormref.resetFields()
    },
    // 根据id查询用户信息并展示修改的对话框
    async modifyt(id) {
      const {data: res} = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.modifyForm = res.data
      this.modify = true
    },
    //修改状态
    async userStateChange(userinfo) {
      console.log(userinfo)
      const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error("更新用户状态失败！")
      }
      this.$message.success('更新用户状态成功！')
    },
    //根据id进行删除
    async deleteInfo(id) {
      //确认是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error("删除用户失败")
      this.$message.success('删除用户成功')
      let total = this.total-1
      if (total%this.queryInfo.pagesize===0){
        this.queryInfo.pagenum = this.queryInfo.pagenum-1
      }
      await this.getUserList()
    },

    async setRole(userinfo) {
      this.userinfo = userinfo
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },

    //  确认分配角色
    async savaRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const {data: res} = await this.$http.put(`users/${this.userinfo.id}/role`, {rid: this.selectedRoleId})
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      await this.getUserList()
      this.setRoleDialogVisible = false
    },

    //  重置选择框
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userinfo = ''
    }
  }
}
</script>

<style scoped>

</style>