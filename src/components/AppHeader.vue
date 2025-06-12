<template>
  <nav class="vertical-header bg-dark" v-if="isLogin" style="height: 100vh; width: 60px; position: fixed; top: 0; left: 0; background-attachment: fixed;">
    <div class="navbar-nav flex-column" style="flex: 1;">
      <div class="nav-item">
        <router-link :to="{ name: 'login' }" class="nav-link" style="color: #fff;">
            <HomeOutlined style="font-size: 30px; text-align: center; margin-top: 10px; margin-left: 10px;"/>
        </router-link>
      </div>
    </div>
    <div class="navbar-nav flex-column" style="flex: 1;">
      <div class="nav-item">
        <router-link :to="{ name: 'account' }" class="nav-link" style="color: #fff;">
          <UserOutlined style="font-size: 30px; text-align: center; margin-top: 10px; margin-left: 10px;"/>
        </router-link>
      </div>
    </div>
    <div class="navbar-nav flex-column" style="flex: 1;">
      <div class="nav-item">
        <router-link :to="{ name: 'project' }" class="nav-link" style="color: #fff;">
          <FolderOutlined style="font-size: 30px; text-align: center; margin-top: 10px; margin-left: 10px;"/>
        </router-link>
      </div>
    </div>
    <div class="navbar-nav flex-column" style="margin-bottom: 20px; position: absolute; bottom: 50px; width: 100%;" v-if="isAdmin">
      <div class="nav-item">
        <router-link :to="{ name: 'admin' }" class="nav-link" style="color: #fff;">
            <SolutionOutlined style="font-size: 30px; text-align: center; margin-top: 10px; margin-left: 10px;"/>
        </router-link>
      </div>
    </div>
    <div class="navbar-nav flex-column" style="margin-bottom: 20px; position: absolute; bottom: 0; width: 100%;">
      <div class="nav-item" v-if="isLogin">
      <a class="nav-link" @click="logout" style="color: #fff;">
        <LogoutOutlined style="font-size: 30px; text-align: center; margin-top: 10px; margin-left: 10px;"/>
      </a>
      </div>
    </div>
  </nav>
</template>

<script>
import { UserOutlined, HomeOutlined, LogoutOutlined, FolderOutlined, SolutionOutlined } from "@ant-design/icons-vue";
export default {
  components: {
    UserOutlined,
    HomeOutlined,
    LogoutOutlined,
    FolderOutlined,
    SolutionOutlined
  },
  data() {
    return {
      isLogin: false,
    };
  },
  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user && user.admin == 1;
    },

  },
  created() {
    this.checkLogin();
  },
  methods: {
    checkLogin() {
      const user = JSON.parse(localStorage.getItem("user"));
      this.isLogin = !!user;
    },
    logout() {
      localStorage.removeItem("user");
      this.isLogin = false;
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
</style>