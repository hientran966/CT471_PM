<template>
    <div class="row">
        <div class="col-4">
        <Menu 
            :items="items"
            @click="onMenuClick"
            style="max-height: 100%;"
            />
        </div>
        <div class="col-8">
            <AllAssign :taskId="taskId"/>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import AllAssign from '@/components/AllAssign.vue';
import Menu from '@/components/Menu.vue';
import { SettingOutlined } from "@ant-design/icons-vue";
import TaskService from "@/services/CongViec.service";
import ProjectService from "@/services/DuAn.service";

const route = useRoute();
const taskId = computed(() => route.query.taskId || "");
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
  const tasks = await TaskService.getAllTasks();
  const project = await ProjectService.getProjectById(projectId.value);
  const projectName = project?.tenDA || "Chọn dự án";
  items.value = [
    getItem(
      h('b', projectName),
      "projectName",
      null
    ),
    getItem(
      "Temp",
      "sub4",
      () => h(SettingOutlined),
      tasks.map((task, idx) =>
        getItem("Temp", String(idx + 1))
      )
    ),
    getItem("Temp", "3"),
  ];
});

const activeKey = ref("1");

function onMenuClick({ key }) {
  activeKey.value = key;
}
</script>
