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
        :breadcrumb="{ routes }"
        :sub-title="currentProject?.tenDA || 'Chưa chọn dự án'"
      >
        <template #tags>
          <a-tag :color="getStatusColor(currentProject?.trangThai)">
            {{ currentProject?.trangThai || 'Không xác định' }}
          </a-tag>
        </template>
        <template #extra>
          <a-button type="primary" @click="createRef?.showModal()">Tải lên file</a-button>
        </template>
      </a-page-header>

      <FileList :projectId="projectId" ref="listRef" />
      <FileForm
        ref="createRef"
        :project-id="projectId"
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
import ProjectService from "@/services/DuAn.service";
import FileList from "@/components/ProjectFile.vue";
import Menu from "@/components/Menu.vue";
import FileForm from "@/components/FileForm.vue";

const route = useRoute();
const router = useRouter();
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);
const currentProject = ref(null);
const createRef = ref();
const listRef = ref();

const activeKey = ref("file");

const routes = [
  { path: "index", breadcrumbName: "Dự án" },
  { path: "file", breadcrumbName: "Danh sách file" }
];

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

function getStatusColor(status) {
  switch (status) {
    case "Đã hoàn thành": return "green";
    case "Đang tiến hành": return "blue";
    case "Chưa bắt đầu": return "default";
    default: return "default";
  }
}

onMounted(async () => {
  const projects = await ProjectService.getAllProjects();
  currentProject.value = projects.find(p => String(p.id) === projectId.value);
  
  items.value = [
    getItem(h('b', currentProject.value?.tenDA || "Chọn dự án"), "projectName"),
    getItem("Danh sách công việc", "task"),
    getItem("Thông tin dự án", "info"),
    getItem("File", "file")
  ];
});

function onMenuClick({ key }) {
  const query = { projectId: projectId.value };
  if (key === "task") {
    router.push({ name: "task", query });
  } else if (key === "projectName") {
    router.push({ name: "project" });
  } else if (key === "info") {
    router.push({ name: "info", query });
  } else if (key === "file") {
    router.push({ name: "PJfile", query });
  }
  activeKey.value = key;
}

const loadData = async () => {
  listRef.value.loadData();
};
</script>

<style scoped>
.all-task-scroll {
  flex: 1;
  min-width: 600px;
  height: 100vh;
  overflow-y: auto;
}
</style>
