<template>
  <div style="margin-top: 20px; width: 1000px; height: 100vh; margin-left: auto; margin-right: auto;">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <InputSearch v-model="searchText" />
      <a-row :gutter="[16, 16]" style="margin-bottom: 20px; margin-top: 20px;">
        <a-col :span="12">
          <h1>Danh sách công việc</h1>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-button type="primary" @click="$router.push('/add-task')">Thêm công việc</a-button>
        </a-col>
      </a-row>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="task in tasks.filter(t => t.tenCV.toLowerCase().includes(searchText.toLowerCase()))"
          :key="task.id"
          :span="8"
        >
          <TaskCard :task="task" />
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import TaskCard from "@/components/TaskCard.vue";
import TaskService from "@/services/CongViec.service";
import { ref, watch } from "vue";

const props = defineProps(['projectId']);

const searchText = ref("");
const tasks = ref([]);

const loadData = async () => {
  if (!props.projectId) {
    tasks.value = [];
    return;
  }
  try {
    tasks.value = await TaskService.getTasksByProject(props.projectId);
  } catch (error) {
    console.error("Error loading data:", error);
    tasks.value = [];
  }
};

watch(() => props.projectId, loadData, { immediate: true });
</script>