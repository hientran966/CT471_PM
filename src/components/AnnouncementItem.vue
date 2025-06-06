<template>
  <a-list-item>
    {{ item.content }}
    <span style="float:right;">{{ item.time }}</span>
  </a-list-item>
</template>

<script setup>
defineProps(['item'])
</script>