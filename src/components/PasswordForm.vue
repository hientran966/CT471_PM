<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Đổi mật khẩu"
      ok-text="Lưu"
      cancel-text="Thoát"
      @ok="handleOk"
      destroyOnClose
    >
      <a-form
        ref="formRef"
        :model="user"
        layout="vertical"
        :rules="rules"
        @finish="handleOk"
      >
        <a-form-item label="Mật khẩu hiện tại" name="Password">
          <a-input-password
            v-model:value="user.Password"
            autocomplete="new-password"
          />
        </a-form-item>

        <a-form-item label="Mật khẩu mới" name="newPassword">
          <a-input-password
            v-model:value="user.newPassword"
            autocomplete="new-password"
          />
        </a-form-item>

        <a-form-item label="Xác nhận mật khẩu mới" name="confirmPassword">
          <a-input-password
            v-model:value="user.confirmPassword"
            autocomplete="new-password"
          />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import type { Rule } from "ant-design-vue/es/form";
import { message } from "ant-design-vue";
import AccountService from "@/services/TaiKhoan.service";

const emit = defineEmits(["created"]);

const user = reactive({
  Password: "",
  newPassword: "",
  confirmPassword: "",
});

const formRef = ref();
const open = ref(false);
const editUserId = ref(null);

const userData = JSON.parse(localStorage.getItem("user") || "{}");

const rules: Record<string, Rule[]> = {
  Password: [
    { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
  ],
  newPassword: [
    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
    { min: 8, message: "Mật khẩu mới phải có ít nhất 8 ký tự!" },
  ],
  confirmPassword: [
    { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
    {
      validator: (_, value) => {
        if (value !== user.newPassword) {
          return Promise.reject("Mật khẩu xác nhận không khớp!");
        }
        return Promise.resolve();
      },
    },
  ],
};

const showModal = (record?: any) => {
  if (record) {
    editUserId.value = record.id;
    Object.assign(user, record);
  }
  open.value = true;
};


const handleOk = async () => {
  try {
    await formRef.value.validate();

    const payload = { ...user };
    await AccountService.changePassword(
      editUserId.value || userData.id,
      payload.Password,
      payload.newPassword
    );
    message.success("Cập nhật thành công!");
    open.value = false;
    emit("created");
  } catch (err) {
  const errorMessage = err?.response?.data?.message || err?.message || "Có lỗi, vui lòng kiểm tra lại";
  message.error("Thất bại: " + errorMessage);
  }
};

defineExpose({ showModal });
</script>
