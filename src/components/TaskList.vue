<template>
  <div style="margin-top: 20px; width: 100%;">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <InputSearch v-model="searchText" />
      <a-row :gutter="[16, 16]" style="margin-bottom: 20px; margin-top: 20px;">
        <a-col :span="12">
          <h1>Danh sách công việc</h1>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-button type="primary" @click="taskForm.showModal()">Thêm công việc</a-button>
        </a-col>
      </a-row>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="task in tasks.filter(t => t.tenCV.toLowerCase().includes(searchText.toLowerCase()))"
          :key="task.id"
          :span="8"
        >
          <TaskCard :task="task" :projectId="projectId" @saved="loadData"/>
        </a-col>
      </a-row>
    </a-space>
    <TaskForm ref="taskForm" :projectId="projectId" @saved="loadData" />
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import TaskCard from "@/components/TaskCard.vue";
import TaskForm from "@/components/TaskForm.vue";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service"
import { ref, watch } from "vue";

const props = defineProps(['projectId']);

const taskForm = ref(null);
const searchText = ref("");
const tasks = ref([]);

const loadData = async () => {
  if (!props.projectId) {
    tasks.value = [];
    return;
  }
  try {
    const rawTasks = await TaskService.getTasksByProject(props.projectId);

    const tasksWithProgress = await Promise.all(
      rawTasks.map(async (task) => {
        const assignments = await AssignService.getAssignmentsByTask(task.id);

        const totalWeight = assignments.reduce((sum, a) => sum + (a.doQuanTrong || 0), 0);

        const totalProgress = assignments.reduce(
          (sum, a) => sum + ((a.tienDoCaNhan || 0) * (a.doQuanTrong || 0)),
          0
        );

        const tienDo =
          totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
        return { ...task, tienDo };
      })
    );
    tasks.value = tasksWithProgress;
  } catch (error) {
    console.error("Error loading data:", error);
    tasks.value = [];
  }
};

watch(() => props.projectId, loadData, { immediate: true });
</script>