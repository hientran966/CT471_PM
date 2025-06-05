<template>
    <div class="all-account-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Danh sách phòng ban</h1>
        <a-button type="primary" @click="departmentForm?.showModal()">+</a-button>
      </div>
      <InputSearch v-model="searchText" />
      <Table
        ref="departmentTable"
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
    <DepartmentForm ref="departmentForm" @saved="handleCreated" />
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import DepartmentForm from "@/components/DepartmentForm.vue";
import DepartmentService from "@/services/PhongBan.service";
import { ref } from "vue";
import { StopOutlined, EditOutlined } from "@ant-design/icons-vue";

const searchText = ref("");
const departmentForm = ref(null);
const departmentTable = ref(null);

const columns = [
  { title: "Tên phòng ban", dataIndex: "tenPhong", sorter: true, width: "125px" },
  {
    title: "Phân quyền",
    dataIndex: "phanQuyen",
    filters: [
      { text: "Cao", value: "Cao" },
      { text: "Trung", value: "Trung" },
      { text: "Thấp", value: "Thấp" },
    ],
    width: "105px",
  },
  { title: "Hành động", dataIndex: "account", width: "100px"},
];

const queryData = async (params) => {
  try {
    let res = await DepartmentService.getAllDepartments();

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

    if (params?.phanQuyen && params.phanQuyen.length > 0) {
      res = res.filter(acc => params.phanQuyen.includes(acc.phanQuyen));
    }

    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const handleCreated = () => {
  departmentTable.value?.reload?.();
};

function handleEdit(record) {
  if (departmentForm.value?.showModal) {
    departmentForm.value.showModal(record.id);
  }
}

async function handleDeactivate(record) {
  try {
    const confirmed = await window.confirm(`Xác nhận vô hiệu hóa phòng ban ${record.tenPhong}?`);
    if (!confirmed) return;

    await DepartmentService.deleteDepartment(record.id);
    message.success("Đã vô hiệu hóa phòng ban");
    departmentTable.value?.reload?.();
  } catch (err) {
    console.error(err);
    message.error("Lỗi khi vô hiệu hóa phòng ban");
  }
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