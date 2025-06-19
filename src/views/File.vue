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
      <FileList :taskId="getTaskId()" /> 
    </div>
  </div>
</template>

<script setup>
import { ref, watch, h, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProjectService from "@/services/DuAn.service"
import FileList from "@/components/FileList.vue";
import Menu from '@/components/Menu.vue';

const props = defineProps(['taskId']);
const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);

const files = ref([]);

const getTaskId = () => props.taskId || route.query.taskId || "";

const loadData = async () => {
  const taskId = getTaskId();
  if (!taskId) {
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

const activeKey = ref("0");

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
  width: 1100px;
  height: 100vh;
  overflow-y: auto;
  background-attachment: scroll;
}
</style>
