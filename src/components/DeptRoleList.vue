<template>
    <div class="all-account-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Danh sách loại phòng ban</h1>
        <a-button type="primary" @click="deptRoleForm?.showModal()">+</a-button>
      </div>
      <InputSearch v-model="searchText" />
      <Table
        ref="deptRoleTable"
        :columns="columns"
        :queryData="queryData"
        :searchText="searchText"
        v-slot:actionSlot="{ record }"
      >
        <a-space>
          <a-button type="primary" danger size="small" @click="handleDeactivate(record)">
            <StopOutlined />
          </a-button>
          <a-button type="primary" size="small" @click="handleEdit(record)">
            <EditOutlined />
          </a-button>
        </a-space>
      </Table>
    </div>
    <DeptRoleForm ref="deptRoleForm" @saved="handleCreated" />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import DeptRoleForm from "@/components/DeptRoleForm.vue";
import DeptRoleService from "@/services/LoaiPhongBan.service";
import { ref } from "vue";
import { StopOutlined, EditOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

const searchText = ref("");
const deptRoleForm = ref(null);
const deptRoleTable = ref(null);

const columns = [
  { title: "Loại phòng ban", dataIndex: "loaiPhongBan", sorter: true, width: "125px" },
  {
    title: "Phân quyền",
    dataIndex: "phanQuyen",
    width: "105px",
  },
  { title: "Hành động", dataIndex: "account", width: "100px"},
];

const queryData = async (params) => {
  try {
    let res = await DeptRoleService.getAllDeptRoles();

    if (params?.searchText && params.searchText.trim() !== "") {
      const keyword = params.searchText.trim().toLowerCase();
      res = res.filter(acc =>
        acc.tenPhong?.toLowerCase().includes(keyword) ||
        acc.phanQuyen?.toLowerCase().includes(keyword)
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

    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const handleCreated = () => {
  deptRoleTable.value?.reload?.();
};

function handleEdit(record) {
  if (deptRoleForm.value?.showModal) {
    deptRoleForm.value.showModal(record.id);
  }
}

async function handleDeactivate(record) {
  Modal.confirm({
    title: "Xác nhận vô hiệu hóa",
    content: `Bạn có chắc muốn vô hiệu hóa loại phòng ban ${record.loaiPhongBan}?`,
    okText: "Xác nhận",
    cancelText: "Hủy",
    onOk: async () => {
      try {
        await DeptRoleService.deleteDeptRole(record.id);
        message.success("Đã vô hiệu hóa loại phòng ban");
        deptRoleTable.value?.reload?.();
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi vô hiệu hóa loại phòng ban");
      }
    },
  });
}

</script>

<style scoped>
.all-account-container {
  max-width: 900px;
  margin: 20px auto 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>