<template>
  <a-table class="table"
    :columns="columns"
    :row-key="record => record.id"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import type { TableProps } from 'ant-design-vue';
  import { usePagination } from 'vue-request';

  const props = defineProps<{
    columns: any[],
    queryData: (params: any) => Promise<any[]>
  }>();

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
    run({
      results: pag.pageSize,
      page: pag?.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };
</script>

<style scoped>
  .table {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    margin-top: 10px;
  }
</style>