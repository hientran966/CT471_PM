<template>
  <div class="file-list-wrapper">
      <InputSearch v-model="searchText" style="margin-bottom: 20px;" />
      <div class="file-card-container">
        <FileCard
          v-for="file in filteredFiles"
          :key="file.id"
          :file="file"
          @preview="handlePreview"
        />
      </div>
    </div>
  <FileDetail
    :file="selectedFile"
    :task-creator-id="taskCreatorId"
    ref="detailRef"
    @submitted="handleReview"
    @approved="handleApprove"
    @updated="loadData"
  />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import FileCard from "@/components/FileCard.vue";
import FileDetail from "@/components/FileDetail.vue";
import FileService from "@/services/File.service";
import NotificationService from "@/services/ThongBao.service";
import TaskService from "@/services/CongViec.service";
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";

const props = defineProps(['taskId']);
const route = useRoute();

const searchText = ref("");
const files = ref([]);
const getTaskId = () => props.taskId || route.query.taskId || "";
const selectedFile = ref(null);
const detailRef = ref();
const taskCreatorId = ref("");

function formatDateTime(date) {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const filteredFiles = computed(() =>
  [...files.value]
    .reverse()
    .filter(f => f.tenFile.toLowerCase().includes(searchText.value.toLowerCase()))
);

const handlePreview = (file) => {
  selectedFile.value = file;
  detailRef.value?.showModal();
};

const handleReview = async ({ idFile, review, idNguoiDang, idNguoiNhan }) => {
  if (!review?.trim()) {
    message.warning("Nội dung đánh giá không được để trống!");
    return;
  }

  try {
    await NotificationService.createNotification({
      tieuDe: `Đã gửi đánh giá File`,
      noiDung: review.trim(),
      idPhienBan: idFile,
      ngayDang: formatDateTime(new Date()),
      idNguoiDang,
      idNguoiNhan,
    });

    message.success("Đánh giá đã được gửi thành công!");

    await loadData();

    const updated = files.value.find(f => f.id === selectedFile.value?.id);
    if (updated) selectedFile.value = { ...updated };

    detailRef.value?.showModal();

  } catch (error) {
    message.error("Lỗi khi gửi đánh giá: " + error.message);
  }
};


const handleApprove = async ({ idFile }) => {
  try {
    await FileService.approveVersion(idFile);
    message.success("File đã được duyệt thành công!");
    await loadData();

    const updated = files.value.find(f => f.id === selectedFile.value?.id);
    if (updated) selectedFile.value = { ...updated };
  } catch (error) {
    message.error("Lỗi khi duyệt file: " + error.message);
  }
};

const loadData = async () => {
  const taskId = getTaskId();
  if (!taskId) {
    files.value = [];
    return;
  }
  try {
    const rawFiles = await FileService.getFilesByTask(taskId);
    taskCreatorId.value = await TaskService.getTaskById(taskId).then(task => task.idNguoiTao || "");

    const fileMap = new Map();

    for (const f of rawFiles) {
      const fileKey = f.id;

      if (!fileMap.has(fileKey)) {
        fileMap.set(fileKey, f);
      } else {
        const existing = fileMap.get(fileKey);
        if ((f.soPB || 0) > (existing.soPB || 0)) {
          fileMap.set(fileKey, f);
        }
      }
    }

    files.value = Array.from(fileMap.values());

  } catch (error) {
    console.error("Error loading data:", error);
    files.value = [];
  }
};

watch(() => getTaskId(), loadData, { immediate: true });

defineExpose({ loadData });
</script>

<style scoped>
.file-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}
</style>