<template>
  <a-list-item-meta
    :title="item.tieuDe"
    :description="`${item.noiDung} - ${formatDate(item.ngayDang)}`"
  >
    <template #description>
      <div>
        {{ item.noiDung }} - {{ formatDate(item.ngayDang) }}
      </div>
    </template>
    <template #title>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        {{ item.tieuDe }}
        <a-tag color="blue">{{ getNotificationType(item) }}</a-tag>
      </div>
    </template>
  </a-list-item-meta>
</template>

<script setup>
import { defineProps } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  item: Object,
});

const formatDate = (dateStr) => dayjs(dateStr).format("DD/MM/YYYY HH:mm");

const getNotificationType = (item) => {
  if (item.idPhienBan) return "Đánh giá file";
  if (item.idPhanCong) return "Báo cáo phân công";
  if (item.idCongViec) return "Công việc";
  if (item.idDuAn) return "Dự án";
  return "Thông báo chung";
};
</script>