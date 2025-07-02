<template>
  <a-form layout="inline" :model="filter" @submit.prevent>
    <!-- Mô tả -->
    <a-form-item>
      <a-input v-model:value="filter.keyword" placeholder="Tìm phân công..." allow-clear />
    </a-form-item>

    <!-- Ngày nhận -->
    <a-form-item label="Ngày nhận">
      <a-range-picker v-model:value="filter.receivedDate" />
    </a-form-item>

    <!-- Người nhận (theo tên) -->
    <a-form-item label="Người nhận">
      <a-input v-model:value="filter.recipientName" placeholder="Tên người nhận" allow-clear />
    </a-form-item>

    <a-space>
      <a-button type="primary" html-type="submit" @click="$emit('filter', filter)">Lọc</a-button>
      <a-button @click="resetFilter">Đặt lại</a-button>
    </a-space>
  </a-form>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["filter"]);

const filter = ref({
  keyword: "",
  receivedDate: null,
  recipientName: "",
});

const resetFilter = () => {
  filter.value = {
    keyword: "",
    receivedDate: null,
    recipientName: "",
  };
  emit("filter", filter.value);
};
</script>
