<template>
  <div class="all-file-container">
    <a-space direction="vertical" size="30">
      <h3>Tập tin</h3>
      <InputSearch v-model="searchText" />
      <br>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="file in [...files].reverse().filter(t => t.tenFile.toLowerCase().includes(searchText.toLowerCase()))"
          :key="file.id"
          :span="6"
        >
          <FileCard :file="file"/>
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import FileCard from "@/components/FileCard.vue";
import FileService from "@/services/File.service";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const props = defineProps(['taskId']);
const route = useRoute();

const searchText = ref("");
const files = ref([]);

const getTaskId = () => props.taskId || route.query.taskId || "";

const loadData = async () => {
  const taskId = getTaskId();
  if (!taskId) {
    files.value = [];
    return;
  }
  try {
    files.value = await FileService.getFilesByTask(taskId);
  } catch (error) {
    console.error("Error loading data:", error);
    files.value = [];
  }
};

watch(() => getTaskId(), loadData, { immediate: true });
</script>

<style scoped>
.all-file-container {
  max-width: 1100px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>