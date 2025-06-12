<template>
  <a-card style="width: 100%;" >
    <template #title>
      <strong>{{ assign.moTa }}</strong>
    </template>
    <template #extra>
      <a-space>
        <a v-if="!assign.ngayNhan && assign.trangThai !='Đã từ chối'" type="link" @click="handleAccept" href="#">Nhận</a>
        <a v-if="!assign.ngayNhan && assign.trangThai !='Đã từ chối'" type="link" @click="handleReject" href="#">Từ Chối</a>
        <a v-if="assign.ngayNhan && isAssigned" type="link" @click="reportForm?.showModal()" href="#">Cập Nhật</a>
        <a v-if="assign.ngayNhan && isAssigned" type="link" @click="transferForm?.showModal()" href="#">Chuyển</a>
        <a type="link" @click="transferHistoryRef?.showModal()" href="#">Xem</a>
      </a-space>
    </template>
    <div style="display: flex; align-items: center; gap: 8px;">
      <template v-for="(user, idx) in participants" :key="idx">
        <a-avatar
        :src="user.avatar"
        :style="!user.avatar ? { backgroundColor: '#1890ff' } : undefined"
        >
        <template v-if="!user.avatar">{{ user.name?.charAt(0) || '?' }}</template>
        </a-avatar>
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
      <p><strong>Trạng thái:</strong> {{ assign.trangThai }}</p>
      <a-progress :percent="assign.tienDoCaNhan" style="margin: 8px 0 0 0; width: 300px;" />
    </div>
  </a-card>
  <TransferHistory ref="transferHistoryRef" :transfers="[...allAssignments].reverse()" />
  <ReportForm ref="reportForm" @created="handleUpdated" :assign="assign" />
  <TransferForm ref="transferForm" @created="handleTransfer" :assign-id="assign.id"/>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import AccountService from "@/services/TaiKhoan.service";
import AssignService from "@/services/PhanCong.service";
import TransferHistory from './TransferHistory.vue';
import ReportForm from "@/components/ReportForm.vue";
import TransferForm from "@/components/TransferForm.vue";
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
    tienDoCaNhan: number
  },
  taskId?: string | null;
}>();

const emit = defineEmits(["updated"]);

const participants = ref<{ name: string, avatar?: string }[]>([]);
const transferHistoryRef = ref();
const allAssignments = ref<any[]>([]);
const reportForm = ref();
const transferForm = ref();
const user = ref({
  id: "",
  tenNV: "",
  email: "",
  SDT: "",
  diaChi: "",
  vaiTro: "",
});

const isAssigned = computed(() => {
  return props.assign.idNguoiNhan === user.value.id;
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
  console.log("Cập nhật báo cáo thành công");
};

const handleTransfer = async () => {
  console.log("Chuyển giao thành công");
};

onMounted(async () => {
  try {
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

    // Lấy thông tin người nhận cho avatar group (nếu cần)
    const users = allAssignments.value.map(a => ({
      name: a.nguoiNhan?.tenNV || "Không rõ",
      avatar: a.nguoiNhan?.id
        ? `/api/auth/avatar/${a.nguoiNhan.id}`
        : undefined
    }));
    participants.value = users.filter(
      (v, i, a) => a.findIndex(t => t.avatar === v.avatar) === i
    );
  } catch (err) {
    participants.value = [];
    allAssignments.value = [];
  }
});
</script>