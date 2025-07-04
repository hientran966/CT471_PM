<template>
    <div class="all-account-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Danh sách tài khoản</h1>
      </div>
      <InputSearch v-model="searchText" />
      <Table
        ref="tableRef" 
        :columns="columns"
        :queryData="queryData"
        :searchText="searchText"
        v-slot:actionSlot="{ record }"
      >
        <a-space>
          <a-button type="primary" size="small" @click="handleRecover(record)">
            Khôi phục
          </a-button>
        </a-space>
      </Table>
    </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AuthService from "@/services/TaiKhoan.service";
import RoleService from "@/services/VaiTro.service";
import DepartmentService from "@/services/PhongBan.service";
import { ref } from "vue";
import { Modal, message } from "ant-design-vue";

const searchText = ref("");
const tableRef = ref(null);
const roleMap = ref({});
const deptMap = ref({});

const columns = [
  { title: "Tên", dataIndex: "tenNV", sorter: true, width: "125px" },
  {
    title: "Giới tính",
    dataIndex: "gioiTinh",
    filters: [
      { text: "Nam", value: "Nam" },
      { text: "Nữ", value: "Nữ" },
    ],
    width: "95px",
  },
  { title: "Email", dataIndex: "email", width: "140px", ellipsis: true },
  { title: "Số điện thoại", dataIndex: "SDT", width: "110px" },
  { title: "Địa chỉ", dataIndex: "diaChi", width: "120px", ellipsis: true },
  {
    title: "Vai trò",
    dataIndex: "vaiTro",
    customRender: ({ text }) => roleMap.value[text] || text,
    width: "120px",
  },
  {
    title: "Phòng ban",
    dataIndex: "idPhong",
    customRender: ({ text }) => deptMap.value[text] || text,
    width: "150px",
  },
  {
    title: "Hành động",
    dataIndex: "account",
    width: "100px"
  },
];

const loadMaps = async () => {
  try {
    const roles = await RoleService.getAllRoles();
    const depts = await DepartmentService.getAllDepartments();

    roleMap.value = Object.fromEntries(roles.map(role => [role.id, role.tenVaiTro]));
    deptMap.value = Object.fromEntries(depts.map(dept => [dept.id, dept.tenPhong]));
  } catch (e) {
    console.error("Lỗi tải vai trò hoặc phòng ban:", e);
  }
};
loadMaps();

const queryData = async (params) => {
  try {
    let res = await AuthService.getDeactive();

    if (params?.searchText && params.searchText.trim() !== "") {
      const keyword = params.searchText.trim().toLowerCase();
      res = res.filter(acc =>
        acc.tenNV?.toLowerCase().includes(keyword) ||
        acc.email?.toLowerCase().includes(keyword) ||
        acc.SDT?.toLowerCase().includes(keyword) ||
        acc.diaChi?.toLowerCase().includes(keyword)
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

    if (params?.gioiTinh && params.gioiTinh.length > 0) {
      res = res.filter(acc => params.gioiTinh.includes(acc.gioiTinh));
    }

    if (params?.vaiTro && params.vaiTro.length > 0) {
      res = res.filter(acc => params.vaiTro.includes(acc.vaiTro));
    }
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

async function handleRecover(record) {
    Modal.confirm({
      title: `Xác nhận khôi phục`,
      content: `Bạn có chắc muốn khôi phục tài khoản ${record.tenNV}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await AuthService.recover(record.id);
          message.success("Đã khôi phục tài khoản");
          tableRef.value?.reload?.();
        } catch (err) {
          console.error(err);
          message.error("Lỗi khi khôi phục tài khoản");
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