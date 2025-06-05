<template>
  <div style="padding: 20px; background: #fff; border-radius: 8px; max-width: 1000px; margin: 20px 0 auto auto;">
    <a-page-header
      :title="project.tenDA"
      :sub-title="project.trangThai"
      back-icon
      @back="onBack"
      :tags="[
        h('a-tag', { color: getStatusColor(project.trangThai) }, () => project.trangThai)
      ]"
    >
      <template #extra>
        <a-button type="primary" @click="editProject">Chỉnh sửa</a-button>
      </template>
    </a-page-header>

    <a-descriptions bordered column={1} style="margin-top: 20px;">
      <a-descriptions-item label="Ngày bắt đầu">
        {{ project.ngayBD ? dayjs(project.ngayBD).format('DD/MM/YYYY') : '-' }}
      </a-descriptions-item>
      <a-descriptions-item label="Ngày kết thúc">
        {{ project.ngayKT ? dayjs(project.ngayKT).format('DD/MM/YYYY') : '-' }}
      </a-descriptions-item>
      <a-descriptions-item label="Quản lý dự án">
        <a-avatar :src="`/api/auth/avatar/${project.manager?.id}`" />
        <span style="margin-left: 8px;">{{ project.manager?.tenNV || 'Không rõ' }}</span>
      </a-descriptions-item>
    </a-descriptions>

    <h4 style="margin-top: 30px;">Danh sách công việc</h4>
    <a-list :dataSource="tasks" :locale="{ emptyText: 'Chưa có công việc nào' }">
      <template #renderItem="{ item }">
        <a-list-item :key="item.id">
          <a-list-item-meta
            :title="item.tenCV"
            :description="`Trạng thái: ${computeTaskStatus(item)}`"
          />
          <a-tag :color="getTaskStatusColor(computeTaskStatus(item))">
            {{ computeTaskStatus(item) }}
          </a-tag>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from "vue";
import dayjs from "dayjs";
import { useRouter, useRoute } from "vue-router";
import ProjectService from "@/services/DuAn.service";
import TaskService from "@/services/CongViec.service";
import AccountService from "@/services/TaiKhoan.service";

const router = useRouter();
const route = useRoute();

const project = ref({});
const tasks = ref([]);

const getStatusColor = (status) => {
  switch (status) {
    case "Đã hoàn thành":
      return "green";
    case "Đang tiến hành":
      return "blue";
    case "Quá hạn":
      return "red";
    default:
      return "default";
  }
};

const getTaskStatusColor = (status) => {
  switch (status) {
    case "Đã hoàn thành":
      return "green";
    case "Đang tiến hành":
      return "blue";
    case "Quá hạn":
      return "red";
    default:
      return "default";
  }
};

const computeProjectStatus = (proj) => {
  if (!proj) return 'Chưa cập nhật';
  const now = dayjs();
  const ngayBD = proj.ngayBD ? dayjs(proj.ngayBD) : null;
  const ngayKT = proj.ngayKT ? dayjs(proj.ngayKT) : null;

  if (proj.tienDo >= 100) {
    return "Đã hoàn thành";
  }
  if (ngayKT && ngayKT.isBefore(now, 'day')) {
    return "Quá hạn";
  }
  if (ngayBD && ngayBD.isAfter(now, 'day')) {
    const diffDays = ngayBD.diff(now, 'day');
    return `Bắt đầu sau ${diffDays} ngày`;
  }
  if (ngayBD && (ngayBD.isBefore(now, 'day') || ngayBD.isSame(now, 'day'))) {
    return "Đang tiến hành";
  }
  return "Chưa cập nhật";
};

const computeTaskStatus = (task) => {
  if (!task) return 'Chưa cập nhật';
  const now = dayjs();
  const ngayBD = task.ngayBD ? dayjs(task.ngayBD) : null;
  const ngayKT = task.ngayKT ? dayjs(task.ngayKT) : null;

  if (task.tienDo >= 100) {
    return "Đã hoàn thành";
  }
  if (ngayKT && ngayKT.isBefore(now, 'day')) {
    return "Quá hạn";
  }
  if (ngayBD && ngayBD.isAfter(now, 'day')) {
    const diffDays = ngayBD.diff(now, 'day');
    return `Bắt đầu sau ${diffDays} ngày`;
  }
  if (ngayBD && (ngayBD.isBefore(now, 'day') || ngayBD.isSame(now, 'day'))) {
    return "Đang tiến hành";
  }
  return "Chưa cập nhật";
};

const computedProjectStatus = computed(() => computeProjectStatus(project.value));

const loadProject = async () => {
  try {
    const id = route.query.projectId || route.params.id;
    if (!id) {
      router.back();
      return;
    }
    const data = await ProjectService.getProjectById(id);
    project.value = data;
    project.value.manager = await AccountService.getAccountById(project.value.idNguoiTao);

    tasks.value = await TaskService.getTasksByProject(id);
  } catch (error) {
    console.error(error);
  }
};

const onBack = () => {
  router.back();
};

const editProject = () => {
  router.push({ name: "project-edit", params: { id: project.value.id } });
};

onMounted(loadProject);
</script>

<style scoped>
</style>
