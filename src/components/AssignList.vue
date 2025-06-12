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
            <FileCard :file="file" @preview="handlePreview" />
          </a-col>
        </a-row>
      </div>
    </a-space>
    <AssignForm ref="assignForm" @created="handleCreated" :task-id="props.taskId"/>
    <FileForm ref="fileForm" @uploaded="handleFileUploaded" :task-id="props.taskId" />
    <FileDetail
      :file="selectedFile"
      :task-creator-id="taskCreatorId"
      ref="detailRef"
      @submitted="handleReview"
      @approved="handleApprove"
      @uploadVer="handleUploadNewVersion"
    />
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import AssignDetail from "@/components/AssignDetail.vue";
import FileCard from "@/components/FileCard.vue";
import AssignForm from "@/components/AssignForm.vue";
import FileForm from "@/components/FileForm.vue";
import FileDetail from "@/components/FileDetail.vue";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service";
import FileService from "@/services/File.service";
import NotificationService from "@/services/ThongBao.service";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import Task from "@/views/Task.vue";

const props = defineProps(['taskId', 'projectId']);
const router = useRouter();

const searchText = ref("");
const assigns = ref([]);
const files = ref([]);
const assignForm = ref(null);
const fileForm = ref(null);
const taskCreatorId = ref("");

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

function formatDateTime(date) {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


const loadAssigns = async () => {
  if (!props.taskId) {
    assigns.value = [];
    return;
  }
  try {
    assigns.value = await AssignService.getAssignmentsByTask(props.taskId);
    taskCreatorId.value = await TaskService.getTaskById(props.taskId).then(task => task.idNguoiTao || "");
  } catch (error) {
    console.error("Error loading assigns:", error);
    assigns.value = [];
  }
};

const loadFiles = async () => {
  try {
    const rawFiles = await FileService.getFilesByTask(props.taskId || "");

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
    console.error("Error loading files:", error);
    files.value = [];
  }
};

const handleUploadNewVersion = (fileId) => {
  fileForm.value.showModal(fileId);
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

const selectedFile = ref(null);
const detailRef = ref();

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