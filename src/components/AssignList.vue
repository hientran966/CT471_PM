<template>
  <div class="all-assign-container">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <InputSearch v-model="searchText" />
      <a-row :gutter="[16, 16]" style="margin-bottom: 20px; margin-top: 20px;">
        <a-col :span="12">
          <h1>Chi tiết phân công</h1>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-space>
            <a-button type="primary" @click="$router.push({ name: 'file', query: { taskId: props.taskId, projectId: props.projectId } })">File</a-button>
            <a-button type="primary" @click="$router.push('/add-assign')">Phân công mới</a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-row
          v-for="assign in assigns
            .filter(t => t.moTa.toLowerCase().includes(searchText.toLowerCase()))
            .filter(t => t.trangThai !== 'Đã chuyển giao')"
          :key="assign.id"
          :span="20"
        >
          <AssignDetail :assign="assign" />
      </a-row>
    </a-space>
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import AssignDetail from "@/components/AssignDetail.vue";
import AssignService from "@/services/PhanCong.service";
import { ref, watch } from "vue";

const props = defineProps(['taskId', 'projectId']);

const searchText = ref("");
const assigns = ref([]);

const loadData = async () => {
  if (!props.taskId) {
    assigns.value = [];
    return;
  }
  try {
    assigns.value = await AssignService.getAssignmentsByTask(props.taskId);
  } catch (error) {
    console.error("Error loading data:", error);
    assigns.value = [];
  }
};

watch(() => props.taskId, loadData, { immediate: true });
</script>

<style scoped>
.all-assign-container {
  max-width: 900px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>