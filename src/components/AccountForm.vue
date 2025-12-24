<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Thông tin người dùng    "
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
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Họ và tên" name="tenNV">
              <a-input v-model:value="user.tenNV" />
            </a-form-item>

            <a-form-item label="Email" name="email">
              <a-input v-model:value="user.email" :disabled="!isAdmin"/>
            </a-form-item>

            <a-form-item v-if="!isEditMode || isAdmin" label="Mật khẩu" name="Password" :rules="passwordRules">
              <a-input-password
                v-model:value="user.Password"
                autocomplete="new-password"
              />
            </a-form-item>

            <a-form-item label="Vai trò" name="vaiTro">
              <a-select
                v-model:value="user.vaiTro"
                placeholder="Chọn vai trò"
                :disabled="!isAdmin"
                :loading="roles.length === 0"
                allow-clear
              >
                <a-select-option
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.id"
                >
                  {{ role.tenVaiTro }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="Giới tính" name="gioiTinh">
              <a-radio-group v-model:value="user.gioiTinh" :disabled="!isAdmin">
                <a-radio value="Nam">Nam</a-radio>
                <a-radio value="Nữ">Nữ</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="SĐT" name="SDT">
              <a-input v-model:value="user.SDT" />
            </a-form-item>

            <a-form-item label="Địa chỉ" name="diaChi">
              <a-input v-model:value="user.diaChi" />
            </a-form-item>

            <a-form-item label="Phòng ban" name="idPhong">
              <a-select
                v-model:value="user.idPhong"
                placeholder="Chọn phòng ban"
                :loading="deptLoading"
                :disabled="!isAdmin"
                allow-clear
              >
                <a-select-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.tenPhong }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Quyền admin">
              <a-switch
                v-model:checked="user.admin"
                :checked-value="1"
                :un-checked-value="0"
                :disabled="!isAdmin"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import type { Rule } from "ant-design-vue/es/form";
import { message } from "ant-design-vue";

import AccountService from "@/services/TaiKhoan.service";
import DepartmentService from "@/services/PhongBan.service";
import RoleService from "@/services/VaiTro.service";

const emit = defineEmits(["created"]);

const user = reactive({
  tenNV: "",
  admin: 0,
  email: "",
  Password: "",
  vaiTro: "",
  gioiTinh: "",
  SDT: "",
  diaChi: "",
  idPhong: "",
});

const formRef = ref();
const open = ref(false);
const isEditMode = ref(false);
const editUserId = ref(null);

const departments = ref<{ id: string; tenPhong: string }[]>([]);
const roles = ref<{ id: string; tenVaiTro: string }[]>([]);
const deptLoading = ref(false);

const userData = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = computed(() => userData.admin === 1);

const rules: Record<string, Rule[]> = {
  tenNV: [
    { required: true, message: "Xin nhập tên người dùng", trigger: "blur" },
    { min: 3, max: 50, message: "Tên từ 3–50 ký tự", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Xin nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: "blur" },
  ],
  SDT: [
    { pattern: /^[0-9]{9,11}$/, message: "SĐT 9–11 chữ số", trigger: "blur" },
  ],
  idPhong: [{ required: true, message: "Chọn phòng ban", trigger: "change" }],
  vaiTro: [{ required: true, message: "Chọn vai trò", trigger: "change" }],
};

const passwordRules = computed(() =>
  isEditMode.value
    ? []
    : [{ required: true, message: "Nhập mật khẩu", trigger: "blur" }]
);


const showModal = (record?: any) => {
  if (record) {
    isEditMode.value = true;
    editUserId.value = record.id;
    Object.assign(user, record);
  } else {
    isEditMode.value = false;
    editUserId.value = null;
    Object.assign(user, {
      tenNV: "",
      admin: 0,
      email: "",
      Password: "",
      vaiTro: "",
      gioiTinh: "",
      SDT: "",
      diaChi: "",
      idPhong: "",
    });
  }
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();

    const payload = { ...user };

    if (isEditMode.value && !payload.Password) {
      delete payload.Password;
    }
    if (isEditMode.value) {
      await AccountService.updateAccount(editUserId.value, payload);
      message.success("Cập nhật thành công!");
    } else {
      await AccountService.createAccount(payload);
      message.success("Tạo người dùng thành công!");
    }

    open.value = false;
    emit("created");
  } catch (err) {
    message.error("Có lỗi, vui lòng kiểm tra lại");
  }
};

const fetchDepartments = async () => {
  deptLoading.value = true;
  try {
    departments.value = await DepartmentService.getAllDepartments();
  } finally {
    deptLoading.value = false;
  }
};
const fetchRoles = async () => {
  try {
    roles.value = await RoleService.getAllRoles();
  } catch (err) {
    message.error("Không tải được vai trò");
  }
};

onMounted(() => {
  fetchDepartments();
  fetchRoles();
});

defineExpose({ showModal });
</script>
