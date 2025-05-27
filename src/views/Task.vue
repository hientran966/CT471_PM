<template>
    <div class="row">
        <div class="col-4">
        <Menu 
            :items="items"
            @click="onMenuClick"
            style="max-height: 100%;"
            />
        </div>
        <div class="col-8">
            <AllTask />
        </div>
    </div>
</template>

<script setup>
import AllTask from '@/components/AllTask.vue';
import Menu from '@/components/Menu.vue';
import { ref } from "vue";
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
  getItem("Danh Sách Dự Án", "sub4", () => h(SettingOutlined), [
    getItem("Dự Án 1", "1"),
    getItem("Dự Án 2", "2"),
    getItem("Dự Án 3", "3"),
  ]),
  getItem("Temp", "3")
];

const activeKey = ref("1");

function onMenuClick({ key }) {
  activeKey.value = key;
}
</script>
