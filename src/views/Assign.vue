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
      <AssignList :taskId="taskId" :projectId="projectId"/>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import ProjectService from "@/services/DuAn.service"
import AssignList from '@/components/AssignList.vue';
import Menu from '@/components/Menu.vue';

const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);

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
    getItem("Temp", "3"),
  ];
});
function onMenuClick({ key }) {
  if (key === "task") {
    router.push({ name: "task", query: { projectId: projectId.value } });
  } else if (key === "projectName") {
    router.push({ name: "project" });
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