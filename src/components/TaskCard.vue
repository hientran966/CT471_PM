<template>
    <a-card size="small" style="width: 230px;">
      <template #title>
        <strong>{{ task.tenCV }}</strong>
      </template>
    <template #extra>
      <a @click.prevent="$router.push({ name: 'assign', query: { taskId: task.id, projectId: props.projectId } })" href="#">Xem</a>
    </template>
    <p><strong>ID:</strong> {{ task.id }}</p>
    <p><strong>Người tham gia:</strong></p>
    <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
        <a-avatar
          v-if="participants"
          v-for="(user, idx) in participants"
          :key="idx"
          :src="user.avatar ? user.avatar : defaultAvatar"
          :style="!user.avatar ? { backgroundColor: '#1890ff' } : undefined"
        >
          <template v-if="!user.avatar">{{ defaultAvatar }}</template>
        </a-avatar>
    </a-avatar-group>
    <p><strong>Deadline:</strong> {{ task.ngayKT ? dayjs(task.ngayKT).format("DD/MM/YYYY") : "" }}</p>
    <a-progress :percent="task.tienDo" style="margin: 8px 0 0 0;" />
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
    ngayKT?: string,
    tienDo: number
  },
  projectId
}>();

const defaultAvatar = "/api/auth/avatar/AC000001"; 

const participants = ref<{ name: string, avatar?: string }[]>([]);

onMounted(async () => {
  try {
    const assignments = await AssignmentService.getAssignmentsByTask(props.task.id);

    const users = await Promise.all(assignments.map(async (a) => {
      const user = await AccountService.getAccountById(a.idNguoiNhan);
      return {
        id: a.idNguoiNhan,
        name: user?.tenNV || "Không rõ",
        avatar: `/api/auth/avatar/${a.idNguoiNhan}`
      };
    }));

    const unique = users.filter(
      (u, i, arr) => arr.findIndex(x => x.id === u.id) === i
    );

    participants.value = unique;
  } catch (err) {
    participants.value = [];
  }
});
</script>