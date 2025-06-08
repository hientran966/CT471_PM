<template>
  <div class="all-assign-container">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <InputSearch v-model="searchText" />
      
      <a-row :gutter="[16, 16]" style="margin-bottom: 20px; margin-top: 20px;">
        <a-col :span="12">
          <h1>Chi tiết phân công</h1>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-button type="primary" @click="assignForm?.showModal()">Phân công mới</a-button>
        </a-col>
      </a-row>

      <a-row
        v-for="assign in paginatedAssigns"
        :key="assign.id"
        :span="20"
      >
        <AssignDetail :assign="assign" @updated="handleUpdated" />
      </a-row>

      <a-pagination
        v-model:current="currentPage"
        :page-size="pageSize"
        :total="filteredAssigns.length"
        style="margin-top: 20px; text-align: center;"
      />

      <div style="margin-top: 40px;">
        <a-row :gutter="[16, 16]" style="margin-bottom: 20px; margin-top: 20px;">
          <a-col :span="12">
            <h3>File</h3>
          </a-col>
          <a-col :span="12" style="text-align: right;">
            <a-space>
              <a-button type="primary" @click="$router.push({ name: 'file', query: { taskId: props.taskId, projectId: props.projectId } })">Xem tất cả file</a-button>
              <a-button type="dashed" @click="fileForm?.showModal()">Tải lên file</a-button>
            </a-space>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]">
          <a-col
            v-for="file in recentFiles"
            :key="file.id"
            :span="6"
          >
            <FileCard :file="file" />
          </a-col>
        </a-row>
      </div>
    </a-space>
    <AssignForm ref="assignForm" @created="handleCreated" :task-id="props.taskId"/>
    <FileForm ref="fileForm" @uploaded="handleFileUploaded" :task-id="props.taskId"/>
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import AssignDetail from "@/components/AssignDetail.vue";
import FileCard from "@/components/FileCard.vue";
import AssignForm from "@/components/AssignForm.vue";
import FileForm from "@/components/FileForm.vue";
import AssignService from "@/services/PhanCong.service";
import FileService from "@/services/File.service";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(['taskId', 'projectId']);
const router = useRouter();

const searchText = ref("");
const assigns = ref([]);
const files = ref([]);
const assignForm = ref(null);
const fileForm = ref(null);

const currentPage = ref(1);
const pageSize = 5;

const filteredAssigns = computed(() =>
  assigns.value
    .filter(t => t.moTa.toLowerCase().includes(searchText.value.toLowerCase()))
    .filter(t => t.trangThai !== 'Đã chuyển giao')
);

const paginatedAssigns = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAssigns.value.slice(start, start + pageSize);
});

const recentFiles = computed(() => {
  const lastFive = files.value.slice(-5);
  return lastFive.reverse();
});

const loadAssigns = async () => {
  if (!props.taskId) {
    assigns.value = [];
    return;
  }
  try {
    assigns.value = await AssignService.getAssignmentsByTask(props.taskId);
  } catch (error) {
    console.error("Error loading assigns:", error);
    assigns.value = [];
  }
};

const loadFiles = async () => {
  try {
    files.value = await FileService.getFilesByTask(props.taskId || "");
  } catch (error) {
    console.error("Error loading files:", error);
    files.value = [];
  }
};

const uploadFile = () => {
  router.push({ name: 'upload', query: { taskId: props.taskId } });
};

const handleCreated = async () => {
  await loadAssigns();
};

const handleUpdated = async () => {
  await loadAssigns();
  currentPage.value = 1;
};

const handleFileUploaded = async () => {
  await loadFiles();
};

function handleEdit(record) {
  if (accountForm.value?.showModal) {
    accountForm.value.showModal(record);
  }
}

watch(() => props.taskId, async () => {
  await loadAssigns();
  await loadFiles();
}, { immediate: true });
watch(searchText, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.all-assign-container {
  max-width: 900px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>