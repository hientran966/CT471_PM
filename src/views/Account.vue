<template>
  <div class="page row">
    <InputSearch v-model="searchText" />
    <AdmTable/>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import AdmTable from "@/components/AdmTable.vue";

export default {
  components: {
    AdmTable,
    InputSearch,
  },
};
</script>

<style scoped>
</style>