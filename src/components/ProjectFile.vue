<template>
  <div class="all-file-container">
    <a-space direction="vertical" size="30">
      <a-space>
        <h3>Danh sách File</h3>
        <a-button
          type="primary"
          @click="() => createRef?.showModal()">
          Tải lên file
        </a-button>
      </a-space>
      <InputSearch v-model="searchText" />
      <br>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="file in [...files].reverse().filter(t => t.tenFile.toLowerCase().includes(searchText.toLowerCase()))"
          :key="file.id"
          :span="12"
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
  <FileForm
    ref="createRef"
    v-if="getProjectId()"
    :project-id="getProjectId()"
    @file-uploaded="loadData"
    @cancel="loadData"
    @close="selectedFile = null"
    @create-file="loadData"
  />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import FileCard from "@/components/FileCard.vue";
import FileDetail from "@/components/FileDetail.vue";
import FileService from "@/services/File.service";
import FileForm from "@/components/FileForm.vue";
import NotificationService from "@/services/ThongBao.service";
import ProjectService from "@/services/DuAn.service";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";

const props = defineProps(['projectId']);
const route = useRoute();

const searchText = ref("");
const files = ref([]);
const getProjectId = () => props.projectId || route.query.projectId || "";
const selectedFile = ref(null);
const detailRef = ref();
const createRef = ref();
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
  const projectId = getProjectId();
  if (!projectId) {
    files.value = [];
    return;
  }
  try {
    const rawFiles = await FileService.getFilesByProject(projectId);
    taskCreatorId.value = await ProjectService.getProjectById(projectId).then(task => task.idNguoiTao || "");

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

watch(() => getProjectId(), loadData, { immediate: true });
</script>

<style scoped>
.all-file-container {
  max-width: 1100px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>