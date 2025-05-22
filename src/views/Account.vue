<template>
  <div class="row">
    <div class="col-4">
      <Menu :items="items" style="max-height: 100%;"/>
    </div>
    <div class="col-8" style="margin-top: 150px;">
      <h1>Danh sách tài khoản</h1>
      <InputSearch v-model="searchText" />
      <Table :columns="columns" :queryData="queryData" />
    </div>
  </div>
</template>

<script setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AuthService from "@/services/TaiKhoan.service";
import Menu from "@/components/Menu.vue";
import { h } from "vue";
import {
  MailOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { ref } from "vue";
function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const searchText = ref("");

const items = [
  getItem("Navigation One", "sub1", () => h(MailOutlined), [
    getItem(
      "Item 1",
      "g1",
      null,
      [getItem("Option 1", "1"), getItem("Option 2", "2")],
      "group"
    ),
    getItem(
      "Item 2",
      "g2",
      null,
      [getItem("Option 3", "3"), getItem("Option 4", "4")],
      "group"
    ),
  ]),
  getItem("Navigation Two", "sub2", () => h(AppstoreOutlined), [
    getItem("Option 5", "5"),
    getItem("Option 6", "6"),
    getItem("Submenu", "sub3", null, [
      getItem("Option 7", "7"),
      getItem("Option 8", "8"),
    ]),
  ]),
  { type: "divider" },
  getItem("Navigation Three", "sub4", () => h(SettingOutlined), [
    getItem("Option 9", "9"),
    getItem("Option 10", "10"),
    getItem("Option 11", "11"),
    getItem("Option 12", "12"),
  ]),
  getItem(
    "Group",
    "grp",
    null,
    [getItem("Option 13", "13"), getItem("Option 14", "14")],
    "group"
  ),
];

const columns = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Tên", dataIndex: "tenNV", sorter: true, width: "15%" },
  {
    title: "Giới tính",
    dataIndex: "gioiTinh",
    filters: [
      { text: "Nam", value: "Nam" },
      { text: "Nữ", value: "Nữ" },
    ],
    width: "10%",
  },
  { title: "Email", dataIndex: "email", width: "15%" },
  { title: "Số điện thoại", dataIndex: "SDT", width: "15%" },
  { title: "Địa chỉ", dataIndex: "diaChi", width: "20%" },
  {
    title: "Vai trò",
    dataIndex: "vaiTro",
    filters: [
      { text: "Giám đốc", value: "Giám đốc" },
      { text: "Trưởng Phòng", value: "Trưởng Phòng" },
      { text: "Nhân Viên", value: "Nhân Viên" },
      { text: "Admin", value: "Admin" },
    ],
    width: "15%",
  },
];

const queryData = async (params) => {
  try {
    const res = await AuthService.getAllAccounts();
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};
</script>

<style scoped></style>
