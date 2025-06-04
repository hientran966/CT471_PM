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
      <TaskList :projectId="projectId"/>
    </div>  
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import TaskList from '@/components/TaskList.vue';
import Menu from '@/components/Menu.vue';
import { ref, h, onMounted, computed } from "vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import ProjectService from "@/services/DuAn.service";

const route = useRoute();
const projectId = computed(() => route.query.projectId || "");
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

onMounted(async () => {
  const projects = await ProjectService.getAllProjects();
  items.value = [
    getItem(
      h('b', projectId.value
        ? projects.find(p => p.id === projectId.value)?.tenDA || "Chọn dự án"
        : "Chọn dự án"
      ),
      "projectName",
      null
    ),
    getItem(
      "Danh sách công việc",
      "1"
    ),
    getItem("Temp", "3"),
  ];
});

const activeKey = ref("1");

function onMenuClick({ key }) {
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