<template>
    <div class="all-account-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Danh sách vai trò</h1>
        <a-button type="primary" @click="roleForm?.showModal()">+</a-button>
      </div>
      <InputSearch v-model="searchText" />
      <Table
        ref="roleTable"
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
    <RoleForm ref="roleForm" @saved="handleCreated" />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import RoleForm from "@/components/RoleForm.vue";
import RoleService from "@/services/VaiTro.service";
import { ref } from "vue";
import { StopOutlined, EditOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

const searchText = ref("");
const roleForm = ref(null);
const roleTable = ref(null);

const columns = [
  { title: "Tên vai trò", dataIndex: "tenVaiTro", sorter: true, width: "125px" },
  {
    title: "Phân quyền",
    dataIndex: "phanQuyen",
    width: "105px",
  },
  { title: "Hành động", dataIndex: "account", width: "100px"},
];

const queryData = async (params) => {
  try {
    let res = await RoleService.getAllRoles();

    if (params?.searchText && params.searchText.trim() !== "") {
      const keyword = params.searchText.trim().toLowerCase();
      res = res.filter(acc =>
        acc.tenVaiTro?.toLowerCase().includes(keyword) ||
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
  roleTable.value?.reload?.();
};

function handleEdit(record) {
  if (roleForm.value?.showModal) {
    roleForm.value.showModal(record.id);
  }
}

async function handleDeactivate(record) {
  Modal.confirm({
    title: "Xác nhận vô hiệu hóa",
    content: `Bạn có chắc muốn vô hiệu hóa vai trò "${record.tenVaiTro}"?`,
    okText: "Xác nhận",
    cancelText: "Hủy",
    onOk: async () => {
      try {
        await RoleService.deleteRole(record.id);
        message.success("Đã vô hiệu hóa vai trò");
        roleTable.value?.reload?.();
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi vô hiệu hóa vai trò");
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