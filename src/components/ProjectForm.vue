<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin dự án" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
        <a-form :model="project" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
          <a-form-item label="Tên dự án" name="tenDA">
            <a-input v-model:value="project.tenDA" />
          </a-form-item>

          <a-form-item label="Ngày bắt đầu" name="ngayBD">
            <a-date-picker v-model:value="project.ngayBD" style="width: 100%" :disabled-date="isDisabledDate"/>
          </a-form-item>

          <a-form-item label="Ngày kết thúc" name="ngayKT">
            <a-date-picker v-model:value="project.ngayKT" style="width: 100%" :disabled-date="isDisabledDate"/>
          </a-form-item>

          <a-form-item label="Số ngày làm việc" name="soNgay">
            <a-input-number v-model:value="project.soNgay" :min="1" style="width: 100%" />
          </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from 'dayjs';
import { reactive, ref, toRaw, onMounted, watch } from 'vue';
import type { UnwrapRef } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import CalendarService from '@/services/LichNghi.service';
import ProjectService from "@/services/DuAn.service";
import AuthService from "@/services/TaiKhoan.service"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

//Xử lý ngày nghỉ
const project = reactive({
  tenDA: "",
  ngayBD: null,
  ngayKT: null,
  soNgay: null,
});

const danhSachNgayNghi = ref([]);

const loadNgayNghi = async () => {
  const res = await CalendarService.getAllCalendars();
  const daysOff: string[] = [];

  res.forEach(item => {
    let start = dayjs(item.ngayBD);
    const end = dayjs(item.ngayKT);

    while (start.isSameOrBefore(end)) {
      daysOff.push(start.format("YYYY-MM-DD"));
      start = start.add(1, "day");
    }
  });

  danhSachNgayNghi.value = daysOff;
};

onMounted(loadNgayNghi);

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

const isNgayLamViec = (date: Dayjs) => {
  const isWeekend = date.day() === 0 || date.day() === 6;
  const isHoliday = danhSachNgayNghi.value.includes(formatDate(date));
  return !isWeekend && !isHoliday;
};

const isDisabledDate = (current: Dayjs) => {
  return !isNgayLamViec(current);
};

const tinhNgayKT = () => {
  if (!project.soNgay || !project.ngayBD) return;

  let current = dayjs(project.ngayBD);
  let count = 0;

  while (count < project.soNgay) {
    if (isNgayLamViec(current)) {
      count++;
      if (count === project.soNgay) break;
    }
    current = current.add(1, "day");
  }

  project.ngayKT = current;
};

const tinhSoNgay = () => {
  if (!project.ngayBD || !project.ngayKT) return;
  let current = dayjs(project.ngayBD);
  const end = dayjs(project.ngayKT);
  let count = 0;
  while (current.isSameOrBefore(end)) {
    if (isNgayLamViec(current)) count++;
    current = current.add(1, "day");
  }
  project.soNgay = count;
};

// Tự động tính khi dữ liệu thay đổi
watch(() => [project.soNgay, project.ngayBD], ([s, b]) => {
  if (s && b) tinhNgayKT();
});
watch(() => [project.ngayBD, project.ngayKT], ([b, k]) => {
  if (b && k) tinhSoNgay();
});

//Xử lý form
interface FormState {
  tenDA: string;
  ngayBD: Dayjs | undefined;
  ngayKT: Dayjs | undefined;
  soNgay: number | 0;

}
const formRef = ref();

const rules: Record<string, Rule[]> = {
  tenDA: [
    { required: true, message: 'Xin nhập tên dự án', trigger: 'change' },
    { min: 3, max: 50, message: 'Tên dự án từ 3 đến 50 ký tự', trigger: 'blur' },
  ],
  ngayBD: [
    { required: true, message: 'Xin chọn ngày bắt đầu', trigger: 'change', type: 'object' }
  ],
  ngayKT: [
    { required: true, message: 'Xin chọn ngày kết thúc', trigger: 'change', type: 'object' },
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!value) return Promise.resolve();
        if (project.ngayBD && value.isBefore(project.ngayBD)) {
          return Promise.reject('Ngày kết thúc không được trước ngày bắt đầu!');
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
};

const props = defineProps<{ projects?: any[] }>();
const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    const currentUser = await AuthService.getCurrentUser();
    await ProjectService.createProject({
      tenDA: project.tenDA,
      ngayBD: formatDate(project.ngayBD),
      ngayKT: formatDate(project.ngayKT),
      idNguoiTao: currentUser.id,
    });
    open.value = false;
    message.success('Cập nhật dự án thành công', 5);
    emit("created");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error('Có lỗi xảy ra', 5);
  }
};

defineExpose({ showModal });
</script>