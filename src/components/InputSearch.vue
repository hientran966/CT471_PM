<template>
  <a-input-search
    :value="modelValue"
    @update:value="val => $emit('update:modelValue', val)"
    placeholder="Nhập từ khóa tìm kiếm"
    enter-button
    @search="onSearch"
  />
</template>

<script lang="ts" setup>
    const props = defineProps<{ modelValue: string }>();
    const emit = defineEmits(['update:modelValue', 'search']);

    const onSearch = (searchValue: string) => {
        emit('update:modelValue', searchValue);
    };
</script>