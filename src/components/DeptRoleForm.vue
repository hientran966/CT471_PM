<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin loại phòng ban" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
        <a-form :model="role" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
          <a-form-item label="Loại phòng ban" name="loaiPhongBan">
            <a-input v-model:value="role.loaiPhongBan" />
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
import DeptRoleService from "@/services/LoaiPhongBan.service";
import AuthService from "@/services/TaiKhoan.service"

const emit = defineEmits(['saved']);

const props = defineProps<{
  role?: {
    id: string,
    loaiPhongBan: string,
    phanQuyen: string,
  },
}>();

const editRoleId = ref<string | null>(null);

const role = reactive({
  loaiPhongBan: "",
  phanQuyen: "",
});

const formRef = ref();

const rules: Record<string, Rule[]> = {
  loaiPhongBan: [
    { required: true, message: 'Xin nhập loại phòng ban', trigger: 'change' },
    { min: 3, max: 50, message: 'Tên loại phòng ban từ 3 đến 50 ký tự', trigger: 'blur' },
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
      const roleData = await DeptRoleService.getDeptRoleById(roleId);
      role.loaiPhongBan = roleData.loaiPhongBan;
      role.phanQuyen = roleData.phanQuyen;
    } catch (err) {
      message.error("Không tải được loại phòng ban để sửa");
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
      loaiPhongBan: role.loaiPhongBan,
      phanQuyen: role.phanQuyen,
    };

    if (editRoleId.value) {
      await DeptRoleService.updateDeptRole(editRoleId.value, payload);
    } else {
      await DeptRoleService.createDeptRole(payload);
    }

    open.value = false;
    message.success(`${editRoleId.value ? 'Cập nhật' : 'Tạo'} loại phòng ban thành công`);
    emit("saved");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error('Có lỗi xảy ra');
  }
};

defineExpose({ showModal });
</script>