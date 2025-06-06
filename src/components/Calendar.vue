<template>
    <div class="all-account-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Quản lý lịch nghỉ</h1>
        <a-button type="primary" @click="calendarForm?.showModal()">+</a-button>
      </div>
      <a-space direction="horizontal" :size="10">
        <h6>Lọc theo ngày</h6>
        <a-range-picker v-model:value="dateRange" />
      </a-space>
      <Table
        ref="calendarTable"
        :columns="columns"
        :queryData="queryData"
        :dateRange="dateRange"
        v-slot:actionSlot="{ record }"
      >
        <a-space>
          <a-button type="primary" danger size="small" @click="handleDeactivate(record)">
            <StopOutlined />
          </a-button>
          <a-button type="primary" size="small" @click="handleEdit(record)">
            <EditOutlined />
          </a-button>
        </a-space>
      </Table>
    </div>
    <CalendarForm ref="calendarForm" @created="handleCreated"/>
</template>

<script lang="ts" setup>
import CalendarForm from "@/components/CalendarForm.vue";
import Table from "@/components/Table.vue";
import CalendarService from "@/services/LichNghi.service";
import { ref } from "vue";
import { message } from 'ant-design-vue';
import { StopOutlined, EditOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import type { Dayjs } from 'dayjs';

defineProps();
defineEmits();

const components = { StopOutlined, EditOutlined };

type RangeValue = [Dayjs, Dayjs];

const dateRange = ref<RangeValue>();
const calendarForm = ref(null);

const columns = [
  { title: "Tiêu đề", dataIndex: "tieuDe", width: "200px", ellipsis: true },
  { title: "Ngày bắt đầu", dataIndex: "ngayBD", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Ngày kết thúc", dataIndex: "ngayKT", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { 
    title: "Bù từ ngày", 
    dataIndex: "ngayBDBu", 
    sorter: true, 
    width: "100px", 
    customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "-" 
  },
  { 
    title: "Đến ngày", 
    dataIndex: "ngayKTBu", 
    sorter: true, 
    width: "100px", 
    customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "-" 
  },
];


const queryData = async (params) => {
  try {
    let res = await CalendarService.getAllCalendars();

    for (const item of res) {
      if (item.idNgayBu) {
        const ngayBu = await CalendarService.getNgayBuById(item.idNgayBu);
        item.ngayBDBu = ngayBu?.ngayBD || null;
        item.ngayKTBu = ngayBu?.ngayKT || null;
      } else {
        item.ngayBDBu = null;
        item.ngayKTBu = null;
      }
    }

    if (params?.dateRange && params.dateRange[0] && params.dateRange[1]) {
      const [start, end] = params.dateRange;
      res = res.filter(item => {
        const date = new Date(item.ngayBD);
        return date >= new Date(start) && date <= new Date(end);
      });
    }

    if (params?.sortField && params?.sortOrder) {
      const field = params.sortField;
      const order = params.sortOrder === "ascend" ? 1 : -1;
      res = res.slice().sort((a, b) => {
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        if (typeof a[field] === "string" && typeof b[field] === "string") {
          return a[field].localeCompare(b[field]) * order;
        }
        return (a[field] > b[field] ? 1 : -1) * order;
      });
    }
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};


const calendarTable = ref(null);

const handleCreated = () => {
  calendarTable.value?.reload?.();
};

function handleEdit(record) {
  if (calendarForm.value?.showModal) {
    calendarForm.value.showModal(record);
  }
}

async function handleDeactivate(record) {
  try {
    const confirmed = window.confirm(`Xác nhận vô hiệu hóa lịch nghỉ "${record.tieuDe}"?`);
    if (!confirmed) return;

    await CalendarService.deleteCalendar(record.id);
    message.success("Đã vô hiệu hóa lịch nghỉ thành công");
    calendarTable.value?.reload?.();
  } catch (err) {
    console.error(err);
    message.error("Lỗi khi vô hiệu hóa lịch nghỉ");
  }
}
</script>

<style scoped>
.all-account-container {
  max-width: 900px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>