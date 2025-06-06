<template>
  <div class="me-background">
    <div class="dashboard-container">
      <a-row :gutter="16">
        <a-col :span="20">
          <div class="me-header-overlay">
            <a-avatar :src="avatar" :size="64" class="me-avatar" />
            <h2>Xin chào, {{ user.tenNV }}!</h2>
          </div>

          <a-row :gutter="16" style="margin-top: 20px">
            <a-col :span="12">
              <a-card title="Thông báo">
                <a-list
                  :data-source="announcements"
                  bordered
                  :render-item="(item) => h(AnnouncementItem, { item })"
                />
              </a-card>
            </a-col>

            <a-col :span="12">
              <a-card title="Dự án của tôi">
                <a-table
                  :columns="projectColumns"
                  :data-source="projects"
                  size="small"
                />
              </a-card>
            </a-col>
          </a-row>
          <a-row :gutter="16" style="margin-top: 20px">
            <a-col :span="12">
              <a-card
                title="Công việc của tôi"
                style="max-height: 400px; overflow-y: auto"
              >
                <a-list :data-source="tasks" bordered :render-item="renderTaskItem" />
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h, watch } from "vue";
import AnnouncementItem from "@/components/AnnouncementItem.vue";
import TaskItem from "@/components/TaskItem.vue";
import AuthService from "@/services/TaiKhoan.service";
import ProjectService from "@/services/DuAn.service";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service"
import dayjs from "dayjs";

function formatDate(dateString) {
  return dayjs(dateString).format("DD/MM/YYYY");
}

const announcements = ref([]);

const user = ref({ id: "" });
const tasks = ref([]);

const avatar = computed(() =>
  user.value.id ? `/api/auth/avatar/${user.value.id}` : undefined
);

const projects = ref([]);

const renderTaskItem = ({ item }) => h(TaskItem, { item });

onMounted(async () => {
  try {
    const data = await AuthService.getCurrentUser();
    Object.assign(user.value, data);

    if (user.value.id) {
      projects.value = await ProjectService.getProjectsByAccountId(
        user.value.id
      );
      const rawTasks = await TaskService.getTasksByAccount(user.value.id);

      const tasksWithProgress = await Promise.all(
        rawTasks.map(async (task) => {
          const assignments = await AssignService.getAssignmentsByTask(task.id);

          const totalWeight = assignments.reduce((sum, a) => sum + (a.doQuanTrong || 0), 0);

          const totalProgress = assignments.reduce(
            (sum, a) => sum + ((a.tienDoCaNhan || 0) * (a.doQuanTrong || 0)),
            0
          );

          const tienDo =
            totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
          return { ...task, tienDo };
        })
      );
      tasks.value = tasksWithProgress;
      console.log("Công việc đã load:", JSON.stringify(tasks.value, null, 2));
    }
  } catch (err) {
    console.error("Không lấy được thông tin tài khoản hoặc dự án:", err);
  }
});

const projectColumns = [
  { title: "Tên dự án", dataIndex: "tenDA", key: "tenDA" },
  {
    title: "Bắt đầu",
    dataIndex: "ngayBD",
    key: "ngayBD",
    customRender: ({ text }) => formatDate(text),
  },
  {
    title: "Kết thúc",
    dataIndex: "ngayKT",
    key: "ngayKT",
    customRender: ({ text }) => formatDate(text),
  },
];
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.sidebar {
  background-color: #fff;
  height: 100vh;
  padding-top: 20px;
  border-right: 1px solid #f0f0f0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.me-header {
  position: relative;
  background-image: url("@/assets/background.jpg");
  background-size: cover;
  background-position: center;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.me-background {
  background-image: url("@/assets/background.jpg");
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  min-width: calc(100vw - 75px);
  padding: 40px;
}

.me-header-overlay {
  background-color: rgba(255, 255, 255, 0.75);
  padding: 20px 30px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.me-avatar {
  border: 2px solid white;
}
</style>
