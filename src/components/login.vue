<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png">
      </div>
      <el-form :rules="rules" ref="formLogin" :model="formLogin" class="formLogin">
        <el-form-item prop="username">
          <el-input type="text" v-model="formLogin.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="formLogin.password" placeholder="请输入用密码"
                    prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="sublogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      rules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {max: 8, min: 3, message: '用户名应为3-8个字符', trigger: "blur"}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {max: 16, min: 6, message: '密码应为6~16位', trigger: "blur"}
        ]
      },
      formLogin: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    sublogin() {
      this.$refs.formLogin.validate(async (valid) => {
        if (valid) {
          const {data: res} = await this.$http.post('login', this.formLogin)
          if (res.meta.status !== 200) return this.$message.error("登陆成功")
          this.$message.success("登陆成功")
          window.sessionStorage.setItem("token", res.data.token)
          await this.$router.push("/home")
        } else {
          this.$message.error('用户或密码不符合规范')
          return false;
        }
      });
    }
  }
}
</script>

<style scoped lang="less">
.login_container {
  background: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login_box {
  width: 450px;
  height: 300px;
  background: white;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  .avatar_box {
    height: 120px;
    width: 120px;
    padding: 10px;
    border-radius: 50%;
    border-radius: 1px solid #eee;
    box-shadow: 0 0 10px #ddd;
    margin-top: -60px;
    background: white;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #eee;
    }
  }

  .formLogin {
    width: 80%;
  }
}
</style>