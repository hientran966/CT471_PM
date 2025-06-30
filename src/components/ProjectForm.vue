<template>
  <div>
    <a-modal v-model:open="open" :title="project.id ? 'Chỉnh sửa dự án' : 'Tạo dự án'" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
      <a-form :model="project" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
        <a-form-item label="Tên dự án" name="tenDA">
          <a-input v-model:value="project.tenDA" />
        </a-form-item>

        <a-form-item label="Ngày bắt đầu" name="ngayBD">
          <a-date-picker v-model:value="project.ngayBD" style="width: 100%" :disabled-date="isDisabledDate" />
        </a-form-item>

        <a-form-item label="Ngày kết thúc" name="ngayKT">
          <a-date-picker v-model:value="project.ngayKT" style="width: 100%" :disabled-date="isDisabledDate" />
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
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import CalendarService from '@/services/LichNghi.service';
import ProjectService from "@/services/DuAn.service";
import AuthService from "@/services/TaiKhoan.service"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const emit = defineEmits(["created"]);

const props = defineProps<{
  projects?: any[],
  editingProject?: any | null,
}>();

// Form state
const project = reactive({
  id: null as number | null,
  tenDA: "",
  ngayBD: null as Dayjs | null,
  ngayKT: null as Dayjs | null,
  soNgay: null as number | null,
});

watch(() => props.editingProject, (val) => {
  if (val) {
    project.id = val.id;
    project.tenDA = val.tenDA;
    project.ngayBD = dayjs(val.ngayBD);
    project.ngayKT = dayjs(val.ngayKT);
    project.soNgay = val.soNgay || null;
  }
}, { immediate: true });

// Ngày nghỉ và ngày bù
const danhSachNgayNghi = ref<string[]>([]);
const danhSachNgayBu = ref<{ start: string, end: string }[]>([]);

const loadNgayNghi = async () => {
  const res = await CalendarService.getAllCalendars();
  const daysOff: string[] = [];
  const buDays: { start: string, end: string }[] = [];

  for (const item of res) {
    let start = dayjs(item.ngayBD);
    const end = dayjs(item.ngayKT);
    while (start.isSameOrBefore(end)) {
      daysOff.push(start.format("YYYY-MM-DD"));
      start = start.add(1, "day");
    }

    if (item.idNgayBu) {
      const ngayBu = await CalendarService.getNgayBuById(item.idNgayBu);
      if (ngayBu?.ngayBD && ngayBu?.ngayKT) {
        buDays.push({
          start: dayjs(ngayBu.ngayBD).format("YYYY-MM-DD"),
          end: dayjs(ngayBu.ngayKT).format("YYYY-MM-DD")
        });
      }
    }
  }

  danhSachNgayNghi.value = daysOff;
  danhSachNgayBu.value = buDays;
};

onMounted(loadNgayNghi);

// Xử lý ngày
const formatDate = (date: Dayjs) => dayjs(date).format("YYYY-MM-DD");

const isNgayLamViec = (date: Dayjs) => {
  const isWeekend = date.day() === 0 || date.day() === 6;
  const dateStr = formatDate(date);
  const isHoliday = danhSachNgayNghi.value.includes(dateStr);

  if (!isHoliday && !isWeekend) return true;

  const isMakeUpDay = danhSachNgayBu.value.some(({ start, end }) => {
    return dayjs(dateStr).isSameOrAfter(start) && dayjs(dateStr).isSameOrBefore(end);
  });

  return isMakeUpDay;
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

// Tự động tính
watch(() => [project.soNgay, project.ngayBD], () => {
  if (project.soNgay && project.ngayBD) tinhNgayKT();
});
watch(() => [project.ngayBD, project.ngayKT], () => {
  if (project.ngayBD && project.ngayKT) tinhSoNgay();
});

// Validate
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

// Modal và xử lý
const open = ref(false);
const formRef = ref();

const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(project, {
    id: null,
    tenDA: "",
    ngayBD: null,
    ngayKT: null,
    soNgay: null,
  });
};

const showModal = () => {
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    const currentUser = await AuthService.getCurrentUser();

    const payload = {
      tenDA: project.tenDA,
      ngayBD: formatDate(project.ngayBD),
      ngayKT: formatDate(project.ngayKT),
      soNgay: project.soNgay,
      idNguoiTao: currentUser.id,
    };

    if (project.id) {
      await ProjectService.updateProject(project.id, payload);
      message.success("Cập nhật dự án thành công");
    } else {
      await ProjectService.createProject(payload);
      message.success("Tạo dự án thành công");
    }

    open.value = false;
    emit("created");
  } catch (error) {
    console.error("Lỗi khi lưu dự án:", error);
    message.error("Đã xảy ra lỗi");
  }
};

defineExpose({ showModal });
</script>