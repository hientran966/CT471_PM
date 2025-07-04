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
        @click="openAvatarUpload"
        >
        </a-avatar>
        <a-space>
          <a-button type="primary" @click="handleEdit()"><EditOutlined /></a-button>
          <a-button type="primary" @click="handlePassword">Đổi mật khẩu</a-button>
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
          <p><strong>Phòng ban:</strong> {{ deptName }}</p>
          <p><strong>Vai trò:</strong> {{ roleName }}</p>
        </a-card>
      </a-space>
    </div>
  </div>
  <AccountForm ref="accountForm" @created="handleCreated"/>
  <PasswordForm ref="passwordForm"/>
  <FileForm ref="fileForm" :avatar="true" @created="reloadUser"/>
</template>

<script setup>
import { EditOutlined } from "@ant-design/icons-vue";
import AAvatar from "ant-design-vue/es/avatar";
import AButton from "ant-design-vue/es/button";
import ASpace from "ant-design-vue/es/space";
import ACard from "ant-design-vue/es/card";
import AccountForm from "@/components/AccountForm.vue";
import PasswordForm from "@/components/PasswordForm.vue";
import FileForm from "@/components/FileForm.vue"
import AuthService from "@/services/TaiKhoan.service";
import RoleService from "@/services/VaiTro.service"
import DepartmentService from "@/services/PhongBan.service";
import { ref, onMounted, computed } from "vue";

const user = ref({
  id: "",
  tenNV: "",
  email: "",
  SDT: "",
  diaChi: "",
  vaiTro: "",
});

const deptName = ref("");
const roleName = ref("");
const accountForm = ref(null);
const passwordForm = ref(null);
const fileForm = ref(null);

const avatar = computed(() => {
  return user.value.id ? `/api/auth/avatar/${user.value.id}` : undefined;
});

function handleEdit() {
  if (accountForm.value?.showModal) {
    accountForm.value.showModal({ ...user.value });
  }
}

function handlePassword() {
  if (passwordForm.value?.showModal) {
    passwordForm.value.showModal({ ...user.value });
  }
}

function handleCreated() {
  onMounted();
}

function openAvatarUpload() {
  if (fileForm.value?.showModal) {
    fileForm.value.showModal();
  } else {
    console.warn("fileForm chưa được khởi tạo");
  }
}

async function reloadUser() {
  window.location.reload();
}

onMounted(async () => {
  const currUser = await AuthService.getCurrentUser();
  if (currUser) {
    try {
      const data = await AuthService.getAccountById(currUser.id);
      Object.assign(user.value, data);

      const role = await RoleService.getRoleById(data.vaiTro);
      roleName.value = role.tenVaiTro;

      const dept = await DepartmentService.getDepartmentById(data.idPhong);
      deptName.value = dept.tenPhong;
    } catch (err) {
      console.error("Không lấy được thông tin tài khoản hoặc vai trò:", err);
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
