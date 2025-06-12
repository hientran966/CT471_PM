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
          <FileCard :file="file" @preview="handlePreview" />
        </a-col>
      </a-row>
    </a-space>
  </div>
  <FileDetail
    :file="selectedFile"
    :task-creator-id="taskCreatorId"
    ref="detailRef"
    @submitted="handleReview"
    @approved="handleApprove"
  />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import FileCard from "@/components/FileCard.vue";
import FileDetail from "@/components/FileDetail.vue";
import FileService from "@/services/File.service";
import NotificationService from "@/services/ThongBao.service";
import TaskService from "@/services/CongViec.service";
import { ref, watch } from "vue";
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

const handlePreview = (file) => {
  selectedFile.value = file;
  detailRef.value?.showModal();
};

const handleReview = ({ idFile, review, idNguoiDang }) => {
  if (!review?.trim()) {
    message.warning("Nội dung đánh giá không được để trống!");
    return;
  }

  NotificationService.createNotification({
    tieuDe: "Đánh giá file",
    noiDung: review.trim(),
    idPhienBan: idFile,
    ngayDang: formatDateTime(new Date()),
    idNguoiDang: idNguoiDang,
  })
    .then(() => {
      message.success("Đánh giá đã được gửi thành công!");
      detailRef.value?.showModal();
    })
    .catch((error) => {
      message.error("Lỗi khi gửi đánh giá: " + error.message);
    });
};

const handleApprove = ({ idFile }) => {
  // Gửi API duyệt file
  FileService.approveVersion(idFile)
    .then(() => {
      message.success("File đã được duyệt thành công!");
    })
    .catch(error => {
      message.error("Lỗi khi duyệt file: " + error.message);
    });
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
</script>

<style scoped>
.all-file-container {
  max-width: 1100px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>