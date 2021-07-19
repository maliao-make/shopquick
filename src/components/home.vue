<template>
  <el-container class="home-container">
    <el-header class="home-header">
      <div>
        <img src="" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="fold" @click="zheCollapse">|||</div>
        <el-menu
            :default-active="$route.path"
            @open="handleOpen"
            @close="handleClose"
            active-text-color="#ffd04b"
            :unique-opened=true
            :collapse="isCollapse"
            :collapse-transition="false"
            router>
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i class="el-icon-menu" style="margin-right: 20px"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item @click="saveNavState('/' + subitem.path)" :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      menuList: [],
      isCollapse:false,
      activePath:''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push("/login")
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    zheCollapse(){
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    },

    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    }

  }
}
</script>

<style scoped lang="less">
.el-aside {
  background-color: #c2aaaa;
  .fold{
    background-color: #aa9797;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}

.el-main {
  background-color: #eaedf1;
}

.home-container {
  height: 100%;

  .home-header {
    background-color: #c1a9a9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 26px;
    margin-left: 0;

    div {
      display: flex;
      align-items: center;
    }
  }
}

</style>