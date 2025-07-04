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

        <a-form-item label="Phòng ban" name="idPhong">
          <a-select
            v-model:value="selectedDept"
            placeholder="Chọn phòng ban"
            @change="fetchAccountsByDept"
            allow-clear
            :loading="deptLoading"
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

        <a-form-item label="Nhân viên đảm nhận" name="idNguoiNhan">
          <a-select
            :mode="isEditMode ? undefined : 'multiple'"
            v-model:value="assign.idNguoiNhan"
            placeholder="Chọn nhân viên"
            :loading="deptLoading"
            allow-clear
          >
            <a-select-option
              v-for="dept in accounts"
              :key="dept.id"
              :value="dept.id"
            >
              <span style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ dept.tenNV }}</span>
                <a-tag :color="getTagColor(dept.assignCount)">
                  {{ dept.assignCount }} công việc đang thực hiện
                </a-tag>
              </span>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Độ quan trọng" name="doQuanTrong">
          <a-select
            v-model:value="assign.doQuanTrong"
            placeholder="Chọn độ quan trọng"
            allow-clear
          >
            <a-select-option :value="1">Thấp</a-select-option>
            <a-select-option :value="2">Trung bình</a-select-option>
            <a-select-option :value="3">Quan trọng</a-select-option>
            <a-select-option :value="4">Rất quan trọng</a-select-option>
            <a-select-option :value="5">Cực kỳ quan trọng</a-select-option>
          </a-select>
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
import DepartmentService from "@/services/PhongBan.service";
import AuthService from "@/services/TaiKhoan.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created", "updated"]);

const props = defineProps<{
  taskId: string;
  assignId?: string | null;
}>();

const formRef = ref();
const accounts = ref<{
  id: string;
  tenNV: string;
  assignCount: number;
}[]>([]);
const deptLoading = ref(false);
const open = ref<boolean>(false);
const isEditMode = ref(false);
const departments = ref<{ id: string; tenPhong: string }[]>([]);
const selectedDept = ref<string | null>(null);

const assign = reactive({
  moTa: "",
  doQuanTrong: null as number | null,
  idNguoiNhan: [] as string[],
});

function getTagColor(count: number) {
  if (count <= 2) return "green";
  if (count <= 5) return "gold";
  return "red";
}

const fetchDepartmentsList = async () => {
  deptLoading.value = true;
  try {
    const currentUser = await AuthService.getCurrentUser();
    const userDepts = await AuthService.getUserDepartment(currentUser.id);
    const allDepartments = await DepartmentService.getAllDepartments();
    const maxPermission = Math.max(...userDepts.map((d: any) => d.phanQuyen));

    departments.value = allDepartments.filter(
      (dept: any) => dept.phanQuyen <= maxPermission
    );
  } finally {
    deptLoading.value = false;
  }
};

const rules: Record<string, Rule[]> = {
  moTa: [
    { required: true, message: "Xin nhập mô tả", trigger: "blur" },
    { min: 3, max: 50, message: "Mô tả từ 3-50 ký tự", trigger: "blur" },
  ],
  idNguoiNhan: [
    { required: true, message: "Chọn ít nhất 1 nhân viên", trigger: "change" },
  ],
  doQuanTrong: [
    { required: true, message: "Chọn độ quan trọng", trigger: "change" },
  ],
};

const resetForm = () => {
  assign.moTa = "";
  assign.doQuanTrong = null;
  assign.idNguoiNhan = [];
};

const showModal = async () => {
  if (props.assignId) {
    const existingAssign = await AssignService.getAssignmentById(props.assignId);
    isEditMode.value = true;
    assign.moTa = existingAssign.moTa;
    assign.doQuanTrong = existingAssign.doQuanTrong;
    assign.idNguoiNhan = [existingAssign.idNguoiNhan];
  } else {
    isEditMode.value = false;
    resetForm();
  }

  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();

    if (isEditMode.value && props.assignId) {
      // Chế độ cập nhật
      await AssignService.updateAssignment(props.assignId, {
        moTa: assign.moTa,
        doQuanTrong: assign.doQuanTrong,
        idNguoiNhan: assign.idNguoiNhan,
      });
      message.success("Cập nhật phân công thành công", 5);
      emit("updated");

    } else {
      // Chế độ tạo mới
      const promises = assign.idNguoiNhan.map((userId) =>
        AssignService.createAssignment({
          moTa: assign.moTa,
          doQuanTrong: assign.doQuanTrong,
          tienDoCaNhan: 0,
          idNguoiNhan: userId,
          idCongViec: props.taskId,
        })
      );
      await Promise.all(promises);
      message.success("Tạo phân công thành công", 5);
      emit("created");
    }

    open.value = false;

  } catch (error) {
    console.warn("Validation failed:", error);
    message.error("Có lỗi xảy ra", 5);
  }
};

const fetchAccountsByDept = async (deptId: string) => {
  deptLoading.value = true;
  try {
    const rawAccounts = await AuthService.getDepartmentAccounts(deptId);
    const results = await Promise.all(
      rawAccounts.map(async (acc: any) => {
        const res = await AuthService.getAssignNumber(acc.id);
        return {
          ...acc,
          assignCount: Number(res.count) || 0,
        };
      })
    );
    accounts.value = results.sort((a, b) => b.assignCount - a.assignCount);
  } finally {
    deptLoading.value = false;
  }
};

onMounted(() => {
  fetchDepartmentsList();
});

defineExpose({ showModal });
</script>
