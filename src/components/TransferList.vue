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
          />
        </a-tab-pane>

        <a-tab-pane key="received" tab="Đã nhận">
          <Table
            ref="receivedTable"
            :columns="columnsReceived"
            :queryData="queryDataReceived"
            :searchText="searchText"
          />
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
  <AssignPreview ref="previewRef" />
</template>

<script lang="ts" setup>
import InputSearch from "@/components/InputSearch.vue";
import Table from "@/components/Table.vue";
import AssignService from "@/services/PhanCong.service";
import AccountService from "@/services/TaiKhoan.service";
import { message } from "ant-design-vue";
import { ref, h } from "vue";
import { useRouter } from "vue-router";
import AssignPreview from "@/components/AssignPreview.vue";

const emit = defineEmits(["updated"]);

const open = ref(false);
const searchText = ref("");
const previewRef = ref();
const activeTab = ref("sent");
const sentTable = ref();
const receivedTable = ref();

const router = useRouter();
const currentUser = ref(null);
const accountNameMap = ref(new Map());

const props = defineProps({
  taskId: String,
});

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

const columnsSent = [
  { title: "ID", dataIndex: "id", sorter: true, width: "10%" },
  { title: "Mô tả", dataIndex: "moTa", sorter: true, width: "20%" },
  {
    title: "Phân công",
    dataIndex: "idTruoc",
    width: "15%",
    customRender: ({ record }) =>
      h(
        "a",
        {
          style: "color: #1890ff; cursor: pointer;",
          onClick: () => handlePreview(record.idTruoc),
        },
        record.idTruoc
      ),
  },
  {
    title: "Người nhận",
    dataIndex: "tenNguoiNhan",
    sorter: true,
    width: "20%",
    customRender: ({ record }) => {
      return h("span", {}, record.tenNguoiNhan + (record.isTransfer === 0 ? " (Thu hồi)" : ""));
    },
  },
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
  {
    title: "Phân công",
    dataIndex: "idTruoc",
    width: "15%",
    customRender: ({ record }) =>
      h(
        "a",
        {
          style: "color: #1890ff; cursor: pointer;",
          onClick: () => handlePreview(record.idTruoc),
        },
        record.idTruoc
      ),
  },
  {
    title: "Người gửi",
    dataIndex: "tenNguoiGui",
    sorter: true,
    width: "20%",
    customRender: ({ record }) => {
      return h("span", {}, record.tenNguoiGui + (record.isTransfer === 0 ? " (Thu hồi)" : ""));
    },
  },
  {
    title: "Hành động",
    dataIndex: "actions",
    width: "20%",
    customRender: ({ record }) => {
      if (record.trangThai === "Từ chối") return h("span", { style: "color: red;" }, "Đã từ chối");
      if (record.trangThai === "Đã nhận") return h("span", { style: "color: green;" }, "Đã nhận");

      const isThuHoi = record.isTransfer === 0;
      const labelAccept = isThuHoi ? "Duyệt thu hồi" : "Nhận";
      const labelReject = isThuHoi ? "Từ chối thu hồi" : "Từ chối";

      return h("div", [
        h("a", { style: "margin-right: 8px; color: green;", onClick: () => handleAccept(record) }, labelAccept),
        h("a", { style: "color: red;", onClick: () => handleReject(record) }, labelReject),
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
    const all = await AssignService.getTransferByUser(currentUser.value.id, props.taskId);

    const sent = all.filter(t => 
      (t.isTransfer === 1 && t.idNguoiGui === currentUser.value.id) ||
      (t.isTransfer === 0 && t.idNguoiNhan === currentUser.value.id)
    );

    for (const t of sent) {
      const isThuHoi = t.isTransfer === 0;
      t.tenNguoiNhan = await getAccountName(isThuHoi ? t.idNguoiGui : t.idNguoiNhan);
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
    const all = await AssignService.getTransferByUser(currentUser.value.id, props.taskId);

    const received = all.filter(t => 
      (t.isTransfer === 1 && t.idNguoiNhan === currentUser.value.id) ||
      (t.isTransfer === 0 && t.idNguoiGui === currentUser.value.id)
    );

    for (const t of received) {
      const isThuHoi = t.isTransfer === 0;
      t.tenNguoiGui = await getAccountName(isThuHoi ? t.idNguoiNhan : t.idNguoiGui);
    }

    return filterAndSort(received, params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const reloadTables = () => {
  if (activeTab.value === "received") {
    receivedTable.value?.reload?.();
  } else {
    sentTable.value?.reload?.();
  }
};

const handleAccept = async (record) => {
  try {
    await AssignService.completeTransfer(record.id);
    message.success("Đã nhận");
    reloadTables();
    emit("updated");
  } catch (err) {
    message.error("Lỗi nhận công việc");
  }
};

const handleReject = async (record) => {
  try {
    await AssignService.rejectTransfer(record.id);
    message.success("Đã từ chối");
    reloadTables();
    emit("updated");
  } catch (err) {
    message.error("Lỗi từ chối công việc");
  }
};

const handlePreview = (assignId) => {
  if (previewRef.value?.showModal) {
    previewRef.value.showModal(assignId);
  }
};

const showModal = () => {
  reloadTables();
  open.value = true;
};
const handleOk = () => {
  open.value = false;
};

defineExpose({ showModal });
</script>
