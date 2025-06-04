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
      <AccountList v-if="activeKey === '1'" />
      <div v-else-if="activeKey === '2'">Tài khoản đã khóa</div>
      <Calendar v-else-if="activeKey === '3'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Menu from "@/components/Menu.vue";
import AccountList from "@/components/AccountList.vue";
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
    getItem("Tài khoản đang hoạt động", "1"),
    getItem("Tài khoản đã khóa", "2"),
  ]),
  getItem("Lịch Nghỉ", "3")
];

const activeKey = ref("1");

function onMenuClick({ key }) {
  activeKey.value = key;
}
</script>

<style scoped></style>
