<template>
  <div>
    <a-modal v-model:open="open" title="Danh Sách Chuyển Giao" :footer="null" @ok="handleOk" :width="1200">
      <InputSearch v-model="searchText" style="margin-bottom: 20px;" />

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="sent" tab="Đã gửi">
          <Table
            ref="sentTable"
            :columns="columnsSent"
            :queryData="queryDataSent"
            :searchText="searchText"
            @row-click="onRowClick"
          />
        </a-tab-pane>

        <a-tab-pane key="received" tab="Đã nhận">
          <Table
            ref="receivedTable"
            :columns="columnsReceived"
            :queryData="queryDataReceived"
            :searchText="searchText"
            @row-click="onRowClick"
          />
        </a-tab-pane>
      </a-tabs>
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

const open = ref(false);
const searchText = ref("");
const activeTab = ref("sent");

const router = useRouter();
const currentUser = ref(null);
const accountNameMap = ref(new Map());

const getAccountName = async (id) => {
  if (!id) return "";
  if (accountNameMap.value.has(id)) return accountNameMap.value.get(id);
  try {
    const acc = await AccountService.getAccountById(id);
    const name = acc?.tenNV || id;
    accountNameMap.value.set(id, name);
    return name;
  } catch {
    return id;
  }
};

const onRowClick = (record) => {
  router.push({ name: "task", query: { projectId: record.id } });
};

const columnsSent = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Mô tả", dataIndex: "moTa", sorter: true, width: "20%" },
  { title: "Phân công", dataIndex: "idTruoc", sorter: true, width: "15%" },
  { title: "Người nhận", dataIndex: "tenNguoiNhan", sorter: true, width: "20%" },
  {
    title: "Trạng thái",
    dataIndex: "trangThai",
    width: "15%",
    customRender: ({ record }) => record.trangThai || "Chưa cập nhật",
  },
];

const columnsReceived = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Mô tả", dataIndex: "moTa", sorter: true, width: "20%" },
  { title: "Phân công", dataIndex: "idTruoc", sorter: true, width: "15%" },
  { title: "Người gửi", dataIndex: "tenNguoiGui", sorter: true, width: "20%" },
  {
    title: "Hành động",
    dataIndex: "actions",
    width: "20%",
    customRender: ({ record }) => {
      if (record.trangThai === "Từ chối") return h("span", { style: "color: red;" }, "Đã từ chối");
      if (record.trangThai === "Đã nhận") return h("span", { style: "color: green;" }, "Đã nhận");
      return h("div", [
        h("a", { style: "margin-right: 8px; color: green;", onClick: () => handleAccept(record) }, "Nhận"),
        h("a", { style: "color: red;", onClick: () => handleReject(record) }, "Từ chối"),
      ]);
    },
  },
];

const filterAndSort = (data, params) => {
  let res = [...data];
  const keyword = params?.searchText?.trim().toLowerCase();
  if (keyword) res = res.filter(d => d.moTa?.toLowerCase().includes(keyword));

  if (params?.sortField && params?.sortOrder) {
    const field = params.sortField;
    const order = params.sortOrder === "ascend" ? 1 : -1;
    res.sort((a, b) => {
      const va = a[field] ?? "", vb = b[field] ?? "";
      return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * order;
    });
  }
  return res;
};

const queryDataSent = async (params) => {
  try {
    if (!currentUser.value) currentUser.value = await AccountService.getCurrentUser();
    const all = await AssignService.getTransferByUser(currentUser.value.id);
    const sent = all.filter(t => t.idNguoiGui === currentUser.value.id);

    for (const t of sent) {
      t.tenNguoiNhan = await getAccountName(t.idNguoiNhan);
    }

    return filterAndSort(sent, params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const queryDataReceived = async (params) => {
  try {
    if (!currentUser.value) currentUser.value = await AccountService.getCurrentUser();
    const all = await AssignService.getTransferByUser(currentUser.value.id);
    const received = all.filter(t => t.idNguoiNhan === currentUser.value.id);

    for (const t of received) {
      t.tenNguoiGui = await getAccountName(t.idNguoiGui);
    }

    return filterAndSort(received, params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const handleAccept = async (record) => {
  try {
    await AssignService.completeTransfer(record.id);
    message.success("Đã nhận công việc");
  } catch (err) {
    message.error("Lỗi nhận công việc");
  }
};

const handleReject = async (record) => {
  try {
    await AssignService.rejectTransfer(record.id);
    message.success("Đã từ chối công việc");
  } catch (err) {
    message.error("Lỗi từ chối công việc");
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
