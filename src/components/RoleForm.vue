<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin vai trò" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
        <a-form :model="role" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
          <a-form-item label="Tên vai trò" name="tenVaiTro">
            <a-input v-model:value="role.tenVaiTro" />
          </a-form-item>

          <a-form-item label="Phân quyền" name="phanQuyen">
              <a-input-number v-model:value="role.phanQuyen" placeholder="Nhập phân quyền" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import RoleService from "@/services/VaiTro.service";
import AuthService from "@/services/TaiKhoan.service"

const emit = defineEmits(['saved']);

const props = defineProps<{
  role?: {
    id: string,
    tenVaiTro: string,
    phanQuyen: string,
  },
}>();

const editRoleId = ref<string | null>(null);

const role = reactive({
  tenVaiTro: "",
  phanQuyen: "",
});

const formRef = ref();

const rules: Record<string, Rule[]> = {
  tenVaiTro: [
    { required: true, message: 'Xin nhập tên vai trò', trigger: 'change' },
    { min: 3, max: 50, message: 'Tên vai trò từ 3 đến 50 ký tự', trigger: 'blur' },
  ],
  phanQuyen: [
    { required: true, message: 'Xin nhập phân quyền', trigger: 'change' },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
};

const open = ref<boolean>(false);

const showModal = async (roleId?: string) => {
  if (roleId) {
    editRoleId.value = roleId;
    try {
      const roleData = await RoleService.getRoleById(roleId);
      role.tenVaiTro = roleData.tenVaiTro;
      role.phanQuyen = roleData.phanQuyen;
    } catch (err) {
      message.error("Không tải được vai trò để sửa");
      return;
    }
  } else {
    editRoleId.value = null;
  }

  open.value = true;
};


const handleOk = async () => {
  try {
    await formRef.value.validate();

    const payload = {
      tenVaiTro: role.tenVaiTro,
      phanQuyen: role.phanQuyen,
    };

    if (editRoleId.value) {
      await RoleService.updateRole(editRoleId.value, payload);
    } else {
      await RoleService.createRole(payload);
    }

    open.value = false;
    message.success(`${editRoleId.value ? 'Cập nhật' : 'Tạo'} vai trò thành công`);
    emit("saved");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error('Có lỗi xảy ra');
  }
};

defineExpose({ showModal });
</script>