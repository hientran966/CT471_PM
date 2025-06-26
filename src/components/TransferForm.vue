<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Chuyển giao công việc"
      ok-text="Lưu"
      cancel-text="Thoát"
      @ok="handleOk"
    >
      <a-form
        :model="transfer"
        layout="vertical"
        @finish="handleOk"
        :rules="rules"
        ref="formRef"
      >
        <a-form-item label="Mô tả" name="moTa">
          <a-input v-model:value="transfer.moTa" />
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
            v-model:value="transfer.idNguoiNhan"
            placeholder="Chọn nhân viên"
            :loading="deptLoading"
            allow-clear
          >
            <a-select-option
              v-for="acc in accounts"
              :key="acc.id"
              :value="acc.id"
            >
              <span style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ acc.tenNV }}</span>
                <a-tag :color="getTagColor(acc.assignCount)">
                  {{ acc.assignCount }} công việc
                </a-tag>
              </span>
            </a-select-option>
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
const emit = defineEmits(["created"]);

const props = defineProps<{ assignId: string }>();

const formRef = ref();
const accounts = ref<{
  id: string;
  tenNV: string;
  assignCount: number;
}[]>([]);
const deptLoading = ref(false);
const open = ref<boolean>(false);
const departments = ref<{ id: string; tenPhong: string }[]>([]);
const selectedDept = ref<string | null>(null);

const transfer = reactive({
  moTa: "",
  idNguoiNhan: null as string | null,
  idNguoiGui: "",
});

function getTagColor(count: number) {
  if (count <= 2) return "green";
  if (count <= 5) return "gold";
  return "red";
}

const rules: Record<string, Rule[]> = {
  moTa: [
    { required: true, message: "Xin nhập mô tả", trigger: "blur" },
    { min: 3, max: 50, message: "Mô tả từ 3-50 ký tự", trigger: "blur" },
  ],
  idNguoiNhan: [{ required: true, message: "Chọn nhân viên", trigger: "change" }],
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
    const currentUser = await AuthService.getCurrentUser();
    transfer.idNguoiGui = currentUser.id;
    console.log("Submitting transfer:", props.assignId, toRaw(transfer));
    await AssignService.startTransfer(
      props.assignId,
      toRaw(transfer)
    );
    open.value = false;
    message.success("Gửi yêu cầu chuyển giao thành công", 5);
    emit("created");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error("Có lỗi xảy ra", 5);
  }
};

const fetchDepartments = async () => {
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

onMounted(fetchDepartments);

defineExpose({ showModal });
</script>
