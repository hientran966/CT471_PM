<template>
  <nav class="vertical-header bg-dark" v-if="isLogin" style="height: 100vh; width: 50px; position: fixed; top: 0; left: 0;">
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
import { UserOutlined, HomeOutlined, LogoutOutlined } from "@ant-design/icons-vue";
export default {
  components: {
    UserOutlined,
    HomeOutlined,
    LogoutOutlined,
  },
  data() {
    return {
      isLogin: false,
    };
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