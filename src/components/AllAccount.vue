<template>
    <div style="margin-top: 150px; margin-left: auto; margin-right: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Danh sách tài khoản</h1>
        <a-button type="primary">+</a-button>
      </div>
      <InputSearch v-model="searchText" />
      <Table :columns="columns" :queryData="queryData" :searchText="searchText" />
    </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AuthService from "@/services/TaiKhoan.service";
import { ref } from "vue";

const searchText = ref("");

const columns = [
  { title: "ID", dataIndex: "id", sorter: true, width: "95px" },
  { title: "Tên", dataIndex: "tenNV", sorter: true, width: "125px" },
  {
    title: "Giới tính",
    dataIndex: "gioiTinh",
    filters: [
      { text: "Nam", value: "Nam" },
      { text: "Nữ", value: "Nữ" },
    ],
    width: "105px",
  },
  { title: "Email", dataIndex: "email", width: "100px", ellipsis: true, },
  { title: "Số điện thoại", dataIndex: "SDT", width: "110px" },
  { title: "Địa chỉ", dataIndex: "diaChi", width: "100px", ellipsis: true, },
  {
    title: "Vai trò",
    dataIndex: "vaiTro",
    filters: [
      { text: "Giám đốc", value: "Giám đốc" },
      { text: "Trưởng Phòng", value: "Trưởng Phòng" },
      { text: "Nhân Viên", value: "Nhân Viên" },
      { text: "Admin", value: "Admin" },
    ],
    width: "90px",
  },
  { title: "Địa chỉ", dataIndex: "diaChi", width: "100px", ellipsis: true, },
  { title: "Hành động", dataIndex: "account", width: "100px"},
];

const queryData = async (params) => {
  try {
    let res = await AuthService.getAllAccounts();

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


</script>

<style scoped></style>
