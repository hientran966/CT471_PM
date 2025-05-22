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
  <div class="container" style="margin-left: 50px;">
    <router-view />
  </div>
</template>