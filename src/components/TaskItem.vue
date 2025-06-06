<template>
  <a-list-item>
    <a-list-item-meta
      :title="item.tenCV"
      :description="`${item.moTa}`"
    />
    <div style="margin-top: 8px;">
      <a-tag :color="statusColor">{{ statusText }}</a-tag>
    </div>
  </a-list-item>
</template>

<script setup>
import { computed } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

function formatDate(dateStr) {
  if (!dateStr) return "Không xác định";
  return dayjs(dateStr).format("DD/MM/YYYY");
}

const statusText = computed(() => {
  if (!props.item) return "Chưa cập nhật";
  const now = dayjs();
  const ngayBD = props.item.ngayBD ? dayjs(props.item.ngayBD) : null;
  const ngayKT = props.item.ngayKT ? dayjs(props.item.ngayKT) : null;

  if (props.item.tienDo >= 100) {
    return "Đã hoàn thành";
  }
  if (ngayKT && ngayKT.isBefore(now, "day")) {
    return "Quá hạn";
  }
  if (ngayBD && ngayBD.isAfter(now, "day")) {
    const diffDays = ngayBD.diff(now, "day");
    return `Bắt đầu sau ${diffDays + 1} ngày`;
  }
  if (ngayBD && (ngayBD.isBefore(now, "day") || ngayBD.isSame(now, "day"))) {
    return "Đang tiến hành";
  }
  return "Chưa cập nhật";
});

const statusColor = computed(() => {
  switch (statusText.value) {
    case "Đã hoàn thành":
      return "green";
    case "Quá hạn":
      return "red";
    case "Đang tiến hành":
      return "blue";
    default:
      return "default";
  }
});
</script>
