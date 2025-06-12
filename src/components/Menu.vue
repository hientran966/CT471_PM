<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    style="width: 256px ; height: 100vh; border-right: 2px solid #e8e8e8;"
    mode="inline"
    :items="items"
    @click="handleClick"
  ></a-menu>
</template>
<script lang="ts" setup>
    import { ref, watch } from 'vue';
    import type { MenuProps, ItemType } from 'ant-design-vue';

    const props = defineProps<{
    items: ItemType[]
    }>();

    const selectedKeys = ref<string[]>(['1']);
    const openKeys = ref<string[]>(['sub1']);

    const handleClick: MenuProps['onClick'] = e => {
    };

    watch(openKeys, val => {

    });
</script>

<style scoped>

</style>