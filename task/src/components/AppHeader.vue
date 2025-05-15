<template>
  <nav class="navbar navbar-expand navbar-dark bg-dark"  v-if="isLogin">
    <a href="/" class="navbar-brand"></a>
    <div class="mr-auto navbar-nav">
      <div class="nav-item">
        <router-link :to="{ name: 'login' }" class="nav-link">
          Sách <i class="fas fa-book"></i>
        </router-link>
      </div>
    </div>
    <div class="ml-auto navbar-nav">
      <div class="nav-item" v-if="isLogin">
        <button @click="logout" class="btn btn-danger">Đăng xuất</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
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
