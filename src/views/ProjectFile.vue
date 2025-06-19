<template>
    <div class="row" style="max-height: 100vh;">
    <div class="col-4" style="background-attachment: fixed;">
      <Menu 
        :items="items"
        :selectedKeys="[activeKey]"
        @select="onMenuClick"
        style="max-height: 100%;"
      />
    </div>
    <div class="col-8  all-task-scroll">
      <FileList :projectId="projectId" /> 
    </div>
  </div>
</template>

<script setup>
import { ref, watch, h, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProjectService from "@/services/DuAn.service"
import FileList from "@/components/ProjectFile.vue";
import Menu from '@/components/Menu.vue';

const props = defineProps(['projectId']);
const route = useRoute();
const router = useRouter();
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);

const files = ref([]);

const getprojectId = () => props.projectId || route.query.projectId || "";

const loadData = async () => {
  const projectId = getprojectId();
  if (!projectId) {
    files.value = [];
    return;
  }
};

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const activeKey = ref("file");

onMounted(async () => {
  projectId.value = route.query.projectId || "";
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


watch(() => getprojectId(), loadData, { immediate: true });
</script>

<style scoped>
.all-task-scroll {
  min-width: 800px;
  height: 100vh;
  overflow-y: auto;
  background-attachment: scroll;
}
</style>
