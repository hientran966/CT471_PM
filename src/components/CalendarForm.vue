<template>
  <div>
    <a-modal v-model:open="open" title="Thông tin lịch nghỉ" ok-text="Lưu"
      cancel-text="Thoát" @ok="handleOk">
      
      <a-form :model="calendar" layout="vertical" @finish="handleOk" :rules="rules" ref="formRef">
        
        <a-form-item label="Tiêu đề" name="tieuDe">
          <a-input v-model:value="calendar.tieuDe" />
        </a-form-item>

        <a-form-item label="Ngày bắt đầu" name="ngayBD">
          <a-date-picker v-model:value="calendar.ngayBD" style="width: 100%" />
        </a-form-item>

        <a-form-item label="Ngày kết thúc" name="ngayKT">
          <a-date-picker v-model:value="calendar.ngayKT" style="width: 100%" />
        </a-form-item>

        <!-- Switch chọn có ngày bù -->
        <a-form-item label="Có ngày bù">
          <a-switch v-model:checked="hasNgayBu" />
        </a-form-item>

        <!-- Ngày bù -->
        <a-form-item label="Ngày bắt đầu ngày bù" name="ngayBDBu">
          <a-date-picker 
            v-model:value="calendar.ngayBDBu" 
            style="width: 100%" 
            :disabled="!hasNgayBu" 
          />
        </a-form-item>

        <a-form-item label="Ngày kết thúc ngày bù" name="ngayKTBu">
          <a-date-picker 
            v-model:value="calendar.ngayKTBu" 
            style="width: 100%" 
            :disabled="!hasNgayBu" 
          />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from 'dayjs';
import { reactive, ref, toRaw, watch } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import CalendarService from '@/services/LichNghi.service';
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const emit = defineEmits(["created"]);
const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

const calendar = reactive({
  tieuDe: "",
  ngayBD: null as Dayjs | null,
  ngayKT: null as Dayjs | null,
  ngayBDBu: null as Dayjs | null,
  ngayKTBu: null as Dayjs | null,
  soNgay: null,
});

const formRef = ref();

const hasNgayBu = ref(false);

// Reset ngày bù khi tắt switch
watch(hasNgayBu, (newVal) => {
  if (!newVal) {
    calendar.ngayBDBu = null;
    calendar.ngayKTBu = null;
  }
});

const rules: Record<string, Rule[]> = {
  tieuDe: [
    { required: true, message: 'Xin nhập tiêu đề', trigger: 'change' },
    { min: 3, max: 50, message: 'Tiêu đề từ 3 đến 50 ký tự', trigger: 'blur' },
  ],
  ngayBD: [
    { required: true, message: 'Xin chọn ngày bắt đầu', trigger: 'change', type: 'object' }
  ],
  ngayKT: [
    { required: true, message: 'Xin chọn ngày kết thúc', trigger: 'change', type: 'object' },
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!value) return Promise.resolve();
        if (calendar.ngayBD && value.isBefore(calendar.ngayBD)) {
          return Promise.reject('Ngày kết thúc không được trước ngày bắt đầu!');
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
  ngayBDBu: [
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!hasNgayBu.value) return Promise.resolve();
        if (!value) return Promise.reject('Xin chọn ngày bắt đầu ngày bù');
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
  ngayKTBu: [
    {
      validator: async (_rule: Rule, value: Dayjs) => {
        if (!hasNgayBu.value) return Promise.resolve();
        if (!value) return Promise.reject('Xin chọn ngày kết thúc ngày bù');
        if (calendar.ngayBDBu && value.isBefore(calendar.ngayBDBu)) {
          return Promise.reject('Ngày kết thúc ngày bù không được trước ngày bắt đầu ngày bù!');
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
  hasNgayBu.value = false;
};

const props = defineProps<{ calendars?: any[] }>();
const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();

    const payload: any = {
      tieuDe: calendar.tieuDe,
      ngayBD: formatDate(calendar.ngayBD),
      ngayKT: formatDate(calendar.ngayKT),
    };

    if (hasNgayBu.value) {
      payload.ngayBDBu = formatDate(calendar.ngayBDBu);
      payload.ngayKTBu = formatDate(calendar.ngayKTBu);
    }

    await CalendarService.createCalendar(payload);

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
