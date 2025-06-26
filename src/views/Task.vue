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
        title="Danh sách công việc"
        :sub-title="currentProject?.tenDA || 'Chưa chọn dự án'"
        :breadcrumb="{ routes: routes, itemRender }"
      >
        <template #tags>
          <a-tag :color="getStatusColor(currentProject?.trangThai)">
            {{ currentProject?.trangThai || 'Không xác định' }}
          </a-tag>
        </template>
        <template #extra>
          <a-button type="primary" @click="taskForm.showModal()">Thêm công việc</a-button>
        </template>
      </a-page-header>
      <TaskList :projectId="projectId" ref="taskList" />
    </div>
    <TaskForm ref="taskForm" :projectId="projectId" @saved="handleCreate" />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import ProjectService from "@/services/DuAn.service"
import TaskList from '@/components/TaskList.vue';
import TaskForm from "@/components/TaskForm.vue";
import Menu from '@/components/Menu.vue';

const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);
const taskForm = ref(null);
const taskList = ref(null);
const currentProject = ref();

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

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

const routes = computed(() => [
  {
    path: "/project",
    breadcrumbName: "Dự án",
    name: "project"
  },
  {
    path: "/task",
    breadcrumbName: "Danh sách công việc",
    name: "task"
  }
]);

function itemRender({ route }) {
  return h(
    "a",
    {
      onClick: (e) => {
        e.preventDefault();
        if (route.name && route.name !== "task") {
          router.push({ name: route.name, query: { projectId: projectId.value } });
        }
      }
    },
    route.breadcrumbName
  );
}

const activeKey = ref("task");

onMounted(async () => {
  taskId.value = route.query.taskId || "";
  const projects = await ProjectService.getAllProjects();
  currentProject.value = projects.find(p => String(p.id) === projectId.value);
  console.log(currentProject);
  items.value = [
    getItem(
      h('b', currentProject.value ? currentProject.value.tenDA : "Chọn dự án"),
      "projectName"
    ),
    getItem(
      "Danh sách công việc",
      "task"
    ),
    getItem(
      "Thông tin dự án",
      "info"
    ),
    getItem(
      "File",
      "file"
    ),
  ];
});

function handleCreate() {
  taskList.value?.loadData?.();
}

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