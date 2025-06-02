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
    <template #bodyCell="{ column }">
      <template v-if="column.dataIndex === 'account'">
        <a-button type="primary" danger size="small">
          <StopOutlined />
        </a-button>
        <a-button type="primary" success size="small">
          <EditOutlined />
        </a-button>
      </template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import type { TableProps } from 'ant-design-vue';
  import { usePagination } from 'vue-request';
  import { StopOutlined, EditOutlined } from "@ant-design/icons-vue";
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
    run({
      results: pag.pageSize,
      page: pag?.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
      searchText: props.searchText,
    });
  };

  function onRow(record) {
    return {
      onClick: () => emit('row-click', record)
    };
  }

  watch(
    () => props.searchText,
    (val) => {
      run({ searchText: val });
    }
  );
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