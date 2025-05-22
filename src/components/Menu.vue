<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    style="width: 256px"
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
    console.log('click', e);
    };

    watch(openKeys, val => {
    console.log('openKeys', val);
    });
</script>