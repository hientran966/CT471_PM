<template>
  <div class="page">
    <h4>Đăng Nhập</h4>
    <LoginForm
      :loginInfo="loginInfo"
      @submit:login="login"
    />
    <p>{{ message }}</p>
  </div>
</template>
<script>
import LoginForm from "@/components/LoginForm.vue";
import AuthService from "@/services/TaiKhoan.service";
export default {
  components: {
    LoginForm,
  },
  data() {
    return {
      loginInfo: {
        email: "",
        Password: "",
      },
      message: "",
    };
  },
  methods: {
    async login(loginData) {
      try {
        const user = await AuthService.login(loginData.email, loginData.Password);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          window.location.reload()
        } else {
          this.message = "Tên đăng nhập hoặc mật khẩu không đúng!";
        }
      } catch (error) {
        this.message = error.response?.data?.message || "Lỗi khi đăng nhập. Vui lòng thử lại!";
        console.error("Lỗi đăng nhập:", error);
      }
    }
  },
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  position: fixed;
  top: 10%;
  left: 35%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 400px;
  height: 500px;
}

h4 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #000000;
}

.register-link a {
  color: #ff0000;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.message {
  color: red;
  margin-top: 10px;
}
</style>