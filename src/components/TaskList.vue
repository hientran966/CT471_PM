<template>
  <div class="task-wrapper">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <TaskFilter @filter="handleFilter" />
      <br />
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="task in filteredTasks"
          :key="task.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <TaskCard :task="task" :projectId="projectId" @saved="loadData" />
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script setup>
import TaskFilter from "@/components/TaskFilter.vue";
import TaskCard from "@/components/TaskCard.vue";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service";
import AccountService from "@/services/TaiKhoan.service";
import { ref, watch, computed } from "vue";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const props = defineProps(['projectId']);

const searchFilters = ref({
  deadline: null,
  status: null,
  participant: "",
});

const tasks = ref([]);

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    if (searchFilters.value.deadline) {
      const [start, end] = searchFilters.value.deadline;
      const taskDate = dayjs(task.ngayKT);
      if (!taskDate.isBetween(start, end, "day", "[]")) return false;
    }

    const status = computeStatus(task);
    if (searchFilters.value.status && status !== searchFilters.value.status)
      return false;

    if (
      searchFilters.value.participant &&
      !task.thamGia?.toLowerCase().includes(searchFilters.value.participant.toLowerCase())
    )
      return false;

    return true;
  });
});

const handleFilter = (filters) => {
  searchFilters.value = filters;
};

const computeStatus = (task) => {
  const now = dayjs();
  const ngayBD = task.ngayBD ? dayjs(task.ngayBD) : null;
  const ngayKT = task.ngayKT ? dayjs(task.ngayKT) : null;

  if (task.tienDo >= 100) return "Đã hoàn thành";
  if (ngayKT && ngayKT.isBefore(now, "day")) return "Quá hạn";
  if (ngayBD && ngayBD.isAfter(now, "day")) {
    const diffDays = ngayBD.diff(now, "day");
    return `Bắt đầu sau ${diffDays + 1} ngày`;
  }
  if (ngayBD && (ngayBD.isBefore(now, "day") || ngayBD.isSame(now, "day")))
    return "Đang tiến hành";
  return "Chưa cập nhật";
};

const loadData = async () => {
  if (!props.projectId) {
    tasks.value = [];
    return;
  }

  try {
    const rawTasks = await TaskService.getTasksByProject(props.projectId);

    const tasksWithProgress = await Promise.all(
      rawTasks.map(async (task) => {
        const assignments = await AssignService.getAssignmentsByTask(task.id);

        const participantNames = await Promise.all(assignments.map(async (a) => {
          const user = await AccountService.getAccountById(a.idNguoiNhan);
          return user?.tenNV || "";
        }));

        const totalWeight = assignments.reduce((sum, a) => sum + (a.doQuanTrong || 1), 0);
        const tienDo = totalWeight === 0
          ? 0
          : Math.round(
              assignments.reduce((sum, a) => sum + ((a.tienDoCaNhan || 0) * (a.doQuanTrong || 1)), 0) / totalWeight
            );

        return { ...task, tienDo, thamGia: participantNames.join(", ") };
      })
    );

    tasks.value = tasksWithProgress;
  } catch (error) {
    console.error("Error loading data:", error);
    tasks.value = [];
  }
};

watch(() => props.projectId, loadData, { immediate: true });

defineExpose({ loadData });
</script>

<style scoped>
.task-wrapper {
  margin-top: 20px;
  padding: 0 16px;
  flex: 1 1 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
