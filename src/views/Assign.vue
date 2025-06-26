<template>
  <div class="row" style="max-height: 100vh;">
    <div class="col-2" style="background-attachment: fixed;">
      <Menu 
        :items="items"
        :selectedKeys="[activeKey]"
        @select="onMenuClick"
        style="max-height: 100%;"
      />
    </div>
    <div class="col-10 all-task-scroll">
      <a-page-header
        title="Chi tiết phân công"
        :sub-title="currentTask?.tenCV || ''"
        :breadcrumb="{ routes, itemRender }"
      >
        <template #extra>
          <a-space>
            <a-button
              type="primary"
              @click="$router.push({ name: 'file', query: { taskId: taskId, projectId: projectId } })"
            >
              Xem tất cả file
            </a-button>
            <a-button type="primary" @click="transferList?.showModal()">Yêu cầu chuyển giao</a-button>
            <a-button v-if="isCreator" type="primary" @click="assignForm?.showModal()">Phân công mới</a-button>
          </a-space>
        </template>
      </a-page-header>
      <AssignList :taskId="taskId" :projectId="projectId"/>
    </div>
  </div>
  <AssignForm ref="assignForm" :task-id="taskId" @created="() => assignListRef?.loadAssigns?.()" />
  <TransferList ref="transferList" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import ProjectService from "@/services/DuAn.service"
import TaskService from "@/services/CongViec.service"
import AssignList from '@/components/AssignList.vue';
import TransferList from '@/components/TransferList.vue';
import AssignForm from '@/components/AssignForm.vue';
import AuthService from "@/services/TaiKhoan.service";
import Menu from '@/components/Menu.vue';

const route = useRoute();
const router = useRouter();
const taskId = ref("");
const projectId = computed(() => String(route.query.projectId || ""));
const items = ref([]);
const currentTask = ref();
const assignForm = ref(null);
const transferList = ref(null);
const currentUser = ref(null);
const taskCreatorId = ref("");
const isCreator = computed(() => taskCreatorId.value === currentUser.value?.id);

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const routes = computed(() => [
  {
    path: "/project",
    breadcrumbName: "Dự án",
    name: "project",
  },
  {
    path: "/task",
    breadcrumbName: "Danh sách công việc",
    name: "task",
  },
  {
    path: "/curr",
    breadcrumbName: "Chi tiết phân công",
    name: "curr",
  },
]);

function itemRender({ route }) {
  return h(
    "a",
    {
      onClick: (e) => {
        e.preventDefault();
        if (route.name !== "curr") {
          router.push({ name: route.name, query: { projectId: projectId.value, taskId: taskId.value } });
        }
      },
    },
    route.breadcrumbName
  );
}

const activeKey = ref("0");

onMounted(async () => {
  currentUser.value = await AuthService.getCurrentUser();
  taskId.value = route.query.taskId || "";
  const projects = await ProjectService.getAllProjects();
  currentTask.value = await TaskService.getTaskById(taskId.value);
  taskCreatorId.value = currentTask.value.idNguoiTao;
  items.value = [
    getItem(
      h('b', projectId.value && projects.find(p => String(p.id) === projectId.value)
        ? projects.find(p => String(p.id) === projectId.value).tenDA
        : "Chọn dự án"
      ),
      "projectName",
      null
    ),
    getItem(
      "Danh sách công việc",
      "task"
    ),
    getItem(
      "Thông tin dự án",
      "info"
    ),
    getItem(
      "File",
      "file" 
    )
  ];
});
function onMenuClick({ key }) {
  if (key === "task") {
    router.push({ name: "task", query: { projectId: projectId.value } });
  }  else if (key === "info") {
    router.push({ name: "info", query: { projectId: projectId.value } });
  } else if (key === "file") {
    router.push({ name: "PJfile", query: { projectId: projectId.value } });
  }
  activeKey.value = key;
}

</script>

<style scoped>
.all-task-scroll {
  height: 100vh;
  overflow-y: auto;
  background-attachment: scroll;
}
</style>