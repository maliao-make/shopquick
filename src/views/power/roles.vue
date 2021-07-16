<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialog = true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-table :data="roleList" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                      :class="['vcenter','bdbottom',i1 === 0 ?'bdtop':'']">
                <el-col :span="6">
                  <el-tag closable @close="removeRight(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-row v-for="(item2,i2) in item1.children" :key="item2.id"
                          :class="['vcenter',i2 === 0 ? '' : 'bdtop']">
                    <el-col :span="6">
                      <el-tag type="warning" closable @close="removeRight(scope.row,item2.id)">{{
                          item2.authName
                        }}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                              @close="removeRight(scope.row,item3.id)">{{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRole(scope.row.id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除
              </el-button>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">
                分配权限
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-dialog
          title="添加角色"
          :visible.sync="addDialog"
          width="30%"
          :before-close="addlogClosed">
        <el-form :model="addFormRole" status-icon :rules="addRolerules" ref="addRoleref" label-width="70px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addFormRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addFormRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialog = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
          title="修改角色"
          :visible.sync="edit"
          width="50%"
          @close="editClosed">
        <el-form :model="editRoleForm" status-icon :rules="editRolerules" ref="editRoleFormRef" label-width="70px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model.number="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="edit = false">取 消</el-button>
        <el-button type="primary" @click="edits">修 改</el-button>
      </span>
      </el-dialog>
      <!--分配权限对话款-->
      <el-dialog
          title="分配权限"
          :visible.sync="setRightDialogVisible"
          width="50%"
          @close="setDialogClosed">
        <el-tree
            :data="rightsList"
            show-checkbox
            default-expand-all
            node-key="id"
            ref="treeRef"
            highlight-current
            :props="treeProps"
            :default-checked-keys="defaultKeys">
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allocationRight">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "roles",
  data() {
    return {
      addDialog: false,
      edit: false,
      setRightDialogVisible: false,
      roleList: [],
      //添加表单
      addFormRole: {
        roleName: '',
        roleDesc: ''
      },
      //修改表单
      editRoleForm: {},
      addRolerules: {
        roleName: [
          {required: true, message: '请输入角色名', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },
      editForm: {},
      editRolerules: {
        roleName: [
          {required: true, message: '请输入角色名', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },
      rightsList: '',
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认选中的节点Id值数组
      defaultKeys: [],
      //当前即将分配权限的角色id
      roleId:''

    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    //获取角色列表
    async getRoleList() {
      const {data: res} = await this.$http.get('roles')
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },

    //关闭添加对话框时清除对话框表单内容
    addlogClosed() {
      this.$refs.addRoleref.resetFields()
    },

    //添加角色
    addRole() {
      this.$refs.addRoleref.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('roles', this.addFormRole)
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败！")
        }
        this.$message.success("添加角色成功！")
        this.addDialog = false
        await this.getRoleList()
      })
    },

    //关闭修改对话框时清除对话框表单内容
    editClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },

    //  查询要编辑的角色
    async editRole(id) {
      const {data: res} = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editRoleForm = res.data
      this.edit = true
    },

    // 编辑角色
    edits() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put('roles/' + this.editRoleForm.roleId, this.editRoleForm)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        //  关闭对话框
        this.edit = false
        //  刷新数据列表
        await this.getRoleList()
        //  提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },

    //  删除橘色
    async deleteRole(id) {
      //确认是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error("删除绝失败")
      this.$message.success('删除角色成功')
      await this.getRoleList()
    },

    //根据id删除权限
    async removeRight(role, rigntid) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rigntid}`)
      if (res.meta.status !== 200) return this.$message.error("删除权限失败")
      this.$message.success('删除权限成功')
      role.children = res.data
    },

    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('请求权限数据失败')
      this.rightsList = res.data
      // console.log(role)
      this.getLeafKeys(role, this.defaultKeys)
      // console.log(this.defaultKeys)
      this.setRightDialogVisible = true
    },

    //  通过递归的形式，获取角色下所有的三级权限的id,并保存到defaultKey数据中
    getLeafKeys(node, arr) {

      //如果当前node节点不包含children属性，则时三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    //清空数组
    setDialogClosed() {
      this.defaultKeys = []
    },

    //  分配权限
    async  allocationRight() {
      const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})

      if (res.meta.status !== 200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      await this.getRoleList()
      this.setRightDialogVisible = false
    }

  }
}
</script>

<style>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eeeeee;
}

.bdbottom {
  border-bottom: 1px solid #eeeeee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>