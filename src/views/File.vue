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
        title="Danh sách file"
        :sub-title="currentTask?.tenCV || ''"
        :breadcrumb="{ routes, itemRender }"
      >
        <template #extra>
          <a-button type="primary" @click="createRef?.showModal()">Tải lên file</a-button>
        </template>
      </a-page-header>

      <FileList :taskId="getTaskId()" ref="listRef"/>
      <FileForm
        ref="createRef"
        :task-id="taskId"
        @file-uploaded="loadData"
        @cancel="loadData"
        @close="selectedFile = null"
        @created="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, h, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProjectService from "@/services/DuAn.service"
import FileList from "@/components/FileList.vue";
import Menu from '@/components/Menu.vue';
import FileForm from "@/components/FileForm.vue";

const props = defineProps(['taskId']);
const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const getTaskId = () => props.taskId || route.query.taskId || "";
const currentTask = ref();
const items = ref([]);
const files = ref([]);
const createRef = ref();
const listRef = ref();

const activeKey = ref("0");

const loadData = async () => {
  const taskId = getTaskId();
  if (!taskId) {
    files.value = [];
    return;
  }
  listRef.value.loadData();
};

const routes = computed(() => [
  {
    path: "/project",
    breadcrumbName: "Dự án",
    name: "project",
  },
  {
    path: "/task",
    breadcrumbName: "Danh sách công việc",
    name: "task",
  },
  {
    path: "/assign",
    breadcrumbName: "Chi tiết phân công",
    name: "assign",
  },
  {
    path: "/curr",
    breadcrumbName: "File",
    name: "curr",
  },
]);

function itemRender({ route }) {
  return h(
    "a",
    {
      onClick: (e) => {
        e.preventDefault();
        if (route.name !== "curr") {
          router.push({ name: route.name, query: { projectId: projectId.value, taskId: taskId.value } });
        }
      },
    },
    route.breadcrumbName
  );
}

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

onMounted(async () => {
  taskId.value = route.query.taskId || "";
  const projects = await ProjectService.getAllProjects();
  items.value = [
    getItem(
      h('b', projectId.value && projects.find(p => String(p.id) === projectId.value)
        ? projects.find(p => String(p.id) === projectId.value).tenDA
        : "Chọn dự án"
      ),
      "projectName",
      null
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


watch(() => getTaskId(), loadData, { immediate: true });
</script>

<style scoped>
.all-task-scroll {
  flex: 1;
  min-width: 600px;
  height: 100vh;
  overflow-y: auto;
}
</style>
