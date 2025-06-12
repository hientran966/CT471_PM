<template>
  <div>
    <a-modal v-model:open="open" title="Sơ đồ" @ok="handleOk">
      
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};

defineExpose({ showModal });
</script>

