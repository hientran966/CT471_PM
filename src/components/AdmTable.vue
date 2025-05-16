<template>
  <a-table
    :columns="columns"
    :row-key="record => record.login.uuid"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'name'">{{ text.first }} {{ text.last }}</template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import type { TableProps } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import axios from 'axios';
import AuthService from '@/services/TaiKhoan.service';
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    sorter: true,
    width: '20%',
  },
  {
    title: 'Tên',
    dataIndex: 'tenNV',
    sorter: true,
    width: '20%',
  },
  {
    title: 'Giới tính',
    dataIndex: 'gioiTinh',
    filters: [
      { text: 'Nam', value: 'Nam' },
      { text: 'Nữ', value: 'Nữ' },
    ],
    width: '20%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'SDT',
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'diaChi',
  },
  {
    title: 'Chức vụ',
    dataIndex: 'chucVu',
    filters: [
      { text: 'Trưởng Phòng', value: 'Trưởng Phòng' },
      { text: 'Nhân Viên', value: 'Nhân Viên' },
      { text: 'Admin', value: 'Admin' },
    ],
  }
];

type APIParams = {
  results: number;
  page?: number;
  sortField?: string;
  sortOrder?: number;
  [key: string]: any;
};
type APIResult = {
  results: {
    id: string;
    tenNV: string;
    gioiTinh: string;
    email: string;
    SDT: string;
    diaChi: string;
    chucVu: string;
  }[];
};

const queryData = async (params: APIParams) => {
  try {
    const res = await AuthService.getAllAccounts();
    return res;
  } catch (err) {
    console.error(err);
    return { results: [] };
  }
};

const {
  data: dataSource,
  run,
  loading,
  current,
  pageSize,
} = usePagination(queryData, {
  formatResult: res => res.data.results,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'results',
  },
});

const pagination = computed(() => ({
  total: 200,
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
