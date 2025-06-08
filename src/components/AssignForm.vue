<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Phân công công việc"
      ok-text="Lưu"
      cancel-text="Thoát"
      @ok="handleOk"
    >
      <a-form
        :model="assign"
        layout="vertical"
        @finish="handleOk"
        :rules="rules"
        ref="formRef"
      >
        <a-form-item label="Mô tả" name="moTa">
          <a-input v-model:value="assign.moTa" />
        </a-form-item>

        <a-form-item label="Nhân viên đảm nhận" name="idNguoiNhan">
          <a-select
            v-model:value="assign.idNguoiNhan"
            placeholder="Chọn phòng ban"
            :loading="deptLoading"
            allow-clear
          >
            <a-select-option
              v-for="dept in accounts"
              :key="dept.id"
              :value="dept.id"
            >
              {{ dept.tenNV }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Độ quan trọng" name="doQuanTrong">
          <a-input-number
            v-model:value="assign.doQuanTrong"
            :min="1"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from "dayjs";
import { reactive, ref, toRaw, onMounted, watch } from "vue";
import type { Rule } from "ant-design-vue/es/form";
import { message } from "ant-design-vue";
import AssignService from "@/services/PhanCong.service";
import AuthService from "@/services/TaiKhoan.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

const props = defineProps<{ taskId: string }>();

const assign = reactive({
  moTa: "",
  doQuanTrong: null,
  idNguoiNhan: "",
});

const formRef = ref();
const accounts = ref<{ id: string; tenNV: string }[]>([]);
const deptLoading = ref(false);
const open = ref<boolean>(false);

const rules: Record<string, Rule[]> = {
  moTa: [
    { required: true, message: "Xin nhập mô tả", trigger: "change" },
    { min: 3, max: 50, message: "Mô tả từ 3 đến 50 ký tự", trigger: "blur" },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
};


const showModal = () => {
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    await AssignService.createAssignment({
      moTa: assign.moTa,
      doQuanTrong: assign.doQuanTrong,
      idNguoiNhan: assign.idNguoiNhan,
      idCongViec: props.taskId,
    });
    open.value = false;
    message.success("Cập nhật dự án thành công", 5);
    emit("created");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error("Có lỗi xảy ra", 5);
  }
};

const fetchDepartments = async () => {
  deptLoading.value = true;
  const currentUser = await AuthService.getCurrentUser();
  try {
    accounts.value = await AuthService.getDepartmentAccounts(currentUser.id);
  } finally {
    deptLoading.value = false;
  }
};

onMounted(fetchDepartments);

defineExpose({ showModal });
</script>
