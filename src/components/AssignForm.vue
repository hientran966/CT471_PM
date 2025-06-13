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
              <span style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ dept.tenNV }}</span>
                <a-tag :color="getTagColor(dept.assignCount)">
                  {{ dept.assignCount }} phân công đang thực hiện
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
            <a-select-option value="1">Thấp</a-select-option>
            <a-select-option value="2">Trung bình</a-select-option>
            <a-select-option value="3">Quan trọng</a-select-option>
            <a-select-option value="4">Rất quan trọng</a-select-option>
            <a-select-option value="5">Cực kỳ quan trọng</a-select-option>
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
import AuthService from "@/services/TaiKhoan.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

const props = defineProps<{ taskId: string }>();

const formRef = ref();
const accounts = ref<{
  id: string;
  tenNV: string;
  assignCount: number;
}[]>([]);
const deptLoading = ref(false);
const open = ref<boolean>(false);

const assign = reactive({
  moTa: "",
  doQuanTrong: null as number | null,
  idNguoiNhan: null as string | null,
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
  doQuanTrong: [
    { required: true, message: "Chọn độ quan trọng", trigger: "change" },
  ],
};

const resetForm = () => {
  assign.moTa = "";
  assign.doQuanTrong = null;
  assign.idNguoiNhan = null;
};

const showModal = () => {
  resetForm();
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    await AssignService.createAssignment({
      moTa: assign.moTa,
      doQuanTrong: assign.doQuanTrong,
      tienDoCaNhan: 0,
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
    const rawAccounts = await AuthService.getDepartmentAccounts(currentUser.id);

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
