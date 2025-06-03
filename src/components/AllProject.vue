<template>
    <div style="margin-top: 20px; width: calc(100vw - 75px); margin-left: 10px; margin-right: auto;">
      <a-space size="30" direction="vertical">
        <h5>Danh sách dự án</h5>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="addProject?.showModal()">Thêm Mới</a-button>
      </a-space>
      <InputSearch v-model="searchText" style="margin-top: 10px;"/>
      <Table
        :columns="columns"
        :queryData="queryData"
        :searchText="searchText"
        @row-click="onRowClick"
      />
    </div>
    <AddProject ref="addProject" ></AddProject>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AddProject from "@/components/AddProject.vue";

import ProjectService from "@/services/DuAn.service"
import AssignmentService from "@/services/PhanCong.service";
import TaskService from "@/services/CongViec.service";
import AccountService from "@/services/TaiKhoan.service";

import { h, ref } from "vue";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons-vue";
import { Tooltip } from "ant-design-vue";
import { useRouter } from "vue-router";

const searchText = ref("");
const addProject = ref("");
const router = useRouter();

function onRowClick(record) {
  router.push({ name: "task", query: { projectId: record.id } });
}

const columns = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Tên dự án", dataIndex: "tenDA", sorter: true, width: "15%" },
  { title: "Ngày bắt đầu", dataIndex: "ngayBD", sorter: true, width: "15%", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  { title: "Ngày kết thúc", dataIndex: "ngayKT", sorter: true, width: "15%", customRender: ({ text }) => text ? dayjs(text).format("DD/MM/YYYY") : "" },
  {
    title: "Trạng Thái",
    dataIndex: "trangThai",
    filters: [
      { text: "Chưa bắt đầu", value: "Chưa bắt đầu" },
      { text: "Đang tiến hành", value: "Đang tiến hành" },
      { text: "Đã hoàn thành", value: "Đã hoàn thành" },
    ],
    width: "15%",
  },
  {
    title: "Quản Lý",
    dataIndex: "idNguoiTao",
    width: "10%",
    customRender: ({ record }) => {
      const manager = record.manager;
      if (!manager) return "";
      return h(
        Tooltip,
        { title: manager.tenNV },
        {
          default: () =>
            h("img", {
              src: `/api/auth/avatar/${manager.id}`,
              style: "width:32px;height:32px;border-radius:50%;margin-right:8px;object-fit:cover;",
              alt: manager.tenNV,
            }),
        }
      );
    }
  },
  {
    title: "Tham Gia",
    dataIndex: "assign",
    width: "20%",
    customRender: ({ record }) => {
      if (!record.participants || !record.participants.length) return "";
      const defaultAvatar = "/api/auth/avatar/AC000001"; 
      return h(
        "div",
        { style: "display:flex;gap:4px;" },
        record.participants.map(user =>
          h(
            Tooltip,
            { title: user.tenNV },
            {
              default: () =>
                h("img", {
                  key: user.id,
                  src: `/api/auth/avatar/${user.id}`,
                  style: "width:32px;height:32px;border-radius:50%;object-fit:cover;",
                  alt: user.tenNV,
                  onError: (e) => { e.target.src = defaultAvatar; }
                }),
            }
          )
        )
      );
    }
  }
];

const queryData = async (params) => {
  try {
    let res = await ProjectService.getAllProjects();

    if (params?.searchText && params.searchText.trim() !== "") {
      const keyword = params.searchText.trim().toLowerCase();
      res = res.filter(acc =>
        acc.tenDA?.toLowerCase().includes(keyword)
      );
    }

    if (params?.sortField && params?.sortOrder) {
      const field = params.sortField;
      const order = params.sortOrder === "ascend" ? 1 : -1;
      res = res.slice().sort((a, b) => {
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        if (typeof a[field] === "string" && typeof b[field] === "string") {
          return a[field].localeCompare(b[field]) * order;
        }
        return (a[field] > b[field] ? 1 : -1) * order;
      });
    }

    if (params?.trangThai && params.trangThai.length > 0) {
      res = res.filter(acc => params.trangThai.includes(acc.trangThai));
    }

    for (const project of res) {
      if (project.idNguoiTao) {
        const manager = await AccountService.getAccountById(project.idNguoiTao);
        project.manager = manager;
      }
      // Lấy tất cả công việc của dự án
      const tasks = await TaskService.getTasksByProject(project.id);
      let participantIds = new Set();

      // Lấy tất cả phân công của từng công việc
      for (const task of tasks) {
        const assignments = await AssignmentService.getAssignmentsByTask(task.id);
        assignments.forEach(a => participantIds.add(a.idNguoiNhan));
      }

      // Lấy thông tin tài khoản cho từng id người tham gia (loại trùng)
      project.participants = await Promise.all(
        Array.from(participantIds).map(async (id) => {
          const user = await AccountService.getAccountById(id);
          return user;
        })
      );
    }
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

</script>

<style scoped></style>
