<template>
  <div>
    <a-modal v-model:open="open" title="Lịch Sử Chuyển Giao" @ok="handleOk">
      <template v-if="transfers && transfers.length">
        <a-timeline>
          <a-timeline-item v-for="(item, idx) in transfers" :key="item.id">
            <div>
              <strong>Người nhận:</strong> {{ item.nguoiNhan?.tenNV || item.idNguoiNhan || 'Không rõ' }}<br />
              <strong>Mô tả:</strong> {{ item.moTa || '' }}<br />
              <strong>Ngày nhận:</strong> {{ item.ngayNhan ? dayjs(item.ngayNhan).format("DD/MM/YYYY HH:mm") : "Chưa xác định" }}<br />
              <strong>Ngày hoàn tất:</strong> {{ item.ngayHoanTat ? dayjs(item.ngayHoanTat).format("DD/MM/YYYY HH:mm") : "Chưa xác định" }}<br />
              <strong>Trạng thái:</strong> {{ item.trangThai || '' }}
            </div>
          </a-timeline-item>
        </a-timeline>
      </template>
      <template v-else>
        <p>Không có lịch sử phân công.</p>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from "dayjs";

const props = defineProps<{ transfers: any[] }>();
const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const handleOk = () => {
  open.value = false;
};

defineExpose({ showModal });
</script>