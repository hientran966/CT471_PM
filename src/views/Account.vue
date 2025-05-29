<template>
<div class="row" style="display: flex; justify-content: center; align-items: center; width: calc(100vw - 50px); height: 200px; background-color: rgb(255, 208, 208); position: relative;">
    <a-avatar :size="150" style="margin-left: 20px;">
        <template #icon><UserOutlined /></template>
    </a-avatar>
    <a-button type="primary" style="margin-left: 20px;">Cập nhật thông tin</a-button>
    <a-button type="primary" style="margin-left: 20px;">Đổi mật khẩu</a-button>
</div>
<div class="row" style="display: flex; justify-content: center; align-items: center; width: calc(100vw - 50px);">
    <a-space direction="vertical" style="width: 80%;">
        <a-card style="margin-top: 20px;">
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
</template>

<script setup>
import { UserOutlined } from "@ant-design/icons-vue";
import AAvatar from "ant-design-vue/es/avatar";
import AButton from "ant-design-vue/es/button";
import ASpace from "ant-design-vue/es/space";
import ACard from "ant-design-vue/es/card";
import AuthService from "@/services/TaiKhoan.service";
import { ref, onMounted } from "vue";

const user = ref({
  tenNV: "",
  email: "",
  SDT: "",
  diaChi: "",
  vaiTro: "",
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
        box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    }
</style>
