<template>
  <a-table class="table"
    :columns="columns"
    :row-key="record => record.id"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
    :row-class-name="() => 'clickable-row'"
    :customRow="onRow"
  >
    <template #bodyCell="{ column, record }">
      <!-- Slot riêng cho trạng thái -->
      <template v-if="column.dataIndex === 'trangThai'">
        <slot name="statusSlot" :record="record" />
      </template>

      <!-- Slot cho tài khoản -->
      <template v-else-if="column.dataIndex === 'account'">
        <slot name="actionSlot" :record="record" />
      </template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
  import { computed, watch, ref } from 'vue';
  import type { TableProps } from 'ant-design-vue';
  import { usePagination } from 'vue-request';
  import { defineExpose } from 'vue';

  const lastParams = ref<any>({});

  const props = defineProps<{
    columns: any[],
    queryData: (params: any) => Promise<any[]>,
    searchText?: string
    dateRange?: any
  }>();

  const emit = defineEmits(['row-click']);

  const {
    data: dataSource,
    run,
    loading,
    current,
    pageSize,
  } = usePagination(props.queryData, {
    formatResult: res => res,
    pagination: {
      currentKey: 'page',
      pageSizeKey: 'results',
    },
  });

  const pagination = computed(() => ({
    total: dataSource.value?.length || 0,
    current: current.value,
    pageSize: pageSize.value,
  }));

  const handleTableChange: TableProps['onChange'] = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
  ) => {
    const params = {
      results: pag.pageSize,
      page: pag?.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
      searchText: props.searchText,
    };
    lastParams.value = params;
    run(params);
  };

  function onRow(record) {
    return {
      onClick: () => emit('row-click', record)
    };
  }

  watch(
    () => props.searchText,
    (val) => {
      const params = { ...lastParams.value, searchText: val };
      lastParams.value = params;
      run(params);
    }
  );

  defineExpose({
  reload: () => {
    const params = {
      ...lastParams.value,
      searchText: props.searchText,
    };
    lastParams.value = params;
    run(params);
  }
});
</script>

<style scoped>
  .table {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    margin-top: 10px;
    min-width: 1000px;
  }
</style>