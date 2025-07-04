<template>
  <a-card style="width: 100%;" >
    <template #title>
      <strong>{{ assign.moTa }}</strong>
    </template>
    <template #extra>
      <a-space>
        <a v-if="!assign.ngayNhan && assign.trangThai !='Đã từ chối' && isAssigned && !view" type="link" @click="handleAccept" href="#">Nhận</a>

        <a-popconfirm title="Xác nhận từ chối phân công?" @confirm="handleReject" ok-text="Xác nhận" cancel-text="Hủy">
          <a v-if="!assign.ngayNhan && assign.trangThai !='Đã từ chối' && isAssigned && !view" type="link" href="#">Từ Chối</a>
        </a-popconfirm>

        <a v-if="isManager && assign.trangThai=='Chưa bắt đầu' && !view" type="link" @click="handleEdit" href="#">Sửa</a>

        <a-popconfirm title="Xác nhận thu hồi phân công?" @confirm="handleWithdraw" ok-text="Xác nhận" cancel-text="Hủy">
          <a v-if="isManager && !view" type="link" href="#">Thu hồi</a>
        </a-popconfirm>

        <a v-if="assign.ngayNhan && isAssigned && !view" type="link" @click="reportForm?.showModal()" href="#">Cập Nhật</a>

        <a v-if="assign.ngayNhan && isAssigned && !view" type="link" @click="transferForm?.showModal()" href="#">Chuyển</a>

        <a v-if="!view" type="link" @click="transferHistoryRef?.showModal()" href="#">Xem</a>
      </a-space>
    </template>
    <div style="display: flex; align-items: center; gap: 8px;">
      <template v-for="(user, idx) in participants" :key="idx">
        <a-tooltip :title="user.name">
          <a-avatar
          :src="user.avatar"
          :style="!user.avatar ? { backgroundColor: '#1890ff' } : undefined"
          >
          <template v-if="!user.avatar">{{ user.name?.charAt(0) || '?' }}</template>
          </a-avatar>
        </a-tooltip>
        <span
        v-if="idx < participants.length - 1"
        style="margin: 0 4px; font-size: 18px; color: #aaa;"
        >
        →
        </span>
      </template>
    </div>

    <div style="display: flex; justify-content: space-between;">
      <p style="margin-bottom: 0;">
        <strong>Ngày nhận:</strong>
        <template v-if="assign.ngayNhan">
          {{ dayjs(assign.ngayNhan).format("DD/MM/YYYY HH:mm") }}
        </template>
        <template v-else-if="assign.trangThai === 'Đã từ chối'">
          Đã từ chối
        </template>
        <template v-else>
          Chờ nhận
        </template>
      </p>
      <p v-if="assign.ngayHoanTat" style="margin-bottom: 0;">
        <strong>Ngày hoàn tất:</strong>
        {{ dayjs(assign.ngayHoanTat).format("DD/MM/YYYY HH:mm") }}
      </p>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <p v-if="!view"><strong>Trạng thái:</strong> {{ assign.trangThai }}</p>
      <a-progress :percent="assign.tienDoCaNhan" style="margin: 8px 0 0 0; width: 300px;" />
    </div>
  </a-card>
  <TransferHistory ref="transferHistoryRef" :transfers="[...allAssignments].reverse()" :assign="assign.id" :taskId="taskId"/>
  <ReportForm ref="reportForm" @created="handleUpdated" :assign="assign" :task="props.taskId"/>
  <TransferForm ref="transferForm" @created="handleTransfer" :assign-id="assign.id" :task-id="props.taskId"/>
  <AssignForm ref="assignForm" @updated="handleUpdated" :task-id="props.taskId" :assignId="assign.id"/>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, Ref, toRaw } from "vue";
import AccountService from "@/services/TaiKhoan.service";
import AssignService from "@/services/PhanCong.service";
import TaskService from "@/services/CongViec.service";
import TransferHistory from '@/components/TransferHistory.vue';
import ReportForm from "@/components/ReportForm.vue";
import TransferForm from "@/components/TransferForm.vue";
import AssignForm from "@/components/AssignForm.vue";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const props = defineProps<{
  assign: {
    id: string,
    moTa: string,
    trangThai: string,
    ngayNhan?: string,
    ngayHoanTat?: string,
    idNguoiNhan: string,
    tienDoCaNhan: number,
    doQuanTrong?: number,
  },
  taskId?: string | null;
  view?: boolean;
}>();

const emit = defineEmits(["updated"]);

const participants = ref<{ name: string, avatar?: string }[]>([]);
const transferHistoryRef = ref();
const allAssignments = ref<any[]>([]);
const reportForm = ref();
const transferForm = ref();
const assignForm = ref();
const manager = ref();
const user = ref({
  id: "",
  tenNV: "",
  email: "",
  SDT: "",
  diaChi: "",
  vaiTro: "",
});

const transfer = ref({
  moTa: "Yêu cầu thu hồi",
  idNguoiNhan: "",
  idNguoiGui: props.assign.idNguoiNhan,
  idCongViec: props.taskId
});

const isAssigned = computed(() => {
  return props.assign.idNguoiNhan === user.value.id;
});

const isManager = computed(() => {
  return user.value.id === manager.value;
});

const formatDateToMySQL = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const handleAccept = async () => {
  try {
    await AssignService.updateAssignment(props.assign.id, {
      ngayNhan: formatDateToMySQL(new Date()),
      trangThai: "Đang thực hiện",
    });
    message.success("Đã xác nhận thành công");
    emit("updated");
  } catch (err) {
    console.error("Lỗi khi nhận công việc", err);
  }
};

const handleReject = async () => {
  try {
    await AssignService.updateAssignment(props.assign.id, {
      trangThai: "Đã từ chối",
    });
    message.success("Đã từ chối");
    emit("updated");
  } catch (err) {
    console.error("Lỗi khi từ chối công việc", err);
  }
};

const handleUpdated = async () => {
  emit("updated");
};

const handleTransfer = async () => {
  emit("updated");
};

const handleEdit = () => {
  assignForm.value?.showModal();
};

const handleWithdraw = async () => {
  if (props.assign.trangThai === 'Chưa bắt đầu') {
    await handleRemove();
  } else {
    await handleRecall();
    emit("updated");
  }
};

const handleRemove = async () => {
  try {
    await AssignService.deleteAssignment(props.assign.id);
    message.success("Đã thu hồi thành công");
    emit("updated");
  } catch (err) {
    console.error("Lỗi khi thu hồi phân công", err);
  }
};

const handleRecall = async () => {
  try {
    const currentUser = await AccountService.getCurrentUser();

    const payload = {
      moTa: "Yêu cầu thu hồi",
      idNguoiGui: props.assign.idNguoiNhan,
      idNguoiNhan: currentUser.id,
      idCongViec: props.taskId ?? null,
      isTransfer: 0,
    };

    await AssignService.startTransfer(props.assign.id, payload);
    message.success("Đã gửi yêu cầu thu hồi");
    emit("updated");
  } catch (err) {
    console.error("Lỗi khi gửi yêu cầu thu hồi:", err);
    message.error(err?.response?.data || "Không gửi được yêu cầu thu hồi");
  }
};

onMounted(async () => {
  try {
    manager.value = await TaskService.getTaskById(props.taskId).then(task => task.idNguoiTao || "");
    // Lấy toàn bộ lịch sử chuyển giao
    let currentId = props.assign.id;
    const assignmentIds = [currentId];
    const transferChain = await AssignService.getFullTransferChain(props.assign.id);
    user.value = await AccountService.getCurrentUser();
    if (!user.value || !user.value.id) {
      throw new Error("Không thể xác định người dùng hiện tại");
    }

    // Duyệt ngược qua các chuyển giao để lấy chuỗi phân công
    while (true) {
      const found = Array.isArray(transferChain)
        ? transferChain.find(item => item.idSau === currentId)
        : null;
      if (found && found.idTruoc) {
        assignmentIds.unshift(found.idTruoc);
        currentId = found.idTruoc;
      } else {
        break;
      }
    }

    // Lấy thông tin phân công cho từng id
    allAssignments.value = (
      await Promise.all(
        assignmentIds.map(async (id) => {
          const assign = await AssignService.getAssignmentById(id);
          if (assign) {
            const user = assign.idNguoiNhan
              ? await AccountService.getAccountById(assign.idNguoiNhan)
              : null;
            return {
              ...assign,
              nguoiNhan: user,
            };
          }
          return null;
        })
      )
    ).filter(Boolean);

    // Lấy thông tin người nhận cho avatar group
    const users = allAssignments.value.map(a => ({
      name: a.nguoiNhan?.tenNV || "Không rõ",
      avatar: a.nguoiNhan?.id
        ? `/api/auth/avatar/${a.nguoiNhan.id}`
        : undefined
    }));
    participants.value = users;
  } catch (err) {
    participants.value = [];
    allAssignments.value = [];
  }
});
</script>