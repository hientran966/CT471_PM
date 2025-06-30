<template>
  <nav
    class="vertical-header bg-dark"
    v-if="isLogin"
    style="height: 100vh; width: 60px; position: fixed; top: 0; left: 0;"
  >
    <!-- Trang chủ -->
    <div class="nav-item">
      <router-link
        :to="{ name: 'login' }"
        class="nav-link"
        exact
      >
        <HomeOutlined class="icon" />
      </router-link>
    </div>

    <!-- Tài khoản -->
    <div class="nav-item">
      <router-link
        :to="{ name: 'account' }"
        class="nav-link"
        exact
      >
        <UserOutlined class="icon" />
      </router-link>
    </div>

    <!-- Dự án -->
    <div class="nav-item">
      <router-link
        :to="{ name: 'project' }"
        class="nav-link"
        exact
      >
        <FolderOutlined class="icon" />
      </router-link>
    </div>

    <!-- Quản trị (chỉ admin) -->
    <div
      class="nav-item"
      style="position: absolute; bottom: 50px; width: 100%;"
      v-if="isAdmin"
    >
      <router-link
        :to="{ name: 'admin' }"
        class="nav-link"
        exact
      >
        <SolutionOutlined class="icon" />
      </router-link>
    </div>

    <!-- Đăng xuất -->
    <div
      class="nav-item"
      style="position: absolute; bottom: 0; width: 100%;"
    >
      <a class="nav-link" @click="logout">
        <LogoutOutlined class="icon" />
      </a>
    </div>
  </nav>
</template>

<script>
import {
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  FolderOutlined,
  SolutionOutlined
} from "@ant-design/icons-vue";

export default {
  components: {
    UserOutlined,
    HomeOutlined,
    LogoutOutlined,
    FolderOutlined,
    SolutionOutlined,
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
.nav-link {
  display: block;
  text-align: center;
  padding: 10px 0;
  color: #fff;
  transition: background 0.3s;
}

.nav-link:hover {
  background-color: #1d1d1d;
}

.router-link-exact-active {
  background-color: #1890ff;
  border-radius: 8px;
}

.icon {
  font-size: 30px;
  display: block;
  margin: 0 auto;
}
</style>