<template>
  <AllAssign :taskId="taskId"/>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, h, onMounted, computed } from "vue";
import AllAssign from '@/components/AllAssign.vue';

const route = useRoute();
const taskId = ref("");

onMounted(() => {
  taskId.value = route.query.taskId || "";
});
</script>
