<template>
    <div style="margin-top: 150px; width: 1000px; margin-left: auto; margin-right: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Quản lý lịch nghỉ</h1>
        <a-button type="primary">+</a-button>
      </div>
      <a-space direction="horizontal" :size="10">
        <h6>Lọc theo ngày</h6>
        <a-range-picker v-model:value="dateRange" />
      </a-space>
      <Table :columns="columns" :queryData="queryData" :dateRange="dateRange"  />
    </div>
</template>

<script lang="ts" setup>
import Table from "@/components/Table.vue";
import CalendarService from "@/services/LichNghi.service";
import { ref } from "vue";
import dayjs from "dayjs";
import type { Dayjs } from 'dayjs';

type RangeValue = [Dayjs, Dayjs];

const dateRange = ref<RangeValue>();

const columns = [
  { title: "ID", dataIndex: "id", sorter: true, width: "95px" },
  { title: "Ngày bắt đầu", dataIndex: "ngayBD", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Ngày kết thúc", dataIndex: "ngayKT", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Mô tả", dataIndex: "moTa", width: "200px", ellipsis: true, },
  { title: "Bù từ ngày", dataIndex: "ngayBD", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Đến ngày", dataIndex: "ngayKT", sorter: true, width: "100px", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Hành động", dataIndex: "calendar", sorter: true, width: "100px"},
];

const queryData = async (params) => {
  try {
    let res = await CalendarService.getAllCalendars();

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
</script>

<style scoped></style>
