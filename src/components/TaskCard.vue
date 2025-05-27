<template>
    <a-card style="width: 300px;">
      <template #title>
        <strong>{{ task.tenCV }}</strong>
      </template>
    <template #extra><a href="#">Xem</a></template>
    <p><strong>ID:</strong> {{ task.id }}</p>
    <p><strong>Người tham gia:</strong></p>
    <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
        <a-avatar
            v-for="(user, idx) in participants"
            :key="idx"
            :src="user.avatar"
            :style="!user.avatar ? { backgroundColor: '#1890ff' } : undefined"
            >
            <template v-if="!user.avatar">{{ user.name?.charAt(0) || '?' }}</template>
        </a-avatar>
    </a-avatar-group>
    <p><strong>Deadline:</strong> {{ task.ngayKT ? dayjs(task.ngayKT).format("DD/MM/YYYY") : "" }}</p>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AssignmentService from "@/services/PhanCong.service";
import AccountService from "@/services/TaiKhoan.service";
import dayjs from "dayjs";

const props = defineProps<{
  task: {
    id: string,
    tenCV: string,
    ngayKT?: string
  }
}>();



const participants = ref<{ name: string, avatar?: string }[]>([]);

onMounted(async () => {
  try {
    const assignments = await AssignmentService.getAssignmentsByTask(props.task.id);

    const promises = assignments.map(async (a) => {
      const user = await AccountService.getAccountById(a.idNguoiNhan);
      return {
        name: user?.tenNV || "Không rõ",
        avatar: `/api/auth/avatar/${a.idNguoiNhan}`
      };
    });
    participants.value = await Promise.all(promises);
  } catch (err) {
    participants.value = [];
  }
});
</script>