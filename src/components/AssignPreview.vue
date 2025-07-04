<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Chi Tiết Phân Công"
      :footer="null"
      :bodyStyle="{ maxHeight: '60vh', overflowY: 'auto', }"
    >
      <!-- Chỉ hiển thị nếu assign đã được gán -->
      <AssignDetail v-if="assign" :assign="assign" :view="true" />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AssignDetail from '@/components/AssignDetail.vue';
import AssignService from "@/services/PhanCong.service";

const open = ref(false);
const assign = ref<any>(null);

const showModal = async (id: string) => {
  try {
    const data = await AssignService.getAssignmentById(id);
    if (data) {
      assign.value = data;
      open.value = true;
    } else {
      console.warn("Không tìm thấy phân công với ID:", id);
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phân công:", error);
  }
};

defineExpose({ showModal });
</script>