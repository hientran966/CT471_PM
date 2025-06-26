<template>
  <div class="row" style="max-height: 100vh;">
    <div class="col-2" style="background-attachment: fixed;">
      <Menu 
        :items="items"
        :selectedKeys="[activeKey]"
        @select="onMenuClick"
        style="max-height: 100%;"
      />
    </div>
    <div class="col-10 all-task-scroll">
      <a-page-header
        title="Thông tin dự án"
        :breadcrumb="{ routes }"
        :sub-title="projectName || 'Chưa chọn dự án'"
      >
        <template #tags>
          <a-tag :color="getStatusColor(currentProject?.trangThai)">
            {{ currentProject?.trangThai || 'Không xác định' }}
          </a-tag>
        </template>
      </a-page-header>

      <ProjectInfo :projectId="projectId" />
    </div> 
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import ProjectService from "@/services/DuAn.service"
import ProjectInfo from '@/components/ProjectInfo.vue';
import Menu from '@/components/Menu.vue';

const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);
const currentProject = ref(null);
const projectName = computed(() => currentProject.value?.tenDA || "");

function getStatusColor(status) {
  switch (status) {
    case "Đã hoàn thành":
      return "green";
    case "Đang tiến hành":
      return "blue";
    case "Chưa bắt đầu":
      return "default";
    default:
      return "default";
  }
}

const routes = [
  {
    path: 'index',
    breadcrumbName: 'Dự án',
  },
  {
    path: 'info',
    breadcrumbName: 'Thông tin',
  },
];

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const activeKey = ref("info");

onMounted(async () => {
  taskId.value = route.query.taskId || "";
  const projects = await ProjectService.getAllProjects();
  currentProject.value = projects.find(p => String(p.id) === projectId.value);

  items.value = [
    getItem(
      h('b', currentProject.value?.tenDA || "Chọn dự án"),
      "projectName"
    ),
    getItem("Danh sách công việc", "task"),
    getItem("Thông tin dự án", "info"),
    getItem("File", "file"),
  ];
});

function onMenuClick({ key }) {
  if (key === "task") {
    router.push({ name: "task", query: { projectId: projectId.value } });
  } else if (key === "projectName") {
    router.push({ name: "project" });
  } else if (key === "info") {
    router.push({ name: "info", query: { projectId: projectId.value } });
  } else if (key === "file") {
    router.push({ name: "PJfile", query: { projectId: projectId.value } });
  }
  activeKey.value = key;
}
</script>

<style scoped>
.all-task-scroll {
  height: 100vh;
  overflow-y: auto;
  background-attachment: scroll;
}
</style>