<template>
  <div class="all-assign-container">
    <a-space direction="vertical" size="30" style="width: 100%;">
      <AssignFilter @filter="handleFilter" />

      <a-tabs v-model:activeKey="activeTab">
        <!-- Tab: Đang thực hiện -->
        <a-tab-pane key="inprogress" tab="Đang thực hiện">
          <template v-if="paginatedInProgress.length">
            <div class="scroll-area">
              <a-row v-for="assign in paginatedInProgress" :key="assign.id">
                <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
              </a-row>
              <a-pagination
                v-model:current="currentPageInProgress"
                :page-size="pageSize"
                :total="filteredInProgress.length"
                style="margin-top: 20px; text-align: center;"
              />
            </div>
          </template>
        </a-tab-pane>

        <!-- Tab: Chờ nhận -->
        <a-tab-pane key="waiting" tab="Chờ nhận">
          <template v-if="paginatedWaiting.length">
            <div class="scroll-area">
              <a-row v-for="assign in paginatedWaiting" :key="assign.id">
                <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
              </a-row>
              <a-pagination
                v-model:current="currentPageWaiting"
                :page-size="pageSize"
                :total="filteredWaiting.length"
                style="margin-top: 20px; text-align: center;"
              />
            </div>
          </template>
        </a-tab-pane>

        <!-- Tab: Đã từ chối -->
        <a-tab-pane key="rejected" tab="Đã từ chối">
          <template v-if="paginatedRejected.length">
            <div class="scroll-area">
              <a-row v-for="assign in paginatedRejected" :key="assign.id">
                <AssignDetail :assign="assign" @updated="handleUpdated" :task-id="props.taskId" />
              </a-row>
              <a-pagination
                v-model:current="currentPageRejected"
                :page-size="pageSize"
                :total="filteredRejected.length"
                style="margin-top: 20px; text-align: center;"
              />
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>
    </a-space>
  </div>
</template>

<script setup>
import AssignFilter from "@/components/AssignFilter.vue";
import AssignDetail from "@/components/AssignDetail.vue";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service";
import AuthService from "@/services/TaiKhoan.service";
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const props = defineProps(['taskId', 'projectId']);

const searchText = ref("");
const assigns = ref([]);
const taskCreatorId = ref("");
const currentUser = ref(null);
const isReady = ref(false);

const activeTab = ref("inprogress");
const currentPage = ref(1);
const pageSize = 5;

const currentPageWaiting = ref(1);
const currentPageInProgress = ref(1);
const currentPageRejected = ref(1);
const filters = ref({
  keyword: "",
  receivedDate: null,
  recipientName: "",
});

const handleFilter = (newFilters) => {
  filters.value = newFilters;
  currentPageWaiting.value = 1;
  currentPageInProgress.value = 1;
  currentPageRejected.value = 1;
};

const isCreator = computed(() => {
  return taskCreatorId.value && currentUser.value && taskCreatorId.value === currentUser.value.id;
});

const filteredAssigns = computed(() => {
  if (!isReady.value) return [];

  let base = assigns.value;

  const keyword = filters.value.keyword?.toLowerCase() || "";
  if (keyword) {
    base = base.filter(a => a.moTa?.toLowerCase().includes(keyword));
  }

  const [start, end] = filters.value.receivedDate || [];
  if (start && end) {
    base = base.filter(a => {
      if (!a.ngayNhan) return false;
      const ngayNhan = dayjs(a.ngayNhan);
      return ngayNhan.isBetween(dayjs(start), dayjs(end), "day", "[]");
    });
  }

  const recipientName = filters.value.recipientName?.toLowerCase();
  if (recipientName) {
    base = base.filter(a => a.tenNguoiNhan?.toLowerCase().includes(recipientName));
  }

  base = base.filter(a => a.trangThai !== 'Đã chuyển giao');

  return isCreator.value
    ? base
    : base.filter(a => a.idNguoiNhan === currentUser.value?.id);
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

const paginatedWaiting = computed(() => {
  const start = (currentPageWaiting.value - 1) * pageSize;
  return filteredWaiting.value.slice(start, start + pageSize);
});

const paginatedInProgress = computed(() => {
  const start = (currentPageInProgress.value - 1) * pageSize;
  return filteredInProgress.value.slice(start, start + pageSize);
});

const paginatedRejected = computed(() => {
  const start = (currentPageRejected.value - 1) * pageSize;
  return filteredRejected.value.slice(start, start + pageSize);
});

const loadAssigns = async () => {
  isReady.value = false;
  if (!props.taskId) {
    assigns.value = [];
    return;
  }
  try {
    currentUser.value = await AuthService.getCurrentUser();
    const task = await TaskService.getTaskById(props.taskId);
    taskCreatorId.value = task?.idNguoiTao || "";

    const rawAssigns = await AssignService.getAssignmentsByTask(props.taskId);

    assigns.value = await Promise.all(
      rawAssigns.map(async (a) => {
        const user = await AuthService.getAccountById(a.idNguoiNhan); // hoặc AccountService nếu đúng hơn
        return {
          ...a,
          tenNguoiNhan: user?.tenNV || "",
        };
      })
    );
  } catch (error) {
    console.error("Error loading assigns:", error);
    assigns.value = [];
  } finally {
    isReady.value = true;
  }
};

const handleUpdated = async () => {
  await loadAssigns();
  currentPage.value = 1;
};

watch(() => props.taskId, async () => {
  await loadAssigns();
}, { immediate: true });

watch([searchText, activeTab], () => {
  currentPageWaiting.value = 1;
  currentPageInProgress.value = 1;
  currentPageRejected.value = 1;
});
</script>

<style scoped>
.all-assign-container {
  max-width: 1000px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.scroll-area {
  height: 525px;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
