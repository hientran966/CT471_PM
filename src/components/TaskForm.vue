<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin công việc" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
        <a-form :model="task" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
          <a-form-item label="Tên công việc" name="tenCV">
            <a-input v-model:value="task.tenCV" />
          </a-form-item>

          <a-row :gutter="16">
            <a-col :span="8"> 
              <a-form-item label="Ngày bắt đầu" name="ngayBD">
                <a-date-picker v-model:value="task.ngayBD" style="width: 100%" :disabled-date="isDisabledDate"/>
              </a-form-item>
            </a-col>

            <a-col :span="8"> 
              <a-form-item label="Ngày kết thúc" name="ngayKT">
                <a-date-picker v-model:value="task.ngayKT" style="width: 100%" :disabled-date="isDisabledDate"/>
              </a-form-item>
            </a-col>

            <a-col :span="4"> 
              <a-form-item label="Số ngày" name="soNgay">
                <a-input-number v-model:value="task.soNgay" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="Mô tả" name="moTa">
            <a-textarea v-model:value="task.moTa" :rows="4"/>
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
import TaskService from "@/services/CongViec.service";
import AuthService from "@/services/TaiKhoan.service"
import ProjectService from "@/services/DuAn.service"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
const emit = defineEmits(['saved']);

const props = defineProps<{
  task?: {
    id: string,
    tenCV: string,
    ngayBD: string,
    ngayKT: string,
    tienDo: number,
    moTa: Text
  },
  projectId
}>();

const editTaskId = ref<string | null>(null);
const project = ref();

//Xử lý ngày nghỉ
const task = reactive({
  tenCV: "",
  ngayBD: null,
  ngayKT: null,
  soNgay: null,
  moTa: ""
});

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

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

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
  if (!task.soNgay || !task.ngayBD) return;

  let current = dayjs(task.ngayBD);
  let count = 0;

  while (count < task.soNgay) {
    if (isNgayLamViec(current)) {
      count++;
      if (count === task.soNgay) break;
    }
    current = current.add(1, "day");
  }

  task.ngayKT = current;
};

const tinhSoNgay = () => {
  if (!task.ngayBD || !task.ngayKT) return;
  let current = dayjs(task.ngayBD);
  const end = dayjs(task.ngayKT);
  let count = 0;
  while (current.isSameOrBefore(end)) {
    if (isNgayLamViec(current)) count++;
    current = current.add(1, "day");
  }
  task.soNgay = count;
};

// Tự động tính khi dữ liệu thay đổi
watch(() => [task.soNgay, task.ngayBD], ([s, b]) => {
  if (s && b) tinhNgayKT();
});
watch(() => [task.ngayBD, task.ngayKT], ([b, k]) => {
  if (b && k) tinhSoNgay();
});

//Xử lý form
interface FormState {
  tenCV: string;
  ngayBD: Dayjs | undefined;
  ngayKT: Dayjs | undefined;
  soNgay: number | 0;

}
const formRef = ref();

const rules: Record<string, Rule[]> = {
  tenCV: [
    { required: true, message: 'Xin nhập tên công việc', trigger: 'change' },
    { min: 3, max: 50, message: 'Tên công việc từ 3 đến 50 ký tự', trigger: 'blur' },
  ],
  ngayBD: [
    { required: true, message: 'Xin chọn ngày bắt đầu', trigger: 'change', type: 'object' },
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!value || !project.value) return Promise.resolve();
        if (value.isBefore(project.value.ngayBD)) {
          return Promise.reject('Ngày bắt đầu không được trước ngày bắt đầu của dự án');
        }
        if (value.isAfter(project.value.ngayKT)) {
          return Promise.reject('Ngày bắt đầu không được sau ngày kết thúc của dự án');
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ],

  ngayKT: [
    { required: true, message: 'Xin chọn ngày kết thúc', trigger: 'change', type: 'object' },
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!value || !task.ngayBD || !project.value) return Promise.resolve();

        if (value.isBefore(task.ngayBD)) {
          return Promise.reject('Ngày kết thúc không được trước ngày bắt đầu công việc!');
        }
        if (value.isAfter(project.value.ngayKT)) {
          return Promise.reject('Ngày kết thúc không được sau ngày kết thúc của dự án!');
        }
        if (value.isBefore(project.value.ngayBD)) {
          return Promise.reject('Ngày kết thúc không được trước ngày bắt đầu của dự án!');
        }

        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

const resetForm = () => {
  formRef.value.resetFields();
};

const open = ref<boolean>(false);

const showModal = async (taskId?: string) => {
  project.value = await ProjectService.getProjectById(props.projectId);
  project.value.ngayBD = dayjs(project.value.ngayBD);
  project.value.ngayKT = dayjs(project.value.ngayKT);

  if (taskId) {
    editTaskId.value = taskId;
    try {
      const taskData = await TaskService.getTaskById(taskId);
      task.tenCV = taskData.tenCV;
      task.moTa = taskData.moTa;
      task.ngayBD = dayjs(taskData.ngayBD);
      task.ngayKT = dayjs(taskData.ngayKT);
      tinhSoNgay();
    } catch (err) {
      message.error("Không tải được công việc để sửa");
      return;
    }
  } else {
    editTaskId.value = null;
    task.tenCV = "";
    task.moTa = "";
    task.ngayBD = null;
    task.ngayKT = null;
    task.soNgay = null;
  }

  open.value = true;
};


const handleOk = async () => {
  try {
    await formRef.value.validate();
    const currentUser = await AuthService.getCurrentUser();

    const payload = {
      tenCV: task.tenCV,
      moTa: task.moTa ?? null,
      ngayBD: formatDate(task.ngayBD),
      ngayKT: formatDate(task.ngayKT),
      idNguoiTao: currentUser.id,
      idDuAn: props.projectId,
    };

    if (editTaskId.value) {
      await TaskService.updateTask(editTaskId.value, payload);
    } else {
      await TaskService.createTask(payload);
    }

    open.value = false;
    message.success(`${editTaskId.value ? 'Cập nhật' : 'Tạo'} công việc thành công`);
    emit("saved");
  } catch (error) {
    console.warn("Validation failed:", error);
    message.error('Có lỗi xảy ra');
  }
};

defineExpose({ showModal });
</script>