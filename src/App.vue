<script>
import AppHeader from "@/components/AppHeader.vue";

export default {
  components: {
    AppHeader,
  },
  computed: {
    isLoginPage() {
      return this.$route.name === "login";
    },
  },
};
</script>

<template>
  <AppHeader v-if="!isLoginPage" />
  <div class="main-content">
    <router-view />
  </div>
</template>

<style>
.main-content {
  margin-left: 60px;
  width: calc(100vw - 80px);
  min-height: 100vh;
}
</style>