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
            <a-button type="primary" @click="$router.push({ name: 'file', query: { taskId: props.taskId, projectId: props.projectId } })">Xem tất cả file</a-button>
            <a-button type="primary" @click="transferList?.showModal()">Yêu cầu chuyển giao</a-button>
            <a-button type="primary" @click="assignForm?.showModal()">Phân công mới</a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- Chờ nhận -->
      <template v-if="filteredWaiting.length">
        <h3>Chờ nhận</h3>
        <a-row v-for="assign in filteredWaiting" :key="assign.id">
          <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
        </a-row>
      </template>

      <!-- Đang thực hiện -->
      <template v-if="filteredInProgress.length">
        <h3>Đang thực hiện</h3>
        <a-row v-for="assign in filteredInProgress" :key="assign.id">
          <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
        </a-row>
        
        <a-pagination
          v-model:current="currentPage"
          :page-size="pageSize"
          :total="paginatedAssigns.length"
          style="margin-top: 20px; text-align: center;"
        />
      </template>

      <!-- Đã từ chối -->
      <template v-if="filteredRejected.length">
        <h3>Đã từ chối</h3>
        <a-row v-for="assign in filteredRejected" :key="assign.id">
          <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
        </a-row>
      </template>
    </a-space>
    <AssignForm ref="assignForm" @created="handleCreated" :task-id="props.taskId"/>
    <TransferList ref="transferList" />
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import AssignDetail from "@/components/AssignDetail.vue";
import AssignForm from "@/components/AssignForm.vue";
import TransferList from "@/components/TransferList.vue";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service";
import AuthService from "@/services/TaiKhoan.service";
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(['taskId', 'projectId']);
const router = useRouter();

const searchText = ref("");
const assigns = ref([]);
const assignForm = ref(null);
const transferList = ref(null);
const taskCreatorId = ref("");

const isCreator = computed(() => {
  return taskCreatorId.value && currentUser.value && taskCreatorId.value === currentUser.value.id;
});

const currentPage = ref(1);
const pageSize = 5;

const currentUser = ref(null);

onMounted(async () => {
  currentUser.value = await AuthService.getCurrentUser();
});

const filteredAssigns = computed(() => {
  if (isCreator.value) {
    return assigns.value
      .filter(t => t.moTa.toLowerCase().includes(searchText.value.toLowerCase()))
      .filter(t => t.trangThai !== 'Đã chuyển giao');
  } else {
    return assigns.value
      .filter(t => t.idNguoiNhan === currentUser.value?.id)
      .filter(t => t.moTa.toLowerCase().includes(searchText.value.toLowerCase()))
      .filter(t => t.trangThai !== 'Đã chuyển giao');
  }
});

const filteredWaiting = computed(() =>
  filteredAssigns.value.filter(a => !a.ngayNhan && a.trangThai !== 'Đã từ chối')
);

const filteredInProgress = computed(() =>
  filteredAssigns.value.filter(a => a.ngayNhan && a.trangThai !== 'Đã từ chối')
);

const filteredRejected = computed(() =>
  filteredAssigns.value.filter(a => a.trangThai === 'Đã từ chối')
);

const paginatedAssigns = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredInProgress.value.slice(start, start + pageSize);
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

const handleCreated = async () => {
  await loadAssigns();
};

const handleUpdated = async () => {
  await loadAssigns();
  currentPage.value = 1;
};

watch(() => props.taskId, async () => {
  await loadAssigns();
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