<template>
  <div class="row">
    <div class="col-2">
      <Menu 
        :items="items"
        @click="onMenuClick"
        style="max-height: 100%;"
        />
    </div>
    <div class="col-10">
      <AccountList v-if="activeKey === 'account'" />
      <DeactivetList v-else-if="activeKey === 'deactive'"/>
      <DepartmentList v-else-if="activeKey === 'department'" />
      <Calendar v-else-if="activeKey === 'calendar'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Menu from "@/components/Menu.vue";
import AccountList from "@/components/AccountList.vue";
import DeactivetList from "@/components/DeactiveList.vue";
import DepartmentList from "@/components/DepartmentList.vue";
import Calendar from "@/components/Calendar.vue";
import { h } from "vue";
import { SettingOutlined } from "@ant-design/icons-vue";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem("Quản Lý Tài Khoản", "sub4", () => h(SettingOutlined), [
    getItem("Tài khoản đang hoạt động", "account"),
    getItem("Tài khoản đã khóa", "deactive"),
  ]),
  getItem("Phòng ban", "department"),
  getItem("Lịch Nghỉ", "calendar")
];

const activeKey = ref("account");

function onMenuClick({ key }) {
  activeKey.value = key;
}
</script>

<style scoped></style>
