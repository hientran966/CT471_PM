<template>
  <div style="margin-top: 20px; width: 1000px; margin-left: auto; margin-right: auto;">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <h3>Tập tin</h3>
      <InputSearch v-model="searchText" />
      <br>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="file in files.filter(t => t.tenFile.toLowerCase().includes(searchText.toLowerCase()))"
          :key="file.id"
          :span="5"
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

const props = defineProps(['taskId']);

const searchText = ref("");
const files = ref([]);

const loadData = async () => {
  try {
    files.value = await FileService.getFilesByTask(props.taskId);
  } catch (error) {
    console.error("Error loading data:", error);
    files.value = [];
  }
};

watch(() => props.taskId, loadData, { immediate: true });
</script>