<template>
  <a-form layout="inline" :model="filter" @submit.prevent>
    <a-form-item label="Deadline">
      <a-range-picker v-model:value="filter.deadline" />
    </a-form-item>

    <a-form-item label="Trạng thái">
      <a-select v-model:value="filter.status" style="width: 150px" allowClear>
        <a-select-option value="Chưa bắt đầu">Chưa bắt đầu</a-select-option>
        <a-select-option value="Đang tiến hành">Đang tiến hành</a-select-option>
        <a-select-option value="Đã hoàn thành">Đã hoàn thành</a-select-option>
        <a-select-option value="Quá hạn">Quá hạn</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Người tham gia">
      <a-input v-model:value="filter.participant" placeholder="Tên người tham gia" />
    </a-form-item>

    <a-space>
      <a-button type="primary" html-type="submit" @click="$emit('filter', filter)">Lọc</a-button>
      <a-button @click="resetFilter">Đặt lại</a-button>
    </a-space>
  </a-form>
</template>

<script setup>
import { ref } from "vue";
import dayjs from "dayjs";

const filter = ref({
  deadline: null,
  status: null,
  participant: "",
});

const resetFilter = () => {
  filter.value = {
    deadline: null,
    status: null,
    participant: "",
  };
  setTimeout(() => {
    emit("filter", filter.value);
  });
};

const emit = defineEmits(["filter"]);
</script>
