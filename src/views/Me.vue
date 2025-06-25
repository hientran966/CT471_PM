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
              <a-card title="Dự án & Công việc">
                <a-table
                  :columns="treeColumns"
                  :data-source="treeData"
                  :pagination="false"
                  :default-expand-all-rows="true"
                />
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="Thông báo">
                <a-list
                  :data-source="announcements"
                  bordered
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <AnnouncementItem :item="item" />
                    </a-list-item>
                  </template>
                </a-list>
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
import AuthService from "@/services/TaiKhoan.service";
import ProjectService from "@/services/DuAn.service";
import TaskService from "@/services/CongViec.service";
import AssignService from "@/services/PhanCong.service";
import NotificationService from "@/services/ThongBao.service";
import dayjs from "dayjs";

function formatDate(dateString) {
  return dayjs(dateString).format("DD/MM/YYYY");
}

const getNotificationType = (item) => {
  if (item.idPhienBan) return "Đánh giá file";
  if (item.idPhanCong) return "Báo cáo phân công";
  if (item.idCongViec) return "Thông báo công việc";
  if (item.idDuAn) return "Thông báo dự án";
  return "Thông báo chung";
};

const announcements = ref([]);

const user = ref({ id: "" });
const treeData = ref([]);

const avatar = computed(() =>
  user.value.id ? `/api/auth/avatar/${user.value.id}` : undefined
);

onMounted(async () => {
  try {
    const data = await AuthService.getCurrentUser();
    Object.assign(user.value, data);

    if (user.value.id) {
      const [projectsRaw, tasksRaw] = await Promise.all([
        ProjectService.getProjectsByAccountId(user.value.id),
        TaskService.getTasksByAccount(user.value.id),
      ]);

      announcements.value = await NotificationService.getByReceive(user.value.id);

      console.log("announcements", announcements.value);

      const tasksWithProgress = await Promise.all(
        tasksRaw.map(async (task) => {
          const assignments = await AssignService.getAssignmentsByTask(task.id);
          const totalWeight = assignments.reduce((sum, a) => sum + (a.doQuanTrong || 0), 0);
          const totalProgress = assignments.reduce(
            (sum, a) => sum + ((a.tienDoCaNhan || 0) * (a.doQuanTrong || 0)),
            0
          );
          const tienDo = totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
          return { ...task, tienDo };
        })
      );

      const groupedData = projectsRaw.map((project) => {
        const children = tasksWithProgress
          .filter((task) => task.idDuAn === project.id)
          .map((task) => ({
            key: `task-${task.id}`,
            ten: task.tenCV,
            ngayBD: formatDate(task.ngayBD),
            ngayKT: formatDate(task.ngayKT),
            trangThai: task.trangThai,
          }));

        return {
          key: `project-${project.id}`,
          ten: project.tenDA,
          ngayBD: formatDate(project.ngayBD),
          ngayKT: formatDate(project.ngayKT),
          trangThai: project.trangThai,
          children,
        };
      });

      treeData.value = groupedData;
    }
  } catch (err) {
    console.error("Không lấy được thông tin:", err);
  }
});

const treeColumns = [
  { title: "Tên", dataIndex: "ten", key: "ten" },
  { title: "Bắt đầu", dataIndex: "ngayBD", key: "ngayBD" },
  { title: "Kết thúc", dataIndex: "ngayKT", key: "ngayKT" },
  { title: "Trạng thái", dataIndex: "trangThai", key: "trangThai" },
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
