<template>
  <a-card hoverable style="width: 200px" size="small" @click="$emit('preview', props.file)">
    <template #cover>
      <template v-if="isImage">
        <img alt="example" :src="fileSrc" />
      </template>
      <template v-else-if="isWord">
        <img alt="word" src="../assets/icons/word-icon.png" style="width:100px;margin:20px auto;display:block;" />
      </template>
      <template v-else-if="isExcel">
        <img alt="excel" src="../assets/icons/excel-icon.png" style="width:100px;margin:20px auto;display:block;" />
      </template>
      <template v-else-if="isPDF">
        <img alt="file" src="../assets/icons/pdf-icon.png" style="width:100px;margin:20px auto;display:block;" />
      </template>
      <template v-else>
        <img alt="file" src="../assets/icons/file-icon.png" style="width:100px;margin:20px auto;display:block;" />
      </template>
    </template>
    <a-card-meta :title="file.tenFile" description="This is the description">
      <template #avatar>
        <a-avatar :src="`/api/auth/avatar/${props.file.idNguoiTao}`" />
      </template>
    </a-card-meta>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import FileService from "@/services/File.service";
import dayjs from "dayjs";
import { version } from "vite";

const props = defineProps<{
    file: {
    id: string,
    tenFile: string,
    idNguoiTao: string
  },
}>();

const defaultAvatar = "/api/auth/avatar/AC000001"; 
const fileSrc = ref<string>("");

const backendUrl = "http://localhost:3000";

const ext = computed(() => props.file.tenFile.split('.').pop()?.toLowerCase() || "");

const isImage = computed(() => ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext.value));
const isWord = computed(() => ["doc", "docx"].includes(ext.value));
const isExcel = computed(() => ["xls", "xlsx"].includes(ext.value));
const isPDF = computed(() => ["pdf"].includes(ext.value));

onMounted(async () => {
  try {
    const versions = await FileService.getAllVersions(props.file.id);

    if (versions && versions.length > 0) {
      fileSrc.value = `${backendUrl}/${versions[versions.length - 1].duongDan}`;
    }

  } catch (err) {
  }
});
</script>