<template>
  <div class="row account-row">
    <div class="col-4 account-left">
      <a-space
        direction="vertical"
        style="justify-content: center"
        size="middle"
      >
      <br>
        <a-avatar
        :src="avatar"
        :size="150"
        :style="!avatar ? { backgroundColor: '#1890ff' } : undefined"
        >
        </a-avatar>
        <a-space>
          <a-button type="primary"><EditOutlined /></a-button>
          <a-button type="primary">Đổi mật khẩu</a-button>
        </a-space>
      </a-space>
    </div>
    <div class="col-8 account-right">
      <a-space direction="vertical" style="width: 100%; height: 100vh">
        <a-card style="margin-top: 20px; height: 100%">
          <template #title>
            <strong>Thông tin cá nhân</strong>
          </template>
          <p><strong>Tên:</strong> {{ user.tenNV }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Số điện thoại:</strong> {{ user.SDT }}</p>
          <p><strong>Địa chỉ:</strong> {{ user.diaChi }}</p>
          <p><strong>Vai trò:</strong> {{ user.vaiTro }}</p>
        </a-card>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { EditOutlined } from "@ant-design/icons-vue";
import AAvatar from "ant-design-vue/es/avatar";
import AButton from "ant-design-vue/es/button";
import ASpace from "ant-design-vue/es/space";
import ACard from "ant-design-vue/es/card";
import AuthService from "@/services/TaiKhoan.service";
import { ref, onMounted, computed } from "vue";

const user = ref({
  id: "",
  tenNV: "",
  email: "",
  SDT: "",
  diaChi: "",
  vaiTro: "",
});

const avatar = computed(() => {
  return user.value.id ? `/api/auth/avatar/${user.value.id}` : undefined;
});

onMounted(async () => {
  const email = localStorage.getItem("user");
  if (email) {
    try {
      const data = await AuthService.getCurrentUser();
      Object.assign(user.value, data);
    } catch (err) {
      console.error("Không lấy được thông tin tài khoản:", err);
    }
  }
});
</script>

<style scoped>
.ant-card {
  border-radius: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.row {
  margin-bottom: 16px;
}

a-avatar {
  background-color: #f5f5f5;
}

a-button {
  font-weight: 500;
}

a-card {
  transition: box-shadow 0.3s;
}

a-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.account-row {
  display: flex;
  width: 100%;
  height: 100vh;
  margin-left: 0;
}

.account-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-image: url("@/assets/background.jpg");
  background-size: cover;
  background-color: rgb(255, 208, 208);
  flex: 1 1 0;
  min-width: 200px;
  min-height: 100vh;
}

.account-right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 2 1 0;
  min-width: 300px;
  min-height: 100vh;
}
</style>
