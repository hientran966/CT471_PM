<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin phòng ban" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
        <a-form :model="department" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
          <a-form-item label="Tên phòng ban" name="tenPhong">
            <a-input v-model:value="department.tenPhong" />
          </a-form-item>

          <a-form-item label="Phân quyền" name="phanQuyen">
              <a-select v-model:value="department.phanQuyen" placeholder="Chọn phân quyền">
                <a-select-option value="Cao">Cao</a-select-option>
                <a-select-option value="Trung">Trung</a-select-option>
                <a-select-option value="Thấp">Thấp</a-select-option>
              </a-select>
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import DepartmentService from "@/services/PhongBan.service";
import AuthService from "@/services/TaiKhoan.service"

const emit = defineEmits(['saved']);

const props = defineProps<{
  department?: {
    id: string,
    tenPhong: string,
    phanQuyen: string,
  },
}>();

const editDepartmentId = ref<string | null>(null);

const department = reactive({
  tenPhong: "",
  phanQuyen: "",
});

const formRef = ref();

const rules: Record<string, Rule[]> = {
  tenPhong: [
    { required: true, message: 'Xin nhập tên phòng ban', trigger: 'change' },
    { min: 3, max: 50, message: 'Tên phòng ban từ 3 đến 50 ký tự', trigger: 'blur' },
  ],
  phanQuyen: [
    { required: true, message: 'Xin chọn phân quyền', trigger: 'change' },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
};

const open = ref<boolean>(false);

const showModal = async (departmentId?: string) => {
  if (departmentId) {
    editDepartmentId.value = departmentId;
    try {
      const departmentData = await DepartmentService.getDepartmentById(departmentId);
      department.tenPhong = departmentData.tenPhong;
      department.phanQuyen = departmentData.phanQuyen;
    } catch (err) {
      message.error("Không tải được phòng ban để sửa");
      return;
    }
  } else {
    editDepartmentId.value = null;
  }

  open.value = true;
};


const handleOk = async () => {
  try {
    await formRef.value.validate();

    const payload = {
      tenPhong: department.tenPhong,
      phanQuyen: department.phanQuyen,
    };

    if (editDepartmentId.value) {
      await DepartmentService.updateDepartment(editDepartmentId.value, payload);
    } else {
      await DepartmentService.createDepartment(payload);
    }

    open.value = false;
    message.success(`${editDepartmentId.value ? 'Cập nhật' : 'Tạo'} phòng ban thành công`);
    emit("saved");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error('Có lỗi xảy ra');
  }
};

defineExpose({ showModal });
</script>