<template>
  <a-card 
    size="small" 
    style="width: 230px; cursor: pointer;"
    @click="$router.push({
            name: 'assign',
            query: { taskId: task.id, projectId: props.projectId },
          })"
  >
    <template #title>
      <strong>{{ task.tenCV }}</strong>
    </template>
    <template #extra>
      <a
        v-if="isManager"
        @click.stop.prevent="editTask"
        href="#"
        >Sửa</a
      >
      <a-popconfirm
        title="Xác nhận xóa công việc?"
        ok-text="Có"
        cancel-text="Không"
        @confirm="deleteTask"
        @cancel="cancel"
      >
        <a
          href="#"
          @click.stop.prevent
          >Xóa</a
        >
      </a-popconfirm>
    </template>
    <p><strong>ID:</strong> {{ task.id }}</p>
    <a-tooltip :title="task.moTa">
      <p class="desc-text">{{ task.moTa }}</p>
    </a-tooltip>
    <p>
      <strong>Deadline:</strong>
      <a-tag
        :color="
          isOverdue(task) ? 'red' : isNearDeadline(task) ? 'orange' : 'green'
        "
      >
        {{ task.ngayKT ? dayjs(task.ngayKT).format("DD/MM/YYYY") : "?" }}
      </a-tag>
    </p>
    <p>
      <strong>Trạng thái:</strong>
      <a-tag :color="getStatusColor(computeStatus(task))">
        {{ computeStatus(task) }}
      </a-tag>
    </p>
    <p><strong>Người tham gia:</strong></p>
    <a-avatar-group
      :max-count="2"
      :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }"
    >
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
    <a-progress :percent="task.tienDo" style="margin: 8px 0 0 0" />
  </a-card>
  <TaskForm ref="taskForm" @saved="handleEdit" :projectId="projectId" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { ComponentPublicInstance } from "vue";
import ProjectService from "@/services/DuAn.service"
import TaskService from "@/services/CongViec.service"
import AssignmentService from "@/services/PhanCong.service";
import AccountService from "@/services/TaiKhoan.service";
import TaskForm from "@/components/TaskForm.vue";
import dayjs from "dayjs";
import { message } from 'ant-design-vue';

const props = defineProps<{
  task: {
    id: string;
    tenCV: string;
    ngayBD?: string;
    ngayKT?: string;
    tienDo: number;
    moTa: Text;
  };
  projectId;
}>();

const emit = defineEmits(['saved']);

const defaultAvatar = "/api/auth/avatar/AC000001";

const participants = ref<{ name: string; avatar?: string }[]>([]);
const project = ref<any>(null);
const manager = ref<any>(null);
const taskForm = ref<ComponentPublicInstance<typeof TaskForm> | null>(null);

const isOverdue = (task) => {
  if (task.tienDo >= 100) return false;
  if (!task.ngayKT) return false;
  return dayjs(task.ngayKT).isBefore(dayjs(), "day");
};

const isNearDeadline = (task) => {
  if (task.tienDo >= 100) return false;
  if (!task.ngayKT) return false;
  const today = dayjs();
  const end = dayjs(task.ngayKT);
  const diff = end.diff(today, "day");
  return diff >= 0 && diff <= 2;
};

const computeStatus = (task) => {
  const now = dayjs();
  const ngayBD = task.ngayBD ? dayjs(task.ngayBD) : null;
  const ngayKT = task.ngayKT ? dayjs(task.ngayKT) : null;

  if (task.tienDo >= 100) {
    return 'Đã hoàn thành';
  }
  if (ngayKT && ngayKT.isBefore(now, 'day')) {
    return 'Quá hạn';
  }
  if (ngayBD && ngayBD.isAfter(now, 'day')) {
    const diffDays = ngayBD.diff(now, 'day');
    return `Bắt đầu sau ${diffDays + 1} ngày`;
  }
  if (ngayBD && (ngayBD.isBefore(now, 'day') || ngayBD.isSame(now, 'day'))) {
    return 'Đang tiến hành';
  }
  return 'Chưa cập nhật';
};


const getStatusColor = (status: string) => {
  switch (status) {
    case 'Chưa bắt đầu':
      return 'default';
    case 'Đang tiến hành':
      return 'blue';
    case 'Đã hoàn thành':
      return 'green';
    case 'Quá hạn':
      return 'red';
    default:
      return 'default';
  }
};


const isManager = computed(() => {
  return project.value?.idNguoiTao === manager.value?.id;
});

const editTask = () => {
  taskForm.value?.showModal(props.task.id);
};

const loadData = async () => {
  try {
    const assignments = await AssignmentService.getAssignmentsByTask(
      props.task.id
    );

    project.value = await ProjectService.getProjectById(props.projectId);
    manager.value = await AccountService.getCurrentUser();

    const users = await Promise.all(
      assignments.map(async (a) => {
        const user = await AccountService.getAccountById(a.idNguoiNhan);
        return {
          id: a.idNguoiNhan,
          name: user?.tenNV || "Không rõ",
          avatar: `/api/auth/avatar/${a.idNguoiNhan}`,
        };
      })
    );

    const unique = users.filter(
      (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
    );

    participants.value = unique;
  } catch (err) {
    participants.value = [];
  }
};

const handleEdit = async () => {
  emit('saved');
};

const deleteTask = async () => {
  try {
    await TaskService.deleteTask(props.task.id);
    message.success("Xóa công việc hoàn tất");
    emit('saved');
  } catch (error) {
    console.error("Xóa công việc thất bại:", error);
    message.error("Xóa công việc thất bại");
  }
};

const cancel = (e: MouseEvent) => {
  console.log(e);
};

onMounted(loadData);
</script>

<style scoped>
.desc-text {
  text-size-adjust: 5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: gray;
}
</style>
