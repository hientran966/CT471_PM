<template>
  <div>
    <a-modal v-model:open="open" title="Danh Sách Chuyển Giao" @ok="handleOk" :width="1200">
      <InputSearch v-model="searchText" style="margin-top: 10px;" />
      
      <h5 style="margin-top: 20px">Đã gửi</h5>
      <Table
        ref="sentTable"
        :columns="columnsSent"
        :queryData="queryDataSent"
        :searchText="searchText"
        @row-click="onRowClick"
      />

      <h5 style="margin-top: 20px">Đã nhận</h5>
      <Table
        ref="receivedTable"
        :columns="columnsReceived"
        :queryData="queryDataReceived"
        :searchText="searchText"
        @row-click="onRowClick"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AssignService from "@/services/PhanCong.service";
import AccountService from "@/services/TaiKhoan.service";
import { message } from "ant-design-vue";
import { ref, h } from "vue";
import { useRouter } from "vue-router";

const emit = defineEmits(["updated"]);

const searchText = ref("");
const router = useRouter();
const open = ref(false);
const currentUser = ref(null);

function onRowClick(record) {
  router.push({ name: "task", query: { projectId: record.id } });
}

const columnsSent = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Mô tả", dataIndex: "moTa", sorter: true, width: "15%" },
  { title: "Phân công", dataIndex: "idTruoc", sorter: true, width: "15%" },
  { title: "Người nhận", dataIndex: "idNguoiNhan", sorter: true, width: "15%" },
  { 
    title: "Trạng thái", 
    dataIndex: "trangThai", 
    width: "15%",
    customRender: ({ record }) => record.trangThai || "Chưa cập nhật"
  },
];

const columnsReceived = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Mô tả", dataIndex: "moTa", sorter: true, width: "15%" },
  { title: "Phân công", dataIndex: "idTruoc", sorter: true, width: "15%" },
  { title: "Người gửi", dataIndex: "idNguoiGui", sorter: true, width: "15%" },
  { 
    title: "Hành động", 
    dataIndex: "actions", 
    width: "20%",
    customRender: ({ record }) => {
      if (record.trangThai === "Từ chối") {
        return h("span", { style: "color: red;" }, "Đã từ chối");
      }
      if (record.ngayNhan) {
        return h("span", { style: "color: green;" }, "Đã nhận");
      }
      return h("div", [
        h(
          "a", 
          { style: "margin-right: 8px; color: green;", onClick: () => handleAccept(record) }, 
          "Nhận"
        ),
        h(
          "a", 
          { style: "color: red;", onClick: () => handleReject(record) }, 
          "Từ chối"
        ),
      ]);
    }
  },
];

const filterAndSort = (data, params) => {
  let res = [...data];

  if (params?.searchText && params.searchText.trim() !== "") {
    const keyword = params.searchText.trim().toLowerCase();
    res = res.filter(acc => acc.moTa?.toLowerCase().includes(keyword));
  }

  if (params?.sortField && params?.sortOrder) {
    const field = params.sortField;
    const order = params.sortOrder === "ascend" ? 1 : -1;
    res = res.slice().sort((a, b) => {
      if (a[field] == null) return 1;
      if (b[field] == null) return -1;
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return a[field].localeCompare(b[field]) * order;
      }
      return (a[field] > b[field] ? 1 : -1) * order;
    });
  }

  return res;
};

const queryDataSent = async (params) => {
  try {
    if (!currentUser.value) {
      currentUser.value = await AccountService.getCurrentUser();
    }

    const all = await AssignService.getTransferByUser(currentUser.value.id);
    const sent = all.filter(t => t.idNguoiGui === currentUser.value.id);
    return filterAndSort(sent, params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const queryDataReceived = async (params) => {
  try {
    if (!currentUser.value) {
      currentUser.value = await AccountService.getCurrentUser();
    }

    const all = await AssignService.getTransferByUser(currentUser.value.id);
    const received = all.filter(t => t.idNguoiNhan === currentUser.value.id);
    return filterAndSort(received, params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const ensureCurrentUser = async () => {
  if (!currentUser.value) {
    currentUser.value = await AccountService.getCurrentUser();
  }
};

const handleAccept = async (record) => {
  try {
    await ensureCurrentUser();
    await AssignService.completeTransfer(record.id);
    message.success("Đã nhận công việc");
  } catch (err) {
    console.error("Lỗi khi nhận công việc", err);
  }
};

const handleReject = async (record) => {
  try {
    await AssignService.rejectTransfer(record.id);
    message.success("Đã từ chối công việc");
  } catch (err) {
    console.error("Lỗi khi từ chối công việc", err);
  }
};

const showModal = () => {
  open.value = true;
};

const handleOk = () => {
  open.value = false;
};

defineExpose({ showModal });
</script>
